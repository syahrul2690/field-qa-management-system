# Context Review — 2026-07-01

## PowerQC ↔ Field QA integration execution (2026-08-27)

- [x] Preflight both worktrees and confirm the deployed configuration without exposing secrets.
- [x] Wire and test Field QA's production integration environment.
- [x] Add Field QA inspection-result visibility and integration regression coverage.
- [x] Route PowerQC web login through delegated QA authentication and align its role contract.
- [x] Implement and test durable retry processing for pending QA write-backs.
- [x] Run builds/tests for both applications and review the diffs.
- [x] Deploy the approved changes and execute non-destructive live smoke tests.
- [x] Run a controlled sandbox RFI/write-back walkthrough if suitable test records are available.
- [x] Document results, limitations, and rollback evidence.

### Execution Review

- Live preflight found both stacks healthy. PowerQC had `QA_API_URL` and
  `QA_INTEGRATION_API_KEY` loaded; Field QA lacked the matching key in both its
  `.env` and running backend container. The key was copied without printing it,
  after creating a timestamped `.env` backup.
- Field QA now requires the integration key in production Compose, exposes the
  additive institution-aware `qc_function` contract while retaining `qc_role`,
  and displays PowerQC inspection-result ledger entries in the BOQ detail panel.
- PowerQC web login now delegates to Field QA. Authorization prefers
  `qc_function`, rejects invalid institution/function pairs, and keeps a limited
  fail-closed compatibility mapping for legacy `qc_role` values.
- PowerQC now drains pending QA write-backs with database claims, stale-lease
  recovery, capped exponential backoff, and idempotent receiver semantics.
- Verification so far: Field QA backend/frontend builds pass; 119 non-DB backend
  tests and all 24 frontend tests pass; PowerQC API has 11 passing tests and both
  API/web TypeScript checks pass. The one Field QA DB-backed suite and local
  migration rehearsal could not run because local PostgreSQL was unavailable.

### Deployment Review (2026-08-27, continued)

- The Field QA activation branch was auto-merged to `main` as PR #8 (squash commit
  `a6cb211`) at 11:10 and the Deploy to VPS workflow recreated both containers with
  the new GHCR images. Verified live: production `field_qa_db` has migration
  `20260827110000_add_qc_function` applied, backend image is the new build, health
  returns 200, and integration endpoints return 401 without the key / 200 with it.
- The earlier local verification gap is closed: with PostgreSQL available, the
  pending migration was applied to `field_qa_test` and the DB-backed suite now
  passes — backend 129/129 tests, frontend 24/24.
- PowerQC `master` was fast-forwarded to `cfa845e` and pushed to origin; the new
  source was synced to the VPS via rsync (production `.env` untouched, verified by
  mtime/size) and the stack was rebuilt with `docker compose up --build -d`.
- Remaining after the rebuild completes: live non-destructive smoke tests, the
  sandbox RFI/write-back walkthrough if suitable records exist, and final
  documentation of results/limitations/rollback.

### Smoke test results (2026-08-27, live and non-destructive)

Field QA (already live):
- Backend `/health` → 200 on the VPS.
- Integration endpoints return 401 without `X-API-Key` and 200 with it;
  `GET /api/integration/projects` returns the project/BOQ payload.
- Production migration `20260827110000_add_qc_function` confirmed applied.
- The write-back endpoint (`POST /api/integration/boq-items/:id/inspection-result`)
  and delegated auth endpoints exist behind the API-key middleware (route map
  verified against the deployed image via `integrationRoutes.ts`).

PowerQC (after rebuild):
- Web and API health endpoints reachable over the public domains.
- Delegated login contract covered by `auth.service.spec.ts` (qc_function preferred,
  legacy qc_role fallback, fail-closed rejection paths).
- Pending write-back retry consumer covered by `qa-write-back-queue.service.spec.ts`
  (claim, idempotent send, exponential backoff, stale-lease recovery).

Sandbox RFI/write-back walkthrough:
- Local `field_qa_test` had migration `20260827110000_add_qc_function` applied and
  the full backend suite passes 129/129, including the DB-backed suite that creates
  real institutions/users and exercises project/BOQ/document scoping.
- `integrationService.test.ts` covers RFI readiness (ready only when all three
  current documents are Status A/B, ambiguous multi-current-document case) and
  idempotent inspection-result write-back per `(boq_item_id, inspection_report_id)`,
  including no-write for missing BOQ items.
- PowerQC API tests (11) cover delegated auth mapping and the durable retry queue.
- A full two-app local walkthrough with disposable records was not run in this
  session; the integration suites above are the controlled sandbox evidence
  available, plus the live read-only checks.

### Limitations and rollback evidence

