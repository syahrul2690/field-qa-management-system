import { Request, Response, NextFunction } from 'express';
import { ActivityAction } from '@prisma/client';
import { logActivity } from '../services/activityLogService';

/**
 * Maps HTTP method + route pattern to an ActivityAction.
 * Used for automatic audit logging on mutating requests.
 */
const ROUTE_ACTION_MAP: Array<{
  method: string;
  pattern: RegExp;
  action: ActivityAction;
  entityType?: string;
}> = [
  { method: 'POST', pattern: /\/auth\/login/, action: ActivityAction.LOGIN },
  { method: 'POST', pattern: /\/auth\/logout/, action: ActivityAction.LOGOUT },
  { method: 'POST', pattern: /\/auth\/register/, action: ActivityAction.REGISTER },
  { method: 'PATCH', pattern: /\/admin\/users\/.*\/approve/, action: ActivityAction.USER_APPROVED, entityType: 'User' },
  { method: 'PATCH', pattern: /\/admin\/users\/.*\/reject/, action: ActivityAction.USER_REJECTED, entityType: 'User' },
  { method: 'POST', pattern: /\/projects$/, action: ActivityAction.PROJECT_CREATED, entityType: 'Project' },
  { method: 'PATCH', pattern: /\/projects\//, action: ActivityAction.PROJECT_UPDATED, entityType: 'Project' },
  { method: 'POST', pattern: /\/projects\/.*\/amendments/, action: ActivityAction.PROJECT_AMENDED, entityType: 'Project' },
  { method: 'POST', pattern: /\/projects\/.*\/boq\/upload/, action: ActivityAction.BOQ_UPLOADED, entityType: 'BoqItem' },
  { method: 'POST', pattern: /\/documents$/, action: ActivityAction.DOCUMENT_UPLOADED, entityType: 'Document' },
  { method: 'POST', pattern: /\/documents\/.*\/revisions/, action: ActivityAction.DOCUMENT_REVISED, entityType: 'Document' },
  { method: 'POST', pattern: /\/reviews$/, action: ActivityAction.REVIEW_SUBMITTED, entityType: 'DocumentReview' },
  { method: 'POST', pattern: /\/reviews\/.*\/review$/, action: ActivityAction.REVIEW_COMMENTED, entityType: 'DocumentReview' },
  { method: 'POST', pattern: /\/reviews\/.*\/delegate$/, action: ActivityAction.REVIEW_DELEGATED, entityType: 'DocumentReview' },
  { method: 'POST', pattern: /\/reviews\/.*\/check$/, action: ActivityAction.REVIEW_CHECKED, entityType: 'DocumentReview' },
  { method: 'POST', pattern: /\/reviews\/.*\/approve$/, action: ActivityAction.REVIEW_APPROVED, entityType: 'DocumentReview' },
];

export function activityLogMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Only log mutating methods
  if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) {
    next();
    return;
  }

  const matched = ROUTE_ACTION_MAP.find(
    (m) => m.method === req.method && m.pattern.test(req.path),
  );

  if (matched) {
    // Log asynchronously — don't block the request
    res.on('finish', () => {
      if (res.statusCode < 400) {
        logActivity({
          userId: req.user?.id,
          action: matched.action,
          entityType: matched.entityType,
          ipAddress: req.ip,
        }).catch(() => {});
      }
    });
  }

  next();
}
