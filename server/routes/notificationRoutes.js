import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import * as n from '../controllers/notificationController.js';

const router = Router();
router.get('/', protect, n.listNotifications);
router.post('/read-all', protect, n.markAllRead);
router.post('/:id/read', protect, n.markRead);
export default router;
