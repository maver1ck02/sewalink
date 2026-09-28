import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema(
  {
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'ProviderProfile', required: true, unique: true },
    blockedDates: [{ type: Date }],
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Availability', availabilitySchema);
