import Report from '../models/Report.js';
import { success, fail } from '../utils/apiResponse.js';
import { notifyUser } from '../services/notify.js';
import { writeAudit } from '../utils/audit.js';

export async function createReport(req, res, next) {
  try {
    const report = await Report.create({
      reporter: req.user._id,
      targetType: req.body.targetType,
      targetId: req.body.targetId,
      reason: req.body.reason,
      details: req.body.details || '',
    });
    return success(res, 'Report submitted', { report }, 201);
  } catch (err) {
    next(err);
  }
}

export async function listReports(_req, res, next) {
  try {
    const reports = await Report.find().populate('reporter', 'name email').sort({ createdAt: -1 });
    return success(res, 'Reports', { reports });
  } catch (err) {
    next(err);
  }
}

export async function updateReport(req, res, next) {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return fail(res, 'Report not found', 404);
    report.status = req.body.status || report.status;
    report.adminNote = req.body.adminNote || report.adminNote;
    await report.save();
    await notifyUser({
      userId: report.reporter,
      type: 'report_update',
      title: 'Report update',
      message: `Your report is now ${report.status}`,
      entityType: 'Report',
      entityId: report._id,
    });
    await writeAudit({
      actor: req.user._id,
      action: 'report.update',
      targetType: 'Report',
      targetId: report._id,
      meta: { status: report.status },
    });
    return success(res, 'Report updated', { report });
  } catch (err) {
    next(err);
  }
}
