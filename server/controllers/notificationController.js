import Notification from '../models/Notification.js';
import { success } from '../utils/apiResponse.js';

export async function listNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    const unread = await Notification.countDocuments({ user: req.user._id, read: false });
    return success(res, 'Notifications', { notifications, unread });
  } catch (err) {
    next(err);
  }
}

export async function markRead(req, res, next) {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true });
    return success(res, 'Marked as read');
  } catch (err) {
    next(err);
  }
}

export async function markAllRead(req, res, next) {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    return success(res, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
}
