import Favorite from '../models/Favorite.js';
import { success, fail } from '../utils/apiResponse.js';

export async function addFavorite(req, res, next) {
  try {
    if (req.user.role !== 'customer') return fail(res, 'Only customers can save providers', 403);
    try {
      const favorite = await Favorite.create({ customer: req.user._id, provider: req.body.providerId });
      return success(res, 'Provider saved', { favorite }, 201);
    } catch (err) {
      if (err.code === 11000) return fail(res, 'Provider already saved', 409);
      throw err;
    }
  } catch (err) {
    next(err);
  }
}

export async function removeFavorite(req, res, next) {
  try {
    await Favorite.findOneAndDelete({ customer: req.user._id, provider: req.params.providerId });
    return success(res, 'Removed from favorites');
  } catch (err) {
    next(err);
  }
}

export async function listFavorites(req, res, next) {
  try {
    const favorites = await Favorite.find({ customer: req.user._id }).populate('provider');
    return success(res, 'Favorites', { favorites });
  } catch (err) {
    next(err);
  }
}
