import * as replicationService from '../services/replicationService.js';
import { success } from '../utils/apiResponse.js';

export async function capture(req, res, next) {
  try {
    const { primaryDbId, replicaDbId, scenario } = req.body;
    const data = await replicationService.captureReplicationScenario(
      Number(primaryDbId),
      Number(replicaDbId),
      scenario,
    );
    return success(res, data, 'Métrica de replicación capturada');
  } catch (err) {
    return next(err);
  }
}

export async function autoCapture(req, res, next) {
  try {
    const data = await replicationService.autoCaptureReplication();
    return success(res, data, 'Escenarios de replicación generados');
  } catch (err) {
    return next(err);
  }
}

export async function dashboard(req, res, next) {
  try {
    const data = await replicationService.getReplicationDashboard();
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}
