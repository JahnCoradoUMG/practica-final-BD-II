import * as systemService from '../services/systemService.js';
import * as alertRulesRepository from '../repositories/alertRulesRepository.js';
import { success } from '../utils/apiResponse.js';

export async function getInfo(req, res, next) {
  try {
    const data = await systemService.getSystemInfo();
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

export async function getAlertRules(req, res, next) {
  try {
    const data = await alertRulesRepository.findEnabledRules();
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}