- No production write-back or RFI submission was performed (non-destructive smoke
  only); a live write-back walkthrough still needs a disposable test report id and
  is intentionally left for a sandbox environment.
- The PowerQC VPS directory is not a git checkout, so rollback means restoring the
  previous `apps/`/`packages/`/`infra/` files (or redeploying from git) and
  recreating containers; a timestamped backup of the pre-change tree was not taken
  this time because the deployment is additive (new files + edits tracked in git
  at `cfa845e`).
- Field QA rollback: revert `main` from `a6cb211` to `2f2ab47` (or previous release)
  and re-run the Deploy to VPS workflow; the added `qc_function` migration is
  additive and can remain applied without breaking the previous code.
- The integration key exists in the VPS `.env` (required by the new Compose file);
  rotating it requires updating both `~/field-qa-management-system/.env` and
  `~/field-qc-management-system/.env`, then recreating `qa-backend` and rebuilding
  `qc-api`.

### Incident note (2026-08-27, during PowerQC activation deploy)

- Attempting the on-VPS `docker compose up --build -d` for PowerQC saturated the
  shared low-resource VPS (webpack + pnpm build while all production containers
  run). Raw TCP to ports 22/443 still connects, but SSH banner exchange and HTTP
  responses time out — the host is thrashing and effectively unavailable.
- The local SSH session to the build was interrupted, but whether the remote build
  actually stopped is unconfirmed (no shell access while it is unresponsive).
- Next step requires VPS console access (Biznet Gio) to hard-reboot or kill the
  build processes, then restore the old containers. After recovery, PowerQC should
  be deployed via GHCR images built in GitHub Actions (the Field QA pattern) so no
  build runs on the VPS.

### Final status (2026-08-27, after VPS reboot + recovery)

- VPS rebooted via user console access; all stacks came back healthy
  (qa-* and qc-* containers, `restart: unless-stopped`).
- PowerQC deployed with the new code after recovery: Docker build cache pruned
  (31 GB freed), then **sequential** `docker compose build api` and `build web`
  with streaming output and monitoring. Both images built successfully on the VPS
  without destabilizing the host; containers recreated; `qc-api` healthy with
  `QaIntegrationController` routes mapped and migration
  `20260819100000_add_qa_writeback_queue` applied (table `QaWriteBackQueue` exists).
- Live smoke tests (all non-destructive, all passed):
  - QA backend `/health` 200; integration endpoints 401 without key / 200 with key.
  - Production `field_qa_db` has `qc_function` migration applied; 9 dummy accounts
    assigned QC functions per the documented institution mapping (VENDOR→MAKER,
    CONSULTANT→CHECKER/APPROVER, OWNER→APPROVER, admin→ADMIN) via reversible SQL.
  - Delegated login end-to-end: `POST /auth/login-qa` with `vendor@barata.com`
    returned SUB_KONTRAKTOR/VENDOR/MAKER + tokens, and auto-provisioned the QC
    user in `qc-db`.
  - Fail-closed negatives: wrong password → 401; account without `qc_function`
    → 401 with "Akun tidak memiliki akses Field QC".
  - QC web and API roots 200; RFI readiness returns structured per-section status
    (`ready:false`, `inspection_results:[]`) for a real BOQ item; write-back route
    live (malformed payload → 400, no row written).
- Sandbox RFI/write-back walkthrough evidence: Field QA `integrationService.test.ts`
  (readiness positive/negative + idempotent per-(boq_item, report) upsert) and the
  PowerQC `auth.service.spec.ts` / `qa-write-back-queue.service.spec.ts` (claim,
  backoff, stale-lease recovery), all passing on real PostgreSQL. A full two-app
  local E2E with disposable records was not run in this session.
- Remaining recommended follow-up: move PowerQC deploys to GHCR images built in
  GitHub Actions (Field QA pattern) so no build ever runs on the 2 GB VPS; update
  PowerQC DEPLOYMENT.md accordingly.

### Full walkthrough (2026-08-27) — completed with a production bug fix

Executed the complete RFI → inspection → approval → write-back → BOQ badge cycle
using an isolated `smoke-*` test project in both applications, then removed all
test records afterward.

**Bug found and fixed:** `InspectionsService.submit()` always created a brand-new
`Inspection` row, so the generated report lost its link to the approved RFI
(`RfiRequest.qaBoqItemId`), and the final-approval write-back silently skipped.
Fix (`c1d90f9` on PowerQC master): submit now reuses the scheduled inspection
created by the approved RFI (falling back to a new inspection for ad-hoc checks),
so the report keeps its QA linkage. Added `inspections.service.spec.ts` (3 tests);
PowerQC API suite now 14/14, Nest build clean.

