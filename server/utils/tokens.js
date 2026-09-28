import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';

export function signAccessToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, env.jwtSecret, { expiresIn: '15m' });
}

export function signRefreshToken(user) {
  return jwt.sign({ id: user._id, type: 'refresh' }, env.jwtRefreshSecret, { expiresIn: '7d' });
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSecure ? 'none' : 'lax',
    path: '/',
  };
}
