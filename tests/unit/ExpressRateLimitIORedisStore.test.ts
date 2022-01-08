import {expect} from 'chai';
import {Options} from 'express-rate-limit';
import Redis from 'ioredis';
import timekeeper from 'timekeeper';
import ExpressRateLimitIORedisStore from '../../src';

const usleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('The Store works as a unit', () => {
  const redisClient = new Redis('localhost:6379');
  beforeEach(async () => {
    await redisClient.flushall();
    timekeeper.freeze(Date.now());
  });

  afterEach(async () => {
    timekeeper.reset();
  });

  it('Increments the key correctly', incrementTest(redisClient));

  it('Decrements the key correctly', decrementTest(redisClient));

  it('Resets the key correctly', resetTest(redisClient));

  it('Sets the prefix correctly', prefixTest(redisClient));
});

function incrementTest(client: Redis.Redis) {
  return async () => {
    const store = new ExpressRateLimitIORedisStore({
      globalPrefix: 'test-',
      client,
    });

    store.init({windowMs: 1200} as Options);

    let result = await store.increment('clientA');
    const creationDate = Date.now();

    result.totalHits.should.be.equal(1);
    result.resetTime!.getTime().should.be.equal(creationDate + 1200);

    timekeeper.reset();
    await usleep(200);
    result = await store.increment('clientA');
    result.totalHits.should.be.equal(2);
    result.resetTime!.getTime().should.be.equal(creationDate + 1200);
  };
}

function decrementTest(client: Redis.Redis) {
  return async () => {
    const store = new ExpressRateLimitIORedisStore({
      globalPrefix: 'test-',
      client,
    });

    store.init({windowMs: 1200} as Options);

    await store.increment('clientA');
    await store.decrement('clientA');
    const storeValue = parseInt((await client.get('test-clientA'))!);
    storeValue.should.be.equal(0);
    await store.decrement('clientB');
    expect(await client.get('test-clientB')).to.be.null;
  };
}

function resetTest(client: Redis.Redis) {
  return async () => {
    const store = new ExpressRateLimitIORedisStore({
      globalPrefix: 'test-',
      client,
    });

    store.init({windowMs: 1500} as Options);

    await store.increment('clientA');
    let storeValue = parseInt((await client.get('test-clientA'))!);
    storeValue.should.be.equal(1);
    await store.resetKey('clientA');
    await store.increment('clientA');
    storeValue = parseInt((await client.get('test-clientA'))!);
    storeValue.should.be.equal(1);
    await store.resetKey('clientB');
    expect(await client.get('test-clientB')).to.be.null;
  };
}

function prefixTest(client: Redis.Redis) {
  return async () => {
    const store = new ExpressRateLimitIORedisStore({client});

    store.init({windowMs: 1500} as Options);

    await store.increment('clientA');
    const storeValue = parseInt(
      (await client.get('express-rate-limit-store-clientA'))!
    );
    storeValue.should.be.equal(1);
  };
}
