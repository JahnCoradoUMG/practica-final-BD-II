import Redis from 'ioredis';
import env from './env.js';

export const redisClient = new Redis({
  host: env.redis.host,
  port: env.redis.port,
  password: env.redis.password,
  lazyConnect: true,
  maxRetriesPerRequest: 2,
});

redisClient.on('error', (err) => {
  console.error('[redis] error', err.message);
});
