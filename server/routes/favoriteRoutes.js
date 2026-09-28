import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import * as fav from '../controllers/favoriteController.js';

const router = Router();
router.get('/', protect, fav.listFavorites);
router.post('/', protect, fav.addFavorite);
router.delete('/:providerId', protect, fav.removeFavorite);
export default router;
