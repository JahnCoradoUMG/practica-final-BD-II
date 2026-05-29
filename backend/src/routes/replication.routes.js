import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as replicationController from '../controllers/replicationController.js';

const router = Router();
router.use(authenticate);

router.post('/capture', replicationController.capture);
router.post('/auto-capture', replicationController.autoCapture);
router.get('/dashboard', replicationController.dashboard);

export default router;
