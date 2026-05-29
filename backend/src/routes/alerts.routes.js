import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as alertController from '../controllers/alertController.js';

const router = Router();
router.use(authenticate);

router.post('/evaluate', alertController.evaluate);
router.get('/dashboard', alertController.dashboard);
router.put('/rules/:id', alertController.updateRule);
router.put('/:id/ack', alertController.acknowledge);
router.put('/:id/resolve', alertController.resolve);

export default router;
