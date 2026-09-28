import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'ProviderProfile', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    priceType: { type: String, enum: ['fixed', 'starting', 'quotation'], required: true },
    price: { type: Number, default: 0 },
    startingPrice: { type: Number, default: 0 },
    durationMinutes: { type: Number, default: 60 },
    serviceArea: { type: String, default: '' },
    images: [{ type: String }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

serviceSchema.index({ title: 'text', description: 'text' });
serviceSchema.index({ provider: 1, status: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ createdAt: -1 });

export default mongoose.model('Service', serviceSchema);
