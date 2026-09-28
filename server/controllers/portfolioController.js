import Portfolio from '../models/Portfolio.js';
import ProviderProfile from '../models/ProviderProfile.js';
import { success, fail } from '../utils/apiResponse.js';
import { fromMulterFile } from '../services/imageStorage.js';

export async function listPortfolio(req, res, next) {
  try {
    const items = await Portfolio.find({ provider: req.params.providerId }).sort({ completedAt: -1 });
    return success(res, 'Portfolio', { items });
  } catch (err) {
    next(err);
  }
}

export async function createPortfolio(req, res, next) {
  try {
    const profile = await ProviderProfile.findOne({ user: req.user._id });
    if (!profile) return fail(res, 'Provider profile not found', 404);
    const images = (req.files?.images || []).map((f) => fromMulterFile(f));
    const item = await Portfolio.create({
      provider: profile._id,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      images,
      beforeImage: req.files?.beforeImage?.[0] ? fromMulterFile(req.files.beforeImage[0]) : '',
      afterImage: req.files?.afterImage?.[0] ? fromMulterFile(req.files.afterImage[0]) : '',
      completedAt: req.body.completedAt || new Date(),
    });
    return success(res, 'Portfolio item added', { item }, 201);
  } catch (err) {
    next(err);
  }
}
