# Plan de pruebas E2E — DataOps Control Center (SCRUM-23)

## Objetivo

Validar la integración de los 8 módulos funcionales antes de los entregables finales (informe PDF y demo en vivo).

## Prerrequisitos

| Requisito | Comando / nota |
|-----------|----------------|
| Docker Compose | `docker compose -f docker/docker-compose.yml up -d --build` |
| PostgreSQL metadatos | `localhost:5432` |
| PostgreSQL prueba (motores E2E) | `localhost:5433` (`testdb` / `testuser` / `testpass`) |
| Redis (escenario caché) | `localhost:6379` |
| Variables | Copiar `.env.example` → `.env` |

## Ejecución automatizada

```powershell
# Desde la raíz del proyecto
.\scripts\run-e2e-tests.ps1
```

O manualmente:

```powershell
cd backend
$env:METADATA_DB_HOST = "localhost"
$env:METADATA_DB_PORT = "5432"
$env:POSTGRES_TEST_HOST = "localhost"
$env:POSTGRES_TEST_PORT = "5433"
npm install
npm run test:e2e
```

Las evidencias JSON se generan en `docs/e2e/evidence/scenario-XX-latest.json`.

## Checklist de escenarios

| # | Escenario | Endpoints clave | Criterio | Estado |
|---|-----------|-----------------|----------|--------|
| 1 | Registrar 3 motores → health check OK | `POST /api/connections`, `POST /api/health/run` | 3 conexiones + métricas `HEALTHY`/`WARNING`/`CRITICAL` | ☑ |
| 2 | Slow query → optimizar → comparar tiempos | `POST /api/queries/samples`, `PUT /api/queries/:id/optimize` | `optimized_duration_ms` < `duration_ms` | ☑ |
| 3 | Carga 100 usuarios → deadlock | `POST /api/tx/simulate`, `GET /api/tx/dashboard` | ≥50 filas en `tx_log`, deadlocks detectados | ☑ |
| 4 | Cadena FULL→DIFF→INC → Azure | `POST /api/backups/run` ×3 | Tipos en historial; `remote_url` si Azure configurado | ☑ |
| 5 | DROP TABLE → restaurar → RPO/RTO | `POST /api/backups/restore` | `rtoMinutes` y `restoreSeconds` reportados | ☑ |
| 6 | Lag replicación 3 cargas | `POST /api/replication/auto-capture` | Escenarios NORMAL, MEDIUM, HIGH | ☑ |
| 7 | Cache hit ratio > 50% | `GET /api/cache/sample`, `GET /api/cache/stats` | `hit_ratio` ≥ 50 | ☑ |
| 8 | Alertas CPU + backup fallido | `PUT /api/alerts/rules/:id`, `POST /api/alerts/evaluate` | ≥1 alerta en `alert_log` | ☑ |

Ejecutar de nuevo: `.\scripts\run-e2e-tests.ps1` (requiere Docker con metadatos `:5432` y motor prueba `:5433`).

## Evidencias

| Escenario | Archivo de evidencia |
|-----------|---------------------|
| 1 | [docs/e2e/evidence/scenario-01-latest.json](./e2e/evidence/scenario-01-latest.json) |
| 2 | [docs/e2e/evidence/scenario-02-latest.json](./e2e/evidence/scenario-02-latest.json) |
| 3 | [docs/e2e/evidence/scenario-03-latest.json](./e2e/evidence/scenario-03-latest.json) |
| 4 | [docs/e2e/evidence/scenario-04-latest.json](./e2e/evidence/scenario-04-latest.json) |
| 5 | [docs/e2e/evidence/scenario-05-latest.json](./e2e/evidence/scenario-05-latest.json) |
| 6 | [docs/e2e/evidence/scenario-06-latest.json](./e2e/evidence/scenario-06-latest.json) |
| 7 | [docs/e2e/evidence/scenario-07-latest.json](./e2e/evidence/scenario-07-latest.json) |
| 8 | [docs/e2e/evidence/scenario-08-latest.json](./e2e/evidence/scenario-08-latest.json) |

## Verificación Docker Compose

```powershell
docker compose -f docker/docker-compose.yml config
docker compose -f docker/docker-compose.yml ps
```

No deben aparecer servicios en estado `unhealthy` o reinicios continuos. Revisar logs con:

```powershell
docker compose -f docker/docker-compose.yml logs api --tail 50
```

## Pruebas unitarias / conectores (complementarias)

```powershell
cd backend
npm test
```

8 tests de conectores (PostgreSQL, SQL Server, errores).

## Criterios de aceptación SCRUM-23

- [x] Checklist en `/docs/TEST-PLAN.md`
- [x] Logs JSON de evidencia por escenario (`docs/e2e/evidence/`)
- [x] Suite automatizada `npm run test:e2e`
- [x] Sin errores críticos en `docker compose up` (`scripts/verify-compose.ps1` valida la configuración)
