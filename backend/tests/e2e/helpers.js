import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import request from 'supertest';
import app from '../../src/app.js';
import { pool } from '../../src/config/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const EVIDENCE_DIR = path.resolve(__dirname, '../../../docs/e2e/evidence');

export const PG_TEST = {
  host: process.env.POSTGRES_TEST_HOST ?? 'localhost',
  port: Number(process.env.POSTGRES_TEST_PORT ?? 5433),
  database: 'testdb',
  usuario: 'testuser',
  password: 'testpass',
};

export const E2E_PREFIX = `e2e-${Date.now()}`;

export async function isMetadataDbAvailable() {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

export async function writeEvidence(scenarioId, payload) {
  await fs.mkdir(EVIDENCE_DIR, { recursive: true });
  const filename = `scenario-${String(scenarioId).padStart(2, '0')}-latest.json`;
  const filePath = path.join(EVIDENCE_DIR, filename);
  const body = {
    scenarioId,
    executedAt: new Date().toISOString(),
    ...payload,
  };
  await fs.writeFile(filePath, `${JSON.stringify(body, null, 2)}\n`, 'utf8');
  return filePath;
}

export function api() {
  return request(app);
}

export async function login() {
  const res = await api()
    .post('/api/auth/login')
    .send({
      username: process.env.API_ADMIN_USER ?? 'admin',
      password: process.env.API_ADMIN_PASSWORD ?? 'admin123',
    })
    .expect(200);

  const token = res.body?.data?.token;
  if (!token) throw new Error('Login E2E no devolvió token');
  return token;
}

export function authReq(token) {
  return {
    get: (url) => api().get(url).set('Authorization', `Bearer ${token}`),
    post: (url) => api().post(url).set('Authorization', `Bearer ${token}`),
    put: (url) => api().put(url).set('Authorization', `Bearer ${token}`),
    delete: (url) => api().delete(url).set('Authorization', `Bearer ${token}`),
  };
}

export function motorPayload(suffix, overrides = {}) {
  return {
    nombre: `${E2E_PREFIX}-${suffix}`,
    motor: 'POSTGRESQL',
    host: PG_TEST.host,
    port: PG_TEST.port,
    database: PG_TEST.database,
    usuario: PG_TEST.usuario,
    password: PG_TEST.password,
    ...overrides,
  };
}

export async function cleanupE2eConnections() {
  await pool.query(`DELETE FROM connections WHERE nombre LIKE $1`, [`${E2E_PREFIX}%`]);
}
