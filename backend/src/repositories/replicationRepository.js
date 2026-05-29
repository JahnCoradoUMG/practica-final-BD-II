import { pool } from '../config/database.js';

export async function insertReplicationLag(payload) {
  const { rows } = await pool.query(
    `INSERT INTO replication_lag (primary_db_id, replica_db_id, lag_seconds, load_scenario, captured_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING *`,
    [payload.primaryDbId, payload.replicaDbId, payload.lagSeconds, payload.loadScenario],
  );
  return rows[0];
}

export async function listReplicationLag(limit = 100) {
  const { rows } = await pool.query(
    `SELECT r.*, p.nombre AS primary_name, p.motor AS primary_motor,
            rp.nombre AS replica_name, rp.motor AS replica_motor
     FROM replication_lag r
     JOIN connections p ON p.id = r.primary_db_id
     JOIN connections rp ON rp.id = r.replica_db_id
     ORDER BY r.captured_at DESC
     LIMIT $1`,
    [limit],
  );
  return rows;
}
