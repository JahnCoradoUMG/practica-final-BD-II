-- =============================================================================
-- DataOps Control Center — Esquema de metadatos (PostgreSQL 16+)
-- Ticket: SCRUM-7 (DOC-0.2)
-- Ejecutar: psql -U dataops -d dataops_metadata -f 001_schema.sql
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- Extensiones
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Tipos enumerados
-- ---------------------------------------------------------------------------
CREATE TYPE db_engine AS ENUM (
    'ORACLE',
    'SQL_SERVER',
    'POSTGRESQL'
);

CREATE TYPE connection_status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'ERROR'
);

CREATE TYPE health_status AS ENUM (
    'HEALTHY',
    'WARNING',
    'CRITICAL'
);

CREATE TYPE query_performance_class AS ENUM (
    'FAST',      -- < 100 ms
    'MEDIUM',    -- 100–500 ms
    'SLOW',      -- 500–2000 ms
    'CRITICAL'   -- > 2000 ms
);

CREATE TYPE tx_operation AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'SELECT'
);

CREATE TYPE lock_type AS ENUM (
    'SHARED',
    'EXCLUSIVE',
    'DEADLOCK',
    'TIMEOUT'
);

CREATE TYPE backup_type AS ENUM (
    'FULL',
    'DIFF',
    'INC'
);

CREATE TYPE backup_status AS ENUM (
    'RUNNING',
    'SUCCESS',
    'FAILED'
);

CREATE TYPE alert_severity AS ENUM (
    'WARNING',
    'CRITICAL'
);

CREATE TYPE alert_resolution_status AS ENUM (
    'OPEN',
    'ACKNOWLEDGED',
    'RESOLVED'
);

-- ---------------------------------------------------------------------------
-- CONNECTIONS — Registro maestro de motores
-- Credenciales: password_encrypted + password_iv (AES-256-GCM en aplicación)
-- ---------------------------------------------------------------------------
CREATE TABLE connections (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    motor           db_engine NOT NULL,
    host            VARCHAR(255) NOT NULL,
    port            INTEGER NOT NULL CHECK (port > 0 AND port <= 65535),
    database_name   VARCHAR(128) NOT NULL,
    user_name       VARCHAR(128) NOT NULL,
    password_encrypted BYTEA NOT NULL,
    password_iv     BYTEA NOT NULL,
    status          connection_status NOT NULL DEFAULT 'INACTIVE',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_connections_nombre UNIQUE (nombre)
);

COMMENT ON TABLE connections IS 'Motores de BD registrados en la plataforma';
COMMENT ON COLUMN connections.password_encrypted IS 'Password cifrado (nunca texto plano)';
COMMENT ON COLUMN connections.password_iv IS 'IV/nonce para descifrado AES-GCM';

-- ---------------------------------------------------------------------------
-- HEALTH_THRESHOLDS — Umbrales configurables (Módulo 2)
-- ---------------------------------------------------------------------------
CREATE TABLE health_thresholds (
    id              SERIAL PRIMARY KEY,
    connection_id   INTEGER REFERENCES connections(id) ON DELETE CASCADE,
    metric_name     VARCHAR(50) NOT NULL,
    warning_value   NUMERIC(12, 4) NOT NULL,
    critical_value  NUMERIC(12, 4) NOT NULL,
    is_global       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_health_threshold_order CHECK (critical_value >= warning_value)
);

CREATE UNIQUE INDEX uq_health_threshold_global
    ON health_thresholds (metric_name)
    WHERE connection_id IS NULL;

CREATE UNIQUE INDEX uq_health_threshold_per_connection
    ON health_thresholds (connection_id, metric_name)
    WHERE connection_id IS NOT NULL;

COMMENT ON TABLE health_thresholds IS 'Umbrales Healthy/Warning/Critical por métrica';

