import { Request, Response } from 'express';
import { UserStatus, Role, QcRole } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { listPendingUsers, updateUserStatus, findUserById } from '../services/userService';
import { prisma } from '../config/database';

// GET /admin/users/pending
export const listPendingUsersHandler = asyncHandler(async (_req: Request, res: Response) => {
  const users = await listPendingUsers();
  const safeUsers = users.map(({ password_hash: _ph, refresh_token: _rt, ...user }) => user);
  res.json({ success: true, data: { users: safeUsers } });
});

// GET /admin/users?status=PENDING|APPROVED|REJECTED|SUSPENDED
export const listAllUsersHandler = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query as { status?: string };

  const users = await prisma.user.findMany({
    where: status ? { status: status as UserStatus } : undefined,
    include: {
      institution: { select: { id: true, name: true, type: true } },
      unit: { select: { id: true, name: true, level: true } },
    },
    orderBy: { created_at: 'desc' },
  });

  const safeUsers = users.map(({ password_hash: _ph, refresh_token: _rt, ...user }) => user);
  res.json({ success: true, data: { users: safeUsers } });
});

// PATCH /admin/users/:id/approve
export const approveUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await findUserById(id);
  if (!user) throw new AppError('User not found', 404);

  const updated = await updateUserStatus(id, UserStatus.APPROVED, req.user!.id);
  res.json({
    success: true,
    data: { message: 'User approved successfully', user: { id: updated.id, email: updated.email, name: updated.name, status: updated.status } },
  });
});

// PATCH /admin/users/:id/reject
export const rejectUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await findUserById(id);
  if (!user) throw new AppError('User not found', 404);

  const updated = await updateUserStatus(id, UserStatus.REJECTED, req.user!.id);
  res.json({
    success: true,
    data: { message: 'User rejected', user: { id: updated.id, email: updated.email, name: updated.name, status: updated.status } },
  });
});

// PATCH /admin/users/:id/suspend
export const suspendUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await findUserById(id);
  if (!user) throw new AppError('User not found', 404);

  const updated = await updateUserStatus(id, UserStatus.SUSPENDED, req.user!.id);
  res.json({
    success: true,
    data: { message: 'User suspended', user: { id: updated.id, email: updated.email, name: updated.name, status: updated.status } },
  });
});

// PATCH /admin/users/:id — edit user properties (name, role, institution, unit)
export const updateUserProperties = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, role, institution_id, unit_id, qc_role } = req.body as {
    name?: string;
    role?: string;
    institution_id?: string;
    unit_id?: string;
    qc_role?: string | null;
  };

  const user = await findUserById(id);
  if (!user) throw new AppError('User not found', 404);

  // Validate role
  if (role !== undefined && !Object.values(Role).includes(role as Role)) {
    throw new AppError(`Invalid role: ${role}`, 400);
  }

  // Validate qc_role (null to clear, or a valid QcRole value)
  if (qc_role !== undefined && qc_role !== null && !Object.values(QcRole).includes(qc_role as QcRole)) {
    throw new AppError(`Invalid qc_role: ${qc_role}`, 400);
  }

  // Validate institution exists
  if (institution_id !== undefined) {
    const inst = await prisma.institution.findUnique({ where: { id: institution_id } });
    if (!inst) throw new AppError('Institution not found', 404);
  }

  // Validate unit exists and belongs to the (new or existing) institution
  if (unit_id !== undefined) {
    const unit = await prisma.unit.findUnique({ where: { id: unit_id } });
    if (!unit) throw new AppError('Unit not found', 404);
    const targetInstitutionId = institution_id ?? user.institution_id;
    if (unit.institution_id !== targetInstitutionId) {
      throw new AppError('Unit does not belong to the selected institution', 400);
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(name          !== undefined && { name }),
      ...(role          !== undefined && { role: role as Role }),
      ...(institution_id !== undefined && { institution_id }),
      ...(unit_id       !== undefined && { unit_id }),
      ...(qc_role      !== undefined && { qc_role: qc_role === null ? null : qc_role as QcRole }),
    },
    include: {
      institution: { select: { id: true, name: true, type: true } },
      unit:        { select: { id: true, name: true, level: true } },
    },
  });

  const { password_hash: _ph, refresh_token: _rt, ...safeUser } = updated;
  res.json({ success: true, data: safeUser });
});
