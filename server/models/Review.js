import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'ProviderProfile', required: true },
    overallRating: { type: Number, required: true, min: 1, max: 5 },
    serviceQuality: { type: Number, required: true, min: 1, max: 5 },
    communication: { type: Number, required: true, min: 1, max: 5 },
    professionalism: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reviewSchema.index({ provider: 1, createdAt: -1 });

export default mongoose.model('Review', reviewSchema);
