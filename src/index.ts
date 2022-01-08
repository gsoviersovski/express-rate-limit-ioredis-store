import {IncrementResponse, Options, Store} from 'express-rate-limit';
import Redis from 'ioredis';

type ConstructorParam = {
  globalPrefix: string;
  client: Redis.Redis;
};

export default class ExpressRateLimitIORedisStore implements Store {
  private client: Redis.Redis;
  private globalPrefix: string;
  private windowMs: number;

  constructor({globalPrefix, client}: ConstructorParam) {
    this.client = client;
    this.globalPrefix = globalPrefix;
    this.windowMs = 0;
  }

  init(options: Options): void {
    this.windowMs = options.windowMs;
  }

  async increment(key: string): Promise<IncrementResponse> {
    let redisKey = this.getFullKey(key);

    const totalHits = await this.client.incr(redisKey);
    const insertionTime = await this.getInsertionTime(redisKey, totalHits);

    return {
      totalHits,
      resetTime: new Date(insertionTime + this.windowMs),
    };
  }

  async decrement(key: string): Promise<void> {
    await this.client.decr(this.getFullKey(key));
  }

  async resetKey(key: string): Promise<void> {
    await this.client.del(this.getFullKey(key));
  }

  private getFullKey(key: string) {
    return this.globalPrefix + key;
  }

  private async getInsertionTime(key: string, value: number) {
    const isKeyInsertion = value === 1;
    if (isKeyInsertion) {
      const now = new Date().getTime();
      await this.client.set(key + '-create-time', now);
      return now;
    }
    const createTime = await this.client.get(key + '-create-time');
    return parseInt(createTime as string);
  }
}