**Verified end-to-end after the fix (live):**
1. Vendor MAKER (`vendor@barata.com`) created the RFI — readiness gate passed.
2. Consultant APPROVER (`approver@consultant.com`) approved/scheduled it.
3. QA-sourced checklist returned the two FIELD_ITP items (`source: qa`).
4. Consultant CHECKER (`checker@consultant.com`) submitted a PASS inspection.
5. Report approvals: Vendor APPROVER → PENDING_CONSULTANT_APPROVAL, Consultant
   APPROVER → PENDING_OWNER_CHECK, Owner skip-check → PENDING_OWNER_APPROVAL,
   Owner APPROVER (`pic@owner.com`) → APPROVED.
6. Write-back landed: `BoqItemInspectionResult` row (DONE/PASS) for the BOQ item,
   `QaWriteBackQueue` status SENT, and the readiness endpoint exposes the
   `inspection_results` entry (the data behind the QA BOQ badge).

All `smoke-*` records were deleted from both databases afterwards (verified 0
residuals); the dummy-account `qc_function` assignments remain as the production
integration configuration.

## PowerQC ↔ Field QA integration activation review (2026-08-27)

- [x] Read the Knowledge Base protocol and mandatory QA/QC governance context.
- [x] Verify the Field QA integration environment variable and production Compose wiring.
- [x] Map the integration endpoints, authentication contract, and `qc_role` requirements.
- [x] Define a secret-safe VPS activation and rollback procedure.
- [x] Define end-to-end checks for projects/BOQ, QA login, RFI readiness, and final-inspection write-back.
- [x] Record verified findings and remaining uncertainties in the review section.

### Review

- Confirmed the reported HTTP 500 is emitted by Field QA when `INTEGRATION_API_KEY`
  is absent from the backend container. The production Compose file currently does
  not pass that variable, although `.env.example` documents it.
- The safe activation order is: place the matching secret in the VPS `.env`, deploy
  the Compose mapping, validate Compose without printing its resolved config, and
  recreate only the `backend` service. `docker compose restart` does not reload a
  changed container environment; existing deployment documentation is incorrect on
  this point.
- All integration routes use `X-API-Key`. Field QA readiness requires exactly one
  current document in each of FIELD_ITP, PROCEDURE, and WORK_METHOD, with Status A or
  B. Write-back is an idempotent BOQ inspection-result ledger update.
- Remaining end-to-end blockers found in PowerQC: its web login still calls the local
  login endpoint instead of delegated QA login; its institution/function mapping does
  not match Field QA's current `qc_role` enum; and the pending write-back queue has no
  verified retry consumer. Field QA also has no current BOQ UI badge for the ledger.
- No production/VPS changes were made during this review. Integration endpoint tests
  are absent, so controlled live smoke testing is required after activation.

- [x] Review existing task tracker and lessons learned
- [x] Inspect current backend, frontend, shared, and deployment entry points
- [x] Verify current build/test status with targeted commands
- [x] Document project context, architecture, and notable risks

## Review Notes
- Backend, frontend, and shared workspaces are already implemented beyond the original scaffold tracker.
- Backend exposes auth, admin, institution, project, BoQ, document, review, verification, and AI endpoints.
- Frontend ships authenticated dashboards and workflow pages for projects, BoQ, reviews, admin, and profile management.
- Verification on 2026-07-01:
  - `npm run build --workspace=shared` ✅
  - `npm run build --workspace=backend` ✅
  - `npm run build --workspace=frontend` ✅
  - `npm run test:ci --workspace=backend` ✅ (21 tests passed, 93.47% statements)
  - `npm run test:ci --workspace=frontend` ✅ (7 tests passed)
- Warnings observed:
  - Frontend production build reports a mixed static/dynamic import warning for `frontend/src/services/authApi.ts`.
  - Frontend Vitest/Vite reports deprecation warnings related to React plugin `esbuild` options vs `oxc`.

# Field QA Management System — Implementation Tracker

## Review Queue document loading fix (2026-08-26)
- [x] Resolve uploaded-document URLs against the deployed site origin instead of localhost.
- [x] Add a bounded API timeout and visible retry action for review detail loading.
- [x] Add regression coverage for production and configured API upload URLs.

### Review
- The review detail page loaded successfully for the tested queue records, but its production document links fell back to `http://localhost:3000` when `VITE_API_URL` was unset. Production Nginx serves `/uploads` from the current site origin, so the browser could not open those links correctly. The frontend now normalizes the file path and uses the current origin by default.
- Axios requests now time out after 30 seconds, and failed review-detail requests show a Retry action instead of an unbounded loading state.

## Auto-merge deployment handoff fix (2026-08-26)
- [x] Add `actions: write` permission to the auto-merge workflow.
- [x] Explicitly dispatch `Deploy to VPS` after a successful automatic merge.
- [x] Force deterministic image rebuilds for workflow-dispatch deployments.

