# Field QA ↔ Field QC Integration Plan

> **Purpose of this file:** Complete, self-contained context for the QA↔QC integration effort.
> Read this first when resuming work in a new session. Identical copy lives in both repos.
>
> - **field-qa-management-system** — `/Users/mac/Documents/BELAJAR PROGRAMMING/field-qa-management-system`
> - **field-qc-management-system** — `/Users/mac/Documents/BELAJAR PROGRAMMING/field-qc-management-system` (cloned from `git@github.com:dodonabeng5002-ux/Web-Project.git`)
>
> **Status: IN PROGRESS.** (Last updated: 2026-07-14)
> Implemented so far (uncommitted in working trees): field-qa has `ItpItem`, `qc_role`, and the integration API (A1–A3, at least partially); field-qc has `QaIntegrationModule`, QA linkage migration, the RFI readiness gate, and QA-sourced dynamic checklist (B1–B3 + parts of B5).
> **2026-07-14 revision:** three-institution QC workflow added (decisions 7-revised and 11–16, phases A4/B6/B7). Decision 7's `qc_role` vocabulary changed — the already-implemented `QcRole` enum in field-qa needs migrating.

---

## 1. Business Context

Both apps serve PLN (Indonesian state electricity company) power-infrastructure construction projects. They are **two phases of the same process**:

1. **Field QA** = *document phase*. Vendor/contractor submits guide documents — **FIELD_ITP** (Inspection & Test Plan), **PROCEDURE**, **WORK_METHOD** — per BOQ item. A consultant team reviews them in a strict 3-stage workflow (Reviewer → Checker → Approver) ending in a final status:
   - **A** = Approved
   - **B** = Approved with Comments
   - **C** = Rejected / revise & resubmit
2. **Field QC** = *execution phase*. Once documents are approved, the contractor submits an RFI (Request for Inspection); a Field Inspector executes the inspection **using a checklist derived from the approved FIELD_ITP's item list**; the product is an inspection report (PASS) or an NCR (FAIL) that cites the violated standard.

**Core business rule (user-stated):** an RFI in field-qc may only be accepted when the related FIELD_ITP, PROCEDURE, and WORK_METHOD for that BOQ item are all finished in field-qa with **minimum Status B**.

**Projects are the same entity in both systems** ("same project, different phase") — field-qa is the source of truth for project identity. No standalone field-qc projects.

---

## 2. Current-State Summary of Both Codebases

### field-qa-management-system (document review engine)
- **Stack:** React + TS (frontend, port 8080 prod), Express + TS + Prisma (backend, port 3001 prod), PostgreSQL. Deployed on VPS via docker-compose.prod.yml (see `DEPLOYMENT.md`, ssh alias `qa-vps`).
- **Data model:** `Institution` (OWNER/CONSULTANT/VENDOR) → `Unit` (hierarchical, levels 0–2) → `User` (roles: ADMIN, PIC_PROJECT, PIC_CONSULTANT, VENDOR, REVIEWER, CHECKER, APPROVER, VIEWER; status PENDING→APPROVED). `Project` → `BoqItem` (hierarchical: Area→Sub-area→Equipment, Excel-parsed) → `Document` (section: FIELD_ITP | PROCEDURE | WORK_METHOD; revisioned via `revision_no` + `is_current`) → `DocumentReview` (staged: reviewed_at/checked_at/approved_at, optimistic-locked `version`, SLA deadline, QR-stamped comment-sheet PDF, `CommentSheetItem[]`, AMS letter after approval).
- **Review pipeline:** `DRAFT → SUBMITTED → IN_REVIEW → final (APPROVED_A | APPROVED_WITH_COMMENTS_B | REJECTED_C | SUPERSEDED)`. PIC_CONSULTANT assigns the team; unit-level rules gate who can review which section. See `backend/src/services/reviewService.ts`.
- **Docs for onboarding:** `Business Process Memory/00-INDEX.md` (11 files — roles, flows, data models, endpoints, SLA logic). `Knowledge_Base/agent.md` (26 ITP domain-knowledge files, mandatory reading protocol for AI review tasks).
- **Key gap:** FIELD_ITP content is opaque (uploaded files only) — no structured inspection-item model exists anywhere yet.

