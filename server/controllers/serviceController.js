import Service from '../models/Service.js';
import ProviderProfile from '../models/ProviderProfile.js';
import { success, fail } from '../utils/apiResponse.js';
import { fromMulterFile } from '../services/imageStorage.js';

async function ownProvider(userId) {
  return ProviderProfile.findOne({ user: userId });
}

export async function listMyServices(req, res, next) {
  try {
    const profile = await ownProvider(req.user._id);
    if (!profile) return fail(res, 'Provider profile not found', 404);
    const services = await Service.find({ provider: profile._id }).populate('category');
    return success(res, 'Services', { services });
  } catch (err) {
    next(err);
  }
}

export async function createService(req, res, next) {
  try {
    const profile = await ownProvider(req.user._id);
    if (!profile) return fail(res, 'Provider profile not found', 404);
    const images = (req.files || []).map((f) => fromMulterFile(f));
    const service = await Service.create({
      provider: profile._id,
      category: req.body.category,
      title: req.body.title,
      description: req.body.description,
      priceType: req.body.priceType,
      price: req.body.price || 0,
      startingPrice: req.body.startingPrice || 0,
      durationMinutes: req.body.durationMinutes || 60,
      serviceArea: req.body.serviceArea || profile.locationLabel,
      images,
    });
    return success(res, 'Service created', { service }, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateService(req, res, next) {
  try {
    const profile = await ownProvider(req.user._id);
    const service = await Service.findById(req.params.id);
    if (!service) return fail(res, 'Service not found', 404);
    if (req.user.role !== 'admin' && String(service.provider) !== String(profile?._id)) {
      return fail(res, 'Forbidden', 403);
    }
    Object.assign(service, {
      title: req.body.title ?? service.title,
      description: req.body.description ?? service.description,
      priceType: req.body.priceType ?? service.priceType,
      price: req.body.price ?? service.price,
      startingPrice: req.body.startingPrice ?? service.startingPrice,
      durationMinutes: req.body.durationMinutes ?? service.durationMinutes,
      serviceArea: req.body.serviceArea ?? service.serviceArea,
      status: req.body.status ?? service.status,
      category: req.body.category ?? service.category,
    });
    if (req.files?.length) service.images = req.files.map((f) => fromMulterFile(f));
    await service.save();
    return success(res, 'Service updated', { service });
  } catch (err) {
    next(err);
  }
}

export async function getService(req, res, next) {
  try {
    const service = await Service.findById(req.params.id).populate('category provider');
    if (!service) return fail(res, 'Service not found', 404);
    return success(res, 'Service', { service });
  } catch (err) {
    next(err);
  }
}

export async function adminListServices(req, res, next) {
  try {
    const services = await Service.find().populate('category provider').sort({ createdAt: -1 }).limit(200);
    return success(res, 'Services', { services });
  } catch (err) {
    next(err);
  }
}
