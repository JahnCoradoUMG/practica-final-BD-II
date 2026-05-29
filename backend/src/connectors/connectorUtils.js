/** Configuración normalizada para todos los conectores. */
export function toConnectorConfig(input) {
  return {
    host: input.host,
    port: Number(input.port),
    database: input.database ?? input.databaseName,
    user: input.user ?? input.userName,
    password: input.password,
  };
}

export function successResult(engine, data = {}) {
  return { ok: true, engine, ...data };
}

export function failureResult(engine, err, code = 'CONNECTION_ERROR') {
  const message = err?.message ?? String(err);
  return {
    ok: false,
    engine,
    message,
    code,
  };
}