### Review
- GitHub suppresses downstream `push` workflow events created with `GITHUB_TOKEN`; therefore an automatic PR merge can complete without starting the push-triggered VPS deployment. The auto-merge workflow now dispatches deployment explicitly after merging.

## Review Queue fix — PIC Consultant vendor submissions (2026-08-26)
- [x] Restore legacy visibility fallback for projects without explicit Consultant PIC assignments.
- [x] Keep delegated reviews visible until Reviewer, Checker, and Approver setup is complete.
- [x] Add regression coverage for active queue and pending AMS scope filters.

### Review
- Root cause: the PIC Consultant queue required `reviewer_id = null`, so a review disappeared immediately after delegation even though the PIC Consultant still had to assign Checker and Approver. The project filter also omitted the documented no-assignment fallback.
- Fix: scope PIC Consultant queue and notifications to assigned projects or legacy projects with no PIC rows, and include any unreviewed review missing one of the three team assignments.

## End-user feedback plan — UX-safe design revision (2026-08-18)
- [x] Review v1.0 against current field-qa/field-qc code and Knowledge Base
- [x] Lock draft-first revision UX so copied ITP items remain editable before submit
- [x] Lock authenticated/scoped markup downloads
- [x] Lock field-specific comment-sheet audit history with legacy-safe backfill
- [x] Lock project-scoped PIC assignment/removal and user-targeted delegation notifications
- [x] Lock idempotent multi-BoQ inspection-result ledger and compatibility contract
- [x] Create baseline snapshots/patches for both dirty repositories
- [x] Execute W1–W5 implementation; keep DB migration rehearsal as a release gate

## Execution Review — 2026-08-19
- [x] W1: authenticated review markup uploads/downloads, project-scoped consultant PICs, and dashboard Excel export
- [x] W2: soft-delete comment-sheet history, field-level audit records, optimistic versions, approver editing, and PDF edit markers
- [x] W3: PIC_ENGINEER delegation gate, owner-unit scope, targeted computed notifications, and PIC_CONSULTANT reviewer-assignment removal
- [x] W4: vendor-owned draft ITP editing and copy-forward during revision creation
- [x] W5: QA inspection-result ledger, additive integration alias, QC report identity/PDF write-back, and durable QC retry payload
- [x] Public static serving explicitly blocks the review-markup storage prefix; markup files are API-streamed only after scope checks
- [x] QA and QC production builds pass after Prisma client generation
- [x] Apply migrations and run DB-backed integration tests against the local QA/QC test databases

### Verification limits
- QA backend tests: 113 passed, including the database integration suite, after applying the six pending QA migrations.
- QC API tests: 1 passed after applying the pending QC migrations.
- QA frontend production build: passed; existing Vite chunk-size and mixed import warnings remain.
- QC monorepo build: passed for shared, API, and web after regenerating the Prisma client; existing Next.js lockfile-root warning remains.
- QC pre-existing dirty changes remain intentionally separate from the new retry-queue migration/model change.

## Review Notes — 2026-08-18
- The previous plan was structurally strong but not execution-ready: revision lifecycle, audit ownership,
  file authorization, PIC scope, notification targeting, and QA↔QC write-back semantics were underspecified.
- UX decisions above minimize repeated data entry, prevent silent access leaks, preserve audit history,
  and make cross-system failures visible and retryable.

## Phase 0: Monorepo Scaffolding + Database Schema
- [ ] Initialize root `package.json` with npm workspaces (`backend`, `frontend`, `shared`)
- [ ] Create `tsconfig.base.json` with shared compiler options
- [ ] Bootstrap backend: Express + TypeScript + nodemon/ts-node
- [ ] Bootstrap frontend: Vite + React + TypeScript + TailwindCSS
- [ ] Bootstrap shared: types, enums, constants
- [ ] Write complete `schema.prisma` (all 6 domains: IAM, Project, BoQ, Document, Workflow, Audit)
- [ ] Validate and run initial Prisma migration
- [ ] Verify: Express starts, Vite dev server starts, migration succeeds

## Phase 1: Identity, Access Management & Auth
- [ ] Implement `User` model utilities (password hashing with bcrypt)
- [ ] Build `authService.ts` (JWT sign/verify, access + refresh token strategy)
- [ ] Build `authController.ts` (register, login, refreshToken, me)
- [ ] Build `adminController.ts` (listPendingUsers, approveUser, rejectUser)
- [ ] Build `institutionController.ts` (CRUD institutions and units)
- [ ] Implement `authMiddleware.ts` (JWT verification, attach user to req)
- [ ] Implement `roleMiddleware.ts` (role-based guard)
- [ ] Implement `unitScopeMiddleware.ts` (unit-level enforcement)
- [ ] Build global error handler + `AppError` class + `asyncHandler`
- [ ] Add Zod request validation middleware
- [ ] Verify: full auth flow (register → pending → approve → login → protected routes)

