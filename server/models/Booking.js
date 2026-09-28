import mongoose from 'mongoose';

export const BOOKING_STATUSES = [
  'REQUESTED',
  'ACCEPTED',
  'SCHEDULED',
  'PROVIDER_ON_THE_WAY',
  'IN_PROGRESS',
  'COMPLETED',
  'REJECTED',
  'CANCELLED',
  'EXPIRED',
  'DISPUTED',
];

export const TRANSITIONS = {
  REQUESTED: ['ACCEPTED', 'REJECTED', 'CANCELLED', 'EXPIRED'],
  ACCEPTED: ['SCHEDULED', 'CANCELLED'],
  SCHEDULED: ['PROVIDER_ON_THE_WAY', 'CANCELLED'],
  PROVIDER_ON_THE_WAY: ['IN_PROGRESS', 'DISPUTED', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'DISPUTED'],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
  EXPIRED: [],
  DISPUTED: ['COMPLETED', 'CANCELLED'],
};

const bookingSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'ProviderProfile', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    quotation: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation' },
    scheduledAt: { type: Date, required: true },
    address: { type: String, required: true },
    locationLabel: { type: String, default: '' },
    description: { type: String, default: '' },
    images: [{ type: String }],
    status: { type: String, enum: BOOKING_STATUSES, default: 'REQUESTED' },
    quotedPrice: { type: Number, default: 0 },
    finalPrice: { type: Number, default: 0 },
    cancelReason: { type: String, default: '' },
    statusHistory: [
      {
        status: String,
        at: { type: Date, default: Date.now },
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
  },
  { timestamps: true }
);

bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ provider: 1, status: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Booking', bookingSchema);
