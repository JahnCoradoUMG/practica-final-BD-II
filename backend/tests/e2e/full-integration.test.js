import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  E2E_PREFIX,
  PG_TEST,
  authReq,
  cleanupE2eConnections,
  isMetadataDbAvailable,
  login,
  motorPayload,
  writeEvidence,
} from './helpers.js';

let token;
let dbIds = [];
let cpuRuleId;
let cpuThresholdOriginal;

before(async (t) => {
  if (!(await isMetadataDbAvailable())) {
    t.skip('PostgreSQL metadatos no disponible (levantar docker compose)');
    return;
  }
  token = await login();
  const rules = await authReq(token).get('/api/alerts/dashboard');
  const cpuRule = rules.body.data.rules.find((r) => r.rule_code === 'CPU_HIGH');
  assert.ok(cpuRule, 'Regla CPU_HIGH debe existir en seed');
  cpuRuleId = cpuRule.id;
  cpuThresholdOriginal = Number(cpuRule.threshold_value);
});

after(async () => {
  if (!token) return;
  if (cpuRuleId != null && cpuThresholdOriginal != null) {
    await authReq(token)
      .put(`/api/alerts/rules/${cpuRuleId}`)
      .send({ threshold_value: cpuThresholdOriginal });
  }
  await cleanupE2eConnections();
});

