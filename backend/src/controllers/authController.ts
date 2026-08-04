import { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { Role, UserStatus } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { config } from '../config';
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../services/authService';
import {
  findUserByEmail,
  findUserById,
  createUser,
  updateRefreshToken,
  buildTokenPayload,
  updateUserProfile,
} from '../services/userService';

// ─── Validation schemas ────────────────────────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  role: z.nativeEnum(Role),
  institution_id: z.string().uuid('Invalid institution ID'),
  unit_id: z.string().uuid('Invalid unit ID'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ─── Helpers ───────────────────────────────────────────────────────────────────

function parseCookieRefreshToken(req: Request): string | undefined {
  return req.headers.cookie
    ?.split(';')
    .find((c) => c.trim().startsWith('refreshToken='))
    ?.split('=')[1];
}

function setRefreshCookie(res: Response, token: string): void {
  const cookieOptions = [
    'refreshToken=' + token,
    'Path=/api/auth/refresh',
    'HttpOnly',
    'SameSite=Strict',
    'Max-Age=' + 60 * 60 * 24 * 7, // 7 days
    ...(config.nodeEnv === 'production' ? ['Secure'] : []),
  ].join('; ');

  res.setHeader('Set-Cookie', cookieOptions);
}

function clearRefreshCookie(res: Response): void {
  const cookieOptions = [
    'refreshToken=',
    'Path=/api/auth/refresh',
    'HttpOnly',
    'SameSite=Strict',
    'Max-Age=0',
    ...(config.nodeEnv === 'production' ? ['Secure'] : []),
  ].join('; ');

  res.setHeader('Set-Cookie', cookieOptions);
}

// ─── Controllers ──────────────────────────────────────────────────────────────

export const register = asyncHandler(async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400);
  }

  const { email, password, name, role, institution_id, unit_id, phone } = parsed.data;

  const existing = await findUserByEmail(email);
  if (existing) {
    throw new AppError('Email is already registered', 409);
  }

  const user = await createUser({
    email,
    password,
    name,
    phone,
    role,
    institution_id,
    unit_id,
  });

  res.status(201).json({
    success: true,
    data: {
      message: 'Registration submitted. Awaiting admin approval.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        status: user.status,
      },
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400);
  }

  const { email, password } = parsed.data;

  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (user.status === UserStatus.PENDING) {
    throw new AppError('Your account is awaiting admin approval', 403);
  }
  if (user.status === UserStatus.REJECTED) {
    throw new AppError('Your account registration has been rejected', 403);
  }
  if (user.status === UserStatus.SUSPENDED) {
    throw new AppError('Your account has been suspended', 403);
  }
  if (user.status !== UserStatus.APPROVED) {
    throw new AppError('Your account is not active', 403);
  }

  const passwordMatch = await comparePassword(password, user.password_hash);
  if (!passwordMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const payload = buildTokenPayload(user);
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(user.id);

  // Hash and store refresh token
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await updateRefreshToken(user.id, hashedRefreshToken, expiresAt);

  setRefreshCookie(res, refreshToken);

  res.json({
    success: true,
    data: {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        institution_id: user.institution_id,
        institution_type: user.unit.institution.type,
        unit_id: user.unit_id,
        unit_level: user.unit.level,
      },
    },
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const rawToken = parseCookieRefreshToken(req);

  if (!rawToken) {
    throw new AppError('Refresh token missing', 401);
  }

  const tokenPayload = verifyRefreshToken(rawToken);
  const userId = tokenPayload.sub;

  const user = await findUserById(userId);
  if (!user) {
    throw new AppError('User not found', 401);
  }

  if (!user.refresh_token) {
    throw new AppError('Refresh token not found', 401);
  }

  const tokenExpired =
    user.refresh_token_expires && user.refresh_token_expires < new Date();
  if (tokenExpired) {
    throw new AppError('Refresh token has expired', 401);
  }

  const tokenMatches = await bcrypt.compare(rawToken, user.refresh_token);
  if (!tokenMatches) {
    throw new AppError('Invalid refresh token', 401);
  }

  const payload = buildTokenPayload(user);
  const newAccessToken = generateAccessToken(payload);

  res.json({
    success: true,
    data: {
      access_token: newAccessToken,
    },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (req.user) {
    await updateRefreshToken(req.user.id, null);
  }

  clearRefreshCookie(res);

  res.json({ success: true, message: 'Logged out' });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await findUserById(req.user!.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Exclude sensitive fields from response
  const {
    password_hash: _omit,
    refresh_token: _rt,
    refresh_token_expires: _rte,
    approved_by: _ab,
    ...safeUser
  } = user;

  res.json({
    success: true,
    data: {
      user: safeUser,
    },
  });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name, phone, role } = req.body;
  const actorRole = req.user!.role;

  const updateData: { name?: string; phone?: string; role?: Role } = {};

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new AppError('Name must be a non-empty string', 400);
    }
    updateData.name = name.trim();
  }

  if (phone !== undefined) {
    updateData.phone = typeof phone === 'string' ? phone.trim() : '';
  }

  if (role !== undefined) {
    if (actorRole !== Role.ADMIN) {
      throw new AppError('Only administrators can change roles', 403);
    }
    if (!Object.values(Role).includes(role as Role)) {
      throw new AppError('Invalid role value', 400);
    }
    updateData.role = role as Role;
  }

  const updated = await updateUserProfile(req.user!.id, updateData);

  res.json({ success: true, data: { user: updated } });
});

export const listPeers = asyncHandler(async (req: Request, res: Response) => {
  const { role } = req.query;
  const user = req.user!;
  
  const where: Record<string, unknown> = {
    institution_id: user.institution_id,
    status: UserStatus.APPROVED,
  };

  if (role) {
    if (!Object.values(Role).includes(role as Role)) {
      throw new AppError('Invalid role', 400);
    }
    where['role'] = role as Role;
  }

  const { prisma } = require('../config/database');
  const peers = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      unit_id: true,
    },
  });

  res.json({
    success: true,
    data: peers,
  });
});
