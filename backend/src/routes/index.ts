import { Router } from 'express';
import { authRoutes } from './authRoutes';
import { adminRoutes } from './adminRoutes';
import { institutionRoutes } from './institutionRoutes';
import { projectRoutes } from './projectRoutes';
import { boqProjectRoutes, boqItemRoutes } from './boqRoutes';
import { documentRoutes } from './documentRoutes';
import { reviewRoutes } from './reviewRoutes';
import { verifyRoutes } from './verifyRoutes';
import { aiRoutes } from './aiRoutes';
import { integrationRoutes } from './integrationRoutes';

export const router = Router();

// Phase 1: IAM & Auth
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/institutions', institutionRoutes);

// Phase 2: Projects
router.use('/projects', projectRoutes);

// Phase 3: BoQ
router.use('/projects', boqProjectRoutes);
router.use('/boq', boqItemRoutes);

// Phase 4: Documents
router.use('/documents', documentRoutes);

// Phase 5: QA Workflow, PDF Comment Sheet & QR Code
router.use('/reviews', reviewRoutes);
router.use('/verify', verifyRoutes);

// AI features
router.use('/ai', aiRoutes);

// Integration API (service-to-service, API key auth)
router.use('/integration', integrationRoutes);

router.get('/', (_req, res) => {
  res.json({ success: true, message: 'Field QA Management System API v1.0' });
});
