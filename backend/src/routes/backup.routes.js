import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as backupController from '../controllers/backupController.js';

const router = Router();
router.use(authenticate);

router.post('/run', backupController.run);
router.post('/restore', backupController.restore);
router.post('/record-failure', backupController.recordFailure);
router.get('/dashboard', backupController.dashboard);

export default router;
