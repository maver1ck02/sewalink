import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: 'platform' },
    platformName: { type: String, default: 'SewaLink' },
    supportEmail: { type: String, default: 'support@sewalink.local' },
    featuredProviderLimit: { type: Number, default: 8 },
    cancellationHours: { type: Number, default: 6 },
  },
  { timestamps: true }
);

export default mongoose.model('Settings', settingsSchema);
