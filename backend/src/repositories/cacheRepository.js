import { pool } from '../config/database.js';

export async function logCacheMetric(payload) {
  await pool.query(
    `INSERT INTO cache_metrics (cache_key, hit, response_ms, endpoint, captured_at)
     VALUES ($1, $2, $3, $4, NOW())`,
    [payload.cacheKey, payload.hit, payload.responseMs, payload.endpoint],
  );
}

export async function getCacheStats() {
  const { rows } = await pool.query(
    `SELECT
       COUNT(*)::int AS total,
       SUM(CASE WHEN hit THEN 1 ELSE 0 END)::int AS hits,
       SUM(CASE WHEN NOT hit THEN 1 ELSE 0 END)::int AS misses,
       COALESCE(AVG(response_ms),0)::numeric(10,2) AS avg_response_ms
     FROM cache_metrics`,
  );
  const result = rows[0];
  const total = Number(result.total || 0);
  const hits = Number(result.hits || 0);
  return {
    ...result,
    hit_ratio: total > 0 ? Number(((hits / total) * 100).toFixed(2)) : 0,
  };
}
