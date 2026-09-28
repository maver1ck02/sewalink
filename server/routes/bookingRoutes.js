import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { upload } from '../services/imageStorage.js';
import { bookingCreateRules } from '../validators/bookingValidators.js';
import * as bookings from '../controllers/bookingController.js';

const router = Router();
router.post('/', protect, upload.array('images', 5), bookingCreateRules, validate, bookings.createBooking);
router.get('/', protect, bookings.listBookings);
router.get('/:id', protect, bookings.getBooking);
router.patch('/:id/status', protect, bookings.transitionBooking);
export default router;
