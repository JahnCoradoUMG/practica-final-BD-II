-- =============================================================================
-- DataOps Control Center — Datos iniciales de desarrollo
-- Ticket: SCRUM-7 | Solo para entornos locales / demo
-- =============================================================================

BEGIN;

-- Umbrales globales de health check (porcentajes)
INSERT INTO health_thresholds (connection_id, metric_name, warning_value, critical_value, is_global)
VALUES
    (NULL, 'cpu',           70,   85, TRUE),
    (NULL, 'memory',        75,   90, TRUE),
    (NULL, 'connections',  100,  200, TRUE),
    (NULL, 'locks',         10,   25, TRUE),
    (NULL, 'deadlocks',      1,    3, TRUE),
    (NULL, 'disk_usage',  8000, 9000, TRUE)
ON CONFLICT (metric_name) WHERE connection_id IS NULL DO NOTHING;

-- Reglas de alerta mínimas (SystemBrief §8.2) — configurables sin redeploy
INSERT INTO alert_rules (rule_code, description, metric_name, operator, threshold_value, severity, notify_email, notify_dashboard)
VALUES
    ('CPU_HIGH',           'CPU superior al 85%',              'cpu',         '>',  85,   'WARNING',  TRUE,  TRUE),
    ('DEADLOCKS_HIGH',     'Más de 3 deadlocks detectados',    'deadlocks',   '>',   3,   'CRITICAL', FALSE, TRUE),
    ('BACKUP_FAILED',      'Backup fallido',                   'backup_status', '=', 0, 'CRITICAL', TRUE,  TRUE),
    ('REPLICATION_LAG',    'Lag de replicación > 10 seg',      'lag_seconds', '>',  10,   'WARNING',  FALSE, TRUE),
    ('DISK_HIGH',          'Disco superior al 90%',            'disk_usage',  '>',  90,   'CRITICAL', TRUE,  TRUE),
    ('CONNECTIONS_HIGH',   'Conexiones sobre umbral',          'connections', '>', 150,  'WARNING',  FALSE, TRUE)
ON CONFLICT (rule_code) DO NOTHING;

COMMIT;
