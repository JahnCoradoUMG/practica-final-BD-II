import { pool } from '../config/database.js';

export async function insertQueryLog(payload) {
  const { rows } = await pool.query(
    `INSERT INTO query_log
      (db_id, query_text, duration_ms, rows_returned, index_used, execution_plan, optimized_duration_ms, optimization_notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      payload.dbId,
      payload.queryText,
      payload.durationMs,
      payload.rowsReturned,
      payload.indexUsed,
      payload.executionPlan,
      payload.optimizedDurationMs ?? null,
      payload.optimizationNotes ?? null,
    ],
  );
  return rows[0];
}

export async function findTopSlowQueries(limit = 10) {
  const { rows } = await pool.query(
    `SELECT id, db_id, query_text, duration_ms, rows_returned, index_used, execution_plan, performance_class,
            optimized_duration_ms, optimization_notes, created_at
     FROM query_log
     WHERE performance_class IN ('SLOW', 'CRITICAL')
     ORDER BY duration_ms DESC
     LIMIT $1`,
    [limit],
  );
  return rows;
}

export async function markOptimized(id, optimizedDurationMs, note, indexName) {
  const { rows } = await pool.query(
    `UPDATE query_log
     SET optimized_duration_ms = $2,
         optimization_notes = $3,
         index_used = COALESCE($4, index_used)
     WHERE id = $1
     RETURNING *`,
    [id, optimizedDurationMs, note, indexName ?? null],
  );
  return rows[0] || null;
}
