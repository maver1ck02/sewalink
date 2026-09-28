import User from '../models/User.js';
import ProviderProfile from '../models/ProviderProfile.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import Report from '../models/Report.js';
import Verification from '../models/Verification.js';
import AuditLog from '../models/AuditLog.js';
import Settings from '../models/Settings.js';
import Service from '../models/Service.js';
import { success, fail } from '../utils/apiResponse.js';
import { writeAudit } from '../utils/audit.js';
import { notifyUser } from '../services/notify.js';
import { refreshTrust } from './providerController.js';

function monthBuckets(docs, dateField = 'createdAt') {
  const map = {};
  docs.forEach((d) => {
    const dt = new Date(d[dateField]);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
    map[key] = (map[key] || 0) + 1;
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));
}

export async function dashboard(_req, res, next) {
  try {
    const [users, providers, verified, activeBookings, completed, pendingReports] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      ProviderProfile.countDocuments(),
      ProviderProfile.countDocuments({ verificationStatus: 'approved' }),
      Booking.countDocuments({ status: { $in: ['REQUESTED', 'ACCEPTED', 'SCHEDULED', 'PROVIDER_ON_THE_WAY', 'IN_PROGRESS'] } }),
      Booking.countDocuments({ status: 'COMPLETED' }),
      Report.countDocuments({ status: 'pending' }),
    ]);
    return success(res, 'Admin dashboard', {
      stats: { users, providers, verified, activeBookings, completed, pendingReports },
    });
  } catch (err) {
    next(err);
  }
}

