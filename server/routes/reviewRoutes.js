import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { reviewRules } from '../validators/bookingValidators.js';
import * as reviews from '../controllers/reviewController.js';

const router = Router();
router.post('/', protect, reviewRules, validate, reviews.createReview);
router.get('/provider/:providerId', reviews.listReviews);
export default router;
