# Conectores multi-motor — SCRUM-21

Patrón **Adapter** en `backend/src/connectors/`.

## Interface común

| Método | Descripción |
|--------|-------------|
| `testConnection(config)` | Valida conectividad y credenciales |
| `getMetrics(config)` | Exporta métricas del motor |
| `getSlowQueries(config, limit)` | Top consultas lentas |
| `executeBackup(config, type)` | Metadata/ejecución de backup |

## Motores

| Motor | Driver | Modo | Estado |
|-------|--------|------|--------|
| PostgreSQL | `pg` | native | **Funcional** |
| SQL Server | `mssql` (tedious) | native / socket fallback | **Funcional** con instancia SQL |
| Oracle | `oracledb` (opcional) | native / stub | **Stub documentado** sin Instant Client |

### Oracle

Sin Oracle Instant Client, el conector opera en modo **stub**:

- `testConnection`: valida socket + documenta limitación
- `getSlowQueries` / `executeBackup`: respuestas de demostración
- Activar modo native: instalar [Oracle Instant Client](https://www.oracle.com/database/technologies/instant-client.html) y `npm install oracledb`

## API

| Endpoint | Descripción |
|----------|-------------|
| `GET /api/connectors/registry` | Capacidades por motor |
| `POST /api/connectors/:id/test` | Test + sync status `ACTIVE`/`ERROR` |
| `GET /api/connectors/:id/metrics` | Métricas vía adapter |
| `GET /api/connectors/:id/slow-queries` | Slow queries |
| `POST /api/connectors/:id/backup` | Backup vía adapter |

## Errores → CONNECTIONS.status

Los fallos de conexión se mapean con `connectorErrors.js` a `connectionStatus: ERROR` y códigos:

- `CONN_REFUSED`, `CONN_TIMEOUT`, `AUTH_FAILED`, `DB_NOT_FOUND`, etc.

## Tests

```bash
cd backend
npm test
```

Integración PostgreSQL usa `postgres-test` de Docker (`localhost:5433`).
