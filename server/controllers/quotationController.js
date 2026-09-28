import Quotation from '../models/Quotation.js';
import Booking from '../models/Booking.js';
import ProviderProfile from '../models/ProviderProfile.js';
import { success, fail } from '../utils/apiResponse.js';
import { notifyUser } from '../services/notify.js';

export async function sendQuotation(req, res, next) {
  try {
    const booking = await Booking.findById(req.body.bookingId);
    if (!booking) return fail(res, 'Booking not found', 404);
    const profile = await ProviderProfile.findOne({ user: req.user._id });
    if (!profile || String(booking.provider) !== String(profile._id)) {
      return fail(res, 'Forbidden', 403);
    }
    const quotation = await Quotation.create({
      booking: booking._id,
      provider: profile._id,
      customer: booking.customer,
      estimatedPrice: req.body.estimatedPrice,
      description: req.body.description || '',
      estimatedDurationMinutes: req.body.estimatedDurationMinutes || 60,
      notes: req.body.notes || '',
    });
    booking.quotation = quotation._id;
    booking.quotedPrice = quotation.estimatedPrice;
    await booking.save();
    await notifyUser({
      userId: booking.customer,
      type: 'quotation_received',
      title: 'Quotation received',
      message: `A quote of NPR ${quotation.estimatedPrice} is ready`,
      entityType: 'Quotation',
      entityId: quotation._id,
    });
    return success(res, 'Quotation sent', { quotation }, 201);
  } catch (err) {
    next(err);
  }
}

export async function respondQuotation(req, res, next) {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return fail(res, 'Quotation not found', 404);
    if (String(quotation.customer) !== String(req.user._id) && req.user.role !== 'admin') {
      return fail(res, 'Forbidden', 403);
    }
    const accept = req.body.action === 'accept';
    quotation.status = accept ? 'accepted' : 'rejected';
    await quotation.save();
    const booking = await Booking.findById(quotation.booking);
    const profile = await ProviderProfile.findById(quotation.provider);
    if (accept) {
      booking.quotedPrice = quotation.estimatedPrice;
      if (booking.status === 'REQUESTED') {
        booking.status = 'ACCEPTED';
        booking.statusHistory.push({ status: 'ACCEPTED', by: req.user._id });
      }
      await booking.save();
    }
    await notifyUser({
      userId: profile.user,
      type: accept ? 'quotation_accepted' : 'quotation_rejected',
      title: accept ? 'Quotation accepted' : 'Quotation rejected',
      message: accept ? 'The customer accepted your quote' : 'The customer declined your quote',
      entityType: 'Booking',
      entityId: booking._id,
    });
    return success(res, accept ? 'Quote accepted' : 'Quote rejected', { quotation, booking });
  } catch (err) {
    next(err);
  }
}
