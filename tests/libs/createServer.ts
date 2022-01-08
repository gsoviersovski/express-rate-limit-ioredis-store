import express from 'express';
import ExpressRateLimit from 'express-rate-limit';
import http, {Server} from 'http';
import Redis from 'ioredis';
import ms from 'ms';
import ExpressRateLimitIORedisStore from '../../src';

const limiter = ExpressRateLimit({
  store: new ExpressRateLimitIORedisStore({
    client: new Redis('localhost:6379'),
  }),
  max: 10,
  windowMs: ms('3s'),
  handler: (_, res) => {
    return res.json({error: 'Too many requests'});
  },
});

export default function createServer(): Server {
  const app = createApp();
  return http.createServer(app);
}

function createApp() {
  const app = express();
  app.get('/', limiter, (_, res) =>
    res.json({
      message: 'No problems so far',
    })
  );
  return app;
}
