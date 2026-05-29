import * as connectorsService from '../services/connectorsService.js';
import { success } from '../utils/apiResponse.js';

export async function registry(req, res, next) {
  try {
    return success(res, connectorsService.listRegistry());
  } catch (err) {
    return next(err);
  }
}

export async function testByConnectionId(req, res, next) {
  try {
    const data = await connectorsService.testConnectionById(Number(req.params.connectionId));
    return success(res, data, 'Prueba de conector ejecutada');
  } catch (err) {
    return next(err);
  }
}

export async function metricsByConnectionId(req, res, next) {
  try {
    const data = await connectorsService.getMetricsByConnectionId(Number(req.params.connectionId));
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

export async function slowQueriesByConnectionId(req, res, next) {
  try {
    const limit = Number(req.query.limit ?? 10);
    const data = await connectorsService.getSlowQueriesByConnectionId(Number(req.params.connectionId), limit);
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

export async function backupByConnectionId(req, res, next) {
  try {
    const backupType = req.body.backupType ?? 'FULL';
    const data = await connectorsService.executeBackupByConnectionId(Number(req.params.connectionId), backupType);
    return success(res, data, 'Backup vía conector ejecutado');
  } catch (err) {
    return next(err);
  }
}
