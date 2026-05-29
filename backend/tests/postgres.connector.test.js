import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PostgresConnector } from '../src/connectors/postgres.connector.js';

const pgConfig = {
  host: process.env.POSTGRES_TEST_HOST ?? 'localhost',
  port: Number(process.env.POSTGRES_TEST_PORT ?? 5433),
  database: 'testdb',
  user: 'testuser',
  password: 'testpass',
};

test('PostgresConnector expone capacidades nativas', () => {
  const connector = new PostgresConnector();
  const caps = connector.getCapabilities();
  assert.equal(caps.engine, 'POSTGRESQL');
  assert.equal(caps.mode, 'native');
  assert.ok(caps.methods.includes('executeBackup'));
});

test('PostgresConnector testConnection contra motor de prueba', async (t) => {
  const connector = new PostgresConnector();
  const result = await connector.testConnection(pgConfig);
  if (!result.ok) {
    t.skip(`PostgreSQL test no disponible: ${result.message}`);
    return;
  }
  assert.equal(result.engine, 'POSTGRESQL');
});

test('PostgresConnector getMetrics cuando hay conexión', async (t) => {
  const connector = new PostgresConnector();
  const testResult = await connector.testConnection(pgConfig);
  if (!testResult.ok) {
    t.skip('PostgreSQL test no disponible');
    return;
  }
  const metrics = await connector.getMetrics(pgConfig);
  assert.equal(metrics.ok, true);
  assert.ok(metrics.metrics.connections >= 0);
});
