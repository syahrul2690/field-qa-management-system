import { describe, it, expect, vi, beforeAll } from 'vitest';
import jwt from 'jsonwebtoken';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../services/authService';
import { AppError } from '../utils/AppError';

// Mock the config module so we don't need a .env file
vi.mock('../config', () => ({
  config: {
    jwt: {
      accessSecret: 'test-access-secret',
      refreshSecret: 'test-refresh-secret',
      accessExpiresIn: '15m',
      refreshExpiresIn: '7d',
    },
  },
}));

describe('authService', () => {
  describe('hashPassword & comparePassword', () => {
    it('should hash a password and verify it', async () => {
      const plain = 'mySecret123';
      const hash = await hashPassword(plain);
      expect(hash).not.toBe(plain);
      expect(hash).toContain('$2a$');

      const isMatch = await comparePassword(plain, hash);
      expect(isMatch).toBe(true);
    });

    it('should return false for wrong password', async () => {
      const hash = await hashPassword('correct');
      const isMatch = await comparePassword('wrong', hash);
      expect(isMatch).toBe(false);
    });
  });

  describe('generateAccessToken', () => {
    it('should generate a valid JWT access token', () => {
      const payload = {
        sub: 'user-1',
        email: 'test@example.com',
        role: 'ADMIN' as const,
        institution_id: 'inst-1',
        institution_type: 'OWNER' as const,
        unit_id: 'unit-1',
        unit_level: 0,
      };
      const token = generateAccessToken(payload);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);

      const decoded = jwt.verify(token, 'test-access-secret') as Record<string, unknown>;
      expect(decoded.sub).toBe('user-1');
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.role).toBe('ADMIN');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid JWT refresh token', () => {
      const token = generateRefreshToken('user-1');
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, 'test-refresh-secret') as { sub: string };
      expect(decoded.sub).toBe('user-1');
    });
  });

  describe('verifyAccessToken', () => {
    it('should return payload for valid token', () => {
      const payload = {
        sub: 'user-1',
        email: 'test@example.com',
        role: 'ADMIN' as const,
        institution_id: 'inst-1',
        institution_type: 'OWNER' as const,
        unit_id: 'unit-1',
        unit_level: 0,
      };
      const token = generateAccessToken(payload);
      const result = verifyAccessToken(token);
      expect(result.sub).toBe('user-1');
      expect(result.email).toBe('test@example.com');
    });

    it('should throw AppError for invalid token', () => {
      expect(() => verifyAccessToken('invalid.token.here')).toThrow(AppError);
      expect(() => verifyAccessToken('invalid.token.here')).toThrow('Unauthorized');
    });
  });

  describe('verifyRefreshToken', () => {
    it('should return sub for valid refresh token', () => {
      const token = generateRefreshToken('user-2');
      const result = verifyRefreshToken(token);
      expect(result.sub).toBe('user-2');
    });

    it('should throw AppError for expired/invalid refresh token', () => {
      expect(() => verifyRefreshToken('bad.token')).toThrow(AppError);
      expect(() => verifyRefreshToken('bad.token')).toThrow('Invalid or expired refresh token');
    });
  });
});
