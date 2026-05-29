# Benchmark Cache Redis - SCRUM-18

## Metodo

- Endpoint probado: `GET /api/cache/sample?key=health-summary`
- Herramienta: secuencia manual con timestamps (equivalente a curl repetido)
- Corridas:
  1. Primera llamada (miss): genera payload y persiste en cache.
  2. Segunda llamada (hit): respuesta desde Redis.

## Resultado esperado

- Sin cache (miss): ~400 ms
- Con cache (hit): ~40 ms

## Evidencia tecnica

- Logs en `cache_metrics` distinguen `hit=true/false`.
- Dashboard de cache expone `hit_ratio`, `hits`, `misses`.
- API de invalidacion: `POST /api/cache/invalidate`.
