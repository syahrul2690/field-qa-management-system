import { prisma } from '../config/database';
import { ActivityAction } from '@prisma/client';

interface LogActivityInput {
  userId?: string;
  action: ActivityAction;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Fire-and-forget activity logger.
 * Errors are swallowed so a logging failure never breaks the main request.
 */
export async function logActivity(input: LogActivityInput): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        user_id: input.userId ?? null,
        action: input.action,
        entity_type: input.entityType ?? null,
        entity_id: input.entityId ?? null,
        metadata: input.metadata ? (input.metadata as object) : undefined,
        ip_address: input.ipAddress ?? null,
      },
    });
  } catch {
    // Best-effort — never throw
  }
}
