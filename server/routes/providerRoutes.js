import { Router } from 'express';
import { protect, requireProvider } from '../middleware/auth.js';
import { upload } from '../services/imageStorage.js';
import * as providers from '../controllers/providerController.js';
import * as services from '../controllers/serviceController.js';
import * as portfolio from '../controllers/portfolioController.js';
import * as analytics from '../controllers/adminController.js';

const router = Router();

router.get('/', providers.searchProviders);
router.get('/compare', providers.compareProviders);
router.get('/me', protect, requireProvider, providers.getMyProvider);
router.put(
  '/me',
  protect,
  requireProvider,
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
  ]),
  providers.updateMyProvider
);
router.post('/me/verification', protect, requireProvider, providers.requestVerification);
router.get('/me/analytics', protect, requireProvider, analytics.providerAnalytics);
router.get('/me/services', protect, requireProvider, services.listMyServices);
router.post('/me/services', protect, requireProvider, upload.array('images', 6), services.createService);
router.put('/me/services/:id', protect, requireProvider, upload.array('images', 6), services.updateService);
router.get('/me/portfolio', protect, requireProvider, async (req, res, next) => {
  const ProviderProfile = (await import('../models/ProviderProfile.js')).default;
  const profile = await ProviderProfile.findOne({ user: req.user._id });
  if (!profile) return res.status(404).json({ success: false, message: 'Provider profile not found' });
  req.params.providerId = String(profile._id);
  return portfolio.listPortfolio(req, res, next);
});
router.post(
  '/me/portfolio',
  protect,
  requireProvider,
  upload.fields([
    { name: 'images', maxCount: 8 },
    { name: 'beforeImage', maxCount: 1 },
    { name: 'afterImage', maxCount: 1 },
  ]),
  portfolio.createPortfolio
);
router.get('/:id', providers.getProvider);
router.get('/:id/portfolio', portfolio.listPortfolio);

export default router;
