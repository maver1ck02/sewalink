import mongoose from 'mongoose';

const quotationSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'ProviderProfile', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    estimatedPrice: { type: Number, required: true },
    description: { type: String, default: '' },
    estimatedDurationMinutes: { type: Number, default: 60 },
    notes: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

quotationSchema.index({ booking: 1, createdAt: -1 });

export default mongoose.model('Quotation', quotationSchema);
