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
}

export interface BoqTreeNode extends BoqItemNode {
  children: BoqTreeNode[];
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
