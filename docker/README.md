# Docker — DataOps Control Center

## Uso (única vía recomendada)

Desde la **raíz del proyecto**:

```powershell
docker compose -f docker/docker-compose.yml up -d --build
```

O:

```powershell
.\scripts\docker-up.ps1
```

## Servicios

| Servicio | Contenedor | Puerto host |
|----------|------------|-------------|
| postgres-metadata | dataops-postgres-metadata | 5432 |
| postgres-test | dataops-postgres-test | 5433 |
| redis | dataops-redis | 6379 |
| api | dataops-api | 3000 |
| frontend | dataops-frontend | 5173 |
| prometheus | dataops-prometheus | 9090 |
| grafana | dataops-grafana | 3001 |
| alertmanager | dataops-alertmanager | 9093 |
| postgres-exporter | dataops-postgres-exporter | 9187 |

## Init SQL (SCRUM-7)

`init/001_schema.sql` y `init/002_seed.sql` se aplican automáticamente al crear el volumen `postgres_metadata_data`.

Reiniciar BD desde cero:

```powershell
docker compose -f docker/docker-compose.yml down -v
docker compose -f docker/docker-compose.yml up -d
```

## Estado

- **SCRUM-7**: DDL en `init/`
- **SCRUM-8**: `docker-compose.yml` + Prometheus + Grafana + Alertmanager ✅
- **SCRUM-22**: métricas `prom-client` en API, reglas `alerts.yml`, 2 dashboards Grafana, webhook Alertmanager → `alert_log` ✅

Detalle: [docs/observability/README.md](../docs/observability/README.md).
