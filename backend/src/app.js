import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import env from './config/env.js';
import { swaggerSpec } from './config/swagger.js';
import { checkDatabaseConnection } from './config/database.js';
import apiRoutes from './routes/index.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { success } from './utils/apiResponse.js';
import * as metricsController from './controllers/metricsController.js';
import * as alertController from './controllers/alertController.js';

const app = express();
const startTime = Date.now();

app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);

app.get('/health', async (_req, res) => {
  let dbStatus = 'disconnected';
  try {
    await checkDatabaseConnection();
    dbStatus = 'connected';
  } catch {
    dbStatus = 'disconnected';
  }

  return success(res, {
    status: 'ok',
    service: 'dataops-api',
    database: dbStatus,
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
  });
});

app.get('/ready', async (_req, res) => {
  try {
    await checkDatabaseConnection();
    return success(res, { ready: true });
  } catch {
    return res.status(503).json({
      success: false,
      error: { code: 'NOT_READY', message: 'Base de datos no disponible' },
    });
  }
});

app.get('/metrics', metricsController.prometheusMetrics);

/** Webhook Alertmanager → Motor de alertas (SCRUM-22 + SCRUM-20) */
app.post('/api/alerts/webhook/prometheus', alertController.prometheusWebhook);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

app.use('/api', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