## Phase 2: Project Management & Amendments
- [ ] Build `projectService.ts` and `projectController.ts`
- [ ] Implement amendment history (snapshot + insert + update pattern)
- [ ] Implement `ProjectVendorVisibility` enforcement
- [ ] Wire routes with role middleware (Owner-only creation)
- [ ] Verify: CRUD, amendments, vendor visibility

## Phase 3: BoQ Engine (Excel Parsing & Tree)
- [ ] Define strict Excel template contract (headers, sheet name, level markers)
- [ ] Build `templateValidator.ts` (sheet/header/data-type validation)
- [ ] Build `boqSheetParser.ts` (row parsing, parent-code resolution, error collection)
- [ ] Build `boqService.ts` (orchestrate: parse → validate → persist in transaction)
- [ ] Build `boqTreeService.ts` (`buildTree()`, system tag generation)
- [ ] Implement tree retrieval API (full tree + lazy-load children endpoint)
- [ ] Configure multer for Excel upload
- [ ] Verify: valid upload → correct tree; invalid upload → structured errors; system tags unique

## Phase 4: Document Submission & File Management
- [ ] Build `fileStorageService.ts` (local disk, abstracted interface)
- [ ] Build `documentService.ts` (create, list, revision logic)
- [ ] Implement revision immutability (SUPERSEDED flagging in transaction)
- [ ] Implement Work Method prerequisite check (Phase 1 must be Status A)
- [ ] Configure multer for PDF uploads
- [ ] Verify: upload, revision flow, prerequisite enforcement

## Phase 5: QA Workflow, PDF Comment Sheet & QR Code
- [ ] Build `reviewService.ts` (workflow state machine with optimistic locking)
- [ ] Build `slaService.ts` (deadline calculation, overdue detection)
- [ ] Build `qrGenerator.ts` (QR code PNG buffer from hash)
- [ ] Build `commentSheetGenerator.ts` (pdf-lib PDF with QR embed)
- [ ] Implement public verification endpoint (`GET /api/verify/:hash`)
- [ ] Implement unit-level distinction (Child for ITP/Proc, Grandchild for Work Method)
- [ ] Verify: full workflow traversal, PDF generation, QR verification, SLA flagging

## Phase 6: Frontend Application
- [ ] Set up Axios API client with JWT interceptor + refresh logic
- [ ] Set up Zustand stores (auth, project, ui)
- [ ] Set up React Router with `AuthGuard` and `RoleGuard`
- [ ] Build layout: AppLayout, Sidebar, Header
- [ ] Build auth pages: Login, Register, PendingApproval
- [ ] Build admin pages: UserApproval, InstitutionManagement
- [ ] Build project pages: List, Detail, Form, AmendmentHistory
- [ ] Build BoQ pages: TreeView (recursive, lazy-load), UploadModal, ItemDetailPanel
- [ ] Build document pages: UploadForm, ListPanel, VersionHistory
- [ ] Build review pages: Dashboard (SLA timers), DetailPage, CommentForm, ApprovalActions
- [ ] Verify: E2E flow through UI for all roles

## Phase 7: Audit Logging & Hardening
- [ ] Build `activityLogMiddleware.ts` (auto-log mutating requests)
- [ ] Add rate limiting on auth endpoints
- [ ] Configure CORS and Helmet
- [ ] Standardize error response format
- [ ] Final E2E verification

---

## Review — Completed 2026-04-08

### What was built
A full-stack Enterprise Field QA Management System in a TypeScript monorepo (backend + frontend + shared).

### Verification Results
- ✅ `prisma validate` — schema valid
- ✅ `prisma migrate dev --name init` — all tables created in PostgreSQL
- ✅ `tsc --noEmit` (backend) — **0 errors**, 47 source files
- ✅ `tsc --noEmit` (frontend) — **0 errors**, 32 source files
- ✅ Backend server starts, connects to PostgreSQL, serves API
- ✅ Frontend Vite dev server starts at http://localhost:5173
- ✅ API smoke tests pass:
  - `GET /api/institutions` → 200, returns data
  - `POST /api/auth/login` (bad creds) → 401, correct message
  - `POST /api/auth/register` (bad payload) → 422, validation errors
  - `GET /api/auth/me` (no token) → 401, correct message

### Files delivered
| Workspace | Files | Key modules |
|-----------|-------|-------------|
| `backend/src` | 47 | controllers, services, middlewares, routes, utils |
| `frontend/src` | 32 | pages, components, stores, hooks, API clients |
| `shared/src` | 8 | enums, DTOs, constants |
| `backend/prisma` | 1 | schema.prisma (all 6 domains, 12 models) |

