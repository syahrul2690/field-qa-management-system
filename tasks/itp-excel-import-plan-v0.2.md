---
title: Excel Import for ITP Inspection Items — Implementation Plan
date: 2026-08-31
status: draft — pending approval, no implementation started
supersedes: itp-excel-import-plan-v0.1.md (architecture rationale remains valid there)
source_basis: backend/src/services/documentService.ts, backend/src/routes/documentRoutes.ts, backend/src/utils/excelParser/*, frontend/src/features/documents/ItpItemPanel.tsx, frontend/src/services/documentApi.ts, backend/prisma/schema.prisma
---

# Implementation Plan — Excel Import for ITP Inspection Items

Architecture and its rationale are in **v0.1**; this document is the build sequence and
the criteria that decide whether each step is actually done. The load-bearing decision
carried forward: **the import endpoint parses and validates but writes nothing to the
database** — rows are staged into the existing editor grid and persisted only by the
existing `PUT /api/documents/:documentId/itp-items`.

## 0. Deliverables

**New files (6)**

| Path | Purpose |
|---|---|
| `backend/src/utils/excelParser/itpTemplateContract.ts` | headers, caps, cell/enum normalizers |
| `backend/src/utils/excelParser/itpSheetParser.ts` | buffer → `{ rows, errors }` |
| `backend/src/__tests__/itpTemplateContract.test.ts` | normalizer + `cellText` units |
| `backend/src/__tests__/itpSheetParser.test.ts` | parser units, xlsx round-trip |
| `frontend/src/features/documents/ItpImportModal.tsx` | upload UI + error list |
| `frontend/src/features/documents/itpImportMerge.test.ts` | pure merge-logic units |

**Modified files (5)**

| Path | Change |
|---|---|
| `backend/src/middlewares/uploadMiddleware.ts` | add `uploadItpExcel` (memoryStorage) |
| `backend/src/controllers/documentController.ts` | add `parseItpExcel`, `downloadItpTemplate` |
| `backend/src/routes/documentRoutes.ts` | 2 routes, declared before `/:documentId` |
| `frontend/src/services/documentApi.ts` | add `parseItpExcel`, `downloadItpTemplate` |
| `frontend/src/features/documents/ItpItemPanel.tsx` | header buttons, `mergeImportedRows`, staging |

**Must NOT be modified — this is a regression guardrail, not a preference:**
`backend/src/services/documentService.ts`, `backend/prisma/schema.prisma`, and any
migration. No schema change, no new write path, no change to `saveItpItems` authorization.

---

## Step 1 — Contract and normalizers

`itpTemplateContract.ts`, mirroring `boqTemplateContract.ts`:

```ts
export const ITP_SHEET_NAME = 'ITP';
export const REQUIRED_HEADERS = ['Activity', 'Category'] as const;
export const MAX_ITP_ROWS = 500;

/** Flattens string | number | {richText} | {result} | {text} | null → trimmed string. */
export function cellText(value: ExcelJS.CellValue): string;

/** '', '-', '—', 'n/a', 'na' → true (case-insensitive, pre-trimmed). */
export function isBlankCell(text: string): boolean;