### field-qc-management-system (field inspection execution)
- **Stack:** pnpm + turbo monorepo. `apps/web` Next.js 14 App Router (port 3000, PWA/offline), `apps/api` NestJS + Prisma (port 3001 dev), `packages/shared` (zod schemas, enums), `infra/docker-compose.yml` (Postgres, MinIO, Redis). Not yet deployed.
- **Data model:** flat `User` (SUB_KONTRAKTOR, FIELD_INSPECTOR, SITE_MANAGER, ADMIN), `Project` (sector, lat/long), `RfiRequest` (PENDING→APPROVED/REJECTED; approval auto-schedules inspection), `Inspection` (SCHEDULED→SUBMITTED, result PASS/FAIL, GPS, photos, `itemResults` Json), `Ncr` (OPEN→IN_PROGRESS→READY_FOR_REINSPECT→CLOSED, strictly sequential; sub-kontraktor cannot close), `WmsReview`, `Equipment`, `Notification` (WhatsApp **stubbed** — console provider only).
- **Flow:** RFI → approve → schedule inspection → inspector fills checklist → any item `TIDAK_SESUAI` ⇒ result FAIL ⇒ auto-NCR citing failed items (see `apps/api/src/inspections/inspections.service.ts`, `ncr.service.ts`).
- **Key gap:** checklist items are **hardcoded static templates** per category (SIPIL/ELEKTRIKAL/MEKANIKAL/INSTRUMEN_KONTROL) in `packages/shared/src/checklist-templates.ts` — not tied to any real document.

---

## 3. What an ITP Inspection Item Really Is (from field-qa's Knowledge_Base)

Derived from `Knowledge_Base/21_HV_Switchyard_Equipment_ITP.md` §7 and `24_Riau_Peaker_Field_ITP_Comment_Sheets.md`. A real ITP item has:

| Attribute | Example |
|---|---|
| Activity | "Hydrostatic Pressure Test" |
| Reference standard | "ASME B31.1 Cl. 345.4.2" |
| Acceptance criteria | "1.5× design pressure, 30 min hold, zero visible leakage" |
| Verifying document | "Performance Test Report (NFPA 20 form)" |
| **Inspection level (PLN code)** | **H** = Hold point (PLN must witness & sign before work proceeds — the reason RFI exists), **W** = Witness, **INSPECT** = visual verify + photo, **N** = contractor self-check |
| Phase | SHOP/FAT vs FIELD/SAT vs COMMISSIONING |

The inspection level should drive field-qc behavior (hold points block progress), not just be metadata.

---

## 4. Agreed Decisions (do not re-litigate)

