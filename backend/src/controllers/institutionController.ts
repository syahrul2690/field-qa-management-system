import { Request, Response } from 'express';
import { z } from 'zod';
import { InstitutionType } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import {
  listInstitutions,
  createInstitution,
  updateInstitution,
  deleteInstitution,
  getInstitutionById,
  listUnits,
  createUnit,
  updateUnit,
  deleteUnit,
} from '../services/institutionService';

// ─── Validation schemas ────────────────────────────────────────────────────────

const createInstitutionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.nativeEnum(InstitutionType),
  address: z.string().optional(),
});

const updateInstitutionSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
  type: z.nativeEnum(InstitutionType).optional(),
  address: z.string().optional(),
});

const createUnitSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  level: z.number().int().min(0, 'Level must be a non-negative integer'),
  parent_unit_id: z.string().uuid('Invalid parent unit ID').optional(),
  description: z.string().optional(),
});

const updateUnitSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
  level: z.number().int().min(0).optional(),
  parent_unit_id: z.string().uuid('Invalid parent unit ID').nullable().optional(),
  description: z.string().optional(),
});

// ─── Institution controllers ───────────────────────────────────────────────────

export const listInstitutionsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { type } = req.query;

  let institutionType: InstitutionType | undefined;
  if (type) {
    if (!Object.values(InstitutionType).includes(type as InstitutionType)) {
      throw new AppError(`Invalid institution type. Must be one of: ${Object.values(InstitutionType).join(', ')}`, 400);
    }
    institutionType = type as InstitutionType;
  }

  const institutions = await listInstitutions(institutionType);

  res.json({
    success: true,
    data: { institutions },
  });
});

export const createInstitutionHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createInstitutionSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400);
  }

  const institution = await createInstitution(parsed.data);

  res.status(201).json({
    success: true,
    data: { institution },
  });
});

export const updateInstitutionHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const parsed = updateInstitutionSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400);
  }

  if (Object.keys(parsed.data).length === 0) {
    throw new AppError('No fields to update', 400);
  }

  const institution = await updateInstitution(id, parsed.data);

  res.json({
    success: true,
    data: { institution },
  });
});

export const deleteInstitutionHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await deleteInstitution(id);

  res.json({
    success: true,
    message: 'Institution deleted successfully',
  });
});

export const getInstitutionHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const institution = await getInstitutionById(id);
  if (!institution) {
    throw new AppError('Institution not found', 404);
  }

  res.json({
    success: true,
    data: { institution },
  });
});

// ─── Unit controllers ──────────────────────────────────────────────────────────

export const listUnitsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const institution = await getInstitutionById(id);
  if (!institution) {
    throw new AppError('Institution not found', 404);
  }

  const units = await listUnits(id);

  res.json({
    success: true,
    data: { units },
  });
});

export const createUnitHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id: institution_id } = req.params;

  const institution = await getInstitutionById(institution_id);
  if (!institution) {
    throw new AppError('Institution not found', 404);
  }

  const parsed = createUnitSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400);
  }

  const unit = await createUnit({
    institution_id,
    ...parsed.data,
  });

  res.status(201).json({
    success: true,
    data: { unit },
  });
});

export const updateUnitHandler = asyncHandler(async (req: Request, res: Response) => {
  const { unitId } = req.params;

  const parsed = updateUnitSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400);
  }

  if (Object.keys(parsed.data).length === 0) {
    throw new AppError('No fields to update', 400);
  }

  const unit = await updateUnit(unitId, parsed.data);

  res.json({
    success: true,
    data: { unit },
  });
});

export const deleteUnitHandler = asyncHandler(async (req: Request, res: Response) => {
  const { unitId } = req.params;
  await deleteUnit(unitId);

  res.json({
    success: true,
    message: 'Unit deleted successfully',
  });
});
