import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../services/imageStorage.js';
import * as users from '../controllers/userController.js';

const router = Router();
router.put('/me', protect, upload.single('profileImage'), users.updateMe);
router.get('/:id', protect, users.getUser);
export default router;
