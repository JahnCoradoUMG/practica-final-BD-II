import dotenv from 'dotenv';

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.API_PORT ?? 3000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  adminUser: process.env.API_ADMIN_USER ?? 'admin',
  adminPassword: process.env.API_ADMIN_PASSWORD ?? 'admin123',
  db: {
    host: process.env.METADATA_DB_HOST ?? 'postgres-metadata',
    port: Number(process.env.METADATA_DB_PORT ?? 5432),
    database: process.env.METADATA_DB_NAME ?? 'dataops_metadata',
    user: process.env.METADATA_DB_USER ?? 'dataops',
    password: process.env.METADATA_DB_PASSWORD ?? 'dataops_dev_change_me',
  },
  credentialsEncryptionKey: process.env.CREDENTIALS_ENCRYPTION_KEY ?? 'dev-encryption-key-32-chars-min!!',
  healthCheckIntervalMs: Number(process.env.HEALTH_CHECK_INTERVAL_MS ?? 60_000),
  redis: {
    host: process.env.REDIS_HOST ?? 'redis',
    port: Number(process.env.REDIS_PORT ?? 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    ttlSeconds: Number(process.env.REDIS_TTL_SECONDS ?? 300),
  },
  azure: {
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || '',
    container: process.env.AZURE_STORAGE_CONTAINER ?? 'dataops-backups',
    retentionDays: Number(process.env.AZURE_BACKUP_RETENTION_DAYS ?? 30),
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: String(process.env.SMTP_SECURE ?? 'false') === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    fromEmail: process.env.ALERT_FROM_EMAIL || 'alerts@example.com',
    toEmail: process.env.ALERT_TO_EMAIL || 'dba@example.com',
  },
};

export default env;
