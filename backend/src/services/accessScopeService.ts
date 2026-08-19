import { Prisma, InstitutionType, Role } from '@prisma/client';

/**
 * Data-visibility scoping — the single source of truth for "which rows may this
 * user see".
 *
 * Every entity in the domain has a deterministic path up to a Project:
 *
 *   BoqItem          → project
 *   Document         → boq_item → project
 *   DocumentReview   → document → boq_item → project
 *   ItpItem          → document → boq_item → project
 *   CommentSheetItem → review   → document → boq_item → project
 *
 * so a single project-level rule composes into a filter for any of them.
 *
 * These builders exist because the chat assistant can resolve entity ids from
 * natural language. Without a choke point, a list/search tool would enumerate
 * rows across institutions. Callers must never hand-roll an equivalent filter.
 */

export interface ScopeUser {
  id: string;
  role: Role;
  institution_id: string;
  institution_type: InstitutionType;
  unit_id: string;
  /** Display name, when known. Never participates in scoping. */
  name?: string;
}

/**
 * Mirrors the filter applied by projectService.listProjects: vendor
 * institutions are restricted to the projects they have been granted via
 * ProjectVendorVisibility; owner and consultant institutions see everything.
 *
 * Deliberately branches on institution_type rather than role — an ADMIN who
 * belongs to a vendor institution stays restricted. Any institution type we do
 * not recognise falls through to the vendor branch rather than to `{}`, so a
 * future InstitutionType cannot silently open the whole table.
 */
export function buildProjectScopeWhere(user: ScopeUser): Prisma.ProjectWhereInput {
  switch (user.institution_type) {
    case InstitutionType.OWNER:
    case InstitutionType.CONSULTANT:
      return {};
    case InstitutionType.VENDOR:
    default:
      return {
        vendor_visibility: { some: { vendor_institution_id: user.institution_id } },
      };
  }
}

export function buildBoqItemScopeWhere(user: ScopeUser): Prisma.BoqItemWhereInput {
  return { project: buildProjectScopeWhere(user) };
}

export function buildDocumentScopeWhere(user: ScopeUser): Prisma.DocumentWhereInput {
  return {
    OR: [
      { boq_item: buildBoqItemScopeWhere(user) },
      { boq_item_links: { some: { boq_item: buildBoqItemScopeWhere(user) } } },
    ],
  };
}

export function buildReviewScopeWhere(user: ScopeUser): Prisma.DocumentReviewWhereInput {
  return { document: buildDocumentScopeWhere(user) };
}

export function buildItpItemScopeWhere(user: ScopeUser): Prisma.ItpItemWhereInput {
  return { document: buildDocumentScopeWhere(user) };
}

export function buildCommentSheetItemScopeWhere(
  user: ScopeUser,
): Prisma.CommentSheetItemWhereInput {
  return { review: buildReviewScopeWhere(user) };
}

/**
 * True when the user's visibility is unrestricted at the project level. Used
 * only to skip redundant joins in hot paths — never as an authorization
 * shortcut.
 */
export function hasUnrestrictedProjectScope(user: ScopeUser): boolean {
  return Object.keys(buildProjectScopeWhere(user)).length === 0;
}

/**
 * Identifies the scope a conversation was created under. Persisted on
 * ChatConversation so that a user whose role or institution changes cannot
 * replay tool results captured under their previous, possibly wider, scope.
 */
export function scopeFingerprint(user: ScopeUser): string {
  return `${user.role}:${user.institution_type}:${user.institution_id}`;
}
