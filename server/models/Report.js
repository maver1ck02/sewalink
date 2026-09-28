import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['provider', 'customer', 'review', 'service'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reason: {
      type: String,
      enum: ['fake_profile', 'fraud', 'spam', 'bad_behavior', 'incorrect_information', 'other'],
      required: true,
    },
    details: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'investigating', 'resolved', 'rejected'], default: 'pending' },
    adminNote: { type: String, default: '' },
  },
  { timestamps: true }
);

reportSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Report', reportSchema);
