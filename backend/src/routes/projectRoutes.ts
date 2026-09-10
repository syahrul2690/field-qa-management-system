import { Router } from 'express';
import { Role, InstitutionType } from '@prisma/client';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRole, requireInstitution } from '../middlewares/roleMiddleware';
import {
  createProject,
  listProjects,
  getProject,
  updateProject,
  createAmendment,
  listAmendments,
  assignVendor,
  removeVendor,
  listConsultantPics,
  listConsultantPicCandidates,
  assignConsultantPic,
  removeConsultantPic,
  getDashboard,
  exportDashboard,
  getApprovedDocumentsByProject,
  getProjectWmsMonitoring,
} from '../controllers/projectController';

export const projectRoutes = Router();

// POST /projects — create a new project
projectRoutes.post(
  '/',
  authMiddleware,
  requireRole(Role.PIC_PROJECT),
  requireInstitution(InstitutionType.OWNER),
  createProject
);

// GET /projects/dashboard — aggregated dashboard data (must be before /:id)
projectRoutes.get('/dashboard', authMiddleware, getDashboard);
projectRoutes.get('/dashboard/export', authMiddleware, exportDashboard);

// GET /projects — list projects (filtered by institution type)
projectRoutes.get('/', authMiddleware, listProjects);

// GET /projects/:id — get a single project
projectRoutes.get('/:id', authMiddleware, getProject);

// PATCH /projects/:id — update allowed project fields
projectRoutes.patch('/:id', authMiddleware, requireRole(Role.PIC_PROJECT), updateProject);

// POST /projects/:id/amendments — create an amendment
projectRoutes.post(
  '/:id/amendments',
  authMiddleware,
  requireRole(Role.PIC_PROJECT),
  requireInstitution(InstitutionType.OWNER),
  createAmendment
);

// GET /projects/:id/amendments — list amendments
projectRoutes.get('/:id/amendments', authMiddleware, listAmendments);

// POST /projects/:id/vendors — assign a vendor institution
projectRoutes.post(
  '/:id/vendors',
  authMiddleware,
  requireRole(Role.PIC_PROJECT),
  assignVendor
);

// DELETE /projects/:id/vendors/:vendorId — remove a vendor institution
projectRoutes.delete(
  '/:id/vendors/:vendorId',
  authMiddleware,
  requireRole(Role.PIC_PROJECT),
  removeVendor
);

// Project-scoped consultant PIC management.
projectRoutes.get('/:id/consultant-pics', authMiddleware, listConsultantPics);
projectRoutes.get('/:id/consultant-pic-candidates', authMiddleware, listConsultantPicCandidates);
projectRoutes.post(
  '/:id/consultant-pics',
  authMiddleware,
  requireRole(Role.PIC_PROJECT, Role.ADMIN),
  assignConsultantPic,
);
projectRoutes.delete(
  '/:id/consultant-pics/:consultantId',
  authMiddleware,
  requireRole(Role.PIC_PROJECT, Role.ADMIN),
  removeConsultantPic,
);
// GET /projects/:id/approved-documents — list approved docs for a project
projectRoutes.get('/:id/approved-documents', authMiddleware, getApprovedDocumentsByProject);
// Read-only WMS status from Field QC. No WMS mutations are exposed in Field QA.
projectRoutes.get('/:id/wms-monitoring', authMiddleware, getProjectWmsMonitoring);
