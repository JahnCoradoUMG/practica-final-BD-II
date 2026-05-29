import nodemailer from 'nodemailer';
import env from '../config/env.js';
import * as alertRulesRepository from '../repositories/alertRulesRepository.js';
import * as alertLogRepository from '../repositories/alertLogRepository.js';
import * as healthRepository from '../repositories/healthRepository.js';
import * as backupRepository from '../repositories/backupRepository.js';
import * as replicationRepository from '../repositories/replicationRepository.js';
import { AppError } from '../utils/AppError.js';

let transporter = null;

function getTransporter() {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.password) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: { user: env.smtp.user, pass: env.smtp.password },
    });
  }
  return transporter;
}

function compare(operator, value, threshold) {
  if (operator === '>') return value > threshold;
  if (operator === '>=') return value >= threshold;
  if (operator === '<') return value < threshold;
  if (operator === '<=') return value <= threshold;
  return value === threshold;
}

async function maybeSendEmail(subject, body) {
  const client = getTransporter();
  if (!client) return { sent: false, reason: 'SMTP no configurado' };
  await client.sendMail({
    from: env.smtp.fromEmail,
    to: env.smtp.toEmail,
    subject,
    text: body,
  });
  return { sent: true };
}

export async function evaluateAlerts() {
  const rules = await alertRulesRepository.findEnabledRules();
  const latestMetrics = await healthRepository.findLatestMetricsSummary();
  const latestBackup = (await backupRepository.listBackupHistory(1))[0] || null;
  const latestLag = (await replicationRepository.listReplicationLag(1))[0] || null;

  const emitted = [];
  for (const rule of rules) {
    let observed = null;
    let dbId = null;
    if (['cpu', 'connections'].includes(rule.metric_name) && latestMetrics.length) {
      observed = Number(latestMetrics[0][rule.metric_name]);
    } else if (rule.metric_name === 'deadlocks' && latestMetrics.length) {
      observed = Number(latestMetrics[0].deadlocks ?? 0);
    } else if (rule.metric_name === 'disk_usage' && latestMetrics.length) {
      observed = Number(latestMetrics[0].disk_usage ?? latestMetrics[0].memory ?? 0);
    } else if (rule.metric_name === 'backup_status' && latestBackup) {
      observed = latestBackup.status === 'FAILED' ? 0 : 1;
      dbId = latestBackup.db_id;
    } else if (rule.metric_name === 'lag_seconds' && latestLag) {
      observed = Number(latestLag.lag_seconds);
      dbId = latestLag.primary_db_id;
    }
    if (observed == null) continue;

    const threshold = Number(rule.threshold_value);
    if (!compare(rule.operator, observed, threshold)) continue;

    const log = await alertLogRepository.insertAlertLog({
      ruleId: rule.id,
      dbId,
      conditionText: `${rule.metric_name} ${rule.operator} ${threshold}`,
      metricValue: observed,
      severity: rule.severity,
    });

    if (rule.notify_email) {
      await maybeSendEmail(
        `[DataOps][${rule.severity}] ${rule.rule_code}`,
        `Se activó la regla ${rule.rule_code}: valor=${observed}, condición=${rule.metric_name} ${rule.operator} ${threshold}`,
      );
    }
    emitted.push(log);
  }
  return { emitted: emitted.length };
}

export async function getAlertDashboard() {
  const [rules, logs] = await Promise.all([
    alertRulesRepository.findAllRules(),
    alertLogRepository.listAlertLog(100),
  ]);
  return { rules, logs };
}

export async function updateRule(id, payload) {
  const normalized = {
    thresholdValue: payload.thresholdValue ?? payload.threshold_value,
    operator: payload.operator,
    notifyEmail: payload.notifyEmail ?? payload.notify_email,
    notifyDashboard: payload.notifyDashboard ?? payload.notify_dashboard,
    isEnabled: payload.isEnabled ?? payload.is_enabled,
  };
  const updated = await alertRulesRepository.updateRule(id, normalized);
  if (!updated) throw new AppError('Regla no encontrada', 404, 'NOT_FOUND');
  return updated;
}

export async function acknowledgeAlert(id, notes) {
  const updated = await alertLogRepository.acknowledgeAlert(id, notes);
  if (!updated) throw new AppError('Alerta no encontrada', 404, 'NOT_FOUND');
  return updated;
}

export async function resolveAlert(id, resolvedBy, notes) {
  const updated = await alertLogRepository.resolveAlert(id, resolvedBy, notes);
  if (!updated) throw new AppError('Alerta no encontrada', 404, 'NOT_FOUND');
  return updated;
}

export async function ingestPrometheusWebhook(payload) {
  const alerts = payload?.alerts ?? [];
  const ingested = [];

  for (const alert of alerts) {
    if (alert.status === 'resolved') continue;

    const severity = String(alert.labels?.severity ?? 'warning').toUpperCase() === 'CRITICAL'
      ? 'CRITICAL'
      : 'WARNING';

    const log = await alertLogRepository.insertAlertLog({
      ruleId: null,
      dbId: null,
      conditionText: alert.annotations?.summary
        ?? alert.annotations?.description
        ?? `${alert.labels?.alertname ?? 'prometheus_alert'}: ${alert.annotations?.description ?? ''}`,
      metricValue: null,
      severity,
    });
    ingested.push(log);
  }

  return { ingested: ingested.length, alerts: ingested };
}
