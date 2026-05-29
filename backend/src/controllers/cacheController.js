import * as cacheService from '../services/cacheService.js';
import { success } from '../utils/apiResponse.js';

export async function sample(req, res, next) {
  try {
    const key = req.query.key || 'health-summary';
    const data = await cacheService.getCachedSample(String(key));
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

export async function invalidate(req, res, next) {
  try {
    const data = await cacheService.invalidateCache(String(req.body.key || 'health-summary'));
    return success(res, data, 'Cache invalidada');
  } catch (err) {
    return next(err);
  }
}

export async function stats(req, res, next) {
  try {
    const data = await cacheService.getCacheDashboard();
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}
