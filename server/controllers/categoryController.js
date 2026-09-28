import Category from '../models/Category.js';
import { success, fail } from '../utils/apiResponse.js';

export async function listCategories(_req, res, next) {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    return success(res, 'Categories', { categories });
  } catch (err) {
    next(err);
  }
}

export async function adminListCategories(_req, res, next) {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return success(res, 'Categories', { categories });
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req, res, next) {
  try {
    const slug = (req.body.slug || req.body.name).toLowerCase().replace(/\s+/g, '-');
    const category = await Category.create({ ...req.body, slug });
    return success(res, 'Category created', { category }, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return fail(res, 'Category not found', 404);
    return success(res, 'Category updated', { category });
  } catch (err) {
    next(err);
  }
}