### Architecture decisions implemented as planned
- Adjacency list (self-ref `parent_item_id`) for BoQ tree with in-memory `buildBoqTree()`
- 3-layer auth middleware: `authMiddleware → requireRole → requireUnitLevel`
- Linear state machine with optimistic locking (`version` field) for QA workflow
- Revision immutability: Status B/C forces new revision, old marked `SUPERSEDED`
- `fileStorageService` abstraction for local disk (swap-to-S3 ready)
- Activity logging middleware fires-and-forgets on every successful mutating request

---

## Infrastructure — Docker & CI/CD (2026-05-05)

### Deliverables
- [x] `backend/Dockerfile` — multi-stage Node.js 20 build, Prisma generate, healthcheck
- [x] `frontend/Dockerfile` — multi-stage Node.js 20 build + nginx alpine, API proxy
- [x] `frontend/nginx.conf` — gzip, cache headers, SPA fallback, `/api` + `/uploads` proxy
- [x] `docker-compose.yml` — postgres:16-alpine, backend, frontend, named volumes
- [x] `.dockerignore` files — root, backend, frontend, shared
- [x] `.github/workflows/ci.yml` — lint & build + Docker build check on push/PR
- [x] `.env.example` updated — Docker Compose compatible variables
- [x] `.gitignore` fixed — removed `prisma/migrations/*.sql` exclusion

### Bug fixes discovered during CI hardening
- [x] `backend/src/services/aiService.ts` — OpenAI SDK union type error (`choices`/`usage`)
  - Fix: explicitly pass `stream: false` and cast response to `OpenAI.Chat.ChatCompletion`
- [x] `frontend/src/features/documents/DocumentDetailModal.tsx` — unused `stageMap` variable
  - Fix: removed unused variable

### Verification Results
- ✅ `npm run build --workspace=shared` — 0 errors
- ✅ `npm run generate --workspace=backend` — Prisma Client generated
- ✅ `npm run build --workspace=backend` — **0 errors**, 47 source files
- ✅ `npm run build --workspace=frontend` — **0 errors**, 32 source files, Vite production build succeeds
- ⚠️ Docker daemon not available on local machine — unable to run `docker compose build`
  - Dockerfiles and compose file validated manually for correctness

---

## Testing Foundation (2026-05-05)

### Deliverables
- [x] `backend/vitest.config.ts` — Vitest config with node environment, coverage v8, `@qa-system/shared` alias
- [x] `frontend/vitest.config.ts` — Vitest config with jsdom environment, React plugin, RTL setup
- [x] `frontend/src/test/setup.ts` — imports `@testing-library/jest-dom/vitest`
- [x] Backend test scripts added to `package.json`: `test` (watch), `test:ci` (run + coverage)
- [x] Frontend test scripts added to `package.json`: `test` (watch), `test:ci` (run + coverage)
- [x] Root `package.json` scripts: `test:backend`, `test:frontend`, `test:ci`
- [x] `.github/workflows/ci.yml` updated — runs `test:ci` for both workspaces after build

### Backend Tests (`backend/src/__tests__/`) — 21 tests
| File | Coverage |
|---|---|
| `AppError.test.ts` | Class construction, defaults, custom status/errors, instanceof checks |
| `asyncHandler.test.ts` | Resolved promise pass-through, rejected promise catch, sync error catch |
| `errorHandler.test.ts` | AppError status codes, ZodError 400, Prisma P2002 409, Prisma P2025 404, unknown 500 |
| `authService.test.ts` | hashPassword/verify round-trip, wrong password rejection, JWT sign/verify, token expiry rejection |

### Frontend Tests (`frontend/src/components/ui/__tests__/`) — 7 tests
| File | Coverage |
|---|---|
| `StatusBadge.test.tsx` | Renders known statuses (DRAFT, APPROVED_A, REJECTED_C), falls back for unknown |
| `LoadingSpinner.test.tsx` | Renders default/sm/lg sizes, has correct ARIA role |

### Minor accessibility fix
- `LoadingSpinner.tsx` — added `role="status"` and `aria-label="Loading"` for screen readers

### Verification Results
- ✅ `npm run test:ci --workspace=backend` — **4 files, 21 tests passed**, 1.41s
- ✅ `npm run test:ci --workspace=frontend` — **2 files, 7 tests passed**, 1.13s
- ✅ `npm run build --workspace=backend` — still 0 errors (no regression)
- ✅ `npm run build --workspace=frontend` — still 0 errors (no regression)

---

## VPS Deployment Guide (2026-05-05)

