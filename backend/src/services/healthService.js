import * as healthRepository from '../repositories/healthRepository.js';

export async function getThresholds() {
  return healthRepository.findGlobalThresholds();
}

export async function getLatestMetrics() {
  return healthRepository.findLatestMetricsSummary();
}

export async function getMetricsHistory(limit = 50) {
  return healthRepository.findRecentMetricsHistory(limit);
}
