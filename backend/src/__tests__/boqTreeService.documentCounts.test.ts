import { describe, expect, it } from 'vitest';
import { attachDocumentCounts } from '../services/boqTreeService';

describe('attachDocumentCounts', () => {
  const items = [{ id: 'fabrication' }, { id: 'erection' }];

  it('counts current documents for direct and linked BoQ items', () => {
    const result = attachDocumentCounts(items, [
      { boq_item_id: 'fabrication', section: 'PROCEDURE', is_current: true },
      {
        boq_item_id: 'fabrication',
        section: 'FIELD_ITP',
        is_current: true,
        boq_item_links: [{ boq_item_id: 'erection' }],
      },
    ]);

    expect(result).toEqual([
      { id: 'fabrication', document_counts: { FIELD_ITP: 1, PROCEDURE: 1, WORK_METHOD: 0 } },
      { id: 'erection', document_counts: { FIELD_ITP: 1, PROCEDURE: 0, WORK_METHOD: 0 } },
    ]);
  });

  it('ignores historical revisions and unsupported sections', () => {
    const result = attachDocumentCounts(items, [
      { boq_item_id: 'fabrication', section: 'FIELD_ITP', is_current: false },
      { boq_item_id: 'fabrication', section: 'OTHER', is_current: true },
    ]);

    expect(result[0].document_counts).toEqual({ FIELD_ITP: 0, PROCEDURE: 0, WORK_METHOD: 0 });
  });
});
