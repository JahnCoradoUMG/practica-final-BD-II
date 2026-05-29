import env from '../config/env.js';
import { getConnector } from '../connectors/index.js';
import * as connectionsRepository from '../repositories/connectionsRepository.js';
import * as healthRepository from '../repositories/healthRepository.js';
import { decryptSecret } from '../utils/crypto.js';

let timer = null;
let running = false;

function classifyMetric(metricValue, threshold) {
  if (metricValue >= Number(threshold.critical_value)) return 'CRITICAL';
  if (metricValue >= Number(threshold.warning_value)) return 'WARNING';
  return 'HEALTHY';
}

function resolveHealthStatus(metrics, thresholds) {
  const thresholdByMetric = new Map(thresholds.map((t) => [t.metric_name, t]));
  const keys = ['cpu', 'memory', 'connections', 'locks', 'deadlocks', 'disk_usage'];

  let finalStatus = 'HEALTHY';
  for (const key of keys) {
    const threshold = thresholdByMetric.get(key);
    if (!threshold) continue;

    const value = Number(metrics[key] ?? 0);
    const status = classifyMetric(value, threshold);
    if (status === 'CRITICAL') return 'CRITICAL';
    if (status === 'WARNING') finalStatus = 'WARNING';
  }

  return finalStatus;
}

async function captureForConnection(connection, thresholds) {
  try {
    const connector = getConnector(connection.motor);
    const password = decryptSecret(connection.password_encrypted, connection.password_iv);
    const result = await connector.getMetrics({
      host: connection.host,
      port: connection.port,
      database: connection.database_name,
      user: connection.user_name,
      password,
    });

    if (!result.ok) {
      await connectionsRepository.updateConnectionStatus(connection.id, 'ERROR');
      return;
    }

    const metrics = result.metrics;
    const healthStatus = resolveHealthStatus(
      {
        cpu: metrics.cpu,
        memory: metrics.memory,
        connections: metrics.connections,
        locks: metrics.locks,
        deadlocks: metrics.deadlocks,
        disk_usage: metrics.diskUsage,
      },
      thresholds,
    );

    await healthRepository.insertDbMetrics({
      dbId: connection.id,
      cpu: metrics.cpu,
      memory: metrics.memory,
      connections: metrics.connections,
      locks: metrics.locks,
      deadlocks: metrics.deadlocks,
      diskUsage: metrics.diskUsage,
      healthStatus,
    });

    await connectionsRepository.updateConnectionStatus(connection.id, 'ACTIVE');
  } catch {
    await connectionsRepository.updateConnectionStatus(connection.id, 'ERROR');
  }
}

export async function runHealthCheckCycle() {
  if (running) return;
  running = true;
  try {
    const [connections, thresholds] = await Promise.all([
      connectionsRepository.findConnectionsForMonitoring(),
      healthRepository.findGlobalThresholds(),
    ]);

    await Promise.allSettled(connections.map((connection) => captureForConnection(connection, thresholds)));
  } catch (err) {
    console.error('[health-job] error en ciclo', err.message);
  } finally {
    running = false;
  }
}

export function startHealthCheckScheduler() {
  const intervalMs = Number.isFinite(env.healthCheckIntervalMs) && env.healthCheckIntervalMs > 0
    ? env.healthCheckIntervalMs
    : 60_000;

  runHealthCheckCycle();
  timer = setInterval(() => {
    runHealthCheckCycle();
  }, intervalMs);

  console.log(`[health-job] scheduler iniciado cada ${intervalMs}ms`);
}

export function stopHealthCheckScheduler() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
