import * as healthService from '../services/healthService.js';
import { runHealthCheckCycle } from '../jobs/healthCheckJob.js';
import { success } from '../utils/apiResponse.js';

export async function getThresholds(req, res, next) {
  try {
    const data = await healthService.getThresholds();
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

export async function getLatestMetrics(req, res, next) {
  try {
    const data = await healthService.getLatestMetrics();
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

export async function getMetricsHistory(req, res, next) {
  try {
    const requestedLimit = Number(req.query.limit ?? 50);
    const limit = Number.isFinite(requestedLimit)
      ? Math.max(1, Math.min(200, Math.trunc(requestedLimit)))
      : 50;
    const data = await healthService.getMetricsHistory(limit);
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

export async function runCycle(req, res, next) {
  try {
    await runHealthCheckCycle();
    const data = await healthService.getLatestMetrics();
    return success(res, { metrics: data }, 'Ciclo de health check ejecutado');
  } catch (err) {
    return next(err);
  }
}
