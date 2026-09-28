import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'ProviderProfile', required: true },
  },
  { timestamps: true }
);

favoriteSchema.index({ customer: 1, provider: 1 }, { unique: true });

export default mongoose.model('Favorite', favoriteSchema);
