import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import * as reports from '../controllers/reportController.js';

const router = Router();
router.post('/', protect, reports.createReport);
export default router;
