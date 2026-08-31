import type ExcelJS from 'exceljs';
import { InspectionLevel, ItpPhase, ItpCategory } from '@prisma/client';

export const ITP_SHEET_NAME = 'ITP';

export const REQUIRED_HEADERS = ['Activity', 'Category'] as const;
export const OPTIONAL_HEADERS = [
  'Acceptance Criteria',
  'Reference Standard',
  'Verifying Document',
  'Sub',
  'PP',
  'PLN',
  'Phase',
] as const;

export type RequiredHeader = typeof REQUIRED_HEADERS[number];

export const MAX_ITP_ROWS = 500;

const BLANK_TEXTS = new Set(['', '-', '—', 'n/a', 'na']);

/**
 * Flattens ExcelJS cell values to a trimmed string. ExcelJS returns plain
 * strings/numbers for simple cells, but `{ richText: [...] }` for formatted
 * text and `{ result: ... }` for formulas — String(cell.value) on either of
 * those yields "[object Object]" rather than the visible text.
 */
export function cellText(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value).trim();
  if (value instanceof Date) return value.toISOString().trim();
  if (typeof value === 'object') {
    if ('richText' in value && Array.isArray((value as { richText: Array<{ text: string }> }).richText)) {
      return (value as { richText: Array<{ text: string }> }).richText.map((run) => run.text).join('').trim();
    }
    if ('result' in value) {
      return cellText((value as { result: ExcelJS.CellValue }).result);
    }
    if ('text' in value && typeof (value as { text: unknown }).text === 'string') {
      return ((value as { text: string }).text).trim();
    }
  }
  return String(value).trim();
}

export function isBlankCell(text: string): boolean {
  return BLANK_TEXTS.has(text.trim().toLowerCase());
}

const INSPECTION_LEVEL_ALIASES: Record<string, InspectionLevel> = {
  h: InspectionLevel.H,
  hold: InspectionLevel.H,
  'hold point': InspectionLevel.H,
  w: InspectionLevel.W,
  witness: InspectionLevel.W,
  sw: InspectionLevel.SW,
  spot: InspectionLevel.SW,
  'spot witness': InspectionLevel.SW,
  r: InspectionLevel.R,
  review: InspectionLevel.R,
  a: InspectionLevel.A,
  approval: InspectionLevel.A,
  approve: InspectionLevel.A,
  p: InspectionLevel.P,
  perform: InspectionLevel.P,
};

const ITP_PHASE_ALIASES: Record<string, ItpPhase> = {
  shop: ItpPhase.SHOP,
  pabrik: ItpPhase.SHOP,
  field: ItpPhase.FIELD,
  lapangan: ItpPhase.FIELD,
  site: ItpPhase.FIELD,
  commissioning: ItpPhase.COMMISSIONING,
  komisioning: ItpPhase.COMMISSIONING,
};

const ITP_CATEGORY_ALIASES: Record<string, ItpCategory> = {
  sipil: ItpCategory.SIPIL,
  civil: ItpCategory.SIPIL,
  elektrikal: ItpCategory.ELEKTRIKAL,
  electrical: ItpCategory.ELEKTRIKAL,
  mekanikal: ItpCategory.MEKANIKAL,
  mechanical: ItpCategory.MEKANIKAL,
  instrumen_kontrol: ItpCategory.INSTRUMEN_KONTROL,
  'instrumen kontrol': ItpCategory.INSTRUMEN_KONTROL,
  'instrument & control': ItpCategory.INSTRUMEN_KONTROL,
  'instrument and control': ItpCategory.INSTRUMEN_KONTROL,
  'i&c': ItpCategory.INSTRUMEN_KONTROL,
};

/** Returns null when the text doesn't match any known value or alias — never a wrong enum. */
export function normalizeInspectionLevel(text: string): InspectionLevel | null {
  return INSPECTION_LEVEL_ALIASES[text.trim().toLowerCase()] ?? null;
}

export function normalizePhase(text: string): ItpPhase | null {
  return ITP_PHASE_ALIASES[text.trim().toLowerCase()] ?? null;
}

export function normalizeCategory(text: string): ItpCategory | null {
  return ITP_CATEGORY_ALIASES[text.trim().toLowerCase()] ?? null;
}