/** null means UNRECOGNIZED. Blank handling belongs to the caller. */
export function normalizeInspectionLevel(text: string): InspectionLevel | null;
export function normalizePhase(text: string): ItpPhase | null;
export function normalizeCategory(text: string): ItpCategory | null;
```

Splitting *blank* from *unrecognized* is deliberate: blank Sub/PP/PLN is valid (that party
has no role), blank Phase defaults to `FIELD`, blank Category is an error — three different
outcomes that a single nullable return would conflate.

Alias tables per v0.1 §3 (`Hold Point`→H, `Lapangan`→FIELD, `Civil`→SIPIL, `I&C`→
INSTRUMEN_KONTROL, …), matched case-insensitively after trim.

**Success criteria**
- [ ] `cellText` returns the correct string for all six cell shapes, including
      `{ richText: [{text:'A'},{text:'B'}] }` → `'AB'` and `{ result: 42 }` → `'42'`.
      A naive `String(cell.value)` on the rich-text case would yield `[object Object]`;
      a test must assert it does not.
- [ ] Every alias in the v0.1 tables maps correctly, in both upper and lower case.
- [ ] Unrecognized values (`'X'`, `'Hold Pointt'`) return `null`, never a wrong enum.
- [ ] `isBlankCell` true for all five blank forms, false for `'0'`.
- [ ] `npx vitest run src/__tests__/itpTemplateContract.test.ts` passes; `tsc --noEmit` clean.

---

## Step 2 — Sheet parser

```ts
export interface ParsedItpRow {
  activity: string;
  acceptance_criteria?: string;
  reference_standard?: string;
  verifying_document?: string;
  sub_code: InspectionLevel | null;
  pp_code: InspectionLevel | null;
  pln_code: InspectionLevel | null;
  phase: ItpPhase;
  category: ItpCategory;
}
export interface ItpParseResult {
  success: boolean;
  rows: ParsedItpRow[];
  errors: Array<{ row: number; field: string; message: string }>;
}
export async function parseItpWorkbook(buffer: Buffer): Promise<ItpParseResult>;
```

Takes a **Buffer**, not a file path — unlike `parseBoqSheet`, because this endpoint uses
memory storage and never touches disk. Sheet `ITP` with fallback to the first worksheet;
header row 1 matched case-insensitively after trim.

`seq_no` is not parsed. Sheet row order is the only ordering input; `normalizeItpItems`
reassigns `index + 1` on save, so importing `seq_no` could only ever create duplicates or
gaps against `@@unique([document_id, seq_no])`.

**Success criteria**
- [ ] Valid 3-row sheet → `success: true`, 3 rows, field-for-field correct.
- [ ] Missing `Activity` header → single header-level error, zero row errors (no cascade).
- [ ] Blank `Activity` and blank `Category` each produce one row error with the correct
      1-based **sheet** row number (not array index).
- [ ] Fully blank rows are skipped silently and do not shift subsequent row numbers.
- [ ] Blank Sub/PP/PLN → `null`; blank Phase → `FIELD`.
- [ ] `MAX_ITP_ROWS + 1` data rows → exactly one error, not 501.
- [ ] Round-trip: a workbook generated in-test with ExcelJS parses back to the same rows
      (no committed binary fixture).
- [ ] Any error ⇒ `success: false` **and** `rows` is empty — all-or-nothing is enforced by
      the parser, not left to the caller.

---

## Step 3 — Parse endpoint

```
POST /api/documents/itp-items/parse-excel   multipart, field: itp_file
  200 { success: true,  data: { rows: ParsedItpRow[], count: number } }
  422 { success: false, errors: [{ row, field, message }] }
  400 no file / wrong field name
  403 non-VENDOR