export async function analytics(_req, res, next) {
  try {
    const [users, providers, bookings, reports] = await Promise.all([
      User.find({ role: { $ne: 'admin' } }).select('createdAt role'),
      ProviderProfile.find().select('createdAt completedJobs businessName averageRating'),
      Booking.find().select('createdAt status finalPrice'),
      Report.find().select('createdAt status'),
    ]);
    const services = await Service.find().populate('category', 'name');
    const catCount = {};
    services.forEach((s) => {
      const name = s.category?.name || 'Other';
      catCount[name] = (catCount[name] || 0) + 1;
    });
    const popularCategories = Object.entries(catCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    const topProviders = [...providers].sort((a, b) => b.completedJobs - a.completedJobs).slice(0, 8);
    return success(res, 'Analytics', {
      usersPerMonth: monthBuckets(users),
      providersPerMonth: monthBuckets(providers),
      bookingsPerMonth: monthBuckets(bookings),
      completedPerMonth: monthBuckets(bookings.filter((b) => b.status === 'COMPLETED')),
      popularCategories,
      topProviders,
      reportsPerMonth: monthBuckets(reports),
      customerCount: users.filter((u) => u.role === 'customer').length,
      providerCount: users.filter((u) => u.role === 'provider').length,
    });
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req, res, next) {
  try {
    const q = req.query.q ? { $or: [{ name: new RegExp(req.query.q, 'i') }, { email: new RegExp(req.query.q, 'i') }] } : {};
    if (req.query.role) q.role = req.query.role;
    if (req.query.status) q.status = req.query.status;
    const users = await User.find(q).sort({ createdAt: -1 }).limit(200);
    return success(res, 'Users', { users: users.map((u) => u.toPublic()) });
  } catch (err) {
    next(err);
  }
}

export async function setUserStatus(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return fail(res, 'User not found', 404);
    user.status = req.body.status;
    await user.save();
    await writeAudit({
      actor: req.user._id,
      action: 'user.status',
      targetType: 'User',
      targetId: user._id,
      meta: { status: user.status },
    });
    return success(res, 'User updated', { user: user.toPublic() });
  } catch (err) {
    next(err);
  }
}

export async function listProvidersAdmin(req, res, next) {
  try {
    const filter = {};
    if (req.query.verificationStatus) filter.verificationStatus = req.query.verificationStatus;
    const providers = await ProviderProfile.find(filter).populate('user', 'name email status').populate('categories');
    return success(res, 'Providers', { providers });
  } catch (err) {
    next(err);
  }
}

export async function reviewVerification(req, res, next) {
  try {
    const profile = await ProviderProfile.findById(req.params.id);
    if (!profile) return fail(res, 'Provider not found', 404);
    if (String(profile.user) === String(req.user._id)) {
      return fail(res, 'You cannot approve your own verification', 403);
    }
    const approve = req.body.action === 'approve';
    profile.verificationStatus = approve ? 'approved' : 'rejected';
    profile.verificationMessage = req.body.adminNote || '';
    await refreshTrust(profile);
    await Verification.findOneAndUpdate(
      { provider: profile._id, status: 'pending' },
      { status: approve ? 'approved' : 'rejected', adminNote: req.body.adminNote || '', reviewedBy: req.user._id, reviewedAt: new Date() },
      { sort: { createdAt: -1 } }
    );
    await notifyUser({
      userId: profile.user,
      type: approve ? 'verification_approved' : 'verification_rejected',
      title: approve ? 'You are a Verified Provider' : 'Verification rejected',
      message: approve ? 'Customers will now see your Verified badge.' : req.body.adminNote || 'Please update your profile and try again.',
      entityType: 'ProviderProfile',
      entityId: profile._id,
    });
    await writeAudit({
      actor: req.user._id,
      action: approve ? 'provider.verify' : 'provider.reject',
      targetType: 'ProviderProfile',
      targetId: profile._id,
    });
    return success(res, approve ? 'Provider verified' : 'Verification rejected', { provider: profile });
  } catch (err) {
    next(err);
  }
}

export async function toggleFeatured(req, res, next) {
  try {
    const profile = await ProviderProfile.findById(req.params.id);
    if (!profile) return fail(res, 'Provider not found', 404);
    profile.featured = Boolean(req.body.featured);
    await profile.save();
    return success(res, 'Featured status updated', { provider: profile });
  } catch (err) {
    next(err);
  }
}

export async function listBookingsAdmin(_req, res, next) {
  try {
    const bookings = await Booking.find()
      .populate('customer', 'name email')
      .populate('provider')
      .sort({ createdAt: -1 })
      .limit(200);
    return success(res, 'Bookings', { bookings });
  } catch (err) {
    next(err);
  }
}

export async function listReviewsAdmin(_req, res, next) {
  try {
    const reviews = await Review.find().populate('customer', 'name').populate('provider', 'businessName').sort({ createdAt: -1 });
    return success(res, 'Reviews', { reviews });
  } catch (err) {
    next(err);
  }
}

export async function listAudit(_req, res, next) {
  try {
    const logs = await AuditLog.find().populate('actor', 'name email role').sort({ createdAt: -1 }).limit(200);
    return success(res, 'Audit logs', { logs });
  } catch (err) {
    next(err);
  }
}

export async function getSettings(_req, res, next) {
  try {
    const settings = (await Settings.findOne({ key: 'platform' })) || (await Settings.create({ key: 'platform' }));
    return success(res, 'Settings', { settings });
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(req, res, next) {
  try {
    const settings = await Settings.findOneAndUpdate({ key: 'platform' }, req.body, { new: true, upsert: true });
    return success(res, 'Settings updated', { settings });
  } catch (err) {
    next(err);
  }
}

export async function providerAnalytics(req, res, next) {
  try {
    const profile = await ProviderProfile.findOne({ user: req.user._id });
    if (!profile) return fail(res, 'Provider profile not found', 404);
    const bookings = await Booking.find({ provider: profile._id });
    const monthly = monthBuckets(bookings);
    const earnings = {};
    bookings
      .filter((b) => b.status === 'COMPLETED')
      .forEach((b) => {
        const dt = new Date(b.createdAt);
        const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
        earnings[key] = (earnings[key] || 0) + (b.finalPrice || 0);
      });
    const services = await Service.find({ provider: profile._id });
    const reviews = await Review.find({ provider: profile._id, isHidden: false });
    return success(res, 'Provider analytics', {
      totals: {
        requests: bookings.length,
        accepted: bookings.filter((b) => !['REQUESTED', 'REJECTED', 'CANCELLED'].includes(b.status)).length,
        completed: bookings.filter((b) => b.status === 'COMPLETED').length,
        pending: bookings.filter((b) => b.status === 'REQUESTED').length,
        earnings: profile.earningsTotal,
        rating: profile.averageRating,
      },
      monthlyBookings: monthly,
      monthlyEarnings: Object.entries(earnings).map(([month, amount]) => ({ month, amount })),
      services: services.map((s) => ({ title: s.title, id: s._id })),
      ratings: reviews.map((r) => r.overallRating),
    });
  } catch (err) {
    next(err);
  }
}