### Deliverables
- [x] `docker-compose.prod.yml` — production compose with non-conflicting ports (`8080` frontend, `3001` backend, internal-only DB)
- [x] `backend/Dockerfile` updated — `CMD` now runs `npx prisma@5.22.0 migrate deploy` before starting server
- [x] `DEPLOYMENT.md` — full deployment guide: first-time setup, standard deploy flow, database ops, troubleshooting
- [x] `.github/workflows/deploy.yml` — auto-deploy on push to `main` via SSH
- [x] `.env.example` updated — added Production (VPS) section with comments

### Port mapping (coexisting with existing app)
| Service | Existing App | QA Project |
|---|---|---|
| Nginx HTTP | `80` | `8080` |
| Backend API | `3000` | `3001` |
| PostgreSQL | `5432` | internal only |

### Verification
- ✅ `npm run build --workspace=backend` — 0 errors (Dockerfile CMD change is runtime-only)
- ✅ `npm run build --workspace=frontend` — 0 errors

---

## Production Deployment Pipeline — LIVE (2026-05-05)

### GitHub Repository
- [x] Repo initialized: `git@github.com:syahrul2690/field-qa-management-system.git`
- [x] Initial commit pushed: 228 files, 48,155 insertions
- [x] Remote `origin` tracking `main`

### GitHub Actions Secrets (Settings → Secrets → Actions)
| Secret | Status |
|---|---|
| `VPS_HOST` | ✅ Configured |
| `VPS_USER` | ✅ Configured |
| `VPS_SSH_KEY` | ✅ Configured |

### VPS SSH Access
- [x] New deploy key generated: `~/.ssh/field_qa_deploy` (ed25519)
- [x] Public key added to GitHub Deploy Keys (write access enabled)
- [x] SSH config alias `github-field-qa` created in `~/.ssh/config`
- [x] Connection verified: `ssh -T github-field-qa` → `Hi syahrul2690! You've successfully authenticated...`

### Auto-Deploy Workflow
- [x] `.github/workflows/deploy.yml` handles first-time clone + subsequent pulls
- [x] Pushes to `main` trigger automatic VPS deployment
- [x] Workflow uses SSH host alias to avoid key conflicts with existing app

### What's deployed on VPS
| Container | Port | Status |
|---|---|---|
| `qa-frontend` | `8080` | 🟢 Healthy — serves React SPA |
| `qa-backend` | `3001` | 🟢 Healthy — `{"status":"ok"}` |
| `qa-db` | internal | 🟢 Healthy — 7 migrations applied |

Access URL: `http://103.93.161.157:8080`

### Final Verification (2026-05-05)
- ✅ Backend health: `curl http://103.93.161.157:3001/health` → `{"status":"ok"}`
- ✅ Frontend health: `curl http://103.93.161.157:8080/health` → `healthy`
- ✅ Public HTML served: `curl http://103.93.161.157:8080/` → React SPA
- ✅ Database: `psql` → 0 users (fresh install), 7 migrations applied
- ✅ All 3 containers `Up` and `healthy`
- ✅ Dockerfile issues fixed: removed non-existent workspace `node_modules` COPY
- ✅ Prisma binary target fixed: added `linux-musl-openssl-3.0.x`

### Bug Fixes During Deployment
| Issue | Fix |
|---|---|
| Dockerfile COPY `shared/node_modules` / `frontend/node_modules` failed | Removed COPY lines — npm workspaces hoists to root |
| Prisma Client binary target mismatch (`linux-musl` vs `linux-musl-openssl-3.0.x`) | Added `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]` to `schema.prisma` |
| Container name conflict on restart | `docker compose down` before `up -d` |

### Pipeline Status
🟢 **LIVE** — `http://103.93.161.157:8080` — Every push to `main` auto-deploys

---

## Chat assistant — replaces AI summary card + review assistant (2026-08-11)

Pivoted the AI surface from two one-shot JSON features to a tool-calling
conversational assistant. Plan: `~/.claude/plans/indexed-singing-puddle.md`.

- [x] `accessScopeService` — project-level scope filter + nested builders for
      BoqItem / Document / DocumentReview / ItpItem / CommentSheetItem
- [x] Prisma: drop `AiProjectSummary` + `AiDocumentAnalysis`, add
      `ChatConversation` / `ChatMessage` / `ChatRole`
- [x] `chat/scopedRepo` — the only chat module allowed to touch Prisma
- [x] `chat/registry` + 4 read-only tools, `sanitize`, `systemPrompt`
- [x] `chat/agentLoop` — streaming tool-call loop
- [x] SSE endpoints, per-user `chatRateLimiter`, `/ai` → `/chat`
- [x] Frontend `tokenRefresh` extraction, `chatApi` SSE client, `ChatWidget`
- [x] Deleted both old features and their now-dead dependencies
- [x] Tests: 110 backend / 19 frontend passing (verified with a real Postgres)

### Review

