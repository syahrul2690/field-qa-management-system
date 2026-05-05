import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { config } from '../config';
import { generateProjectSummary, analyzeDocument } from '../services/aiService';

// ─── Project AI Summary ───────────────────────────────────────────────────────

export const getProjectAiSummary = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const refresh = req.query.refresh === 'true';

  if (!config.ai.enabled || !config.ai.openRouterKey) {
    return res.json({
      success: true,
      data: null,
      message: 'AI features are not configured',
    });
  }

  const result = await generateProjectSummary(projectId, refresh);

  if (!result) {
    return res.json({
      success: true,
      data: null,
      message: 'AI analysis could not be generated at this time',
    });
  }

  res.json({
    success: true,
    data: result,
  });
});

// ─── Document AI Analysis ─────────────────────────────────────────────────────

export const getDocumentAiAnalysis = asyncHandler(async (req: Request, res: Response) => {
  const { documentId } = req.params;

  if (!config.ai.enabled || !config.ai.openRouterKey) {
    return res.json({
      success: true,
      data: null,
      message: 'AI features are not configured',
    });
  }

  const result = await analyzeDocument(documentId);

  if (!result) {
    return res.json({
      success: true,
      data: null,
      message: 'AI analysis could not be generated. The document may not contain extractable text, or the scanned PDF exceeds the size limit for image analysis.',
    });
  }

  res.json({
    success: true,
    data: result,
  });
});
