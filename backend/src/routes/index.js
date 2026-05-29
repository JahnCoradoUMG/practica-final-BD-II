import { Router } from 'express';
import authRoutes from './auth.routes.js';
import healthRoutes from './health.routes.js';
import systemRoutes from './system.routes.js';
import connectionsRoutes from './connections.routes.js';
import queryRoutes from './query.routes.js';
import txRoutes from './tx.routes.js';
import backupRoutes from './backup.routes.js';
import replicationRoutes from './replication.routes.js';
import cacheRoutes from './cache.routes.js';
import alertsRoutes from './alerts.routes.js';
import connectorsRoutes from './connectors.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/system', systemRoutes);
router.use('/connections', connectionsRoutes);
router.use('/queries', queryRoutes);
router.use('/tx', txRoutes);
router.use('/backups', backupRoutes);
router.use('/replication', replicationRoutes);
router.use('/cache', cacheRoutes);
router.use('/alerts', alertsRoutes);
router.use('/connectors', connectorsRoutes);

export default router;
