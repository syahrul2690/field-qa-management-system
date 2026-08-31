import { ParsedBoqRow } from '../utils/excelParser/boqSheetParser';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BoqItemNode {
  id: string;
  project_id: string;
  parent_item_id: string | null;
  level: number;
  item_code: string;
  system_tag: string;
  title: string;
  description: string | null;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
  document_counts?: BoqDocumentCounts;
}

export interface BoqTreeNode extends BoqItemNode {
  children: BoqTreeNode[];
}

export type BoqDocumentSection = 'FIELD_ITP' | 'PROCEDURE' | 'WORK_METHOD';

// Worst-first severity so a rejected document can never be masked by an
// unrelated approved one, and a rollup to an ancestor never hides it either.
export type BoqDocumentStatus = 'empty' | 'approved' | 'pending' | 'rejected';

export interface BoqSectionFlag {
  status: BoqDocumentStatus;
  count: number;
}

export type BoqDocumentCounts = Record<BoqDocumentSection, BoqSectionFlag>;

export interface CurrentDocumentCoverage {
  boq_item_id: string;
  section: string;
  is_current: boolean;
  status: string;
  boq_item_links?: Array<{ boq_item_id: string }>;
}

const DOCUMENT_SECTIONS: BoqDocumentSection[] = ['FIELD_ITP', 'PROCEDURE', 'WORK_METHOD'];

const STATUS_SEVERITY: Record<BoqDocumentStatus, number> = {
  empty: 0,
  approved: 1,
  pending: 2,
  rejected: 3,
};

const REJECTED_STATUSES = new Set(['REJECTED_C']);
const APPROVED_STATUSES = new Set(['APPROVED_A', 'APPROVED_WITH_COMMENTS_B']);

function toFlagStatus(documentStatus: string): BoqDocumentStatus {
  if (REJECTED_STATUSES.has(documentStatus)) return 'rejected';
  if (APPROVED_STATUSES.has(documentStatus)) return 'approved';
  // DRAFT / SUBMITTED / IN_REVIEW, and anything unrecognized — still in flight.
  return 'pending';
}

function worseStatus(a: BoqDocumentStatus, b: BoqDocumentStatus): BoqDocumentStatus {
  return STATUS_SEVERITY[b] > STATUS_SEVERITY[a] ? b : a;
}

function emptyDocumentCounts(): BoqDocumentCounts {
  return {
    FIELD_ITP: { status: 'empty', count: 0 },
    PROCEDURE: { status: 'empty', count: 0 },
    WORK_METHOD: { status: 'empty', count: 0 },
  };
}

/**
 * Attach each item's own current-document coverage (not counting descendants).
 * A document can cover more than one BoQ item through DocumentBoqItem links,
 * so every covered item gets the same coverage. Historical revisions are
 * ignored. A section's status is the worst status among its current
 * documents (rejected > pending > approved) so a rejected document is never
 * masked by an unrelated approved one in the same section.
 */
export function attachDocumentCounts<T extends { id: string }>(
  items: T[],
  documents: CurrentDocumentCoverage[],
): Array<T & { document_counts: BoqDocumentCounts }> {
  const countsByItem = new Map<string, BoqDocumentCounts>();
  for (const item of items) countsByItem.set(item.id, emptyDocumentCounts());

  for (const document of documents) {
    if (!document.is_current || !DOCUMENT_SECTIONS.includes(document.section as BoqDocumentSection)) continue;
    const section = document.section as BoqDocumentSection;
    const flagStatus = toFlagStatus(document.status);
    const coveredItemIds = [document.boq_item_id, ...(document.boq_item_links ?? []).map((link) => link.boq_item_id)];
    for (const itemId of new Set(coveredItemIds)) {
      const counts = countsByItem.get(itemId);
      if (!counts) continue;
      const flag = counts[section];
      flag.count += 1;
      flag.status = worseStatus(flag.status, flagStatus);
    }
  }

  return items.map((item) => ({
    ...item,
    document_counts: countsByItem.get(item.id) ?? emptyDocumentCounts(),
  }));
}

/**
 * Roll each node's document coverage up from its own documents plus every
 * descendant's, so a collapsed parent shows the worst status hiding anywhere
 * underneath it instead of only what's attached to the parent row itself.
 */
export function rollupDocumentCounts<T extends BoqTreeNode>(nodes: T[]): T[] {
  for (const node of nodes) {
    if (node.children.length === 0) continue;
    rollupDocumentCounts(node.children as T[]);

    const own = node.document_counts ?? emptyDocumentCounts();
    const rolled = emptyDocumentCounts();
    for (const section of DOCUMENT_SECTIONS) {
      rolled[section].status = own[section].status;
      rolled[section].count = own[section].count;
    }

    for (const child of node.children) {
      const childCounts = child.document_counts ?? emptyDocumentCounts();
      for (const section of DOCUMENT_SECTIONS) {
        rolled[section].count += childCounts[section].count;
        rolled[section].status = worseStatus(rolled[section].status, childCounts[section].status);
      }
    }
    node.document_counts = rolled;
  }
  return nodes;
}

// ─── Build nested tree from flat array (in-memory, O(n)) ─────────────────────

export function buildBoqTree(items: BoqItemNode[]): BoqTreeNode[] {
  const map = new Map<string, BoqTreeNode>();
  const roots: BoqTreeNode[] = [];

  for (const item of items) {
    map.set(item.id, { ...item, children: [] });
  }

  for (const item of items) {
    const node = map.get(item.id)!;
    if (item.parent_item_id) {
      const parent = map.get(item.parent_item_id);
      if (parent) {
        parent.children.push(node);
      } else {
        // Parent not found — treat as root
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  return roots;
}

// ─── Generate system tag for a BoQ item ──────────────────────────────────────
// Format: {projectCodePrefix}-L{level}-{itemCode}
// projectCodePrefix = first 6 chars of projectId (stripped of dashes, uppercased)

export function generateSystemTag(
  projectId: string,
  level: number,
  itemCode: string,
): string {
  const prefix = projectId.replace(/-/g, '').substring(0, 6).toUpperCase();
  const code = itemCode.replace(/\s+/g, '-').toUpperCase();
  return `${prefix}-L${level}-${code}`;
}

// ─── Topological sort — parents before children ───────────────────────────────
// Sort by level ascending first, then by sort_order ascending

export function topologicalSort(rows: ParsedBoqRow[]): ParsedBoqRow[] {
  return [...rows].sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return a.sort_order - b.sort_order;
  });
}
