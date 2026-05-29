import { getConnector, getConnectorRegistry } from '../connectors/index.js';
import { applyErrorToConnectionResult } from '../connectors/connectorErrors.js';
import * as connectionsRepository from '../repositories/connectionsRepository.js';
import { decryptSecret } from '../utils/crypto.js';
import { AppError } from '../utils/AppError.js';

async function getConnectionConfig(connectionId) {
  const row = await connectionsRepository.findConnectionById(connectionId);
  if (!row) throw new AppError('Conexión no encontrada', 404, 'NOT_FOUND');

  const password = decryptSecret(row.password_encrypted, row.password_iv);
  return {
    connection: row,
    config: {
      host: row.host,
      port: row.port,
      database: row.database_name,
      user: row.user_name,
      password,
    },
  };
}

async function runAndSyncStatus(connectionId, operation) {
  const { connection, config } = await getConnectionConfig(connectionId);
  const connector = getConnector(connection.motor);
  const raw = await operation(connector, config);
  const result = applyErrorToConnectionResult(raw);

  if (!result.ok) {
    await connectionsRepository.updateConnectionStatus(connectionId, 'ERROR');
  } else if (connection.status === 'ERROR') {
    await connectionsRepository.updateConnectionStatus(connectionId, 'ACTIVE');
  }

  return result;
}

export function listRegistry() {
  return getConnectorRegistry();
}

export async function testConnectionById(connectionId) {
  return runAndSyncStatus(connectionId, (connector, config) => connector.testConnection(config));
}

export async function getMetricsByConnectionId(connectionId) {
  return runAndSyncStatus(connectionId, (connector, config) => connector.getMetrics(config));
}

export async function getSlowQueriesByConnectionId(connectionId, limit = 10) {
  return runAndSyncStatus(connectionId, (connector, config) => connector.getSlowQueries(config, limit));
}

export async function executeBackupByConnectionId(connectionId, backupType = 'FULL') {
  return runAndSyncStatus(connectionId, (connector, config) => connector.executeBackup(config, backupType));
}

export async function testEnginePayload(payload) {
  const connector = getConnector(payload.motor);
  const result = applyErrorToConnectionResult(
    await connector.testConnection({
      host: payload.host,
      port: payload.port,
      database: payload.database,
      user: payload.usuario ?? payload.user,
      password: payload.password,
    }),
  );
  return result;
}
