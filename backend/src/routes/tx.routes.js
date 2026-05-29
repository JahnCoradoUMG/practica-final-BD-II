import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as txController from '../controllers/txController.js';

const router = Router();
router.use(authenticate);

router.post('/simulate', txController.simulate);
router.get('/dashboard', txController.dashboard);

export default router;
