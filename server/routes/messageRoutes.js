import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import * as messages from '../controllers/messageController.js';

const router = Router();
router.get('/', protect, messages.listConversations);
router.post('/', protect, messages.startConversation);
router.post('/provider', protect, messages.startWithProvider);
router.get('/:id', protect, messages.listMessages);
export default router;
