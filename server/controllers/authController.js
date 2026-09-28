import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import ProviderProfile from '../models/ProviderProfile.js';
import { env } from '../config/env.js';
import { success, fail } from '../utils/apiResponse.js';
import { signAccessToken, signRefreshToken, hashToken, cookieOptions } from '../utils/tokens.js';
import { sendEmail, verifyEmailTemplate, resetEmailTemplate } from '../services/email.js';
import { writeAudit } from '../utils/audit.js';

function setAuthCookies(res, accessToken, refreshToken) {
  const base = cookieOptions();
  res.cookie('accessToken', accessToken, { ...base, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { ...base, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

async function attachRefresh(user, res) {
  const access = signAccessToken(user);
  const refresh = signRefreshToken(user);
  user.refreshTokenHash = hashToken(refresh);
  await user.save();
  setAuthCookies(res, access, refresh);
  return access;
}

export async function register(req, res, next) {
  try {
    const { name, email, password, phone, role, locationLabel } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return fail(res, 'Email already registered', 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const verifyRaw = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
      name,
      email,
      phone,
      passwordHash,
      role: role === 'provider' ? 'provider' : 'customer',
      locationLabel: locationLabel || 'Kathmandu',
      emailVerifyToken: hashToken(verifyRaw),
      emailVerifyExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    if (user.role === 'provider') {
      await ProviderProfile.create({
        user: user._id,
        businessName: `${name}'s Services`,
        ownerName: name,
        email,
        phone: phone || '',
        locationLabel: locationLabel || 'Kathmandu',
      });
    }

    const verifyUrl = `${env.clientUrl}/verify-email?token=${verifyRaw}`;
    await sendEmail({
      to: email,
      subject: 'Verify your SewaLink account',
      html: verifyEmailTemplate(name, verifyUrl),
    });

    await writeAudit({ actor: user._id, action: 'user.register', targetType: 'User', targetId: user._id });
    const data = { user: user.toPublic() };
    if (env.nodeEnv !== 'production') data.verifyToken = verifyRaw;
    return success(res, 'Registration successful. Check your email to verify.', data, 201);
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const token = hashToken(req.body.token || req.query.token || '');
    const user = await User.findOne({
      emailVerifyToken: token,
      emailVerifyExpires: { $gt: new Date() },
    }).select('+emailVerifyToken +emailVerifyExpires');
    if (!user) return fail(res, 'Invalid or expired verification token', 400);
    user.emailVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyExpires = undefined;
    await user.save();
    return success(res, 'Email verified successfully');
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) return fail(res, 'Invalid email or password', 401);
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return fail(res, 'Invalid email or password', 401);
    if (user.status !== 'active') return fail(res, 'Account is not active', 403);

    await attachRefresh(user, res);
    await writeAudit({ actor: user._id, action: 'user.login', targetType: 'User', targetId: user._id });
    return success(res, 'Logged in successfully', { user: user.toPublic() });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    if (req.user) {
      await User.updateOne({ _id: req.user._id }, { $unset: { refreshTokenHash: 1 } });
    }
    const base = cookieOptions();
    res.clearCookie('accessToken', base);
    res.clearCookie('refreshToken', base);
    return success(res, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return fail(res, 'Unauthorized', 401);
    const jwt = await import('jsonwebtoken');
    const payload = jwt.default.verify(token, env.jwtRefreshSecret);
    const user = await User.findById(payload.id).select('+refreshTokenHash');
    if (!user || user.refreshTokenHash !== hashToken(token)) return fail(res, 'Unauthorized', 401);
    await attachRefresh(user, res);
    return success(res, 'Token refreshed', { user: user.toPublic() });
  } catch {
    return fail(res, 'Unauthorized', 401);
  }
}

export async function me(req, res) {
  return success(res, 'Current user', { user: req.user.toPublic() });
}

export async function forgotPassword(req, res, next) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const raw = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = hashToken(raw);
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();
      const url = `${env.clientUrl}/reset-password?token=${raw}`;
      await sendEmail({
        to: user.email,
        subject: 'Reset your SewaLink password',
        html: resetEmailTemplate(user.name, url),
      });
    }
    return success(res, 'If that email exists, a reset link was sent.');
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const user = await User.findOne({
      resetPasswordToken: hashToken(req.body.token),
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires +passwordHash');
    if (!user) return fail(res, 'Invalid or expired reset token', 400);
    user.passwordHash = await bcrypt.hash(req.body.password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return success(res, 'Password reset successfully');
  } catch (err) {
    next(err);
  }
}
