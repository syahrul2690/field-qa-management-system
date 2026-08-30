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

export type BoqDocumentCounts = Record<BoqDocumentSection, number>;

export interface CurrentDocumentCoverage {
  boq_item_id: string;
  section: string;
  is_current: boolean;
  boq_item_links?: Array<{ boq_item_id: string }>;
}

const DOCUMENT_SECTIONS: BoqDocumentSection[] = ['FIELD_ITP', 'PROCEDURE', 'WORK_METHOD'];

function emptyDocumentCounts(): BoqDocumentCounts {
  return { FIELD_ITP: 0, PROCEDURE: 0, WORK_METHOD: 0 };
}

/**
 * Attach current document counts to each tree item. A document can cover more
 * than one BoQ item through DocumentBoqItem links, so every covered item gets
 * the same current-document presence. Historical revisions are ignored.
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
    const coveredItemIds = [document.boq_item_id, ...(document.boq_item_links ?? []).map((link) => link.boq_item_id)];
    for (const itemId of new Set(coveredItemIds)) {
      const counts = countsByItem.get(itemId);
      if (counts) counts[section] += 1;
    }
  }

  return items.map((item) => ({
    ...item,
    document_counts: countsByItem.get(item.id) ?? emptyDocumentCounts(),
  }));
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
