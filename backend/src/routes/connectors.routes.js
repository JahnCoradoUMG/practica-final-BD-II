import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as connectorsController from '../controllers/connectorsController.js';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/connectors/registry:
 *   get:
 *     tags: [Connectors]
 *     summary: Registro de conectores multi-motor (SCRUM-21)
 *     security:
 *       - bearerAuth: []
 */
router.get('/registry', connectorsController.registry);

/**
 * @openapi
 * /api/connectors/{connectionId}/test:
 *   post:
 *     tags: [Connectors]
 *     summary: Probar conexión vía adapter y sincronizar estado
 */
router.post('/:connectionId/test', connectorsController.testByConnectionId);

router.get('/:connectionId/metrics', connectorsController.metricsByConnectionId);
router.get('/:connectionId/slow-queries', connectorsController.slowQueriesByConnectionId);
router.post('/:connectionId/backup', connectorsController.backupByConnectionId);

export default router;
