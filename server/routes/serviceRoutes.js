import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import * as services from '../controllers/serviceController.js';

const router = Router();
router.get('/:id', services.getService);
export default router;
