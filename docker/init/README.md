# Scripts de inicialización PostgreSQL

## Modo oficial: Docker Compose (SCRUM-8)

Los archivos se montan en `/docker-entrypoint-initdb.d/` del servicio `postgres-metadata`:

| Archivo | Cuándo se ejecuta |
|---------|-------------------|
| `001_schema.sql` | Primer arranque del volumen (una sola vez) |
| `002_seed.sql` | Primer arranque del volumen (una sola vez) |

```powershell
docker compose -f docker/docker-compose.yml up -d
docker exec dataops-postgres-metadata psql -U dataops -d dataops_metadata -c "\dt"
```

## `000_create_database.sql`

Solo referencia para administración manual fuera de Docker. **No se monta** en el contenedor.

Variables equivalentes en Compose:

- `POSTGRES_USER=dataops`
- `POSTGRES_PASSWORD` (ver `.env`)
- `POSTGRES_DB=dataops_metadata`
