import * as metricsService from '../services/metricsService.js';

export async function prometheusMetrics(_req, res, next) {
  try {
    const body = await metricsService.getPrometheusMetrics();
    res.set('Content-Type', metricsService.getMetricsContentType());
    return res.send(body);
  } catch (err) {
    return next(err);
  }
}
