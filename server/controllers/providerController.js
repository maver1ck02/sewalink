import ProviderProfile from '../models/ProviderProfile.js';
import Service from '../models/Service.js';
import Review from '../models/Review.js';
import Portfolio from '../models/Portfolio.js';
import Verification from '../models/Verification.js';
import Report from '../models/Report.js';
import User from '../models/User.js';
import { success, fail } from '../utils/apiResponse.js';
import { haversineKm, formatDistance } from '../utils/geo.js';
import { calculateTrustScore } from '../services/trustScore.js';
import { smartMatch, serviceRelevance } from '../services/smartMatch.js';
import { fromMulterFile } from '../services/imageStorage.js';
import { writeAudit } from '../utils/audit.js';
import { notifyUser } from '../services/notify.js';

async function refreshTrust(profile) {
  const user = await User.findById(profile.user);
  const reportCount = await Report.countDocuments({
    targetType: 'provider',
    targetId: profile._id,
    status: 'resolved',
  });
  profile.trustScore = calculateTrustScore(profile, {
    accountCreatedAt: user?.createdAt,
    reportCount,
  });
  await profile.save();
  return profile;
}

export async function getMyProvider(req, res, next) {
  try {
    const profile = await ProviderProfile.findOne({ user: req.user._id }).populate('categories');
    if (!profile) return fail(res, 'Provider profile not found', 404);
    return success(res, 'Provider profile', { provider: profile });
  } catch (err) {
    next(err);
  }
}

export async function updateMyProvider(req, res, next) {
  try {
    const profile = await ProviderProfile.findOne({ user: req.user._id });
    if (!profile) return fail(res, 'Provider profile not found', 404);
    const allowed = [
      'businessName',
      'ownerName',
      'description',
      'phone',
      'email',
      'serviceAreas',
      'locationLabel',
      'workingHours',
      'isAvailable',
      'experienceYears',
      'categories',
    ];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) profile[key] = req.body[key];
    });
    if (req.body.lng && req.body.lat) {
      profile.location = { type: 'Point', coordinates: [Number(req.body.lng), Number(req.body.lat)] };
    }
    if (req.files?.profileImage?.[0]) profile.profileImage = fromMulterFile(req.files.profileImage[0]);
    if (req.files?.coverImage?.[0]) profile.coverImage = fromMulterFile(req.files.coverImage[0]);
    await profile.save();
    return success(res, 'Provider profile updated', { provider: profile });
  } catch (err) {
    next(err);
  }
}

export async function requestVerification(req, res, next) {
  try {
    const profile = await ProviderProfile.findOne({ user: req.user._id });
    if (!profile) return fail(res, 'Provider profile not found', 404);
    profile.verificationStatus = 'pending';
    profile.verificationMessage = req.body.message || '';
    profile.verificationSubmittedAt = new Date();
    await profile.save();
    await Verification.create({
      provider: profile._id,
      message: req.body.message || '',
      status: 'pending',
    });
    await writeAudit({
      actor: req.user._id,
      action: 'provider.verification.request',
      targetType: 'ProviderProfile',
      targetId: profile._id,
    });
    return success(res, 'Verification requested');
  } catch (err) {
    next(err);
  }
}

