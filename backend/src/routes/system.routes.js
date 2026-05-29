import { Router } from 'express';
import * as systemController from '../controllers/systemController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/system/info:
 *   get:
 *     tags: [System]
 *     summary: Estado del API, BD y conectores registrados
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del sistema
 */
router.get('/info', systemController.getInfo);

/**
 * @openapi
 * /api/system/alert-rules:
 *   get:
 *     tags: [System]
 *     summary: Reglas de alerta habilitadas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reglas desde alert_rules
 */
router.get('/alert-rules', systemController.getAlertRules);

export default router;
