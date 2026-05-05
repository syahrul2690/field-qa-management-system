import { Router } from 'express';
import { Role } from '@prisma/client';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import {
  listPendingUsersHandler,
  listAllUsersHandler,
  approveUser,
  rejectUser,
  suspendUser,
  updateUserProperties,
} from '../controllers/adminController';

export const adminRoutes = Router();

// All admin routes require auth + ADMIN role
adminRoutes.use(authMiddleware, requireRole(Role.ADMIN));

adminRoutes.get('/users/pending', listPendingUsersHandler);
adminRoutes.get('/users', listAllUsersHandler);
adminRoutes.patch('/users/:id/approve', approveUser);
adminRoutes.patch('/users/:id/reject', rejectUser);
adminRoutes.patch('/users/:id/suspend', suspendUser);
adminRoutes.patch('/users/:id', updateUserProperties);   // edit name / role / institution / unit
