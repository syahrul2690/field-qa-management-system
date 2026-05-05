import { Router } from 'express';
import { Role } from '@prisma/client';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import {
  listInstitutionsHandler,
  createInstitutionHandler,
  updateInstitutionHandler,
  deleteInstitutionHandler,
  getInstitutionHandler,
  listUnitsHandler,
  createUnitHandler,
  updateUnitHandler,
  deleteUnitHandler,
} from '../controllers/institutionController';

export const institutionRoutes = Router();

// Public routes (no auth required — used by registration form, etc.)
institutionRoutes.get('/', listInstitutionsHandler);
institutionRoutes.get('/:id', getInstitutionHandler);
institutionRoutes.get('/:id/units', listUnitsHandler);

// Admin-only routes — institutions
institutionRoutes.post('/', authMiddleware, requireRole(Role.ADMIN), createInstitutionHandler);
institutionRoutes.patch('/:id', authMiddleware, requireRole(Role.ADMIN), updateInstitutionHandler);
institutionRoutes.delete('/:id', authMiddleware, requireRole(Role.ADMIN), deleteInstitutionHandler);

// Admin-only routes — units
institutionRoutes.post('/:id/units', authMiddleware, requireRole(Role.ADMIN), createUnitHandler);
institutionRoutes.patch('/:id/units/:unitId', authMiddleware, requireRole(Role.ADMIN), updateUnitHandler);
institutionRoutes.delete('/:id/units/:unitId', authMiddleware, requireRole(Role.ADMIN), deleteUnitHandler);
