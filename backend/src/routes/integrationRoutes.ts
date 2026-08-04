import { Router } from 'express';
import { apiKeyMiddleware } from '../middlewares/apiKeyMiddleware';
import * as integrationController from '../controllers/integrationController';

export const integrationRoutes = Router();

integrationRoutes.use(apiKeyMiddleware);

// GET /api/integration/projects — List all projects with BOQ tree
integrationRoutes.get('/projects', integrationController.getProjects);

// GET /api/integration/boq-items/:boqItemId/qc-readiness — Check if all 3 doc sections are approved
integrationRoutes.get('/boq-items/:boqItemId/qc-readiness', integrationController.getQcReadiness);

// GET /api/integration/documents/:documentId — Document metadata + ITP items
integrationRoutes.get('/documents/:documentId', integrationController.getDocument);

// POST /api/integration/auth/verify — Verify email+password, return user info + qc_role
integrationRoutes.post('/auth/verify', integrationController.verifyAuth);

// POST /api/integration/auth/exchange-token — Issue single-use 60s token for app switching
integrationRoutes.post('/auth/exchange-token', integrationController.issueExchangeToken);

// POST /api/integration/auth/redeem-token — Redeem exchange token → user info
integrationRoutes.post('/auth/redeem-token', integrationController.redeemExchangeToken);
