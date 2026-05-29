import { checkDatabaseConnection } from '../config/database.js';
import * as alertRulesRepository from '../repositories/alertRulesRepository.js';
import { getConnectorRegistry } from '../connectors/index.js';

export async function getSystemInfo() {
  const dbOk = await checkDatabaseConnection();
  const alertRules = await alertRulesRepository.findEnabledRules();
  const connectors = getConnectorRegistry();

  return {
    service: 'dataops-api',
    version: '0.3.0',
    database: dbOk ? 'connected' : 'disconnected',
    connectors,
    alertRulesCount: alertRules.length,
    timestamp: new Date().toISOString(),
  };
}
