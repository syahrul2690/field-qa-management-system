import { describe, expect, it } from 'vitest';
import { attachDocumentCounts, rollupDocumentCounts, BoqTreeNode } from '../services/boqTreeService';

describe('attachDocumentCounts', () => {
  const items = [{ id: 'fabrication' }, { id: 'erection' }];

  it('counts current documents for direct and linked BoQ items', () => {
    const result = attachDocumentCounts(items, [
      { boq_item_id: 'fabrication', section: 'PROCEDURE', is_current: true, status: 'APPROVED_A' },
      {
        boq_item_id: 'fabrication',
        section: 'FIELD_ITP',
        is_current: true,
        status: 'SUBMITTED',
        boq_item_links: [{ boq_item_id: 'erection' }],
      },
    ]);

    expect(result).toEqual([
      {
        id: 'fabrication',
        document_counts: {
          FIELD_ITP: { status: 'pending', count: 1 },
          PROCEDURE: { status: 'approved', count: 1 },
          WORK_METHOD: { status: 'empty', count: 0 },
        },
      },
      {
        id: 'erection',
        document_counts: {
          FIELD_ITP: { status: 'pending', count: 1 },
          PROCEDURE: { status: 'empty', count: 0 },
          WORK_METHOD: { status: 'empty', count: 0 },
        },
      },
    ]);
  });

  it('ignores historical revisions and unsupported sections', () => {
    const result = attachDocumentCounts(items, [
      { boq_item_id: 'fabrication', section: 'FIELD_ITP', is_current: false, status: 'APPROVED_A' },
      { boq_item_id: 'fabrication', section: 'OTHER', is_current: true, status: 'APPROVED_A' },
    ]);

    expect(result[0].document_counts).toEqual({
      FIELD_ITP: { status: 'empty', count: 0 },
      PROCEDURE: { status: 'empty', count: 0 },
      WORK_METHOD: { status: 'empty', count: 0 },
    });
  });

  it('lets a rejected document outrank an approved one in the same section', () => {
    const result = attachDocumentCounts([{ id: 'fabrication' }], [
      { boq_item_id: 'fabrication', section: 'FIELD_ITP', is_current: true, status: 'APPROVED_A' },
      { boq_item_id: 'fabrication', section: 'FIELD_ITP', is_current: true, status: 'REJECTED_C' },
    ]);

    expect(result[0].document_counts.FIELD_ITP).toEqual({ status: 'rejected', count: 2 });
  });
});

describe('rollupDocumentCounts', () => {
  function node(id: string, children: BoqTreeNode[] = []): BoqTreeNode {
    return {
      id,
      project_id: 'p',
      parent_item_id: null,
      level: 1,
      item_code: id,
      system_tag: id,
      title: id,
      description: null,
      sort_order: 0,
      created_at: new Date(),
      updated_at: new Date(),
      document_counts: {
        FIELD_ITP: { status: 'empty', count: 0 },
        PROCEDURE: { status: 'empty', count: 0 },
        WORK_METHOD: { status: 'empty', count: 0 },
      },
      children,
    };
  }

  it('bubbles a child rejection up to a collapsed parent that has no documents of its own', () => {
    const child = node('B.1');
    child.document_counts!.FIELD_ITP = { status: 'rejected', count: 1 };
    const parent = node('B', [child]);

    const [result] = rollupDocumentCounts([parent]);

    expect(result.document_counts!.FIELD_ITP).toEqual({ status: 'rejected', count: 1 });
    expect(result.children[0].document_counts!.FIELD_ITP).toEqual({ status: 'rejected', count: 1 });
  });

  it("does not let a child's empty section hide the parent's own document", () => {
    const child = node('B.1');
    const parent = node('B', [child]);
    parent.document_counts!.PROCEDURE = { status: 'approved', count: 1 };

    const [result] = rollupDocumentCounts([parent]);

    expect(result.document_counts!.PROCEDURE).toEqual({ status: 'approved', count: 1 });
  });
});
