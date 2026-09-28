import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import ProviderProfile from '../models/ProviderProfile.js';
import { success, fail } from '../utils/apiResponse.js';
import { refreshTrust } from './providerController.js';
import { notifyUser } from '../services/notify.js';

export async function createReview(req, res, next) {
  try {
    const booking = await Booking.findById(req.body.bookingId);
    if (!booking) return fail(res, 'Booking not found', 404);
    if (String(booking.customer) !== String(req.user._id)) {
      return fail(res, 'You can only review your own completed bookings', 403);
    }
    if (booking.status !== 'COMPLETED') return fail(res, 'You can only review completed bookings', 400);
    const existing = await Review.findOne({ booking: booking._id });
    if (existing) return fail(res, 'This booking was already reviewed', 409);

    const review = await Review.create({
      booking: booking._id,
      customer: req.user._id,
      provider: booking.provider,
      overallRating: req.body.overallRating,
      serviceQuality: req.body.serviceQuality,
      communication: req.body.communication,
      professionalism: req.body.professionalism,
      comment: req.body.comment || '',
    });

    const stats = await Review.aggregate([
      { $match: { provider: booking.provider, isHidden: false } },
      { $group: { _id: '$provider', avg: { $avg: '$overallRating' }, count: { $sum: 1 } } },
    ]);
    const profile = await ProviderProfile.findById(booking.provider);
    profile.averageRating = Number((stats[0]?.avg || 0).toFixed(2));
    profile.totalReviews = stats[0]?.count || 0;
    await refreshTrust(profile);
    await notifyUser({
      userId: profile.user,
      type: 'new_review',
      title: 'New review',
      message: `${req.user.name} left a ${review.overallRating}-star review`,
      entityType: 'Review',
      entityId: review._id,
    });
    return success(res, 'Review submitted', { review }, 201);
  } catch (err) {
    next(err);
  }
}

export async function hideReview(req, res, next) {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { isHidden: true }, { new: true });
    if (!review) return fail(res, 'Review not found', 404);
    return success(res, 'Review removed', { review });
  } catch (err) {
    next(err);
  }
}

export async function listReviews(req, res, next) {
  try {
    const reviews = await Review.find({ provider: req.params.providerId, isHidden: false })
      .populate('customer', 'name profileImage')
      .sort({ createdAt: -1 });
    return success(res, 'Reviews', { reviews });
  } catch (err) {
    next(err);
  }
}
