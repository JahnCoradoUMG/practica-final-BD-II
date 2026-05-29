import client from 'prom-client';
import * as healthRepository from '../repositories/healthRepository.js';
import * as replicationRepository from '../repositories/replicationRepository.js';

const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: 'dataops_' });

const upGauge = new client.Gauge({
  name: 'dataops_up',
  help: 'API DataOps en ejecución (1=up)',
  registers: [register],
});

const dbCpuGauge = new client.Gauge({
  name: 'dataops_db_cpu_percent',
  help: 'CPU por conexión de motor',
  labelNames: ['connection', 'motor'],
  registers: [register],
});

const dbMemoryGauge = new client.Gauge({
  name: 'dataops_db_memory_percent',
  help: 'Memoria por conexión de motor',
  labelNames: ['connection', 'motor'],
  registers: [register],
});

const dbConnectionsGauge = new client.Gauge({
  name: 'dataops_db_connections',
  help: 'Conexiones activas por motor',
  labelNames: ['connection', 'motor'],
  registers: [register],
});

const dbLocksGauge = new client.Gauge({
  name: 'dataops_db_locks',
  help: 'Locks por motor',
  labelNames: ['connection', 'motor'],
  registers: [register],
});

const replicationLagGauge = new client.Gauge({
  name: 'dataops_replication_lag_seconds',
  help: 'Lag de replicación primario-réplica',
  labelNames: ['primary', 'replica', 'scenario'],
  registers: [register],
});

export async function refreshBusinessMetrics() {
  upGauge.set(1);

  dbCpuGauge.reset();
  dbMemoryGauge.reset();
  dbConnectionsGauge.reset();
  dbLocksGauge.reset();
  replicationLagGauge.reset();

  let latest = [];
  let lagRows = [];
  try {
    latest = await healthRepository.findLatestMetricsSummary();
    lagRows = await replicationRepository.listReplicationLag(20);
  } catch {
    return;
  }
  for (const row of latest) {
    const labels = { connection: row.connection_name, motor: row.motor };
    dbCpuGauge.set(labels, Number(row.cpu ?? 0));
    dbMemoryGauge.set(labels, Number(row.memory ?? 0));
    dbConnectionsGauge.set(labels, Number(row.connections ?? 0));
    dbLocksGauge.set(labels, Number(row.locks ?? 0));
  }

  for (const row of lagRows) {
    replicationLagGauge.set(
      {
        primary: row.primary_name,
        replica: row.replica_name,
        scenario: row.load_scenario,
      },
      Number(row.lag_seconds ?? 0),
    );
  }
}

export async function getPrometheusMetrics() {
  await refreshBusinessMetrics();
  return register.metrics();
}

export function getMetricsContentType() {
  return register.contentType;
}
