import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as cacheController from '../controllers/cacheController.js';

const router = Router();
router.use(authenticate);

router.get('/sample', cacheController.sample);
router.post('/invalidate', cacheController.invalidate);
router.get('/stats', cacheController.stats);

export default router;
