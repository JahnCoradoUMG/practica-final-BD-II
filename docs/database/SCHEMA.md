# Esquema de metadatos — PostgreSQL

| Campo | Valor |
|-------|-------|
| **Motor** | PostgreSQL 16+ |
| **Base de datos** | `dataops_metadata` |
| **Scripts** | `docker/init/` |
| **Ticket** | SCRUM-7 |

## Diagrama entidad-relación (resumen)

```
connections ──┬──< db_metrics
              ├──< query_log
              ├──< tx_log
              ├──< backup_history (auto-ref parent_full_id)
              ├──< alert_log
              └──< replication_lag (primary / replica)

alert_rules ──< alert_log

health_thresholds ──> connections (opcional, global si connection_id NULL)

cache_metrics (standalone)
```

## Tablas principales (PDF / SystemBrief)

| Tabla | Módulo | Descripción |
|-------|--------|-------------|
| `connections` | 1 | Motores registrados; password en `password_encrypted` + `password_iv` |
| `db_metrics` | 2 | CPU, memoria, conexiones, locks, deadlocks, disco |
| `query_log` | 3 | Consultas con `performance_class` generada automáticamente |
| `tx_log` | 4 | Sesiones, operaciones, deadlocks |
| `backup_history` | 5 | FULL/DIFF/INC, hash, URL Azure, SLA, snapshots |
| `alert_log` | 9 | Historial de alertas y resolución |

## Tablas de soporte

| Tabla | Uso |
|-------|-----|
| `health_thresholds` | Umbrales Healthy / Warning / Critical |
| `alert_rules` | Reglas editables sin redeploy |
| `replication_lag` | Lag primario-réplica (Módulo 6) |
| `cache_metrics` | Hit/miss Redis (Módulo 7) |

## Clasificación de queries (`query_log.performance_class`)

| Clase | Condición (`duration_ms`) |
|-------|---------------------------|
| FAST | < 100 |
| MEDIUM | 100 – 499 |
| SLOW | 500 – 1999 |
| CRITICAL | ≥ 2000 |

Columna **GENERATED ALWAYS AS** — no requiere lógica en aplicación.

## Seguridad de credenciales

| Columna | Tipo | Notas |
|---------|------|-------|
| `password_encrypted` | BYTEA | Ciphertext AES-256-GCM |
| `password_iv` | BYTEA | Nonce/IV (12 bytes recomendado) |

La clave maestra vive en `CREDENTIALS_ENCRYPTION_KEY` (`.env`), nunca en la BD.

## Vistas

| Vista | Propósito |
|-------|-----------|
| `v_latest_db_metrics` | Última captura por motor (dashboard health) |
| `v_top_slow_queries` | Agregado para top queries y Power BI |

## Aplicar esquema (solo Docker)

El esquema **no** se aplica con `psql` en el host. Usar Docker Compose:

```powershell
docker compose -f docker/docker-compose.yml up -d
docker exec dataops-postgres-metadata psql -U dataops -d dataops_metadata -c "\dt"
```

En el primer arranque, el contenedor `postgres-metadata` ejecuta:

- `docker/init/001_schema.sql` → tablas, índices, vistas
- `docker/init/002_seed.sql` → umbrales y reglas de alerta

Si necesitas reinicializar la BD (borra datos):

```powershell
docker compose -f docker/docker-compose.yml down -v
docker compose -f docker/docker-compose.yml up -d
```

`000_create_database.sql` es documentación legacy; la imagen `postgres:16-alpine` crea usuario/BD vía variables `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`.

## Índices

Índices compuestos en `(db_id, capture_time DESC)` para métricas y logs de alto volumen.  
Índices parciales en alertas abiertas y deadlocks.
