---
title: Excel Import for ITP Inspection Items
date: 2026-08-31
status: draft — pending review, no implementation started
source_basis: backend/src/services/documentService.ts, backend/src/utils/excelParser/*, frontend/src/features/documents/ItpItemPanel.tsx, backend/prisma/schema.prisma
---

# Excel Import for ITP Inspection Items

## 1. Problem

Vendors fill Inspection Items one row at a time in `ItpItemPanel`, through a 10-column
grid (Activity, Acceptance Criteria, Reference Standard, Verifying Document, Sub, PP,
PLN, Phase, Category). A real Field ITP carries 20–150 rows. Manual entry is the
bottleneck and the main source of vendor friction on document submission.

## 2. Recommended architecture — parse-only endpoint, stage into the existing grid

**The import endpoint parses and validates, but writes nothing to the database.** It
returns normalized rows as JSON; the frontend loads them into the existing editor grid
as unsaved changes; the vendor reviews and presses the existing **Save ITP Items**
button, which goes through the existing `PUT /api/documents/:documentId/itp-items`.

Rationale — this is the decision that matters most:

- **No second write path.** `saveItpItems` already enforces six layered guards: VENDOR
  role, VENDOR institution, institution owns the document, section is `FIELD_ITP`,
  document `is_current` + `DRAFT`, and no review with a final status. A direct
  import-to-database endpoint would have to duplicate every one of them, and they would
  drift apart over time. Reusing the existing PUT means import inherits all of them for
  free, permanently.
- **Review before commit.** ITP rows are contractual. A vendor must see what 120 parsed
  rows actually look like before they become the document of record. Staging in the grid
  gives that for free, and the existing dirty-state guard already warns on navigate-away.
- **No new frontend dependency.** The frontend currently has no Excel library; the
  backend already has `exceljs@4.4.0`. Parsing server-side avoids adding ~1 MB to the
  bundle and keeps one parsing implementation, in TypeScript, unit-testable.
- **Safe and idempotent.** An endpoint that persists nothing is trivially retryable and
  needs no rollback story.

The existing `ItpItemPanel` state machine already supports this with no changes to its
save logic: setting `localItems` + `setDirty(true)` is exactly what import needs, and the
`!dirty` guard on the server-sync `useEffect` (ItpItemPanel.tsx:71) already prevents
imported rows from being clobbered by a refetch.

## 3. Template contract

New `itpTemplateContract.ts`, mirroring the existing `boqTemplateContract.ts` shape.

Sheet name `ITP`, falling back to the first worksheet (same tolerance as the BoQ
validator). Header row 1, matched case-insensitively after `.trim()`.

| Column | Required | Maps to | Notes |
|---|---|---|---|
| No. | no | — | advisory only; `seq_no` is re-derived on save |
| Activity | **yes** | `activity` | must be non-empty after trim |
| Acceptance Criteria | no | `acceptance_criteria` | |
| Reference Standard | no | `reference_standard` | |
| Verifying Document | no | `verifying_document` | |
| Sub | no | `sub_code` | `InspectionLevel` or blank |
| PP | no | `pp_code` | `InspectionLevel` or blank |
| PLN | no | `pln_code` | `InspectionLevel` or blank |
| Phase | no | `phase` | defaults to `FIELD` when blank |
| Category | **yes** | `category` | no safe default — a wrong category is worse than an error |

`seq_no` is deliberately not imported: `normalizeItpItems` already assigns
`index + 1` on save, so sheet row order is the only ordering input. This avoids
duplicate/gap `seq_no` violating the `@@unique([document_id, seq_no])` constraint.

### Enum normalization (case-insensitive, trimmed)

- **InspectionLevel** → `H`, `W`, `SW`, `R`, `A`, `P`. Also accept the spelled-out forms
  that appear in real submittals: `Hold`/`Hold Point`→H, `Witness`→W,
  `Spot Witness`/`Spot`→SW, `Review`→R, `Approval`/`Approve`→A, `Perform`→P.
  Blank, `-`, `—`, `N/A`, `NA` → `null` (party has no role).
- **ItpPhase** → `SHOP`, `FIELD`, `COMMISSIONING`. Aliases: `Pabrik`→SHOP,
  `Lapangan`/`Site`→FIELD, `Komisioning`/`Commissioning`→COMMISSIONING. Blank → `FIELD`.
- **ItpCategory** → `SIPIL`, `ELEKTRIKAL`, `MEKANIKAL`, `INSTRUMEN_KONTROL`. Aliases:
  `Civil`→SIPIL, `Electrical`→ELEKTRIKAL, `Mechanical`→MEKANIKAL,
  `I&C`/`Instrument & Control`/`Instrumen Kontrol`→INSTRUMEN_KONTROL. Blank → error.

### Known parsing gotchas to handle explicitly

- **Rich-text and formula cells.** ExcelJS returns `{ richText: [...] }` for formatted
  cells and `{ result: ... }` for formulas, not a plain string. A shared `cellText(cell)`
  helper must flatten `string | number | { richText } | { result } | { text }` before
  any validation. Naive `String(cell.value)` produces `[object Object]`.
- **Fully blank rows** are skipped, not errored (BoQ validator already does this).
- **Row cap** `MAX_ITP_ROWS = 500`. A real ITP is 20–150 rows; 500 is generous and
  bounds memory. Exceeding it is a single clear error, not 500 row errors.

## 4. Error handling

All-or-nothing, matching the BoQ upload contract: `422` with
`{ errors: [{ row, field, message }] }`. No partial import — silently dropping rows from
a contractual inspection plan is the worst possible failure mode. The modal renders the
error list scrollably with row numbers so the vendor can fix the sheet and re-upload.

## 5. Append vs replace

The modal asks, with a safe default:

- Grid currently empty → **Replace**, no prompt needed (nothing is at risk).
- Grid has rows → default **Append**, with Replace available and the current row count
  shown in the warning text.

## 6. Template download — the highest-leverage piece

`GET /api/documents/itp-items/template` returns a styled `.xlsx` built with ExcelJS,
following the existing `boqController.downloadTemplate` pattern, **plus ExcelJS
`dataValidation` dropdown lists on the five enum columns** (Sub, PP, PLN, Phase,
Category).

Dropdowns are what actually prevent bad data, rather than reporting it after the fact.
Most of the normalization aliases in §3 exist for the case where a vendor edits outside
the template; with dropdowns, the common path can't produce an invalid enum at all.

The template should also ship 2–3 pre-filled example rows and a frozen header row.

## 7. Endpoints

```
POST /api/documents/itp-items/parse-excel    multipart, field: itp_file
GET  /api/documents/itp-items/template       styled .xlsx with dropdowns
```

- **Route ordering:** both must be declared **before** `/:documentId` in
  `documentRoutes.ts`, or Express will match `itp-items` as a `documentId`. The file
  already carries this exact hazard note for `/history` (documentRoutes.ts:41).
- **Document-agnostic by design.** The parse endpoint takes no document id — it is a
  pure function over the uploaded file and returns only what the caller just uploaded, so
  there is no cross-document data exposure to guard.
- **Auth:** `authMiddleware` + `requireRole(Role.VENDOR)` + `requireInstitution(VENDOR)`,
  matching the PUT. This is CPU-cost protection, not data protection.
- **Multer: `memoryStorage`, 10 MB cap, `.xlsx`/`.xls` only.** Read the buffer with
  `wb.xlsx.load(buffer)`. Deliberately *not* the disk-storage pattern used by
  `uploadExcel` — that middleware writes every upload to `uploads/boq/` and never
  deletes it, which is an orphan-file leak we should not replicate for a parse-only
  endpoint that has no reason to retain the file at all.

## 8. Frontend

`ItpItemPanel` header gains, when `canEdit`:

- **Import from Excel** → opens `ItpImportModal`
- **Download Template** → hits the template endpoint

`ItpImportModal` is closely modeled on the existing `BoqUploadModal` (drag-drop zone,
validation-error list, template download link) — same interaction vocabulary, so it needs
no new user learning. On success it calls back into the panel with the parsed rows; the
panel merges per the append/replace choice, renumbers `seq_no`, and sets `dirty`.

Explicit success copy: *"N rows imported into the editor. Review them, then press Save
ITP Items to store them."* The rows are not yet saved and the UI must not imply they are.

## 9. Testing

- Unit — enum normalization: every alias, blank handling, invalid value errors.
- Unit — `cellText` helper: plain, numeric, rich-text, formula, null cells.
- Unit — validator: missing required header, blank Activity, blank Category, blank row
  skipping, row cap.
- Round-trip — generate an `.xlsx` in-test with ExcelJS and parse it back, rather than
  committing a binary fixture.
- Frontend — modal renders the error list; success path stages rows and marks dirty.
- Manual — download template, fill it, import, verify grid, save, reload.

## 10. Sequencing

- [ ] 1. `itpTemplateContract.ts` + `cellText` helper + enum normalizers, with unit tests
- [ ] 2. `itpSheetParser.ts` / validator producing `{ rows, errors }`, with unit tests
- [ ] 3. `POST .../parse-excel` — multer memoryStorage, route ordering, authz
- [ ] 4. `GET .../template` — styled workbook with dropdown validation
- [ ] 5. `ItpImportModal` + panel wiring (append/replace, dirty staging)
- [ ] 6. Frontend tests, `tsc --noEmit`, live browser verification, ship via PR

Steps 1–2 are pure functions with no database and no Express — they carry the actual
complexity and should be fully tested before any wiring exists.

## 11. Assumptions and open questions

- **ASSUMED: v1 accepts only our own template**, not arbitrary contractor ITP
  spreadsheets. This is the assumption most likely to be wrong and it is worth
  confirming against real submittals before step 1. If contractors' own formats must be
  ingested directly, that is a materially different feature (column-mapping UI, merged-cell
  forward-fill for Category/Phase spanning rows, multi-row headers) and should be a
  separate Phase 2 rather than an expansion of this one.
- **NOT INCLUDED, deliberately:** column mapping UI, merged-cell forward-fill, importing
  into non-`FIELD_ITP` sections, importing across multiple documents at once, and
  round-trip *export* of existing items to Excel. Export is the natural next request
  (it makes revisions editable in Excel) but is out of scope here.
- Section restriction stays as-is: Inspection Items exist only on `FIELD_ITP` documents,
  so import appears only there.
