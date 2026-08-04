import { Role, UserStatus, InstitutionType } from '@prisma/client';
import { prisma } from '../config/database';
import { hashPassword } from './authService';
import { TokenPayload } from './authService';

export interface RegisterInput {
  email: string;
  password: string; // plain text; service hashes it
  name: string;
  phone?: string;
  role: Role;
  institution_id: string;
  unit_id: string;
}

// The shape returned by findUserByEmail / findUserById with includes
export type UserWithRelations = {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  phone: string | null;
  role: Role;
  status: UserStatus;
  institution_id: string;
  unit_id: string;
  refresh_token: string | null;
  refresh_token_expires: Date | null;
  approved_by: string | null;
  approved_at: Date | null;
  created_at: Date;
  updated_at: Date;
  // Top-level institution — the user's own institution_id relation (distinct
  // from unit.institution, which is the *unit's* parent institution and is
  // only kept here because buildTokenPayload() needs institution_type/unit_level).
  institution: {
    name: string;
  };
  unit: {
    name: string;
    level: number;
    institution: {
      name: string;
      type: InstitutionType;
    };
  };
};

export async function findUserByEmail(email: string): Promise<UserWithRelations | null> {
  return prisma.user.findUnique({
    where: { email },
    include: {
      institution: {
        select: { name: true },
      },
      unit: {
        select: {
          name: true,
          level: true,
          institution: {
            select: { name: true, type: true },
          },
        },
      },
    },
  }) as Promise<UserWithRelations | null>;
}

export async function findUserById(id: string): Promise<UserWithRelations | null> {
  return prisma.user.findUnique({
    where: { id },
    include: {
      institution: {
        select: { name: true },
      },
      unit: {
        select: {
          name: true,
          level: true,
          institution: {
            select: { name: true, type: true },
          },
        },
      },
    },
  }) as Promise<UserWithRelations | null>;
}

export async function createUser(data: RegisterInput) {
  const password_hash = await hashPassword(data.password);

  return prisma.user.create({
    data: {
      email: data.email,
      password_hash,
      name: data.name,
      phone: data.phone,
      role: data.role,
      institution_id: data.institution_id,
      unit_id: data.unit_id,
      status: UserStatus.PENDING,
    },
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
    },
  });
}

export async function updateUserStatus(
  id: string,
  status: UserStatus,
  approvedBy?: string,
) {
  return prisma.user.update({
    where: { id },
    data: {
      status,
      approved_by: approvedBy ?? null,
      approved_at: approvedBy ? new Date() : null,
    },
  });
}

export async function updateRefreshToken(
  userId: string,
  token: string | null,
  expiresAt?: Date,
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      refresh_token: token,
      refresh_token_expires: expiresAt ?? null,
    },
  });
}

export async function listPendingUsers() {
  return prisma.user.findMany({
    where: { status: UserStatus.PENDING },
    include: {
      institution: true,
      unit: true,
    },
    orderBy: { created_at: 'asc' },
  });
}

export async function updateUserProfile(
  userId: string,
  data: { name?: string; phone?: string; role?: Role },
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.phone !== undefined && { phone: data.phone || null }),
      ...(data.role !== undefined && { role: data.role }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      status: true,
      institution_id: true,
      unit_id: true,
      created_at: true,
      updated_at: true,
      institution: { select: { id: true, name: true, type: true } },
      unit: { select: { id: true, name: true, level: true } },
    },
  });
}

export function buildTokenPayload(user: UserWithRelations): TokenPayload {
  return {
    sub: user.id,
    email: user.email,
    role: user.role,
    institution_id: user.institution_id,
    institution_type: user.unit.institution.type,
    unit_id: user.unit_id,
    unit_level: user.unit.level,
  };
}