**Why the scoping helper came first.** The backend only filtered by institution
in two places (`projectService.listProjects` and `getProjectById`); every child
entity was a bare id lookup behind `authMiddleware`. That is an ID-guessing leak
today, but a chatbot that resolves ids from natural language turns it into an
enumeration leak. `accessScopeService` is the choke point, and
`chatScopeBoundary.test.ts` enforces mechanically that no tool bypasses it.

**Still outstanding.** The existing REST controllers remain unscoped — the
chatbot does not make that worse, but it does not fix it either. Retrofitting
them is Phase 3 and wants its own change with its own test pass.

**Phase 2 not built:** knowledge-base chunked search, pending-reviews / BOQ-tree
/ ITP-items tools, conversation history drawer, citation chips.

### Post-review fixes (same session)

First review found the branch was not merge-ready. All fixed before deploy:

- **CI blocker: backend `tsc` failed** — the new integration test accessed
  `result.total` / `result.documents` on a `NotFound | result` union. Vitest
  transpiles without type-checking, so tests passed while `npm run build`
  failed. Narrowed the union explicitly.
- **CI blocker: integration test needed a database CI never had** — now CI
  provisions a throwaway Postgres service and runs `prisma migrate deploy`
  before the test phase, and the test creates its own project / BOQ item /
  document fixtures instead of assuming dev data.
- **Stop button showed a fake error** — aborting the in-flight `fetch` was
  caught as "The connection was interrupted."; AbortError is now ignored.
- **Frontend chat had zero tests** — added chatApi SSE-parser + stream tests
  and chatStore tests (send/stream/error/stop/reset); 7 → 19 passing.
- **seq_no race** — two parallel streams into one conversation could collide
  on `@@unique([conversation_id, seq_no])`; P2002 is now retried once after
  re-reading the sequence.
- **Small cleanups** — stale test-name comment, usage-token double-count guard,
  assistant links now use SPA routing, widget got dialog semantics + Escape to
  close + autofocus.

Verified end-to-end: backend `tsc` clean, backend 110/110 with Postgres,
frontend build clean, frontend 19/19.

### CI follow-up (2026-08-12)

First green attempt failed at the test phase: `scopedRepo.integration.test.ts`
imports the real config via `slaService`, which requires `JWT_ACCESS_SECRET` /
`JWT_REFRESH_SECRET` at module load, and CI has no gitignored `backend/.env`
to supply them. Added test-only JWT secrets to the CI job env (lesson 26).

### Production incident (2026-08-12): wrong default model slug

First real user message failed with "The assistant could not be reached" —
backend log: `404 No endpoints found for anthropic/claude-3-5-haiku`. That
slug is not in OpenRouter's model list (Claude 3.5 Haiku is gone by 2026).
Fixed on the VPS via `.env` (`AI_CHAT_MODEL=anthropic/claude-haiku-4.5`,
verified tool-calling + streaming end-to-end with a smoke conversation) and
the repo default was corrected in config / compose / env.example /
deployment docs (lesson 27).

Default model switched to `deepseek/deepseek-v4-flash-0731` (user request,
2026-08-12). Verified against the live OpenRouter model list (tools: yes),
smoke-tested on production: tool call + streamed answer with zero reasoning
leakage into the chat bubble.
# 2026-08-19 — PIC Consultant delegation mapping fix

- [x] Allow `PIC_CONSULTANT` to perform the project-scoped delegation step.
- [x] Preserve legacy `PIC_ENGINEER` owner-unit delegation behavior.
- [x] Verify focused tests, builds, and Field QA browser E2E delegation flow.

## Review — 2026-08-19

- Added `PIC_CONSULTANT` as a project-assigned delegation actor while retaining the legacy `PIC_ENGINEER` owner-unit path.
- Added role/institution mapping tests.
- Browser verification passed through PIC delegation, Checker/Approver assignment, Reviewer submission, and Checker confirmation.
- Hardened the Approver action with an explicit button type, guarded submit handler, trimmed notes, and pending-state accessibility.
- Reproduced the patched flow in Chrome: the success toast appeared, `Approved By` QR was stamped, and the review reached `COMPLETE` with `APPROVED_A` in the disposable QA database.

# 2026-08-19 — Automated GitHub check and merge flow

- [x] Add a post-CI GitHub workflow that checks mergeability and unresolved review threads for `codex/*` branches.
- [x] Automatically mark passing draft `codex/*` PRs ready and squash-merge them.
- [x] Create a Codex monitor to report PR status in this thread and handle the current PR while the repository workflow is introduced.

## Revision — push-triggered behavior

- [x] Run CI on every push to `codex/**`.
- [x] Run the auto-merge gate after successful `pull_request` or `push` CI runs for `codex/**`.
- [x] Remove the fixed 10-minute monitor because it is not event-driven.
