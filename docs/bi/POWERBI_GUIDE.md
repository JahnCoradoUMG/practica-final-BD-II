# Power BI Guide - SCRUM-19

## Fuente de datos recomendada

Conectar Power BI a PostgreSQL `dataops_metadata` o consumir API y exportar CSV.

## Vistas obligatorias

1. Rendimiento temporal (`db_metrics`: cpu, memory, connections, locks).
2. Heatmap actividad (distribucion por hora/dia usando `capture_time`).
3. Top 10 queries lentas (`query_log`, `duration_ms`, `optimized_duration_ms`).
4. Estado backups y SLA (`backup_history`, `sla_compliant`, `rpo_minutes`, `rto_minutes`).
5. Disponibilidad global por motor (`connections.status`, `db_metrics.health_status`).

## Refresh

- Desarrollo local: refresh manual cada demo.
- Demo final: refresh al iniciar y despues de ejecutar scripts de simulacion.

## Entregable

- Publicar `.pbix` en `docs/bi/DataOps_Control_Center.pbix` o incluir URL de Power BI Service.
