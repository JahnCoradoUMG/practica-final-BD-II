import * as replicationRepository from '../repositories/replicationRepository.js';
import * as connectionsRepository from '../repositories/connectionsRepository.js';

export async function captureReplicationScenario(primaryDbId, replicaDbId, scenario = 'NORMAL') {
  const scenarioMap = {
    NORMAL: 2,
    MEDIUM: 5,
    HIGH: 20,
  };
  const base = scenarioMap[scenario] ?? 2;
  const lagSeconds = Number((base + Math.random() * 1.2).toFixed(3));
  const saved = await replicationRepository.insertReplicationLag({
    primaryDbId,
    replicaDbId,
    lagSeconds,
    loadScenario: scenario,
  });
  return {
    ...saved,
    status: lagSeconds > 10 ? 'CRITICAL' : lagSeconds > 5 ? 'WARNING' : 'ACCEPTABLE',
  };
}

export async function autoCaptureReplication() {
  const connections = await connectionsRepository.findConnectionsForMonitoring();
  if (connections.length < 2) return { generated: 0 };
  const primary = connections[0];
  const replica = connections[1];
  const scenarios = ['NORMAL', 'MEDIUM', 'HIGH'];
  const records = [];
  for (const scenario of scenarios) {
    records.push(await captureReplicationScenario(primary.id, replica.id, scenario));
  }
  return { generated: records.length, records };
}

export async function getReplicationDashboard() {
  const rows = await replicationRepository.listReplicationLag(100);
  return rows.map((row) => ({
    ...row,
    status: row.lag_seconds > 10 ? 'CRITICAL' : row.lag_seconds > 5 ? 'WARNING' : 'ACCEPTABLE',
  }));
}
