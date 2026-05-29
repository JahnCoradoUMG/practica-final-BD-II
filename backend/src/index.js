import app from './app.js';
import env from './config/env.js';
import { pool } from './config/database.js';
import { startHealthCheckScheduler, stopHealthCheckScheduler } from './jobs/healthCheckJob.js';
import { startPhase1Jobs, stopPhase1Jobs } from './jobs/phase1Jobs.js';

const server = app.listen(env.port, '0.0.0.0', () => {
  console.log(`[dataops-api] http://0.0.0.0:${env.port}`);
  console.log(`[dataops-api] Swagger: http://0.0.0.0:${env.port}/api-docs`);
  startHealthCheckScheduler();
  startPhase1Jobs();
});

async function shutdown(signal) {
  console.log(`[dataops-api] ${signal} — cerrando...`);
  stopHealthCheckScheduler();
  stopPhase1Jobs();
  server.close();
  await pool.end();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
