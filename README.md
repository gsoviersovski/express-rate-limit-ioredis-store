# Express Rate Limit IORedis store

A redis store implementation to be used alongside [ioredis](https://github.com/luin/ioredis) for the [Express Rate Limit](https://github.com/nfriedly/express-rate-limit) middleware.
Since the [existing redis store](https://github.com/wyattjoh/rate-limit-redis) is not natively typed and seemed to be using the legacy store version of the Express Rate Limit, I 
decided to implement a new store for my personal projects. There is a disavantage to rate-limit-redis, in which this store only works with the IORedis client.

## Installation
With npm:
```sh
$ npm install --save express-rate-limit-ioredis-store
```
With yarn:
```sh
$ yarn add express-rate-limit-ioredis-store
```

## Usage
```js
const ExpressRateLimit = require("express-rate-limit");
const RedisStore = require("express-rate-limit-ioredis-store");

const limiter = ExpressRateLimit({
  store: new RedisStore({
    // check Options
  }),
  max: 100,
  windowMs: 60000,
});

app.use(limiter);
```
Or with ES modules
```ts
import ExpressRateLimit from 'express-rate-limit';
import RedisStore from 'express-rate-limit-ioredis-store';

const limiter = ExpressRateLimit({
  store: new RedisStore({
    // check Options
  }),
  max: 100,
  windowMs: 60000,
});

app.use(limiter);
```

## Options

- **globalPrefix**: string (optional) - the prefix that will be added to all the redis keys used by this lib. Default value is `express-rate-limit-store-`.
- **client**: The [ioredis Client](https://github.com/luin/ioredis) to be used by the store.

## Licence

MIT © 2022 Gustavo Soviersovski
