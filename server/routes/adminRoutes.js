import { Router } from 'express';
import { protect, requireAdmin } from '../middleware/auth.js';
import * as admin from '../controllers/adminController.js';
import * as cats from '../controllers/categoryController.js';
import * as services from '../controllers/serviceController.js';
import * as reviews from '../controllers/reviewController.js';
import * as reports from '../controllers/reportController.js';

const router = Router();
router.use(protect, requireAdmin);

router.get('/dashboard', admin.dashboard);
router.get('/analytics', admin.analytics);
router.get('/users', admin.listUsers);
router.patch('/users/:id/status', admin.setUserStatus);
router.get('/providers', admin.listProvidersAdmin);
router.post('/providers/:id/verification', admin.reviewVerification);
router.patch('/providers/:id/featured', admin.toggleFeatured);
router.get('/categories', cats.adminListCategories);
router.post('/categories', cats.createCategory);
router.patch('/categories/:id', cats.updateCategory);
router.get('/services', services.adminListServices);
router.get('/bookings', admin.listBookingsAdmin);
router.get('/reviews', admin.listReviewsAdmin);
router.patch('/reviews/:id/hide', reviews.hideReview);
router.get('/reports', reports.listReports);
router.patch('/reports/:id', reports.updateReport);
router.get('/audit', admin.listAudit);
router.get('/settings', admin.getSettings);
router.patch('/settings', admin.updateSettings);

export default router;
