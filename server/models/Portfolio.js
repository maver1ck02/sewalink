import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema(
  {
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'ProviderProfile', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    images: [{ type: String }],
    beforeImage: { type: String, default: '' },
    afterImage: { type: String, default: '' },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

portfolioSchema.index({ provider: 1, createdAt: -1 });

export default mongoose.model('Portfolio', portfolioSchema);
