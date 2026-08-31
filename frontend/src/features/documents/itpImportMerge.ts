import type { ParsedItpRow } from './ItpImportModal';

// Kept structurally compatible with ItpItemPanel's ItpItem so this module has
// no dependency on the panel — it's a pure function, tested without a DOM.
export interface MergeableItpItem {
  seq_no: number;
  activity: string;
  acceptance_criteria: string;
  reference_standard: string;
  verifying_document: string;
  sub_code: string;
  pp_code: string;
  pln_code: string;
  phase: string;
  category: string;
}

function toMergeableItem(row: ParsedItpRow, seqNo: number): MergeableItpItem {
  return {
    seq_no: seqNo,
    activity: row.activity,
    acceptance_criteria: row.acceptance_criteria ?? '',
    reference_standard: row.reference_standard ?? '',
    verifying_document: row.verifying_document ?? '',
    sub_code: row.sub_code ?? '',
    pp_code: row.pp_code ?? '',
    pln_code: row.pln_code ?? '',
    phase: row.phase,
    category: row.category,
  };
}

/**
 * Merges freshly-parsed rows into the editor's current rows.
 *
 * Replace mode discards the existing rows outright. Append mode first drops
 * any existing row with a blank activity — the panel seeds exactly one such
 * row whenever the grid is empty and editable, and appending onto it would
 * otherwise leave a stray blank row at position 1. Both modes renumber
 * seq_no to a contiguous 1-based sequence, since sheet row order is the only
 * ordering signal on import (the sheet's own "No." column is advisory only).
 */
export function mergeImportedRows(
  existing: MergeableItpItem[],
  imported: ParsedItpRow[],
  mode: 'append' | 'replace',
): MergeableItpItem[] {
  if (mode === 'replace') {
    return imported.map((row, i) => toMergeableItem(row, i + 1));
  }

  const keptExisting = existing.filter((item) => item.activity.trim().length > 0);
  const combined = [...keptExisting, ...imported.map((row) => toMergeableItem(row, 0))];
  return combined.map((item, i) => ({ ...item, seq_no: i + 1 }));
}
