import { getConnector } from '../connectors/index.js';
import { applyErrorToConnectionResult } from '../connectors/connectorErrors.js';
import * as connectionsRepository from '../repositories/connectionsRepository.js';
import { AppError } from '../utils/AppError.js';
import { encryptSecret } from '../utils/crypto.js';

const ALLOWED_ENGINES = new Set(['ORACLE', 'SQL_SERVER', 'POSTGRESQL']);
const ALLOWED_STATUS = new Set(['ACTIVE', 'INACTIVE', 'ERROR']);

function normalizePayload(input) {
  return {
    nombre: String(input.nombre ?? '').trim(),
    motor: String(input.motor ?? '').trim().toUpperCase(),
    host: String(input.host ?? '').trim(),
    port: Number(input.port),
    databaseName: String(input.database ?? '').trim(),
    userName: String(input.usuario ?? '').trim(),
    password: String(input.password ?? ''),
    status: input.status ? String(input.status).trim().toUpperCase() : undefined,
  };
}

function validatePayload(payload, { isUpdate = false } = {}) {
  if (!payload.nombre) throw new AppError('El campo nombre es obligatorio', 400, 'VALIDATION_ERROR');
  if (!ALLOWED_ENGINES.has(payload.motor)) throw new AppError('Motor no soportado', 400, 'VALIDATION_ERROR');
  if (!payload.host) throw new AppError('El campo host es obligatorio', 400, 'VALIDATION_ERROR');
  if (!Number.isInteger(payload.port) || payload.port < 1 || payload.port > 65535) {
    throw new AppError('Puerto inválido', 400, 'VALIDATION_ERROR');
  }
  if (!payload.databaseName) throw new AppError('El campo database es obligatorio', 400, 'VALIDATION_ERROR');
  if (!payload.userName) throw new AppError('El campo usuario es obligatorio', 400, 'VALIDATION_ERROR');

  if (!isUpdate && !payload.password) {
    throw new AppError('El campo password es obligatorio', 400, 'VALIDATION_ERROR');
  }

  if (payload.status && !ALLOWED_STATUS.has(payload.status)) {
    throw new AppError('Estado inválido', 400, 'VALIDATION_ERROR');
  }
}

function toApiModel(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    motor: row.motor,
    host: row.host,
    port: row.port,
    database: row.database_name,
    usuario: row.user_name,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function executeConnectionTest(payload) {
  const connector = getConnector(payload.motor);
  const raw = await connector.testConnection({
    host: payload.host,
    port: payload.port,
    database: payload.databaseName,
    user: payload.userName,
    password: payload.password,
  });
  return applyErrorToConnectionResult(raw);
}

export async function listConnections() {
  const rows = await connectionsRepository.findAllConnections();
  return rows.map(toApiModel);
}

export async function testConnection(input) {
  const payload = normalizePayload(input);
  validatePayload(payload);
  const result = await executeConnectionTest(payload);
  return {
    ok: result.ok,
    engine: payload.motor,
    message: result.message,
  };
}

export async function createConnection(input) {
  const payload = normalizePayload(input);
  validatePayload(payload);

  const connectionTest = await executeConnectionTest(payload);
  const status = payload.status || (connectionTest.ok ? 'ACTIVE' : 'ERROR');
  const { encrypted, iv } = encryptSecret(payload.password);

  let created;
  try {
    created = await connectionsRepository.insertConnection({
      ...payload,
      status,
      passwordEncrypted: encrypted,
      passwordIv: iv,
    });
  } catch (err) {
    if (err.code === '23505') {
      throw new AppError('Ya existe una conexión con ese nombre', 409, 'CONFLICT');
    }
    throw err;
  }

  return {
    ...toApiModel(created),
    connectionTest,
  };
}

export async function updateConnection(id, input) {
  const payload = normalizePayload(input);
  validatePayload(payload, { isUpdate: true });

  const existing = await connectionsRepository.findConnectionById(id);
  if (!existing) throw new AppError('Conexión no encontrada', 404, 'NOT_FOUND');

  const hasNewPassword = Boolean(payload.password);
  const connectionTest = hasNewPassword ? await executeConnectionTest(payload) : null;
  const status = payload.status || (connectionTest ? (connectionTest.ok ? 'ACTIVE' : 'ERROR') : existing.status);

  let passwordEncrypted;
  let passwordIv;
  if (hasNewPassword) {
    const encryptedResult = encryptSecret(payload.password);
    passwordEncrypted = encryptedResult.encrypted;
    passwordIv = encryptedResult.iv;
  }

  let updated;
  try {
    updated = await connectionsRepository.updateConnection(id, {
      ...payload,
      status,
      passwordEncrypted,
      passwordIv,
    });
  } catch (err) {
    if (err.code === '23505') {
      throw new AppError('Ya existe una conexión con ese nombre', 409, 'CONFLICT');
    }
    throw err;
  }

  return {
    ...toApiModel(updated),
    connectionTest,
  };
}

export async function removeConnection(id) {
  const deleted = await connectionsRepository.deleteConnection(id);
  if (!deleted) throw new AppError('Conexión no encontrada', 404, 'NOT_FOUND');
  return { deleted: true };
}
