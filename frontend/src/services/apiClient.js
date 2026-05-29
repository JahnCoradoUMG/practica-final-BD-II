const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json();
  if (!response.ok || payload.success === false) {
    const message = payload?.error?.message || payload?.message || 'Error en la solicitud';
    throw new Error(message);
  }

  return payload.data;
}

export function loginRequest(username, password) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function getSystemInfo(token) {
  return request('/api/system/info', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getLatestHealthMetrics(token) {
  return request('/api/health/metrics/latest', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getHealthMetricsHistory(token, limit = 50) {
  return request(`/api/health/metrics/history?limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getConnections(token) {
  return request('/api/connections', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function testConnection(token, payload) {
  return request('/api/connections/test', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function createConnection(token, payload) {
  return request('/api/connections', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function updateConnection(token, id, payload) {
  return request(`/api/connections/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function deleteConnection(token, id) {
  return request(`/api/connections/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function generateSlowQueries(token) {
  return request('/api/queries/samples', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getTopSlowQueries(token) {
  return request('/api/queries/top-slow', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function optimizeSlowQuery(token, id, indexSuggestion) {
  return request(`/api/queries/${id}/optimize`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ indexSuggestion }),
  });
}

export function simulateConcurrency(token, users = 100) {
  return request('/api/tx/simulate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ users }),
  });
}

export function getTxDashboard(token) {
  return request('/api/tx/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function runBackup(token, payload) {
  return request('/api/backups/run', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function getBackupDashboard(token) {
  return request('/api/backups/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function simulateRestore(token, dbId) {
  return request('/api/backups/restore', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ dbId }),
  });
}

export function autoCaptureReplication(token) {
  return request('/api/replication/auto-capture', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getReplicationDashboard(token) {
  return request('/api/replication/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getCacheSample(token, key = 'health-summary') {
  return request(`/api/cache/sample?key=${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getCacheStats(token) {
  return request('/api/cache/stats', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function invalidateCache(token, key = 'health-summary') {
  return request('/api/cache/invalidate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ key }),
  });
}

export function evaluateAlerts(token) {
  return request('/api/alerts/evaluate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getAlertsDashboard(token) {
  return request('/api/alerts/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function updateAlertRule(token, id, payload) {
  return request(`/api/alerts/rules/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function ackAlert(token, id, notes = '') {
  return request(`/api/alerts/${id}/ack`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ notes }),
  });
}

export function resolveAlert(token, id, notes = '', resolvedBy = 'admin') {
  return request(`/api/alerts/${id}/resolve`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ notes, resolvedBy }),
  });
}
