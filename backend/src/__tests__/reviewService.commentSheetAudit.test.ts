import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Role } from '@prisma/client';

const mockPrisma = vi.hoisted(() => ({
  documentReview: { findUnique: vi.fn() },
  commentSheetItem: { findMany: vi.fn() },
  commentSheetItemAudit: { findMany: vi.fn() },
}));

vi.mock('../config/database', () => ({ prisma: mockPrisma }));

vi.mock('../config', () => ({
  config: {
    sla: { defaultDays: 7 },
    integration: { apiKey: '' },
  },
}));

vi.mock('../utils/pdfEngine/commentSheetGenerator', () => ({
  generateCommentSheet: vi.fn(),
}));

import { getCommentSheetItems } from '../services/reviewService';

describe('getCommentSheetItems — edit attribution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.documentReview.findUnique.mockResolvedValue({ id: 'review-1' });
  });

  it('attributes the most recent edit to the row and includes the full history', async () => {
    mockPrisma.commentSheetItem.findMany.mockResolvedValue([
      { id: 'item-1', review_id: 'review-1', seq_no: 1, pln_comment: 'Fix torque spec', contractor_response: 'Updated', version: 2 },
    ]);
    mockPrisma.commentSheetItemAudit.findMany.mockResolvedValue([
      {
        item_id: 'item-1', field_name: 'CONTRACTOR_RESPONSE', old_value: null, new_value: 'Updated',
        created_at: new Date('2026-08-31T09:41:00Z'),
        actor: { name: 'Rizky Pratama', role: Role.VENDOR },
      },
      {
        item_id: 'item-1', field_name: 'PLN_COMMENT', old_value: 'Torque spec incomplete', new_value: 'Fix torque spec', old: true,
        created_at: new Date('2026-08-31T09:40:00Z'),
        actor: { name: 'Budi Santoso', role: Role.CHECKER },
      },
    ]);

    const [result] = await getCommentSheetItems('review-1');

    expect(result.last_edited_by).toBe('Rizky Pratama');
    expect(result.last_edited_role).toBe(Role.VENDOR);
    expect(result.last_edited_at).toEqual(new Date('2026-08-31T09:41:00Z'));
    expect(result.edit_history).toHaveLength(2);
    expect(result.edit_history[0]).toMatchObject({ field_name: 'CONTRACTOR_RESPONSE', changed_by_name: 'Rizky Pratama' });
    expect(result.edit_history[1]).toMatchObject({ field_name: 'PLN_COMMENT', changed_by_name: 'Budi Santoso' });
  });

  it('leaves attribution null for a row with no edit history', async () => {
    mockPrisma.commentSheetItem.findMany.mockResolvedValue([
      { id: 'item-2', review_id: 'review-1', seq_no: 2, pln_comment: 'New row', contractor_response: null, version: 0 },
    ]);
    mockPrisma.commentSheetItemAudit.findMany.mockResolvedValue([]);

    const [result] = await getCommentSheetItems('review-1');

    expect(result.last_edited_by).toBeNull();
    expect(result.last_edited_role).toBeNull();
    expect(result.last_edited_at).toBeNull();
    expect(result.edit_history).toEqual([]);
  });

  it('falls back to "Unknown" when the actor has been removed', async () => {
    mockPrisma.commentSheetItem.findMany.mockResolvedValue([
      { id: 'item-3', review_id: 'review-1', seq_no: 3, pln_comment: 'x', contractor_response: null, version: 1 },
    ]);
    mockPrisma.commentSheetItemAudit.findMany.mockResolvedValue([
      { item_id: 'item-3', field_name: 'PLN_COMMENT', old_value: 'y', new_value: 'x', created_at: new Date(), actor: null },
    ]);

    const [result] = await getCommentSheetItems('review-1');

    expect(result.last_edited_by).toBeNull();
    expect(result.edit_history[0].changed_by_name).toBe('Unknown');
  });

  it('does not query audits when there are no items', async () => {
    mockPrisma.commentSheetItem.findMany.mockResolvedValue([]);

    const result = await getCommentSheetItems('review-1');

    expect(result).toEqual([]);
    expect(mockPrisma.commentSheetItemAudit.findMany).not.toHaveBeenCalled();
  });

  it('keeps each item\'s audit history separate from other items in the same review', async () => {
    mockPrisma.commentSheetItem.findMany.mockResolvedValue([
      { id: 'item-1', review_id: 'review-1', seq_no: 1, pln_comment: 'a', contractor_response: null, version: 1 },
      { id: 'item-2', review_id: 'review-1', seq_no: 2, pln_comment: 'b', contractor_response: null, version: 1 },
    ]);
    mockPrisma.commentSheetItemAudit.findMany.mockResolvedValue([
      { item_id: 'item-2', field_name: 'PLN_COMMENT', old_value: null, new_value: 'b', created_at: new Date(), actor: { name: 'Editor Two', role: Role.REVIEWER } },
      { item_id: 'item-1', field_name: 'PLN_COMMENT', old_value: null, new_value: 'a', created_at: new Date(), actor: { name: 'Editor One', role: Role.REVIEWER } },
    ]);

    const [item1, item2] = await getCommentSheetItems('review-1');

    expect(item1.last_edited_by).toBe('Editor One');
    expect(item2.last_edited_by).toBe('Editor Two');
  });
});
