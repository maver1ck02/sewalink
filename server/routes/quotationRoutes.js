import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { quotationRules } from '../validators/bookingValidators.js';
import * as quotes from '../controllers/quotationController.js';

const router = Router();
router.post('/', protect, quotationRules, validate, quotes.sendQuotation);
router.post('/:id/respond', protect, quotes.respondQuotation);
export default router;