1. **Integration style:** API integration. Two apps, two databases, stay separate. field-qc calls field-qa's API. NOT a shared DB or merged codebase.
2. **Project ownership:** field-qa is source of truth. Every field-qc project links to a QA project (`qaProjectId`); RFIs/inspections link to a QA BOQ item (`qaBoqItemId`).
3. **ItpItem lives in field-qa**, attached to `Document` (thus versioned with `revision_no`). Other consumers may need it later.
4. **Iteration 1 = manual entry** of ITP items (free-form documents stay as uploaded files). **Iteration 2 = structured parsing** (Excel, reusing field-qa's existing `excelParser` pattern) feeding the *same* `saveItpItems()` service function — downstream unchanged.
5. **RFI gate is per BOQ item:** all 3 sections (FIELD_ITP, PROCEDURE, WORK_METHOD), current revision, each ≥ Status B (`APPROVED_A` or `APPROVED_WITH_COMMENTS_B`). field-qc's RFI form must let the contractor pick the QA BOQ item.
6. **Single identity — field-qa is the identity provider.** One email+password for both apps. field-qc delegates login to field-qa and auto-provisions a thin local user row.
7. **Field inspectors are different people from QA reviewers** (user-confirmed). field-qa's `User` gains a **nullable QC-access field**, independent of the QA `role`.
   **REVISED 2026-07-14:** QC access is no longer a flat role — it is the pair **institution + `qc_function`**:
   - **Institution** comes from the user's existing QA `Institution` (OWNER / CONSULTANT / VENDOR) — no new field needed.
   - **`qc_function`** is a nullable enum on the QA user: `MAKER | CHECKER | APPROVER | ADMIN`. `null` → field-qc login rejected ("no QC access").
   - Valid combinations and what they do in field-qc:
     | Institution | Function | Does |
     |---|---|---|
     | VENDOR | MAKER | Creates RFIs |
     | VENDOR | APPROVER | Report signature 1 |
     | CONSULTANT | CHECKER | Reviews RFIs, submits inspection reports, handles report revisions (replaces the old FIELD_INSPECTOR concept) |
     | CONSULTANT | APPROVER | Report signature 2 |
     | OWNER | CHECKER | Optional report verification before Owner Approver |
     | OWNER | APPROVER | Final signature; triggers BOQ write-back |
     | any | ADMIN | Full access |
   - QC's local `Role` enum (SUB_KONTRAKTOR / FIELD_INSPECTOR / SITE_MANAGER) is retired at B4.
   - **Migration note:** the `QcRole` enum already implemented in field-qa's schema uses the old vocabulary and must be migrated to `qc_function` (old→new: SUB_KONTRAKTOR→MAKER, FIELD_INSPECTOR→CHECKER, SITE_MANAGER→APPROVER, ADMIN→ADMIN).
8. **Seamless app switching (Level 2):** each app's UI gets an "Open in Field QA/QC" button carrying a **short-lived (≤60s), single-use exchange token**; the receiving app validates it against field-qa and silently creates its own session. No shared cookies.
9. **Fail-closed everywhere:** if field-qa is unreachable, field-qc RFI submission and logins are rejected with a clear message — never silently allowed. Existing QC sessions keep working until expiry (delegation happens at login, not per request).
10. Service-to-service calls authenticated by **API key in env vars** (not user JWTs). Never committed; `.env.example` updated in both repos.
11. **QC three-institution workflow (added 2026-07-14, user-confirmed).** Vendor Maker submits the RFI **directly** to the Consultant Checker — no vendor-internal endorsement step. Checker approval = agreeing the inspection date (the existing approve-auto-schedules behavior stays). The fieldwork itself happens outside the system by the joint site team; afterwards the **Consultant Checker** reports the results (completed checklist items, photos, GPS) into the app.
12. **Report approval is strictly sequential:** Vendor Approver → Consultant Approver → (Owner Checker, optional) → Owner Approver. **Every step has a comment field** (recorded with decision, actor, timestamp); each approval is stamped onto the report PDF (reuse field-qa's QR comment-sheet stamp pattern).
13. **Owner Checker step is optional.** If used, it always precedes the Owner Approver. Whether it is toggled per project or per report is an open item (see §7) — default assumption: per report, an Owner Checker may claim the report when it reaches the Owner stage.
14. **Only PASS reports circulate.** A FAIL inspection skips circulation entirely and goes straight to the NCR flow (auto-NCR citing failed items, as already implemented).
15. **Rejection at any approval step returns the report to the Consultant Checker**, who issues a **new report revision**; the approval chain restarts from the Vendor Approver. Comments from every step of every revision are preserved and visible.
16. **BOQ write-back:** when the Owner Approver signs, field-qc calls one narrow **write** endpoint on field-qa (`POST /api/integration/boq-items/:id/inspection-result`, API-key auth, **idempotent by report id**) marking the BOQ item "inspection done" with report number, date, result, and PDF reference. This is the sole exception to A2's read-only rule. Unlike the fail-closed RFI gate, the write-back may be queued and retried if field-qa is temporarily unreachable — the approval itself is already final.

### QC workflow state machine (per decisions 11–16)

```
RFI:        Vendor Maker creates ── PENDING ──> Consultant Checker
                                       ├─ REJECTED (+comment, notify maker)
                                       └─ APPROVED ⇒ auto-schedule Inspection

Inspection: SCHEDULED ──(fieldwork offline)──> Consultant Checker reports
                                       ├─ FAIL ⇒ NCR flow only (no circulation)
                                       └─ PASS ⇒ InspectionReport rev N created

Report:     PENDING_VENDOR_APPROVAL ──> PENDING_CONSULTANT_APPROVAL
              ──> [PENDING_OWNER_CHECK]? ──> PENDING_OWNER_APPROVAL ──> APPROVED
            any step: REJECT (+mandatory comment) ⇒ back to Consultant Checker
              ⇒ rev N+1 ⇒ chain restarts at Vendor Approver
            APPROVED ⇒ BOQ write-back to field-qa (decision 16)
```

QC data-model sketch: new `InspectionReport` (inspectionId, revisionNo, status, pdfUrl) + `ReportApproval` rows (reportId, step, actorId, decision, comment, decidedAt). `Inspection.status` vocabulary gains a terminal `REPORTED` in place of today's `SUBMITTED` being the end of the road.

---

## 5. Implementation Phases

| Phase | Repo | Deliverable |
|---|---|---|
| **A1** | field-qa | `ItpItem` model + migration + manual-entry UI. Fields: `document_id`, `seq_no`, `activity`, `acceptance_criteria`, `reference_standard`, `verifying_document`, `inspection_level` (H/W/INSPECT/N), `phase` (SHOP/FIELD/COMMISSIONING), `category` (maps to QC's SIPIL/ELEKTRIKAL/MEKANIKAL/INSTRUMEN_KONTROL). Editable by Reviewer/Checker while review active; **locked once final status issued** (copy the `CommentSheetItem` pattern — service + UI + lock rules). |
| **A2** | field-qa | Integration API (API-key auth, read-only): `GET /api/integration/projects` (with BOQ tree) · `GET /api/integration/boq-items/:id/qc-readiness` (per-section current-revision status + computed `ready`) · `GET /api/integration/documents/:id` (metadata + `ItpItem[]`). |
| **A3** | field-qa | Identity provider: `qc_role` column + admin-UI dropdown; `POST /api/integration/auth/verify` (email+password → user info + qc_role); exchange-token issue/redeem endpoints for app switching. |
| **B1** | field-qc | Project linkage: `qaProjectId` on `Project`, `qaBoqItemId` + `qaDocumentId` + `revisionNo` on `RfiRequest`/`Inspection` (nullable string refs — no cross-DB FK). Projects created by picking from QA projects API. |
| **B2** | field-qc | `QaIntegrationModule` in NestJS: typed HTTP client for A2/A3 endpoints, API key from env, fail-closed error handling. |
| **B3** | field-qc | RFI gate: on submission call `qc-readiness`; reject with structured per-section status list if not ready; store FIELD_ITP doc id + revision on acceptance. |
| **B4** | field-qc | Delegated login + auto-provisioning from `qc_role`; app-switch buttons both directions using exchange tokens. Retire QC-local passwords/registration. |
| **B5** | field-qc | Dynamic checklist from QA `ItpItem[]` (static templates only as fallback for non-QA-linked demo data, marked in UI). NCR + inspection PDF cite doc number, revision, violated `reference_standard` + `acceptance_criteria`. PDF header: "Executed against {doc_number} Rev {rev} (Status A/B)". |
| **A4** | field-qa | BOQ write-back endpoint `POST /api/integration/boq-items/:id/inspection-result` (API-key auth, idempotent by report id) + "Inspected" badge/fields on the BOQ item UI showing report number/date/PDF link. |
| **B6** | field-qc | Three-institution workflow: consume institution + `qc_function` from A3 (revised); `InspectionReport` + `ReportApproval` models; sequential approval state machine with mandatory comments and optional Owner Checker step; per-step PDF stamping (QR pattern); revision cycle on rejection. |
| **B7** | field-qc | BOQ write-back on final approval, with retry queue; notifications to all parties at each approval step and on final approval/rejection. |
| **C** | both | Hardening: supersession flagging (new revision approved after scheduling), QA-response caching in QC, optional QA→QC webhook on approval ("you may now submit RFI"). |

**Build order:** A1 → A2 → A3 → B1–B3 → B4 → B5 → B6 → A4 → B7 → C. Each phase independently deployable (A-phases can ship with QC not yet consuming them). Note: A3/B4 must apply the revised decision-7 role model (`qc_function`), including migrating the already-implemented `QcRole` enum.

---

## 6. Success Criteria

### End-to-end acceptance walkthrough (the definition of done)
0. One account registered in field-qa works in both apps; app-switch button lands the user in the other app already authenticated with correctly mapped role.
1. Vendor uploads FIELD_ITP + PROCEDURE + WORK_METHOD for one BOQ item in field-qa.
2. RFI attempt in field-qc → **rejected**, message names exactly which documents are missing/below Status B.
3. Documents pass Reviewer→Checker→Approver; FIELD_ITP gets Status B; ~5 ITP items entered with criteria/standard refs/H-W-INSPECT levels.
4. Same RFI resubmitted → **accepted**, stores FIELD_ITP document id + revision.
5. Inspector's checklist shows exactly those items (seq order, inspection-level badges) — not the static template.
6. One item failed → NCR cites that item's `reference_standard` + `acceptance_criteria` verbatim.
7. Report PDF shows "Executed against {doc_number} Rev {rev} (Status B)".
8. PASS report enters circulation: Vendor Approver approves with comment → Consultant Approver approves → Owner Approver approves (Owner Checker skipped) → report `APPROVED`; PDF carries all three stamps + comments.
9. A rejection at the Owner step (with comment) returns the report to the Consultant Checker; revision 2 restarts at the Vendor Approver; comments from revision 1 remain visible.
10. On final approval, the QA BOQ item shows "Inspection done — report {no}, {date}" with a link to the PDF.
11. A FAIL inspection produces an NCR and never enters circulation.

### Per-phase criteria
- **A1:** migration clean against a copy of real data; items editable only while `final_status` is null (403 + read-only UI after, with tests); items pinned to `document_id` so a new revision starts empty while old revision's items stay queryable; test parity with `CommentSheetItem`.
- **A2:** 401 without API key (tested); `qc-readiness` false for every negative case — missing section, Status C, DRAFT/IN_REVIEW, superseded revision (each a test); true **only** when all 3 current revisions ≥ B; endpoints strictly read-only; zero regression on user-facing routes.
- **A3/B4 (identity):** one registration → both apps; password change/suspension in QA applies to QC login immediately (both tested); `qc_role=null` → QC login refused with explicit message; QC-only user completes full inspection flow without ever opening QA's UI; `qc_role` change effective on next login; exchange token single-use + ≤60s expiry, replay → 401 (tested); QA's own login behavior unchanged.
- **B1–B3:** cannot link to nonexistent QA project; unready RFI fails with structured per-section error (e2e test, mocked QA client); RFI stores doc id + revision, visible in UI; **QA unreachable ⇒ RFI rejected fail-closed** ("cannot verify document status").
- **B4–B5:** QA-linked checklist = exactly the QA items in `seq_no` order; static templates unreachable for QA-linked inspections; NCR + PDF snapshot-tested for doc/rev/standard citations; `itemResults` store QA `ItpItem.id` for traceability across later edits.
- **A4:** endpoint rejects without API key; idempotent — same report id posted twice ⇒ one BOQ update (tested); BOQ UI shows inspected state; no other write surface added to the integration API.
- **B6:** only the correct institution+function can act at each step (e.g. Owner Approver cannot sign before Consultant Approver — 403, tested); comment mandatory on rejection; rejection at any step produces a new revision starting at Vendor Approver; FAIL inspections cannot create an `InspectionReport`; PDF snapshot shows per-step stamps.
- **B7:** write-back fires exactly once per approved report; QA unreachable ⇒ queued and retried, approval state unaffected; every approval-step transition emits a notification to the next actor.
- **Non-functional:** field-qa's existing test suite is the regression gate (zero workflow behavior change); both apps build/lint/test green; API key only in env; each phase independently deployable.

### Explicitly OUT of scope (not failure if absent)
- Excel/PDF parsing of ITP files (Iteration 2).
- QA→QC webhooks (Phase C optional).
- Full SSO server / OAuth infrastructure (exchange-token handoff is the chosen mechanism).
- Migrating existing field-qc demo data to QA-linked form.

---

## 7. Open Items / Watch-outs

- Both backends default to port 3001 — dev setup needs distinct ports when running side by side (QA prod already uses 3001 on the VPS).
- Role vocabulary mapping is settled via `qc_role`, but the QA-side default `role` for QC-only users (proposed: VIEWER) should be confirmed at A3 implementation time.
- `category` on `ItpItem` must map cleanly to QC's `InspectionCategory` enum — keep the enum values identical to avoid a translation layer.
- field-qc's WhatsApp notifications are stubbed; integration notifications (e.g. "documents approved, RFI now possible") land in the same stub until Phase C.
- **Owner Checker toggle (decision 13):** confirm at B6 whether the optional Owner Checker step is configured per project or claimed per report. Default assumption: per report.
- **`QcRole` migration:** field-qa already shipped the old `QcRole` enum; A3 rework must migrate values to `qc_function` (mapping in decision 7) before B4/B6 land.
- Can the Vendor Approver reject their own side's report? Assumed yes (any step can reject with comment); confirm at B6.
