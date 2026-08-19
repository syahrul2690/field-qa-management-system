import { Request, Response } from 'express';
import { z } from 'zod';
import { InstitutionType, ProjectType, ProjectUrgency } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import * as projectService from '../services/projectService';
import { buildDashboardWorkbook } from '../utils/excelExport/dashboardExport';

function dashboardFilters(req: Request): { ownerUnitId?: string; vendorInstitutionId?: string } {
  if (!req.user) throw new AppError('Unauthorized', 401);
  if (req.user.institution_type === InstitutionType.VENDOR) {
    return { vendorInstitutionId: req.user.institution_id };
  }
  if (req.user.institution_type === InstitutionType.OWNER && typeof req.query.owner_unit_id === 'string') {
    return { ownerUnitId: req.query.owner_unit_id };
  }
  return {};
}

// ============================================================
// Zod schemas
// ============================================================

const nominalValueSchema = z.object({
  currency: z.string().min(1),
  amount: z.number().positive(),
});

const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  contract_signing_date: z.string().datetime(),
  contract_effective_date: z.string().datetime(),
  duration_days: z.number().int().positive(),
  warranty_period_days: z.number().int().min(0),
  project_type: z.nativeEnum(ProjectType),
  urgency: z.nativeEnum(ProjectUrgency).default(ProjectUrgency.NORMAL),
  nominal_values: z.array(nominalValueSchema).min(1),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  warranty_period_days: z.number().int().min(0).optional(),
  project_type: z.nativeEnum(ProjectType).optional(),
  urgency: z.nativeEnum(ProjectUrgency).optional(),
});

const createAmendmentSchema = z
  .object({
    amendment_reason: z.string().min(1),
    effective_date: z.string().datetime(),
    duration_days: z.number().int().positive().optional(),
    nominal_values: z.array(nominalValueSchema).min(1).optional(),
  })
  .refine((d) => d.duration_days !== undefined || d.nominal_values !== undefined, {
    message: 'At least one of duration_days or nominal_values must be provided',
  });

const assignVendorSchema = z.object({
  vendor_institution_id: z.string().min(1, "Vendor institution ID is required"),
});

const assignConsultantPicSchema = z.object({
  consultant_id: z.string().min(1, 'Consultant user ID is required'),
});

// ============================================================
// Controllers
// ============================================================

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);

  const body = createProjectSchema.parse(req.body);

  const project = await projectService.createProject(
    {
      ...body,
      contract_signing_date: new Date(body.contract_signing_date),
      contract_effective_date: new Date(body.contract_effective_date),
    },
    req.user.id,
    req.user.unit_id
  );

  res.status(201).json({ success: true, data: project });
});

export const listProjects = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);

  const filters: { ownerUnitId?: string; vendorInstitutionId?: string } = {};

  if (req.user.institution_type === InstitutionType.VENDOR) {
    filters.vendorInstitutionId = req.user.institution_id;
  } else if (req.user.institution_type === InstitutionType.OWNER) {
    // OWNER users scoped to their unit unless overridden by query param
    const ownerUnitId = req.query.owner_unit_id as string | undefined;
    if (ownerUnitId) {
      filters.ownerUnitId = ownerUnitId;
    }
  }
  // CONSULTANT, VIEWER, ADMIN — no filter, see all projects

  const projects = await projectService.listProjects(filters);

  res.json({ success: true, data: projects });
});

export const getProject = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);

  const project = await projectService.getProjectById(
    req.params.id,
    req.user.id,
    req.user.institution_id,
    req.user.institution_type
  );

  res.json({ success: true, data: project });
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);

  const body = updateProjectSchema.parse(req.body);

  const project = await projectService.updateProject(req.params.id, body);

  res.json({ success: true, data: project });
});

export const createAmendment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);

  const body = createAmendmentSchema.parse(req.body);

  const amendment = await projectService.createAmendment(
    req.params.id,
    {
      amendment_reason: body.amendment_reason,
      effective_date: new Date(body.effective_date),
      duration_days: body.duration_days,
      nominal_values: body.nominal_values,
    },
    req.user.id
  );

  res.status(201).json({ success: true, data: amendment });
});

export const listAmendments = asyncHandler(async (req: Request, res: Response) => {
  const amendments = await projectService.listAmendments(req.params.id);

  res.json({ success: true, data: amendments });
});

export const assignVendor = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);

  const { vendor_institution_id } = assignVendorSchema.parse(req.body);

  const visibility = await projectService.assignVendor(
    req.params.id,
    vendor_institution_id,
    req.user.id
  );

  res.status(201).json({ success: true, data: visibility });
});

export const removeVendor = asyncHandler(async (req: Request, res: Response) => {
  await projectService.removeVendor(req.params.id, req.params.vendorId);

  res.json({ success: true, message: 'Vendor removed from project' });
});

export const listConsultantPics = asyncHandler(async (req: Request, res: Response) => {
  const data = await projectService.listConsultantPics(req.params.id);
  res.json({ success: true, data });
});

export const listConsultantPicCandidates = asyncHandler(async (req: Request, res: Response) => {
  const data = await projectService.listConsultantPicCandidates(req.params.id);
  res.json({ success: true, data });
});

export const assignConsultantPic = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const { consultant_id } = assignConsultantPicSchema.parse(req.body);
  const data = await projectService.assignConsultantPic(req.params.id, consultant_id, req.user.id);
  res.status(201).json({ success: true, data });
});

export const removeConsultantPic = asyncHandler(async (req: Request, res: Response) => {
  await projectService.removeConsultantPic(req.params.id, req.params.consultantId);
  res.json({ success: true, message: 'Consultant PIC removed from project' });
});

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const data = await projectService.getDashboardData(dashboardFilters(req));
  res.json({ success: true, data });
});

export const exportDashboard = asyncHandler(async (req: Request, res: Response) => {
  const data = await projectService.getDashboardData(dashboardFilters(req));
  const workbook = await buildDashboardWorkbook(data);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="field-qa-dashboard.xlsx"');
  res.send(workbook);
});

export const getApprovedDocumentsByProject = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const docs = await projectService.getApprovedDocumentsByProject(req.params.id);
  res.json({ success: true, data: docs });
});
