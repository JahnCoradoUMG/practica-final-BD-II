import * as txService from '../services/txService.js';
import { success } from '../utils/apiResponse.js';

export async function simulate(req, res, next) {
  try {
    const users = Number(req.body.users ?? 100);
    const data = await txService.simulateConcurrency(users);
    return success(res, data, 'Simulación de concurrencia ejecutada');
  } catch (err) {
    return next(err);
  }
}

export async function dashboard(req, res, next) {
  try {
    const data = await txService.getTxDashboard();
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}
