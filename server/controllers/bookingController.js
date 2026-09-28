import Booking, { TRANSITIONS } from '../models/Booking.js';
import ProviderProfile from '../models/ProviderProfile.js';
import Service from '../models/Service.js';
import Quotation from '../models/Quotation.js';
import Settings from '../models/Settings.js';
import { success, fail } from '../utils/apiResponse.js';
import { notifyUser } from '../services/notify.js';
import { fromMulterFile } from '../services/imageStorage.js';
import { refreshTrust } from './providerController.js';

async function providerOf(user) {
  return ProviderProfile.findOne({ user: user._id });
}

function canAccess(booking, user, providerProfile) {
  if (user.role === 'admin') return true;
  if (String(booking.customer) === String(user._id)) return true;
  if (providerProfile && String(booking.provider) === String(providerProfile._id)) return true;
  return false;
}

export async function createBooking(req, res, next) {
  try {
    if (req.user.role !== 'customer') return fail(res, 'Only customers can request services', 403);
    const provider = await ProviderProfile.findById(req.body.providerId);
    if (!provider) return fail(res, 'Provider not found', 404);
    const service = req.body.serviceId ? await Service.findById(req.body.serviceId) : null;
    const images = (req.files || []).map((f) => fromMulterFile(f));
    const booking = await Booking.create({
      customer: req.user._id,
      provider: provider._id,
      service: service?._id,
      scheduledAt: req.body.scheduledAt,
      address: req.body.address,
      locationLabel: req.body.locationLabel || req.user.locationLabel,
      description: req.body.description || '',
      images,
      quotedPrice: service?.price || service?.startingPrice || 0,
      statusHistory: [{ status: 'REQUESTED', by: req.user._id }],
    });
    const providerUser = provider.user;
    await notifyUser({
      userId: providerUser,
      type: 'booking_request',
      title: 'New booking request',
      message: `${req.user.name} requested a service`,
      entityType: 'Booking',
      entityId: booking._id,
    });
    return success(res, 'Booking created successfully', { booking }, 201);
  } catch (err) {
    next(err);
  }
}

export async function listBookings(req, res, next) {
  try {
    const filter = {};
    if (req.user.role === 'customer') filter.customer = req.user._id;
    else if (req.user.role === 'provider') {
      const profile = await providerOf(req.user);
      filter.provider = profile?._id;
    }
    if (req.query.status) filter.status = req.query.status;
    const bookings = await Booking.find(filter)
      .populate('customer', 'name email profileImage')
      .populate('provider')
      .populate('service')
      .sort({ createdAt: -1 });
    return success(res, 'Bookings', { bookings });
  } catch (err) {
    next(err);
  }
}

export async function getBooking(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name email phone profileImage')
      .populate('provider')
      .populate('service')
      .populate('quotation');
    if (!booking) return fail(res, 'Booking not found', 404);
    const profile = await providerOf(req.user);
    if (!canAccess(booking, req.user, profile)) return fail(res, 'Forbidden', 403);
    const quotes = await Quotation.find({ booking: booking._id }).sort({ createdAt: -1 });
    return success(res, 'Booking', { booking, quotations: quotes });
  } catch (err) {
    next(err);
  }
}

export async function transitionBooking(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return fail(res, 'Booking not found', 404);
    const profile = await providerOf(req.user);
    if (!canAccess(booking, req.user, profile)) return fail(res, 'Forbidden', 403);

    const nextStatus = req.body.status;
    const allowed = TRANSITIONS[booking.status] || [];
    if (!allowed.includes(nextStatus)) {
      return fail(res, `Cannot move from ${booking.status} to ${nextStatus}`, 400);
    }

    const isProvider = profile && String(booking.provider) === String(profile._id);
    const isCustomer = String(booking.customer) === String(req.user._id);
    const providerFlow = ['ACCEPTED', 'REJECTED', 'SCHEDULED', 'PROVIDER_ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED'];
    if (providerFlow.includes(nextStatus) && !isProvider && req.user.role !== 'admin') {
      return fail(res, 'Only the assigned provider can update this status', 403);
    }
    if (nextStatus === 'CANCELLED') {
      const settings = (await Settings.findOne({ key: 'platform' })) || { cancellationHours: 6 };
      const hours = (new Date(booking.scheduledAt) - Date.now()) / 36e5;
      if (!isCustomer && !isProvider && req.user.role !== 'admin') return fail(res, 'Forbidden', 403);
      if (isCustomer && hours < settings.cancellationHours && !['REQUESTED', 'ACCEPTED'].includes(booking.status)) {
        return fail(res, `Cancellations require at least ${settings.cancellationHours} hours notice`, 400);
      }
      booking.cancelReason = req.body.reason || '';
    }

    booking.status = nextStatus;
    booking.statusHistory.push({ status: nextStatus, by: req.user._id });
    if (nextStatus === 'COMPLETED') {
      booking.finalPrice = booking.quotedPrice;
      if (profile) {
        profile.completedJobs += 1;
        profile.earningsTotal += booking.finalPrice || 0;
        await refreshTrust(profile);
      }
    }
    await booking.save();

    const notifyId = isProvider ? booking.customer : (await ProviderProfile.findById(booking.provider)).user;
    await notifyUser({
      userId: notifyId,
      type: `booking_${nextStatus.toLowerCase()}`,
      title: `Booking ${nextStatus.replace(/_/g, ' ').toLowerCase()}`,
      message: `Booking is now ${nextStatus}`,
      entityType: 'Booking',
      entityId: booking._id,
    });
    return success(res, 'Booking updated', { booking });
  } catch (err) {
    next(err);
  }
}
