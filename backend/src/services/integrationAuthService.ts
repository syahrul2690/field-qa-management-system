import { prisma } from '../config/database';
import { comparePassword } from './authService';
import { randomUUID } from 'crypto';

interface ExchangeToken {
  token: string;
  userId: string;
  expiresAt: number;
}

const exchangeTokens = new Map<string, ExchangeToken>();

const TOKEN_TTL_MS = 60_000;

function cleanExpired() {
  const now = Date.now();
  for (const [key, val] of exchangeTokens) {
    if (val.expiresAt <= now) exchangeTokens.delete(key);
  }
}

export async function verifyCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      qc_role: true,
      qc_function: true,
      password_hash: true,
      institution: { select: { id: true, name: true, type: true } },
      unit: { select: { id: true, name: true } },
    },
  });

  if (!user) return null;
  if (user.status !== 'APPROVED') return null;

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) return null;

  const { password_hash: _, ...userInfo } = user;
  return userInfo;
}

export function issueExchangeToken(userId: string): string {
  cleanExpired();
  const token = randomUUID();
  exchangeTokens.set(token, {
    token,
    userId,
    expiresAt: Date.now() + TOKEN_TTL_MS,
  });
  return token;
}

export async function redeemExchangeToken(token: string) {
  cleanExpired();
  const entry = exchangeTokens.get(token);
  if (!entry) return null;

  exchangeTokens.delete(token);

  const user = await prisma.user.findUnique({
    where: { id: entry.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      qc_role: true,
      qc_function: true,
      institution: { select: { id: true, name: true, type: true } },
      unit: { select: { id: true, name: true } },
    },
  });

  if (!user || user.status !== 'APPROVED') return null;
  return user;
}
