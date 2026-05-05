import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { validateBoqTemplate } from '../utils/excelParser/boqTemplateValidator';
import { parseBoqSheet } from '../utils/excelParser/boqSheetParser';
import {
  topologicalSort,
  generateSystemTag,
  buildBoqTree,
  BoqItemNode,
  BoqTreeNode,
} from './boqTreeService';

// ─── Upload BoQ from Excel file ───────────────────────────────────────────────

export async function uploadBoq(
  projectId: string,
  filePath: string,
): Promise<{ count: number }> {
  // 1. Validate template structure
  const validation = await validateBoqTemplate(filePath);
  if (!validation.valid) {
    throw new AppError('Template validation failed', 422, true, validation.errors);
  }

  // 2. Parse rows and resolve parent references
  const parsed = await parseBoqSheet(filePath);
  if (!parsed.success || !parsed.rows) {
    throw new AppError('Sheet parsing failed', 422, true, parsed.errors);
  }

  // 3. Topological sort — parents before children
  const sortedRows = topologicalSort(parsed.rows);

  // 4. Persist atomically — upsert so re-uploads don't violate unique constraints
  const codeToId = new Map<string, string>(); // item_code -> db id

  await prisma.$transaction(async (tx) => {
    for (const row of sortedRows) {
      const parentId = row.parent_code ? codeToId.get(row.parent_code) : undefined;
      const systemTag = generateSystemTag(projectId, row.level, row.item_code);

      const upserted = await tx.boqItem.upsert({
        where: {
          project_id_item_code: {
            project_id: projectId,
            item_code: row.item_code,
          },
        },
        create: {
          project_id: projectId,
          parent_item_id: parentId ?? null,
          level: row.level,
          item_code: row.item_code,
          system_tag: systemTag,
          title: row.title,
          description: row.description ?? null,
          sort_order: row.sort_order,
        },
        update: {
          parent_item_id: parentId ?? null,
          level: row.level,
          system_tag: systemTag,
          title: row.title,
          description: row.description ?? null,
          sort_order: row.sort_order,
        },
      });

      codeToId.set(row.item_code, upserted.id);
    }
  });

  return { count: sortedRows.length };
}

// ─── Get full BoQ tree ────────────────────────────────────────────────────────

export async function getBoqTree(projectId: string): Promise<BoqTreeNode[]> {
  const items = await prisma.boqItem.findMany({
    where: { project_id: projectId },
    orderBy: [{ level: 'asc' }, { sort_order: 'asc' }],
  });
  return buildBoqTree(items as BoqItemNode[]);
}

// ─── Get direct children of a BoQ item (lazy loading) ────────────────────────

export async function getBoqItemChildren(itemId: string): Promise<BoqItemNode[]> {
  const items = await prisma.boqItem.findMany({
    where: { parent_item_id: itemId },
    orderBy: { sort_order: 'asc' },
  });
  return items as BoqItemNode[];
}

// ─── Get single BoQ item with document summary ────────────────────────────────

export async function getBoqItem(itemId: string) {
  const item = await prisma.boqItem.findUnique({
    where: { id: itemId },
    include: {
      documents: {
        where: { is_current: true },
        select: {
          id: true,
          section: true,
          doc_number: true,
          title: true,
          revision_no: true,
          status: true,
          is_current: true,
          created_at: true,
        },
      },
      children: {
        select: { id: true, item_code: true, title: true, level: true, sort_order: true },
        orderBy: { sort_order: 'asc' },
      },
    },
  });

  if (!item) throw new AppError('BoQ item not found', 404);
  return item;
}

// ─── Clear all BoQ items for a project (for re-upload) ───────────────────────

export async function clearBoq(projectId: string): Promise<void> {
  await prisma.boqItem.deleteMany({ where: { project_id: projectId } });
}
