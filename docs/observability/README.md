# Observabilidad — Prometheus, Grafana y Alertmanager (SCRUM-22)

## Arquitectura

```
API (/metrics) ──► Prometheus (9090) ──► Alertmanager (9093)
                         │                      │
                         │                      └── webhook ──► POST /api/alerts/webhook/prometheus
                         ▼
                    Grafana (3001)
postgres-exporter (9187) ──► Prometheus
```

## Métricas expuestas por la API

| Métrica | Descripción |
|---------|-------------|
| `dataops_up` | API en ejecución |
| `dataops_db_cpu_percent` | CPU por conexión/motor |
| `dataops_db_memory_percent` | Memoria por motor |
| `dataops_db_connections` | Conexiones activas |
| `dataops_db_locks` | Bloqueos |
| `dataops_replication_lag_seconds` | Lag primario→réplica |

Fuente: últimas filas de `v_latest_db_metrics` y `replication_lag` (actualizadas en cada scrape de `/metrics`).

## Dashboards provisionados

| UID | Título |
|-----|--------|
| `dataops-health` | DataOps - Health Metrics |
| `dataops-replication` | DataOps - Replicación y Exporters |

Ubicación: `docker/grafana/provisioning/dashboards/json/`.

## Reglas de alerta Prometheus

Archivo: `docker/prometheus/alerts.yml`

- `DataOpsApiDown` — target `dataops-api` caído
- `HighDatabaseCpu` — CPU > 85%
- `HighReplicationLag` — lag > 10 s
- `HighDatabaseConnections` — conexiones > 150

Alertmanager reenvía al webhook de la API; las alertas se registran en `alert_log` (integración con SCRUM-20).

## Verificación rápida

```powershell
docker compose -f docker/docker-compose.yml up -d --build

# Métricas API
curl http://localhost:3000/metrics

# Prometheus targets
start http://localhost:9090/targets

# Grafana (admin / admin)
start http://localhost:3001

# Alertmanager
start http://localhost:9093
```

En Grafana: **Dashboards** → carpeta **DataOps** → abrir *Health Metrics* o *Replicación*.

Para probar el flujo de alertas: en Prometheus → **Alerts**, forzar una condición (p. ej. lag alto tras simular replicación) y revisar `alert_log` en la UI de Alertas.
