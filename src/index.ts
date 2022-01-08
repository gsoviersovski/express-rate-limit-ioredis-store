import {IncrementResponse, Options, Store} from 'express-rate-limit';
import Redis from 'ioredis';

type RedisStoreOptions = {
  globalPrefix?: string;
  client: Redis.Redis;
};

export default class ExpressRateLimitIORedisStore implements Store {
  private client: Redis.Redis;
  private globalPrefix: string;
  private windowMs: number;

  constructor({globalPrefix, client}: RedisStoreOptions) {
    this.client = client;
    this.globalPrefix = globalPrefix ?? 'express-rate-limit-store-';
    this.windowMs = 0;
  }

  init(options: Options): void {
    this.windowMs = options.windowMs;
  }

  async increment(key: string): Promise<IncrementResponse> {
    const redisKey = this.getFullKey(key);
    const totalHits = await this.client.incr(redisKey);
    const insertionTime = await this.getInsertionTime(redisKey, totalHits);

    return {
      totalHits,
      resetTime: new Date(insertionTime + this.windowMs),
    };
  }

  async decrement(key: string): Promise<void> {
    const redisKey = this.getFullKey(key);
    if (await this.client.get(redisKey)) {
      await this.client.decr(redisKey);
    }
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
