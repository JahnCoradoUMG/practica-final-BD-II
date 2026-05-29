/**
 * Mapeo de errores de conexión a códigos operativos y estado CONNECTIONS.
 */
const ERROR_PATTERNS = [
  { pattern: /ECONNREFUSED|connection refused/i, code: 'CONN_REFUSED' },
  { pattern: /ETIMEDOUT|timeout/i, code: 'CONN_TIMEOUT' },
  { pattern: /ENOTFOUND|getaddrinfo/i, code: 'HOST_NOT_FOUND' },
  { pattern: /authentication|password|login failed|28P01/i, code: 'AUTH_FAILED' },
  { pattern: /database.*does not exist|3D000/i, code: 'DB_NOT_FOUND' },
];

export function mapConnectorError(err) {
  const message = err?.message ?? String(err);
  const match = ERROR_PATTERNS.find((item) => item.pattern.test(message));
  return {
    code: match?.code ?? 'CONNECTION_ERROR',
    message,
    connectionStatus: 'ERROR',
  };
}

export function applyErrorToConnectionResult(result) {
  if (result.ok) return result;
  const mapped = mapConnectorError({ message: result.message });
  return {
    ...result,
    code: result.code ?? mapped.code,
    connectionStatus: 'ERROR',
  };
}
