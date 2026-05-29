import * as backupService from '../services/backupService.js';
import { success } from '../utils/apiResponse.js';

export async function run(req, res, next) {
  try {
    const { dbId, backupType, snapshotName } = req.body;
    const data = await backupService.runBackup(Number(dbId), backupType, snapshotName ?? null);
    return success(res, data, 'Backup ejecutado');
  } catch (err) {
    return next(err);
  }
}

export async function dashboard(req, res, next) {
  try {
    const data = await backupService.getBackupDashboard();
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

export async function restore(req, res, next) {
  try {
    const data = await backupService.simulateRestore(Number(req.body.dbId));
    return success(res, data, 'Restauración simulada completada');
  } catch (err) {
    return next(err);
  }
}

export async function recordFailure(req, res, next) {
  try {
    const data = await backupService.recordFailedBackup(Number(req.body.dbId));
    return success(res, data, 'Backup fallido registrado para pruebas');
  } catch (err) {
    return next(err);
  }
}
