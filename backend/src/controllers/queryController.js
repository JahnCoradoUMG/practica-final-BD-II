import * as queryService from '../services/queryService.js';
import { success } from '../utils/apiResponse.js';

export async function generateSamples(req, res, next) {
  try {
    const data = await queryService.generateSlowQuerySamples();
    return success(res, data, 'Muestras de queries generadas');
  } catch (err) {
    return next(err);
  }
}

export async function getTop(req, res, next) {
  try {
    const data = await queryService.getTopSlowQueries();
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

export async function optimize(req, res, next) {
  try {
    const data = await queryService.optimizeQuery(req.params.id, req.body.indexSuggestion);
    return success(res, data, 'Query optimizada');
  } catch (err) {
    return next(err);
  }
}
