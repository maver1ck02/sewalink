import Notification from '../models/Notification.js';
import { emitToUser } from '../sockets/emitter.js';

export async function notifyUser({ userId, type, title, message, entityType, entityId }) {
  const doc = await Notification.create({
    user: userId,
    type,
    title,
    message,
    entityType,
    entityId,
  });
  emitToUser(String(userId), 'notification:new', {
    id: doc._id,
    type,
    title,
    message,
    entityType,
    entityId,
    read: false,
    createdAt: doc.createdAt,
  });
  return doc;
}
