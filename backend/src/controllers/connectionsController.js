import * as connectionsService from '../services/connectionsService.js';
import { success } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';

function parseId(rawId) {
  const parsed = Number(rawId);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError('Id inválido', 400, 'VALIDATION_ERROR');
  }
  return parsed;
}

export async function list(req, res, next) {
  try {
    const data = await connectionsService.listConnections();
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

export async function test(req, res, next) {
  try {
    const data = await connectionsService.testConnection(req.body);
    return success(res, data, 'Prueba de conexión ejecutada');
  } catch (err) {
    return next(err);
  }
}

export async function create(req, res, next) {
  try {
    const data = await connectionsService.createConnection(req.body);
    return success(res, data, 'Conexión registrada', 201);
  } catch (err) {
    return next(err);
  }
}

export async function update(req, res, next) {
  try {
    const data = await connectionsService.updateConnection(parseId(req.params.id), req.body);
    return success(res, data, 'Conexión actualizada');
  } catch (err) {
    return next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const data = await connectionsService.removeConnection(parseId(req.params.id));
    return success(res, data, 'Conexión eliminada');
  } catch (err) {
    return next(err);
  }
}
