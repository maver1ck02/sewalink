import AuditLog from '../models/AuditLog.js';

export async function writeAudit({ actor, action, targetType, targetId, meta }) {
  try {
    await AuditLog.create({ actor, action, targetType, targetId, meta });
  } catch {
    // Audit should never break the main request.
  }
}
