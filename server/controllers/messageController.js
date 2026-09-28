import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import ProviderProfile from '../models/ProviderProfile.js';
import { success, fail } from '../utils/apiResponse.js';

export async function startConversation(req, res, next) {
  try {
    const otherId = req.body.userId;
    if (!otherId) return fail(res, 'User is required');
    let convo = await Conversation.findOne({
      participants: { $all: [req.user._id, otherId] },
    });
    if (!convo) {
      convo = await Conversation.create({
        participants: [req.user._id, otherId],
        booking: req.body.bookingId,
      });
    }
    return success(res, 'Conversation', { conversation: convo });
  } catch (err) {
    next(err);
  }
}

export async function startWithProvider(req, res, next) {
  try {
    const provider = await ProviderProfile.findById(req.body.providerId);
    if (!provider) return fail(res, 'Provider not found', 404);
    req.body.userId = provider.user;
    return startConversation(req, res, next);
  } catch (err) {
    next(err);
  }
}

export async function listConversations(req, res, next) {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name profileImage role')
      .sort({ lastMessageAt: -1 });
    return success(res, 'Conversations', { conversations });
  } catch (err) {
    next(err);
  }
}

export async function listMessages(req, res, next) {
  try {
    const convo = await Conversation.findById(req.params.id);
    if (!convo || !convo.participants.some((p) => String(p) === String(req.user._id))) {
      return fail(res, 'Forbidden', 403);
    }
    const messages = await Message.find({ conversation: convo._id }).sort({ createdAt: 1 });
    await Message.updateMany(
      { conversation: convo._id, sender: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );
    return success(res, 'Messages', { messages, conversation: convo });
  } catch (err) {
    next(err);
  }
}
