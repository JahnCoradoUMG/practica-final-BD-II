import { pool } from '../config/database.js';

export async function findGlobalThresholds() {
  const { rows } = await pool.query(
    `SELECT id, metric_name, warning_value, critical_value, is_global
     FROM health_thresholds
     WHERE connection_id IS NULL
     ORDER BY metric_name`,
  );
  return rows;
}

export async function findLatestMetricsSummary() {
  const { rows } = await pool.query(
    `SELECT db_id, connection_name, motor, cpu, memory, connections, locks, deadlocks, disk_usage, health_status, capture_time
     FROM v_latest_db_metrics
     ORDER BY connection_name`,
  );
  return rows;
}

export async function insertDbMetrics(payload) {
  const { rows } = await pool.query(
    `INSERT INTO db_metrics (db_id, cpu, memory, connections, locks, deadlocks, disk_usage, health_status, capture_time)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
     RETURNING id, capture_time`,
    [
      payload.dbId,
      payload.cpu,
      payload.memory,
      payload.connections,
      payload.locks,
      payload.deadlocks,
      payload.diskUsage,
      payload.healthStatus,
    ],
  );
  return rows[0];
}

export async function findRecentMetricsHistory(limit = 100) {
  const { rows } = await pool.query(
    `SELECT m.id, m.db_id, c.nombre AS connection_name, c.motor, m.cpu, m.memory, m.connections,
            m.locks, m.deadlocks, m.disk_usage, m.health_status, m.capture_time
     FROM db_metrics m
     JOIN connections c ON c.id = m.db_id
     ORDER BY m.capture_time DESC
     LIMIT $1`,
    [limit],
  );
  return rows;
}
