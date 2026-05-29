import { test } from 'node:test';
import assert from 'node:assert/strict';
import { OracleConnector } from '../src/connectors/oracle.connector.js';

test('OracleConnector stub documentado cuando oracledb no está', async () => {
  const connector = new OracleConnector();
  const result = await connector.testConnection({
    host: '127.0.0.1',
    port: 1521,
    database: 'XE',
    user: 'system',
    password: 'oracle',
  });
  assert.equal(typeof result.ok, 'boolean');
  const slow = await connector.getSlowQueries(
    { host: '127.0.0.1', port: 1521, database: 'XE', user: 'x', password: 'x' },
    3,
  );
  if (slow.ok && slow.documentation) {
    assert.match(slow.documentation, /docs\/connectors/);
  }
});
