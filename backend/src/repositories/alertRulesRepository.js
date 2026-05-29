import { pool } from '../config/database.js';

export async function findEnabledRules() {
  const { rows } = await pool.query(
    `SELECT id, rule_code, description, metric_name, operator, threshold_value,
            severity, notify_email, notify_dashboard, is_enabled
     FROM alert_rules
     WHERE is_enabled = TRUE
     ORDER BY rule_code`,
  );
  return rows;
}

export async function findAllRules() {
  const { rows } = await pool.query(
    `SELECT id, rule_code, description, metric_name, operator, threshold_value,
            severity, notify_email, notify_dashboard, is_enabled, created_at, updated_at
     FROM alert_rules
     ORDER BY rule_code`,
  );
  return rows;
}

export async function updateRule(id, payload) {
  const { rows } = await pool.query(
    `UPDATE alert_rules
     SET threshold_value = $2,
         operator = COALESCE($3, operator),
         notify_email = COALESCE($4, notify_email),
         notify_dashboard = COALESCE($5, notify_dashboard),
         is_enabled = COALESCE($6, is_enabled)
     WHERE id = $1
     RETURNING *`,
    [
      id,
      payload.thresholdValue,
      payload.operator ?? null,
      payload.notifyEmail ?? null,
      payload.notifyDashboard ?? null,
      payload.isEnabled ?? null,
    ],
  );
  return rows[0] || null;
}
