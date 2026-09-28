import mongoose from 'mongoose';

const geoSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [85.324, 27.7172] },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['customer', 'provider', 'admin'], default: 'customer' },
    profileImage: { type: String, default: '' },
    locationLabel: { type: String, default: 'Kathmandu' },
    location: { type: geoSchema, default: () => ({ type: 'Point', coordinates: [85.324, 27.7172] }) },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
    emailVerified: { type: Boolean, default: false },
    emailVerifyToken: { type: String, select: false },
    emailVerifyExpires: { type: Date, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    refreshTokenHash: { type: String, select: false },
  },
  { timestamps: true }
);

userSchema.index({ location: '2dsphere' });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ createdAt: -1 });

userSchema.methods.toPublic = function toPublic() {
  return {
    id: this._id,
    _id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    profileImage: this.profileImage,
    locationLabel: this.locationLabel,
    location: this.location,
    status: this.status,
    emailVerified: this.emailVerified,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export default mongoose.model('User', userSchema);
