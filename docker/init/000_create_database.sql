-- =============================================================================
-- Crear rol y base de datos (ejecutar como superusuario postgres)
-- psql -U postgres -f 000_create_database.sql
-- =============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'dataops') THEN
        CREATE ROLE dataops WITH LOGIN PASSWORD 'dataops_dev_change_me';
    END IF;
END
$$;

SELECT 'CREATE DATABASE dataops_metadata OWNER dataops'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'dataops_metadata')\gexec

GRANT ALL PRIVILEGES ON DATABASE dataops_metadata TO dataops;