export async function searchProviders(req, res, next) {
  try {
    const {
      q,
      category,
      location,
      minPrice,
      maxPrice,
      minRating,
      verified,
      available,
      lat,
      lng,
      maxDistanceKm,
      page = 1,
      limit = 12,
      sort = 'match',
    } = req.query;

    const filter = {};
    if (verified === 'true') filter.verificationStatus = 'approved';
    if (available === 'true') filter.isAvailable = true;
    if (minRating) filter.averageRating = { $gte: Number(minRating) };
    if (category) filter.categories = category;
    if (location) filter.locationLabel = new RegExp(location, 'i');

    let providers = await ProviderProfile.find(filter).populate('categories').lean();
    const providerIds = providers.map((p) => p._id);
    const services = await Service.find({
      provider: { $in: providerIds },
      status: 'active',
    }).lean();

    const servicesByProvider = {};
    services.forEach((s) => {
      const id = String(s.provider);
      servicesByProvider[id] = servicesByProvider[id] || [];
      servicesByProvider[id].push(s);
    });

    const prices = services.map((s) => s.price || s.startingPrice || 0).filter((n) => n > 0);
    const globalMin = prices.length ? Math.min(...prices) : 0;
    const globalMax = prices.length ? Math.max(...prices) : 1;

    const originLat = lat ? Number(lat) : null;
    const originLng = lng ? Number(lng) : null;

    let results = providers.map((p) => {
      const list = servicesByProvider[String(p._id)] || [];
      const displayPrice = list[0]?.price || list[0]?.startingPrice || 0;
      let distanceKm = null;
      if (originLat != null && originLng != null && p.location?.coordinates) {
        const [plng, plat] = p.location.coordinates;
        distanceKm = haversineKm(originLat, originLng, plat, plng);
      }
      const relevance = q ? serviceRelevance(q, p, list) : category ? (list.length ? 1 : 0.6) : 0.75;
      const matchScore = smartMatch({
        serviceRelevance: relevance,
        distanceKm,
        rating: p.averageRating,
        isAvailable: p.isAvailable,
        price: displayPrice || null,
        minPrice: globalMin,
        maxPrice: globalMax,
      });
      return {
        ...p,
        services: list,
        matchScore,
        distanceKm,
        distanceLabel: formatDistance(distanceKm),
        startingFrom: displayPrice,
      };
    });

    if (q) {
      results = results.filter((r) => r.matchScore >= 20 || (r.services && r.services.length) || (r.businessName || '').toLowerCase().includes(String(q).toLowerCase()));
    }
    if (minPrice || maxPrice) {
      results = results.filter((r) => {
        const price = r.startingFrom || 0;
        if (minPrice && price < Number(minPrice)) return false;
        if (maxPrice && price > Number(maxPrice)) return false;
        return true;
      });
    }
    if (maxDistanceKm && originLat != null) {
      results = results.filter((r) => r.distanceKm != null && r.distanceKm <= Number(maxDistanceKm));
    }

    if (sort === 'distance') results.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    else if (sort === 'rating') results.sort((a, b) => b.averageRating - a.averageRating);
    else if (sort === 'price') results.sort((a, b) => (a.startingFrom || 0) - (b.startingFrom || 0));
    else results.sort((a, b) => b.matchScore - a.matchScore);

    const p = Number(page);
    const l = Math.min(Number(limit), 50);
    const total = results.length;
    const slice = results.slice((p - 1) * l, p * l);
    return success(res, 'Providers', {
      providers: slice,
      pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) || 1 },
    });
  } catch (err) {
    next(err);
  }
}

export async function getProvider(req, res, next) {
  try {
    const provider = await ProviderProfile.findById(req.params.id).populate('categories');
    if (!provider) return fail(res, 'Provider not found', 404);
    const [services, reviews, portfolio] = await Promise.all([
      Service.find({ provider: provider._id, status: 'active' }).populate('category'),
      Review.find({ provider: provider._id, isHidden: false }).populate('customer', 'name profileImage').sort({ createdAt: -1 }).limit(20),
      Portfolio.find({ provider: provider._id }).sort({ completedAt: -1 }),
    ]);
    await refreshTrust(provider);
    const { lat, lng } = req.query;
    let distanceKm = null;
    if (lat && lng && provider.location?.coordinates) {
      const [plng, plat] = provider.location.coordinates;
      distanceKm = haversineKm(Number(lat), Number(lng), plat, plng);
    }
    return success(res, 'Provider', {
      provider,
      services,
      reviews,
      portfolio,
      distanceKm,
      distanceLabel: formatDistance(distanceKm),
    });
  } catch (err) {
    next(err);
  }
}

export async function compareProviders(req, res, next) {
  try {
    const ids = String(req.query.ids || '')
      .split(',')
      .filter(Boolean);
    if (ids.length < 2) return fail(res, 'Select at least two providers');
    const providers = await ProviderProfile.find({ _id: { $in: ids } }).populate('categories');
    const services = await Service.find({ provider: { $in: ids }, status: 'active' });
    return success(res, 'Compare', { providers, services });
  } catch (err) {
    next(err);
  }
}

export { refreshTrust };
