import { pool } from '../config/database.js';

export async function insertAlertLog(payload) {
  const { rows } = await pool.query(
    `INSERT INTO alert_log (rule_id, db_id, triggered_at, condition_text, metric_value, severity, resolution_status)
     VALUES ($1, $2, NOW(), $3, $4, $5, 'OPEN')
     RETURNING *`,
    [payload.ruleId ?? null, payload.dbId ?? null, payload.conditionText, payload.metricValue ?? null, payload.severity],
  );
  return rows[0];
}

export async function listAlertLog(limit = 100) {
  const { rows } = await pool.query(
    `SELECT a.*, c.nombre AS connection_name, c.motor
     FROM alert_log a
     LEFT JOIN connections c ON c.id = a.db_id
     ORDER BY a.triggered_at DESC
     LIMIT $1`,
    [limit],
  );
  return rows;
}

export async function resolveAlert(id, resolvedBy, notes) {
  const { rows } = await pool.query(
    `UPDATE alert_log
     SET resolution_status = 'RESOLVED',
         resolved_at = NOW(),
         resolved_by = $2,
         notes = COALESCE($3, notes)
     WHERE id = $1
     RETURNING *`,
    [id, resolvedBy, notes ?? null],
  );
  return rows[0] || null;
}

export async function acknowledgeAlert(id, notes) {
  const { rows } = await pool.query(
    `UPDATE alert_log
     SET resolution_status = 'ACKNOWLEDGED',
         notes = COALESCE($2, notes)
     WHERE id = $1
     RETURNING *`,
    [id, notes ?? null],
  );
  return rows[0] || null;
}
