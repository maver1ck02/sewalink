import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    targetType: { type: String, default: '' },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

auditSchema.index({ createdAt: -1 });
auditSchema.index({ action: 1 });

export default mongoose.model('AuditLog', auditSchema);
