import { Router } from 'express';
import * as healthController from '../controllers/healthController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/health/thresholds:
 *   get:
 *     tags: [Health]
 *     summary: Umbrales globales de health check
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de umbrales
 */
router.get('/thresholds', healthController.getThresholds);

/**
 * @openapi
 * /api/health/metrics/latest:
 *   get:
 *     tags: [Health]
 *     summary: Últimas métricas por conexión (vista v_latest_db_metrics)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas recientes
 */
router.get('/metrics/latest', healthController.getLatestMetrics);

/**
 * @openapi
 * /api/health/metrics/history:
 *   get:
 *     tags: [Health]
 *     summary: Historial de métricas recientes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Historial de métricas
 */
router.get('/metrics/history', healthController.getMetricsHistory);

router.post('/run', healthController.runCycle);

export default router;
