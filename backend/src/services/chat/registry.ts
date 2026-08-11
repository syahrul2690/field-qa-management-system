import { z } from 'zod';
import type OpenAI from 'openai';
import type { ScopedRepo } from './scopedRepo';
import type { ScopeUser } from '../accessScopeService';

/**
 * Tool definitions for the chat assistant.
 *
 * Every tool is read-only. There is deliberately no write tool, no URL fetch,
 * no filesystem read and no raw SQL — that restriction is what makes prompt
 * injection through document titles and review comments a nuisance rather than
 * a breach. Weigh any new tool against it before adding one.
 *
 * Handlers receive a ScopedRepo, never the Prisma client, so scope cannot be
 * dropped by accident.
 */

export interface ToolCtx {
  repo: ScopedRepo;
  user: ScopeUser;
  signal: AbortSignal;
}

export interface ToolDef<A = unknown> {
  name: string;
  description: string;
  /** JSON Schema advertised to the model. */
  parameters: Record<string, unknown>;
  /** Runtime validation — the model's arguments are untrusted input. */
  args: z.ZodType<A>;
  /** Short present-tense label shown to the user while the tool runs. */
  label: (args: A) => string;
  handler: (args: A, ctx: ToolCtx) => Promise<unknown>;
}

const SECTIONS = ['FIELD_ITP', 'PROCEDURE', 'WORK_METHOD'] as const;
const STATUSES = [
  'DRAFT',
  'SUBMITTED',
  'IN_REVIEW',
  'APPROVED_A',
  'APPROVED_WITH_COMMENTS_B',
  'REJECTED_C',
  'SUPERSEDED',
] as const;

const listMyProjects: ToolDef<{ query?: string; limit?: number }> = {
  name: 'list_my_projects',
  description:
    'List the projects this user can access, with contract dates and BOQ item counts. ' +
    'Use this first when the user refers to a project by name rather than id.',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Optional case-insensitive substring of the project name.' },
      limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
    },
    required: [],
    additionalProperties: false,
  },
  args: z.object({ query: z.string().max(200).optional(), limit: z.number().int().optional() }),
  label: () => 'Listing your projects',
  handler: (args, ctx) => ctx.repo.listProjects(args),
};

const getProjectStatus: ToolDef<{ project_id: string }> = {
  name: 'get_project_status',
  description:
    'Full status for one project: document counts by status and by section (Field ITP / Procedure / ' +
    'Work Method), completion percentage, overdue review count, average review duration, and the ' +
    'documents currently past their SLA. Resolve the project id with list_my_projects first.',
  parameters: {
    type: 'object',
    properties: { project_id: { type: 'string', description: 'Project UUID.' } },
    required: ['project_id'],
    additionalProperties: false,
  },
  args: z.object({ project_id: z.string().min(1).max(64) }),
  label: () => 'Reading project status',
  handler: (args, ctx) => ctx.repo.getProjectStats(args.project_id),
};

const searchDocuments: ToolDef<{
  project_id?: string;
  query?: string;
  section?: (typeof SECTIONS)[number];
  status?: (typeof STATUSES)[number];
  current_only?: boolean;
  limit?: number;
}> = {
  name: 'search_documents',
  description:
    'Search documents by number or title, optionally filtered by project, section or status. ' +
    'Returns summary rows; call get_document_status for the full workflow position of one document.',
  parameters: {
    type: 'object',
    properties: {
      project_id: { type: 'string' },
      query: { type: 'string', description: 'Substring of the document number or title.' },
      section: { type: 'string', enum: SECTIONS },
      status: { type: 'string', enum: STATUSES },
      current_only: {
        type: 'boolean',
        default: true,
        description: 'Only the current revision of each document. Set false to include superseded revisions.',
      },
      limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
    },
    required: [],
    additionalProperties: false,
  },
  args: z.object({
    project_id: z.string().max(64).optional(),
    query: z.string().max(200).optional(),
    section: z.enum(SECTIONS).optional(),
    status: z.enum(STATUSES).optional(),
    current_only: z.boolean().optional(),
    limit: z.number().int().optional(),
  }),
  label: () => 'Searching documents',
  handler: (args, ctx) => ctx.repo.searchDocuments(args),
};

const getDocumentStatus: ToolDef<{
  document_id?: string;
  doc_number?: string;
  project_id?: string;
}> = {
  name: 'get_document_status',
  description:
    'Where a document sits in the review workflow: current stage (REVIEW / CHECK / APPROVE / COMPLETE), ' +
    'the assigned reviewer, checker and approver, SLA deadline and overdue days, final status ' +
    '(A approved, B approved with comments, C rejected), comment counts, whether the AMS letter has been ' +
    'uploaded, and recent revision history. Identify the document either by document_id, or by doc_number ' +
    'together with project_id.',
  parameters: {
    type: 'object',
    properties: {
      document_id: { type: 'string' },
      doc_number: { type: 'string' },
      project_id: { type: 'string', description: 'Required when identifying by doc_number.' },
    },
    required: [],
    additionalProperties: false,
  },
  args: z
    .object({
      document_id: z.string().max(64).optional(),
      doc_number: z.string().max(120).optional(),
      project_id: z.string().max(64).optional(),
    })
    .refine((v) => Boolean(v.document_id) !== Boolean(v.doc_number), {
      message: 'Provide either document_id or doc_number, not both.',
    })
    .refine((v) => !v.doc_number || Boolean(v.project_id), {
      message: 'project_id is required when identifying a document by doc_number.',
    }),
  label: (a) => `Checking ${a.doc_number ?? 'document'} status`,
  handler: (args, ctx) => ctx.repo.getDocumentWorkflow(args),
};

export const TOOLS: ToolDef<never>[] = [
  listMyProjects,
  getProjectStatus,
  searchDocuments,
  getDocumentStatus,
] as unknown as ToolDef<never>[];

const BY_NAME = new Map(TOOLS.map((t) => [t.name, t]));

export function getTool(name: string): ToolDef<never> | undefined {
  return BY_NAME.get(name);
}

export function toolNames(): string[] {
  return TOOLS.map((t) => t.name);
}

export function toOpenAiTools(): OpenAI.Chat.ChatCompletionTool[] {
  return TOOLS.map((t) => ({
    type: 'function',
    function: { name: t.name, description: t.description, parameters: t.parameters },
  }));
}
