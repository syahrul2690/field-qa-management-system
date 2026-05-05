import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role, InstitutionType } from '@prisma/client';
import { config } from '../config';
import { AppError } from '../utils/AppError';

export interface TokenPayload {
  sub: string;
  email: string;
  role: Role;
  institution_id: string;
  institution_type: InstitutionType;
  unit_id: string;
  unit_level: number;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  } as jwt.SignOptions);
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): TokenPayload {
  try {
    const payload = jwt.verify(token, config.jwt.accessSecret) as TokenPayload;
    return payload;
  } catch {
    throw new AppError('Unauthorized', 401);
  }
}

export function verifyRefreshToken(token: string): { sub: string } {
  try {
    const payload = jwt.verify(token, config.jwt.refreshSecret) as { sub: string };
    return payload;
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }
}
