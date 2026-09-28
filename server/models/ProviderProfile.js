import mongoose from 'mongoose';

const hoursDay = {
  open: { type: String, default: '09:00' },
  close: { type: String, default: '18:00' },
  closed: { type: Boolean, default: false },
};

const providerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    businessName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    serviceAreas: [{ type: String }],
    locationLabel: { type: String, default: 'Kathmandu' },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: { type: [Number], default: [85.324, 27.7172] },
    },
    workingHours: {
      monday: { type: hoursDay, default: () => ({}) },
      tuesday: { type: hoursDay, default: () => ({}) },
      wednesday: { type: hoursDay, default: () => ({}) },
      thursday: { type: hoursDay, default: () => ({}) },
      friday: { type: hoursDay, default: () => ({}) },
      saturday: { type: hoursDay, default: () => ({ open: '10:00', close: '16:00' }) },
      sunday: { type: hoursDay, default: () => ({ closed: true }) },
    },
    isAvailable: { type: Boolean, default: true },
    experienceYears: { type: Number, default: 1 },
    verificationStatus: {
      type: String,
      enum: ['unsubmitted', 'pending', 'approved', 'rejected'],
      default: 'unsubmitted',
    },
    verificationMessage: { type: String, default: '' },
    verificationSubmittedAt: { type: Date },
    trustScore: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
    responseRate: { type: Number, default: 100 },
    featured: { type: Boolean, default: false },
    earningsTotal: { type: Number, default: 0 },
  },
  { timestamps: true }
);

providerSchema.index({ location: '2dsphere' });
providerSchema.index({ categories: 1 });
providerSchema.index({ verificationStatus: 1 });
providerSchema.index({ featured: 1, averageRating: -1 });
providerSchema.index({ businessName: 'text', description: 'text' });

export default mongoose.model('ProviderProfile', providerSchema);
