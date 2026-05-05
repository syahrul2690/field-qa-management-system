import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  getProjectAiSummary,
  getDocumentAiAnalysis,
} from '../controllers/aiController';

export const aiRoutes = Router();

// All AI endpoints require authentication
aiRoutes.use(authMiddleware);

// Project AI summary (cached 1 hour, ?refresh=true to force)
aiRoutes.get('/projects/:projectId/summary', getProjectAiSummary);

// Document AI analysis (cached permanently per revision)
aiRoutes.get('/documents/:documentId/analysis', getDocumentAiAnalysis);
