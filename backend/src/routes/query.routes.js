import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as queryController from '../controllers/queryController.js';

const router = Router();
router.use(authenticate);

router.post('/samples', queryController.generateSamples);
router.get('/top-slow', queryController.getTop);
router.put('/:id/optimize', queryController.optimize);

export default router;
