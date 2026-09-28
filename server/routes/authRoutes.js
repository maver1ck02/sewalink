import { Router } from 'express';
import * as auth from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { registerRules, loginRules, forgotRules, resetRules } from '../validators/authValidators.js';

const router = Router();

router.post('/register', authLimiter, registerRules, validate, auth.register);
router.post('/login', authLimiter, loginRules, validate, auth.login);
router.post('/logout', protect, auth.logout);
router.post('/refresh', auth.refresh);
router.get('/me', protect, auth.me);
router.post('/verify-email', auth.verifyEmail);
router.post('/forgot-password', authLimiter, forgotRules, validate, auth.forgotPassword);
router.post('/reset-password', resetRules, validate, auth.resetPassword);

export default router;