-- ---------------------------------------------------------------------------
-- DB_METRICS — Capturas de health check (cada 1 min)
-- ---------------------------------------------------------------------------
CREATE TABLE db_metrics (
    id              BIGSERIAL PRIMARY KEY,
    db_id           INTEGER NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
    cpu             NUMERIC(5, 2) NOT NULL CHECK (cpu >= 0 AND cpu <= 100),
    memory          NUMERIC(5, 2) NOT NULL CHECK (memory >= 0 AND memory <= 100),
    connections     INTEGER NOT NULL DEFAULT 0 CHECK (connections >= 0),
    locks           INTEGER NOT NULL DEFAULT 0 CHECK (locks >= 0),
    deadlocks       INTEGER NOT NULL DEFAULT 0 CHECK (deadlocks >= 0),
    disk_usage      BIGINT NOT NULL DEFAULT 0 CHECK (disk_usage >= 0),
    health_status   health_status,
    capture_time    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN db_metrics.disk_usage IS 'Espacio en disco en MB';
COMMENT ON COLUMN db_metrics.health_status IS 'Clasificación según health_thresholds';

-- ---------------------------------------------------------------------------
-- QUERY_LOG — Slow query analyzer (Módulo 3)
-- ---------------------------------------------------------------------------
CREATE TABLE query_log (
    id                  BIGSERIAL PRIMARY KEY,
    db_id               INTEGER NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
    query_text          TEXT NOT NULL,
    duration_ms         INTEGER NOT NULL CHECK (duration_ms >= 0),
    rows_returned       BIGINT NOT NULL DEFAULT 0,
    index_used          VARCHAR(255),
    execution_plan      TEXT,
    performance_class   query_performance_class GENERATED ALWAYS AS (
        CASE
            WHEN duration_ms < 100  THEN 'FAST'::query_performance_class
            WHEN duration_ms < 500  THEN 'MEDIUM'::query_performance_class
            WHEN duration_ms < 2000 THEN 'SLOW'::query_performance_class
            ELSE 'CRITICAL'::query_performance_class
        END
    ) STORED,
    optimized_duration_ms INTEGER CHECK (optimized_duration_ms IS NULL OR optimized_duration_ms >= 0),
    optimization_notes  TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN query_log.optimized_duration_ms IS 'Duración tras optimización (evidencia antes/después)';
COMMENT ON COLUMN query_log.performance_class IS 'Fast<100 | Medium 100-500 | Slow 500-2000 | Critical>2000 ms';

-- ---------------------------------------------------------------------------
-- TX_LOG — Concurrencia y deadlocks (Módulo 4)
-- ---------------------------------------------------------------------------
CREATE TABLE tx_log (
    id              BIGSERIAL PRIMARY KEY,
    db_id           INTEGER NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
    session_id      VARCHAR(64) NOT NULL,
    operacion       tx_operation NOT NULL,
    inicio          TIMESTAMPTZ NOT NULL,
    fin             TIMESTAMPTZ,
    wait_time       INTEGER NOT NULL DEFAULT 0 CHECK (wait_time >= 0),
    lock_type       lock_type,
    resolved        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_tx_log_fin_after_inicio CHECK (fin IS NULL OR fin >= inicio)
);

COMMENT ON COLUMN tx_log.wait_time IS 'Tiempo de espera en milisegundos';
COMMENT ON COLUMN tx_log.resolved IS 'TRUE si deadlock/timeout fue resuelto automáticamente';

-- ---------------------------------------------------------------------------
-- BACKUP_HISTORY — Full / Diff / Inc + metadatos nube (Módulo 5)
-- ---------------------------------------------------------------------------
CREATE TABLE backup_history (
    id                  SERIAL PRIMARY KEY,
    db_id               INTEGER NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
    backup_type         backup_type NOT NULL,
    status              backup_status NOT NULL DEFAULT 'RUNNING',
    file_path           VARCHAR(512),
    size_mb             NUMERIC(12, 2) CHECK (size_mb IS NULL OR size_mb >= 0),
    duration_seconds    INTEGER CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
    restore_point       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    parent_full_id      INTEGER REFERENCES backup_history(id) ON DELETE SET NULL,
    snapshot_name       VARCHAR(50) CHECK (
        snapshot_name IS NULL OR snapshot_name IN ('PRE_DEPLOY', 'PRE_TEST', 'PRE_IMPORT')
    ),
    integrity_hash      VARCHAR(128),
    hash_algorithm      VARCHAR(20) DEFAULT 'SHA256',
    remote_url          VARCHAR(1024),
    sla_compliant       BOOLEAN,
    rpo_minutes         NUMERIC(10, 2),
    rto_minutes         NUMERIC(10, 2),
    error_message       TEXT,
    started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at        TIMESTAMPTZ,
    CONSTRAINT chk_backup_parent_full CHECK (
        backup_type = 'FULL' AND parent_full_id IS NULL
        OR backup_type IN ('DIFF', 'INC')
    )
);

COMMENT ON TABLE backup_history IS 'Historial FULL/DIFF/INC; parent_full_id enlaza cadena de restauración';
COMMENT ON COLUMN backup_history.sla_compliant IS 'Cumple SLA objetivo (RPO≈15min, RTO≈45min)';

-- ---------------------------------------------------------------------------
-- ALERT_RULES — Reglas configurables sin redeploy (Módulo 9)
-- ---------------------------------------------------------------------------
CREATE TABLE alert_rules (
    id              SERIAL PRIMARY KEY,
    rule_code       VARCHAR(50) NOT NULL UNIQUE,
    description     VARCHAR(255) NOT NULL,
    metric_name     VARCHAR(50) NOT NULL,
    operator        VARCHAR(10) NOT NULL DEFAULT '>' CHECK (operator IN ('>', '<', '>=', '<=', '=')),
    threshold_value NUMERIC(12, 4) NOT NULL,
    severity        alert_severity NOT NULL,
    notify_email    BOOLEAN NOT NULL DEFAULT FALSE,
    notify_dashboard BOOLEAN NOT NULL DEFAULT TRUE,
    is_enabled      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- ALERT_LOG — Auditoría de alertas disparadas (Módulo 9)
-- ---------------------------------------------------------------------------
CREATE TABLE alert_log (
    id                  BIGSERIAL PRIMARY KEY,
    rule_id             INTEGER REFERENCES alert_rules(id) ON DELETE SET NULL,
    db_id               INTEGER REFERENCES connections(id) ON DELETE SET NULL,
    triggered_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    condition_text      VARCHAR(500) NOT NULL,
    metric_value        NUMERIC(12, 4),
    severity            alert_severity NOT NULL,
    resolution_status   alert_resolution_status NOT NULL DEFAULT 'OPEN',
    resolved_at         TIMESTAMPTZ,
    resolved_by         VARCHAR(100),
    notes               TEXT
);

COMMENT ON TABLE alert_log IS 'Registro de alertas: condición, motor, severidad y resolución';

-- ---------------------------------------------------------------------------
-- REPLICATION_LAG — Métricas primario-réplica (Módulo 6)
-- ---------------------------------------------------------------------------
CREATE TABLE replication_lag (
    id              BIGSERIAL PRIMARY KEY,
    primary_db_id   INTEGER NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
    replica_db_id   INTEGER NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
    lag_seconds     NUMERIC(10, 3) NOT NULL CHECK (lag_seconds >= 0),
    load_scenario   VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    captured_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_replication_lag_different CHECK (primary_db_id <> replica_db_id)
);

-- ---------------------------------------------------------------------------
-- CACHE_METRICS — Hit/miss Redis (Módulo 7)
-- ---------------------------------------------------------------------------
CREATE TABLE cache_metrics (
    id              BIGSERIAL PRIMARY KEY,
    cache_key       VARCHAR(255) NOT NULL,
    hit             BOOLEAN NOT NULL,
    response_ms     INTEGER NOT NULL CHECK (response_ms >= 0),
    endpoint        VARCHAR(255),
    captured_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Índices
-- ---------------------------------------------------------------------------
CREATE INDEX idx_connections_status ON connections (status);
CREATE INDEX idx_connections_motor ON connections (motor);

CREATE INDEX idx_db_metrics_db_capture ON db_metrics (db_id, capture_time DESC);
CREATE INDEX idx_db_metrics_capture ON db_metrics (capture_time DESC);
CREATE INDEX idx_db_metrics_health ON db_metrics (health_status) WHERE health_status IS NOT NULL;

CREATE INDEX idx_query_log_db_created ON query_log (db_id, created_at DESC);
CREATE INDEX idx_query_log_performance ON query_log (performance_class, duration_ms DESC);
CREATE INDEX idx_query_log_duration ON query_log (duration_ms DESC);

CREATE INDEX idx_tx_log_db_inicio ON tx_log (db_id, inicio DESC);
CREATE INDEX idx_tx_log_lock_type ON tx_log (lock_type) WHERE lock_type IN ('DEADLOCK', 'TIMEOUT');
CREATE INDEX idx_tx_log_session ON tx_log (session_id);

CREATE INDEX idx_backup_history_db_started ON backup_history (db_id, started_at DESC);
CREATE INDEX idx_backup_history_type ON backup_history (backup_type, status);
CREATE INDEX idx_backup_history_parent ON backup_history (parent_full_id) WHERE parent_full_id IS NOT NULL;

CREATE INDEX idx_alert_log_triggered ON alert_log (triggered_at DESC);
CREATE INDEX idx_alert_log_db_status ON alert_log (db_id, resolution_status);
CREATE INDEX idx_alert_log_open ON alert_log (resolution_status) WHERE resolution_status = 'OPEN';

CREATE INDEX idx_replication_lag_captured ON replication_lag (captured_at DESC);
CREATE INDEX idx_cache_metrics_captured ON cache_metrics (captured_at DESC);
CREATE INDEX idx_cache_metrics_hit ON cache_metrics (hit, captured_at DESC);

-- ---------------------------------------------------------------------------
-- Trigger: updated_at en connections y alert_rules
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_connections_updated_at
    BEFORE UPDATE ON connections
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_alert_rules_updated_at
    BEFORE UPDATE ON alert_rules
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Vista: última métrica por conexión (dashboard health)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_latest_db_metrics AS
SELECT DISTINCT ON (m.db_id)
    m.*,
    c.nombre AS connection_name,
    c.motor
FROM db_metrics m
JOIN connections c ON c.id = m.db_id
ORDER BY m.db_id, m.capture_time DESC;

-- ---------------------------------------------------------------------------
-- Vista: top 10 queries lentas por motor
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_top_slow_queries AS
SELECT
    q.db_id,
    c.nombre AS connection_name,
    q.query_text,
    AVG(q.duration_ms)::INTEGER AS avg_duration_ms,
    MAX(q.duration_ms) AS max_duration_ms,
    COUNT(*) AS execution_count,
    q.performance_class
FROM query_log q
JOIN connections c ON c.id = q.db_id
WHERE q.performance_class IN ('SLOW', 'CRITICAL')
GROUP BY q.db_id, c.nombre, q.query_text, q.performance_class
ORDER BY avg_duration_ms DESC;

COMMIT;
