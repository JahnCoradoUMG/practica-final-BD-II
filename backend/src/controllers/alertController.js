import * as alertService from '../services/alertService.js';
import { success } from '../utils/apiResponse.js';

export async function evaluate(req, res, next) {
  try {
    const data = await alertService.evaluateAlerts();
    return success(res, data, 'Motor de alertas ejecutado');
  } catch (err) {
    return next(err);
  }
}

export async function dashboard(req, res, next) {
  try {
    const data = await alertService.getAlertDashboard();
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

export async function updateRule(req, res, next) {
  try {
    const data = await alertService.updateRule(Number(req.params.id), req.body);
    return success(res, data, 'Regla actualizada en caliente');
  } catch (err) {
    return next(err);
  }
}

export async function acknowledge(req, res, next) {
  try {
    const data = await alertService.acknowledgeAlert(Number(req.params.id), req.body.notes);
    return success(res, data, 'Alerta reconocida');
  } catch (err) {
    return next(err);
  }
}

export async function resolve(req, res, next) {
  try {
    const data = await alertService.resolveAlert(Number(req.params.id), req.body.resolvedBy || 'admin', req.body.notes);
    return success(res, data, 'Alerta resuelta');
  } catch (err) {
    return next(err);
  }
}

export async function prometheusWebhook(req, res, next) {
  try {
    const data = await alertService.ingestPrometheusWebhook(req.body);
    return success(res, data, 'Alertas Prometheus recibidas');
  } catch (err) {
    return next(err);
  }
}