```

- `uploadItpExcel` in `uploadMiddleware.ts`: `multer.memoryStorage()`, 10 MB, `.xlsx`/`.xls`
  only, `.single('itp_file')`. Deliberately **not** the existing `uploadExcel`, which writes
  to `uploads/boq/` and never deletes — an orphan-file leak worth not replicating on an
  endpoint that has no reason to retain the file.
- Guards: `authMiddleware` + `requireRole(Role.VENDOR)` + `requireInstitution(InstitutionType.VENDOR)`,
  matching the existing PUT. This is CPU-cost protection; the response contains only what
  the caller just uploaded, so there is no cross-document exposure to guard.
- Route registered **above** `documentRoutes.get('/:documentId', …)` (documentRoutes.ts:45),
  or Express matches `itp-items` as a `documentId`. The file already carries this hazard
  note for `/history` at line 41.

**Success criteria**
- [ ] Valid file → 200, `count` equals row count.
- [ ] Invalid file → 422 with the parser's error array; response body contains no `rows`.
- [ ] No file → 400 naming the expected field `itp_file`.
- [ ] Non-VENDOR token → 403, and the file is never parsed.
- [ ] `.pdf` upload → rejected by `fileFilter`, surfaced as 400 not 500.
- [ ] **Route ordering proven:** `GET /api/documents/itp-items/template` returns a
      workbook, not a 404 “Document not found” from the `/:documentId` handler.
- [ ] No file appears anywhere under `backend/uploads/` after a parse request.

---

## Step 4 — Template download

```
GET /api/documents/itp-items/template  →  .xlsx
Content-Disposition: attachment; filename="itp_template.xlsx"
```

Built with ExcelJS following `boqController.downloadTemplate`, plus the piece that
actually matters: **`dataValidation` dropdown lists on Sub, PP, PLN, Phase, Category**,
applied down the used range. Dropdowns prevent bad enums at the source rather than
reporting them afterward; the Step 1 alias tables exist only for sheets edited outside the
template. Ships with a frozen, styled header row and 2–3 realistic example rows.

**Success criteria**
- [ ] Downloaded file opens in Excel and LibreOffice without a repair prompt.
- [ ] Clicking a cell in each of the five enum columns shows a dropdown with exactly the
      valid values.
- [ ] Typing an invalid value into a dropdown column is rejected by Excel itself.
- [ ] The unmodified template, re-uploaded to Step 3, returns 200 and parses its own
      example rows — the template and the parser cannot drift apart.
- [ ] Header row is frozen and matches `REQUIRED_HEADERS` + optional headers exactly.

---

## Step 5 — Frontend

`documentApi.ts` gains, matching the existing `boqApi.upload` / `downloadTemplate` shape:

```ts
parseItpExcel: (file: File) => { /* FormData 'itp_file', multipart */ },
downloadItpTemplate: () => apiClient.get('/documents/itp-items/template', { responseType: 'blob' }),
```

`ItpImportModal.tsx` — modeled on `BoqUploadModal` (drag-drop zone, scrollable
row/field/message error list, template link) so it needs no new user learning. Adds an
**Append / Replace** choice: Replace with no prompt when the grid is empty, otherwise
default Append with the current row count shown.

`ItpItemPanel.tsx` — exports a **pure** merge function so the tricky part is testable
without any network:

```ts
export function mergeImportedRows(
  existing: ItpItem[], imported: ParsedItpRow[], mode: 'append' | 'replace',
): ItpItem[];
```

It must drop existing rows with an empty `activity` before appending — the panel seeds a
blank `EMPTY_ITP_ITEM` row whenever the grid is empty and `canEdit` (ItpItemPanel.tsx:78),
so a naive append would leave a blank row at position 1. It renumbers `seq_no` to
`index + 1` and maps `null` codes to `''` for the select inputs.

On success the panel calls `setLocalItems(merged)` and `setDirty(true)`. No change to the
save mutation. The existing `!dirty` guard on the server-sync effect (ItpItemPanel.tsx:71)
already prevents a refetch from clobbering staged rows.

Copy must not imply persistence: *“N rows imported into the editor. Review them, then
press Save ITP Items to store them.”*

**Success criteria**
- [ ] `mergeImportedRows` unit tests: replace drops all existing; append preserves
      existing and drops the seeded blank row; `seq_no` is contiguous from 1 in both;
      `null` codes become `''`.
- [ ] Modal renders each parse error with its row number; a 422 leaves the grid untouched.
- [ ] Import buttons render only when `canEdit`.
- [ ] After import the Save button is enabled (dirty) and the header count still reflects
      *saved* items, not staged ones.
- [ ] `tsc --noEmit` clean; all existing frontend tests still pass.

---

## Step 6 — Verification and ship

**Success criteria**
- [ ] `npx vitest run` — backend: all previously passing suites still pass, plus the new
      ones. (The pre-existing `scopedRepo.integration.test.ts` failure from local DB drift
      is unrelated and stays out of scope.)
- [ ] `npx vitest run` — frontend: all pass.
- [ ] `npx tsc --noEmit` clean, both workspaces.
- [ ] `git diff --stat backend/src/services/documentService.ts backend/prisma/` is **empty** —
      proves no new write path and no schema change.
- [ ] Live browser walkthrough as a VENDOR on a current FIELD_ITP draft, per the
      acceptance criteria below.
- [ ] PR from a branch cut fresh off `origin/main`, CI green, auto-merge → VPS deploy.

---

## Feature acceptance criteria (user-observable)

The feature is done when a vendor can:

1. Download the template from the ITP panel and see dropdowns on the five enum columns.
2. Fill ~20 rows, import, and see exactly those 20 rows in the grid with correct
   activities, codes, phases and categories.
3. Press **Save ITP Items**, reload the page, and see the 20 rows persisted.
4. Upload a sheet with a blank Activity on row 7 and get an error naming **row 7**, with
   the grid left untouched.
5. **Import without saving, reload, and see zero items** — the single test that proves the
   parse-only design holds and nothing was written behind the vendor's back.
6. Import a second file in Append mode and get both sets, renumbered contiguously.

And a non-vendor cannot reach the parse endpoint at all (403).

---

## Risks

| Risk | Mitigation |
|---|---|
| Route shadowing by `/:documentId` | Explicit ordering + a success criterion that tests it |
| Rich-text/formula cells parsed as `[object Object]` | `cellText` helper + dedicated unit test |
| Vendor believes imported rows are saved | Explicit copy, dirty state, and acceptance test #5 |
| Blank seeded row surviving an append | Pure `mergeImportedRows` + unit test |
| Contractor sheets don't match our template | Out of scope by decision — see below |

## Scope boundary — the assumption to confirm before Step 1

**v1 accepts only our own template, not arbitrary contractor ITP spreadsheets.** This is
the assumption most likely to be wrong, and confirming it against two or three real
submittals costs far less than discovering it in Step 5. If contractors' own formats must
be ingested as-is, that is a different feature — column-mapping UI, merged-cell
forward-fill where Category spans rows, multi-row headers — and belongs in a separate
phase rather than an expansion of this one.

Also deliberately excluded: Excel **export** of existing items (the natural next request,
since it would make revisions editable in Excel), import into non-`FIELD_ITP` sections,
and multi-document import.

## Rollback

Single PR revert. No migration, no schema change, no data backfill, and no modification to
any existing write path — so revert risk is confined to the UI and two additive endpoints.

## Estimated size

~450 added lines backend (≈180 of them tests), ~280 frontend (≈60 tests). Steps 1–2 are
pure functions with no Express and no database, and carry most of the real complexity;
they should be fully green before any wiring exists.
