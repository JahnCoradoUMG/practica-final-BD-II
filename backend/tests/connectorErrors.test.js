import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyErrorToConnectionResult, mapConnectorError } from '../src/connectors/connectorErrors.js';

test('mapConnectorError detecta timeout', () => {
  const mapped = mapConnectorError(new Error('connect ETIMEDOUT'));
  assert.equal(mapped.code, 'CONN_TIMEOUT');
  assert.equal(mapped.connectionStatus, 'ERROR');
});

test('applyErrorToConnectionResult enriquece fallo', () => {
  const result = applyErrorToConnectionResult({
    ok: false,
    engine: 'POSTGRESQL',
    message: 'password authentication failed',
  });
  assert.equal(result.connectionStatus, 'ERROR');
  assert.equal(result.code, 'AUTH_FAILED');
});