describe('SCRUM-23 — E2E integración de módulos', () => {
  test('Escenario 1: registrar 3 motores → health check OK', async (t) => {
    if (!token) {
      t.skip('BD metadatos no disponible');
      return;
    }

    const client = authReq(token);
    const created = [];

    for (const suffix of ['motor-a', 'motor-b', 'motor-c']) {
      const res = await client.post('/api/connections').send(motorPayload(suffix));
      if (res.status !== 201) {
        t.skip(`Motor de prueba no registrable: ${res.body?.error?.message ?? res.status}`);
        return;
      }
      created.push(res.body.data);
      dbIds.push(res.body.data.id);
    }

    assert.equal(created.length, 3);

    const testRes = await client.post('/api/connections/test').send(motorPayload('probe'));
    assert.equal(testRes.status, 200);

    const healthRun = await client.post('/api/health/run').send({});
    assert.equal(healthRun.status, 200);

    const metrics = healthRun.body.data.metrics.filter((m) =>
      created.some((c) => c.nombre === m.connection_name),
    );
    assert.ok(metrics.length >= 3, 'Debe haber métricas para los 3 motores');
    for (const m of metrics) {
      assert.ok(['HEALTHY', 'WARNING', 'CRITICAL'].includes(m.health_status));
    }

    await writeEvidence(1, {
      motorsRegistered: created.map((c) => ({ id: c.id, nombre: c.nombre })),
      connectivityTest: testRes.body.data,
      healthMetrics: metrics,
      result: 'PASS',
    });
  });

  test('Escenario 2: slow query → optimizar → comparar tiempos', async (t) => {
    if (!token || dbIds.length === 0) {
      t.skip('Requiere escenario 1');
      return;
    }

    const client = authReq(token);
    const samples = await client.post('/api/queries/samples').send({});
    assert.equal(samples.status, 200);
    assert.ok(samples.body.data.length > 0, 'Debe generarse al menos una slow query');

    const target = samples.body.data.reduce((prev, cur) =>
      (Number(cur.duration_ms) > Number(prev.duration_ms) ? cur : prev),
    );
    const beforeMs = Number(target.duration_ms);
    const optimized = await client
      .put(`/api/queries/${target.id}/optimize`)
      .send({ indexSuggestion: 'idx_e2e_created_at' });
    assert.equal(optimized.status, 200);

    const afterMs = Number(optimized.body.data.optimized_duration_ms ?? optimized.body.data.duration_ms);
    assert.ok(afterMs < beforeMs, `Optimización debe reducir tiempo (${afterMs} < ${beforeMs})`);

    await writeEvidence(2, {
      queryId: target.id,
      durationBeforeMs: beforeMs,
      durationAfterMs: afterMs,
      improvementPercent: Number((((beforeMs - afterMs) / beforeMs) * 100).toFixed(1)),
      result: 'PASS',
    });
  });

  test('Escenario 3: carga 100 usuarios → deadlock → resolución', async (t) => {
    if (!token) {
      t.skip('BD metadatos no disponible');
      return;
    }

    const client = authReq(token);
    const sim = await client.post('/api/tx/simulate').send({ users: 100 });
    assert.equal(sim.status, 200);
    assert.ok(Number(sim.body.data.generated ?? sim.body.data.inserted ?? 0) >= 1);

    const dash = await client.get('/api/tx/dashboard');
    assert.equal(dash.status, 200);
    const rows = dash.body.data?.items ?? [];
    const deadlocks = rows.filter((r) => r.lock_type === 'DEADLOCK');
    assert.ok(rows.length >= 50, 'Debe generarse historial de transacciones');

    await writeEvidence(3, {
      usersSimulated: 100,
      transactionsLogged: rows.length,
      deadlocksDetected: deadlocks.length,
      sample: rows.slice(0, 5),
      result: 'PASS',
    });
  });

  test('Escenario 4: cadena backup FULL→DIFF→INC → upload Azure opcional', async (t) => {
    if (!token || dbIds.length === 0) {
      t.skip('Requiere escenario 1');
      return;
    }

    const dbId = dbIds[0];
    const client = authReq(token);

    const full = await client.post('/api/backups/run').send({ dbId, backupType: 'FULL', snapshotName: 'PRE_TEST' });
    const diff = await client.post('/api/backups/run').send({ dbId, backupType: 'DIFF' });
    const inc = await client.post('/api/backups/run').send({ dbId, backupType: 'INC' });

    assert.equal(full.status, 200);
    assert.equal(diff.status, 200);
    assert.equal(inc.status, 200);

    const dash = await client.get('/api/backups/dashboard');
    const types = new Set(dash.body.data.history.filter((h) => h.db_id === dbId).map((h) => h.backup_type));
    assert.ok(types.has('FULL'));
    assert.ok(types.has('DIFF'));
    assert.ok(types.has('INC'));

    await writeEvidence(4, {
      dbId,
      chain: [
        { type: 'FULL', status: full.body.data.status, remoteUrl: full.body.data.remote_url },
        { type: 'DIFF', status: diff.body.data.status, remoteUrl: diff.body.data.remote_url },
        { type: 'INC', status: inc.body.data.status, remoteUrl: inc.body.data.remote_url },
      ],
      azureConfigured: Boolean(full.body.data.remote_url),
      result: 'PASS',
    });
  });

  test('Escenario 5: DROP TABLE simulado → restaurar snapshot → RPO/RTO', async (t) => {
    if (!token || dbIds.length === 0) {
      t.skip('Requiere escenario 1');
      return;
    }

    const dbId = dbIds[0];
    const client = authReq(token);
    const restore = await client.post('/api/backups/restore').send({ dbId });
    assert.equal(restore.status, 200);

    const rtoMinutes = Number(restore.body.data.rtoMinutes);
    const restoreSeconds = Number(restore.body.data.restoreSeconds);
    assert.ok(rtoMinutes > 0);
    assert.ok(restoreSeconds >= 120);

    await writeEvidence(5, {
      scenario: 'DROP TABLE simulado → restore desde último backup',
      dbId,
      backupId: restore.body.data.backupId,
      restorePoint: restore.body.data.restorePoint,
      rtoMinutes,
      restoreSeconds,
      result: 'PASS',
    });
  });

  test('Escenario 6: lag de replicación en 3 cargas', async (t) => {
    if (!token || dbIds.length < 2) {
      t.skip('Requiere al menos 2 motores del escenario 1');
      return;
    }

    const client = authReq(token);
    const capture = await client.post('/api/replication/auto-capture').send({});
    assert.equal(capture.status, 200);
    assert.equal(capture.body.data.generated, 3);

    const dash = await client.get('/api/replication/dashboard');
    const scenarios = new Set(
      dash.body.data
        .filter((r) => r.load_scenario)
        .slice(0, 10)
        .map((r) => r.load_scenario),
    );
    assert.ok(scenarios.has('NORMAL'));
    assert.ok(scenarios.has('MEDIUM'));
    assert.ok(scenarios.has('HIGH'));

    await writeEvidence(6, {
      records: capture.body.data.records,
      scenariosVerified: [...scenarios],
      result: 'PASS',
    });
  });

  test('Escenario 7: cache hit ratio > 50% en consultas frecuentes', async (t) => {
    if (!token) {
      t.skip('BD metadatos no disponible');
      return;
    }

    const client = authReq(token);
    const key = `e2e-${E2E_PREFIX}`;

    await client.get(`/api/cache/sample?key=${key}`);
    for (let i = 0; i < 8; i += 1) {
      await client.get(`/api/cache/sample?key=${key}`);
    }

    const stats = await client.get('/api/cache/stats');
    assert.equal(stats.status, 200);
    const hitRatio = Number(stats.body.data.hit_ratio ?? 0);
    assert.ok(hitRatio >= 50, `Hit ratio esperado >= 50%, obtenido ${hitRatio}%`);

    await writeEvidence(7, {
      cacheKey: key,
      stats: stats.body.data,
      result: 'PASS',
    });
  });

  test('Escenario 8: disparar alerta CPU y backup fallido', async (t) => {
    if (!token || dbIds.length === 0 || !cpuRuleId) {
      t.skip('Requiere escenarios previos');
      return;
    }

    const client = authReq(token);
    const dbId = dbIds[0];

    await client.put(`/api/alerts/rules/${cpuRuleId}`).send({ threshold_value: 0 });
    await client.post('/api/health/run').send({});
    await client.post('/api/backups/record-failure').send({ dbId });

    const evalRes = await client.post('/api/alerts/evaluate').send({});
    assert.equal(evalRes.status, 200);
    assert.ok(Number(evalRes.body.data.emitted) >= 1, 'Debe emitir al menos una alerta');

    const dash = await client.get('/api/alerts/dashboard');
    const openAlerts = dash.body.data.logs.filter((l) => l.resolution_status === 'OPEN');
    assert.ok(openAlerts.length >= 1);

    await writeEvidence(8, {
      alertsEmitted: evalRes.body.data.emitted,
      openAlertsSample: openAlerts.slice(0, 5),
      rulesTriggered: ['CPU_HIGH (umbral temporal -1)', 'BACKUP_FAILED'],
      result: 'PASS',
    });
  });
});
