import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';
import { fail } from '../utils/apiResponse.js';

export async function protect(req, res, next) {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '');
    if (!token) return fail(res, 'Unauthorized', 401);
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.id);
    if (!user) return fail(res, 'Unauthorized', 401);
    if (user.status === 'suspended') return fail(res, 'Account suspended', 403);
    if (user.status === 'inactive') return fail(res, 'Account inactive', 403);
    req.user = user;
    next();
  } catch {
    return fail(res, 'Unauthorized', 401);
  }
}

export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return fail(res, 'Forbidden', 403);
    }
    next();
  };
}

export const requireAdmin = requireRoles('admin');
export const requireProvider = requireRoles('provider', 'admin');
export const requireCustomer = requireRoles('customer', 'admin');
