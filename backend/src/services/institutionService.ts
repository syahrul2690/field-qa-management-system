import { InstitutionType } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';

export async function listInstitutions(type?: InstitutionType) {
  return prisma.institution.findMany({
    where: type ? { type } : undefined,
    include: {
      units: true,
    },
    orderBy: { name: 'asc' },
  });
}

export async function createInstitution(data: {
  name: string;
  type: InstitutionType;
  address?: string;
}) {
  return prisma.institution.create({
    data: {
      name: data.name,
      type: data.type,
      address: data.address,
    },
  });
}

export async function updateInstitution(
  id: string,
  data: { name?: string; type?: InstitutionType; address?: string },
) {
  const existing = await prisma.institution.findUnique({ where: { id } });
  if (!existing) throw new AppError('Institution not found', 404);

  return prisma.institution.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.type !== undefined && { type: data.type }),
      // Allow clearing address by passing empty string → store as null
      ...(data.address !== undefined && { address: data.address || null }),
    },
  });
}

export async function deleteInstitution(id: string) {
  const existing = await prisma.institution.findUnique({
    where: { id },
    include: {
      users: { take: 1 },
    },
  });
  if (!existing) throw new AppError('Institution not found', 404);

  if (existing.users.length > 0) {
    throw new AppError(
      'Cannot delete institution: it still has users assigned to it. ' +
        'Reassign or remove those users first.',
      409,
    );
  }

  // Cascade will remove units automatically (schema: onDelete: Cascade on Unit)
  return prisma.institution.delete({ where: { id } });
}

export async function getInstitutionById(id: string) {
  return prisma.institution.findUnique({
    where: { id },
    include: {
      units: {
        include: {
          children: true,
        },
      },
    },
  });
}

export async function listUnits(institutionId: string) {
  return prisma.unit.findMany({
    where: { institution_id: institutionId },
    include: {
      children: true,
    },
    orderBy: [{ level: 'asc' }, { name: 'asc' }],
  });
}

export async function createUnit(data: {
  institution_id: string;
  parent_unit_id?: string;
  name: string;
  level: number;
  description?: string;
}) {
  return prisma.unit.create({
    data: {
      institution_id: data.institution_id,
      parent_unit_id: data.parent_unit_id,
      name: data.name,
      level: data.level,
      description: data.description,
    },
  });
}

export async function updateUnit(
  id: string,
  data: { name?: string; level?: number; parent_unit_id?: string | null; description?: string },
) {
  const existing = await prisma.unit.findUnique({ where: { id } });
  if (!existing) throw new AppError('Unit not found', 404);

  return prisma.unit.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.level !== undefined && { level: data.level }),
      // null explicitly clears the parent
      ...(data.parent_unit_id !== undefined && { parent_unit_id: data.parent_unit_id }),
      ...(data.description !== undefined && { description: data.description || null }),
    },
  });
}

export async function deleteUnit(id: string) {
  const existing = await prisma.unit.findUnique({
    where: { id },
    include: {
      users: { take: 1 },
      children: { take: 1 },
    },
  });
  if (!existing) throw new AppError('Unit not found', 404);

  if (existing.users.length > 0) {
    throw new AppError(
      'Cannot delete unit: it has users assigned to it. Reassign them first.',
      409,
    );
  }

  if (existing.children.length > 0) {
    throw new AppError(
      'Cannot delete unit: it has child units. Delete child units first.',
      409,
    );
  }

  return prisma.unit.delete({ where: { id } });
}
