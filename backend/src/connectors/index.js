import { PostgresConnector } from './postgres.connector.js';
import { SqlServerConnector } from './sqlserver.connector.js';
import { OracleConnector } from './oracle.connector.js';

const registry = [
  new PostgresConnector(),
  new SqlServerConnector(),
  new OracleConnector(),
];

export function getConnector(engine) {
  const found = registry.find((c) => c.engine === engine);
  if (!found) throw new Error(`Conector no registrado: ${engine}`);
  return found;
}

export function getConnectorRegistry() {
  return registry.map((c) => c.getCapabilities());
}

export { registry };
