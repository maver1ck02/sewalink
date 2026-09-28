import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { setIo, emitToUser } from './emitter.js';

export function initSockets(io) {
  setIo(io);

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers.cookie
          ?.split(';')
          .map((p) => p.trim())
          .find((p) => p.startsWith('accessToken='))
          ?.split('=')[1];
      if (!token) return next(new Error('Unauthorized'));
      const payload = jwt.verify(token, env.jwtSecret);
      const user = await User.findById(payload.id);
      if (!user || user.status !== 'active') return next(new Error('Unauthorized'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const userId = String(socket.user._id);
    socket.join(`user:${userId}`);
    emitToUser(userId, 'presence', { userId, online: true });

    socket.on('conversation:join', async (conversationId) => {
      const convo = await Conversation.findById(conversationId);
      if (!convo || !convo.participants.some((p) => String(p) === userId)) return;
      socket.join(`convo:${conversationId}`);
    });

    socket.on('message:send', async ({ conversationId, text, image }) => {
      const convo = await Conversation.findById(conversationId);
      if (!convo || !convo.participants.some((p) => String(p) === userId)) return;
      if (!text && !image) return;
      const msg = await Message.create({
        conversation: conversationId,
        sender: userId,
        text: text || '',
        image: image || '',
        readBy: [userId],
      });
      convo.lastMessage = text || 'Image';
      convo.lastMessageAt = new Date();
      await convo.save();
      const payload = {
        id: msg._id,
        conversationId,
        sender: userId,
        text: msg.text,
        image: msg.image,
        createdAt: msg.createdAt,
      };
      io.to(`convo:${conversationId}`).emit('message:new', payload);
      convo.participants.forEach((p) => {
        if (String(p) !== userId) emitToUser(String(p), 'message:notify', payload);
      });
    });

    socket.on('disconnect', () => {
      emitToUser(userId, 'presence', { userId, online: false });
    });
  });
}
