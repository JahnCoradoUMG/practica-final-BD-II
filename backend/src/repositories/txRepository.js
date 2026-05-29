import { pool } from '../config/database.js';

export async function insertTxLog(payload) {
  const { rows } = await pool.query(
    `INSERT INTO tx_log (db_id, session_id, operacion, inicio, fin, wait_time, lock_type, resolved)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      payload.dbId,
      payload.sessionId,
      payload.operacion,
      payload.inicio,
      payload.fin,
      payload.waitTime,
      payload.lockType,
      payload.resolved,
    ],
  );
  return rows[0];
}

export async function findTxOverview(limit = 100) {
  const { rows } = await pool.query(
    `SELECT t.*, c.nombre AS connection_name, c.motor
     FROM tx_log t
     JOIN connections c ON c.id = t.db_id
     ORDER BY t.inicio DESC
     LIMIT $1`,
    [limit],
  );
  return rows;
}

export async function findTxStats() {
  const { rows } = await pool.query(
    `SELECT
       COUNT(*)::int AS total,
       COALESCE(AVG(wait_time),0)::numeric(10,2) AS avg_wait_time,
       SUM(CASE WHEN lock_type = 'DEADLOCK' THEN 1 ELSE 0 END)::int AS deadlocks,
       SUM(CASE WHEN resolved THEN 1 ELSE 0 END)::int AS resolved
     FROM tx_log`,
  );
  return rows[0];
}
