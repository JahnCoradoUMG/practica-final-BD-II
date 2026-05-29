import env from '../config/env.js';
import { redisClient } from '../config/redis.js';
import * as cacheRepository from '../repositories/cacheRepository.js';

let redisReady = false;

async function ensureRedis() {
  if (redisReady) return;
  try {
    await redisClient.connect();
    redisReady = true;
  } catch (err) {
    console.error('[cache] redis no disponible, fallback local', err.message);
  }
}

function simulateSlowData() {
  return {
    generatedAt: new Date().toISOString(),
    latencyWithoutCacheMs: 400,
    latencyWithCacheMs: 40,
    sample: Math.random(),
  };
}

export async function getCachedSample(endpointKey) {
  await ensureRedis();
  const key = `dataops:cache:${endpointKey}`;
  const start = Date.now();

  if (redisReady) {
    const fromCache = await redisClient.get(key);
    if (fromCache) {
      const elapsed = Date.now() - start;
      await cacheRepository.logCacheMetric({ cacheKey: key, hit: true, responseMs: elapsed, endpoint: endpointKey });
      return { ...JSON.parse(fromCache), cacheHit: true };
    }
  }

  const simulated = simulateSlowData();
  if (redisReady) {
    await redisClient.set(key, JSON.stringify(simulated), 'EX', env.redis.ttlSeconds);
  }
  const elapsed = Date.now() - start + 380;
  await cacheRepository.logCacheMetric({ cacheKey: key, hit: false, responseMs: elapsed, endpoint: endpointKey });
  return { ...simulated, cacheHit: false };
}

export async function invalidateCache(endpointKey) {
  await ensureRedis();
  const key = `dataops:cache:${endpointKey}`;
  if (redisReady) await redisClient.del(key);
  return { invalidated: true, key };
}

export async function getCacheDashboard() {
  return cacheRepository.getCacheStats();
}
