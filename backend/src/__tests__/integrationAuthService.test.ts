import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPrisma = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
}));
const comparePassword = vi.hoisted(() => vi.fn());

vi.mock('../config/database', () => ({ prisma: mockPrisma }));
vi.mock('../services/authService', () => ({ comparePassword }));

import { verifyCredentials } from '../services/integrationAuthService';

describe('integrationAuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    comparePassword.mockResolvedValue(true);
  });

  it('returns the additive PowerQC function without exposing the password hash', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'checker@example.com',
      name: 'Checker',
      role: 'REVIEWER',
      status: 'APPROVED',
      qc_role: 'QC_ENGINEER',
      qc_function: 'CHECKER',
      password_hash: 'stored-hash',
      institution: { id: 'inst-1', name: 'Consultant', type: 'CONSULTANT' },
      unit: { id: 'unit-1', name: 'Site' },
    });

    const user = await verifyCredentials('checker@example.com', 'password');

    expect(user).toMatchObject({
      id: 'user-1',
      qc_role: 'QC_ENGINEER',
      qc_function: 'CHECKER',
    });
    expect(user).not.toHaveProperty('password_hash');
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({
      select: expect.objectContaining({ qc_role: true, qc_function: true }),
    }));
  });

  it('rejects users whose Field QA account is not approved', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      status: 'SUSPENDED',
      password_hash: 'stored-hash',
    });

    await expect(verifyCredentials('suspended@example.com', 'password')).resolves.toBeNull();
    expect(comparePassword).not.toHaveBeenCalled();
  });
});
