import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SqlServerConnector } from '../src/connectors/sqlserver.connector.js';

test('SqlServerConnector implementa interfaz adapter', async () => {
  const connector = new SqlServerConnector();
  await connector.testConnection({ host: '127.0.0.1', port: 1, database: 'x', user: 'x', password: 'x' });
  const caps = connector.getCapabilities();
  assert.equal(caps.engine, 'SQL_SERVER');
  assert.ok(['native', 'socket'].includes(caps.mode));
});

test('SqlServerConnector getSlowQueries retorna estructura', async () => {
  const connector = new SqlServerConnector();
  const result = await connector.getSlowQueries(
    { host: 'invalid-host', port: 1433, database: 'master', user: 'sa', password: 'bad' },
    5,
  );
  assert.equal(typeof result.ok, 'boolean');
  if (result.ok) {
    assert.ok(Array.isArray(result.queries));
  }
});
