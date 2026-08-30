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

## Recent status & fixes (2026-08-27)

- PowerQC ↔ Field QA integration is deployed and verified end-to-end, including a
  full RFI → inspection → approval → write-back walkthrough with isolated records
  (detailed notes and the inspection write-back fix are recorded in commits
  `dd16743`/`0d6b5e8` on `codex/activate-field-qc-integration` and `c1d90f9` on
  PowerQC master). All smoke records were removed from both databases.
- Vendor project list fix (`f55fe91` on `main`): the QA frontend's global React
  Query `staleTime: 5 minutes` was serving a cached `['projects']` list, so a
  newly vendor-assigned project did not appear until a full reload. The projects
  page now uses `staleTime: 0` + `refetchOnMount: 'always'`. Frontend build clean,
  24/24 tests pass.

## PIC Consultant team-assignment authorization fix (2026-08-27)

- [x] Root cause: queue visibility had a legacy fallback (projects without any
      `ProjectConsultantPic` row remain visible to every Consultant PIC), but the
      delegation/team-setup actions used a strict `assertProjectConsultantPic`
      check with no fallback. With zero assignment rows in production, the PIC
      Consultant could see reviews but every assign/delegate call returned 403
      ("You are not assigned as PIC Consultant for this project").
- [x] Fix: added `assertProjectConsultantPicOrLegacy` in `projectService` and used
      it in `delegateReview`, `listDelegationCandidates`, and `assignReviewTeam` —
      an explicit assignment always gates access; projects with no assignment rows
      keep the legacy fallback (any Consultant PIC may act), matching visibility.
- [x] Tests: new `reviewService.consultantPicAuthorization.test.ts` (explicit
      assignment allowed, legacy fallback allowed, other-consultant assignment
      rejected, fallback applied at the delegation gate). Backend 133/133,
      build clean.

### Review
- Explicit per-project PIC assignment (project detail page) remains the correct
  long-term setup; the fallback only preserves pre-existing projects that were
  never assigned.

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

# 2026-08-30 — Move Inspection Item input from Reviewer to Vendor

## Objective

Make the Vendor the only role that can create, edit, and delete Inspection
Items for a Field ITP. The Vendor completes the rows while the current document
is a draft, explicitly submits the document, and all roles see the rows as
read-only after submission. Reviewer and Checker must no longer be able to
overwrite Vendor-owned Inspection Items.

This work corrects a partial implementation: the endpoint is document-scoped
and revisions already copy Inspection Items forward, but the editor and most of
the authorization contract still belong to the review workflow.

## Confirmed current-state gaps

- [x] Confirm the editor exists only in `ReviewDetailPage.tsx` and is editable by
      assigned Reviewer/Checker.
- [x] Confirm the Vendor document modal tells the user to complete ITP rows but
      does not provide an Inspection Item editor.
- [x] Confirm `PUT /documents/:documentId/itp-items` still permits Vendor,
      Reviewer, and Checker.
- [x] Confirm initial uploads are submitted immediately, leaving no Vendor
      editing window for revision 0.
- [x] Confirm new revisions already remain `DRAFT` and copy Inspection Items
      from the preceding revision.
- [x] Confirm the existing backend tests encode the obsolete Reviewer/Checker
      write policy.

## Scope decisions

- Field ITP initial uploads will remain `DRAFT`; the Vendor explicitly submits
  them after completing the Inspection Items. This behavior change is limited
  to `FIELD_ITP` in this work so Procedure and Work Method submission behavior
  is not changed incidentally.
- Only the latest/current `DRAFT` revision is editable. A historical
  `REJECTED_C` revision remains immutable; the Vendor uses the existing revision
  flow, whose new revision is an editable draft with copied rows.
- Vendor ownership is institution-based and document-scoped. An authorized
  Vendor colleague from the owning institution may continue the draft; access
  is not restricted to the individual uploader. Because `Document` currently
  stores only `uploaded_by`, add an immutable `vendor_institution_id` ownership
  snapshot rather than deriving ownership from the uploader's potentially
  changeable current institution.
- Review participants retain read access. Per-item consultant comments are not
  part of this change; reviewers continue using the existing Comment Sheet.
- Submission is not made dependent on a non-zero row count in this change.
  This avoids introducing a new business validation rule without approval.

## Implementation tracking

### 1. Backend domain ownership and authorization

- [x] Move `getItpItems` and `saveItpItems` from `reviewService` to
      `documentService`, and move their controller handlers from the review
      controller to the document controller.
- [x] Keep the resource URLs under `/documents/:documentId/itp-items`.
- [x] Restrict the PUT route middleware to `VENDOR` users from a Vendor
      institution; remove Reviewer and Checker write permission.
- [x] Add `Document.vendor_institution_id`, its Vendor-institution
      relation/index, and a migration that backfills existing Vendor-uploaded
      documents from the uploader's institution. The migration fails safely if
      any legacy row cannot be mapped rather than guessing an institution.
- [x] Set `vendor_institution_id` on every new document and inherit the same
      immutable value on every revision.
- [x] Enforce service-level authorization independently of route middleware:
      the document must exist, be visible to the actor, belong to the actor's
      Vendor institution, be the current revision, have section `FIELD_ITP`,
      and have status `DRAFT`.
- [x] Apply document/project scope to GET so a guessed document ID cannot expose
      Inspection Items outside the actor's authorized projects.
- [ ] Keep this read-hardening scoped to the Inspection Item GET endpoint.
      Retrofitting all existing document list/get/history endpoints is a known,
      separate REST authorization project and is not silently included here.
- [x] Return stable, actionable `403` messages for wrong institution, wrong
      role, non-current revision, and locked status.
- [x] Validate the write payload at the controller boundary: `items` must be an
      array; every retained row must have a trimmed, nonblank activity and valid
      phase/category/responsibility enums. Normalize `seq_no` server-side to
      contiguous `1..N` using submitted array order rather than trusting client
      sequence values.
- [x] Preserve atomic whole-table replacement. Institution colleagues share
      this draft and the existing last-successful-save-wins behavior is accepted
      for this change; optimistic concurrency/versioning is explicitly out of
      scope and should be considered separately if concurrent Vendor editing is
      observed.

### 2. Field ITP draft lifecycle

- [x] Change initial `FIELD_ITP` upload from automatic submission to draft
      creation; do not create a review or start the SLA at upload time.
- [x] Preserve the current automatic submission behavior for `PROCEDURE` and
      `WORK_METHOD` unless a separate workflow change is approved.
- [x] Keep explicit submission as the transition from `DRAFT` into the review
      workflow and the SLA start event.
- [x] Preserve revision copy-forward: the new revision starts as `DRAFT`, copies
      every Inspection Item, and leaves the old revision unchanged.

### 3. Vendor editor and Reviewer read-only view

- [x] Extract the Inspection Item table/editor from `ReviewDetailPage.tsx` into
      a reusable document-owned component.
- [x] Add Inspection Item methods to `documentApi` and remove them from
      `reviewApi`.
- [x] Mount the component in `DocumentDetailModal.tsx` for `FIELD_ITP` documents.
- [x] Enable editing only when the viewer is an authorized Vendor and the
      displayed version is the latest/current `DRAFT`.
- [x] Keep the Inspection Item table in Review Detail as read-only for Reviewer,
      Checker, Approver, PIC, and other already-authorized viewers.
- [x] Remove Reviewer/Checker editing controls and the obsolete “As Reviewer” /
      “As Checker” instructional copy.
- [x] Ensure a draft with no saved rows shows an honest empty/editor state and a
      submitted document with no rows shows an honest read-only empty state.

### 4. “Draft created — what next?” user guidance

- [x] Replace the Field ITP upload success message with:
      **“Field ITP draft created. Next, add and save the Inspection Items, then
      submit the draft for review.”**
- [x] Define the upload-to-editor data flow explicitly: `DocumentUploadForm`
      captures the created document returned by the API and calls an
      `onCreated(document)` callback; `BoqItemDetailPanel` closes the upload
      form, sets `selectedDoc`, and automatically opens `DocumentDetailModal`
      for that exact new draft.
- [x] Treat the automatic opening of Document Details as the primary next
      action, and focus/position the user at the Inspection Item section. Do not
      leave the user to rediscover the draft in the document list.
- [x] In the draft detail view, show a persistent guidance banner with this
      sequence:
      **1. Review uploaded files → 2. Add Inspection Items → 3. Save items →
      4. Submit for Review.**
- [x] Keep **Submit for Review** visible in the draft view, visually separated
      from **Save ITP Items**, and explain that submission locks the rows and
      starts the review process.
- [x] Warn about unsaved Inspection Item changes if the Vendor attempts to
      submit or close the editor while the table is dirty.
- [x] After successful submission, replace the draft instructions with a clear
      read-only confirmation: **“Submitted for review. Inspection Items are now
      locked.”**
- [x] If the user closes the success flow, keep the document discoverable with
      its `DRAFT` badge and the same next-step guidance when reopened.

### 5. Automated verification

- [x] Replace the obsolete `reviewService.itpItems.test.ts` coverage with
      document-domain service tests.
- [x] Test owning Vendor institution + current Field ITP draft ⇒ save succeeds.
- [ ] Test document ownership snapshot creation, revision inheritance, and
      migration backfill; unmappable legacy ownership must remain null and deny
      mutation until administratively resolved.
- [x] Test a different Vendor institution, Reviewer, Checker, and other roles ⇒
      `403`, with no delete/create mutation executed.
- [ ] Test non-current revision, non-Field-ITP section, `SUBMITTED`, active
      review, and final statuses ⇒ locked with no mutation.
- [ ] Test scope-safe GET for allowed and disallowed projects/documents.
- [x] Test payload validation and normalization: whitespace-only activity and
      invalid enums are rejected; client-supplied sequence gaps/duplicates are
      stored as contiguous `1..N` in submitted array order.
- [ ] Test initial Field ITP upload returns `DRAFT` and creates no review; test
      explicit submission creates the review and starts the normal workflow.
- [ ] Regression-test Procedure and Work Method upload behavior.
- [ ] Test revision copy-forward preserves all item fields and leaves the copied
      rows editable only on the new draft.
- [ ] Add frontend tests for Vendor editable draft, Vendor submitted read-only,
      Reviewer/Checker read-only, non-ITP hidden state, dirty-state warning,
      success guidance, and cache refresh after save/submit.

### 6. Manual workflow verification

- [ ] As Vendor, upload a new Field ITP and verify the draft-created guidance
      and direct editor action.
- [ ] Add, modify, reorder, remove, and save Inspection Items; reload and verify
      persistence.
- [ ] Submit the draft and verify the rows lock immediately and the review queue
      receives the document.
- [ ] As Reviewer and Checker, verify the identical rows are visible but no
      editing or save controls exist.
- [ ] As a different Vendor institution, verify the Inspection Items cannot be
      read or changed by direct item URL/API request. Broader document endpoint
      scoping remains outside this work.
- [ ] Complete a Status C cycle, create a revision, verify rows are copied into
      the new draft, edit them, and verify the rejected revision is unchanged.

## Success criteria

- [ ] Vendor is the only role capable of mutating Field ITP Inspection Items in
      both UI and API; Reviewer/Checker write attempts consistently return
      `403`.
- [ ] A new Field ITP upload remains a visible, editable `DRAFT` until the Vendor
      explicitly submits it.
- [ ] The Vendor is told exactly what to do next at creation time and whenever
      the draft is reopened; successful creation automatically opens the exact
      new draft at the editor.
- [ ] Submission locks Inspection Items, creates a review, transitions the
      document from `DRAFT` to `SUBMITTED`, and does not lose any saved rows.
- [ ] Vendor-institution ownership and project visibility are enforced for both
      Inspection Item reads and writes; direct item access outside scope is
      denied. Broader document REST scoping remains separate and documented.
- [ ] Revision copy-forward works without altering historical rows.
- [ ] Focused backend/frontend tests, production builds, and the manual
      Vendor→Reviewer workflow all pass with recorded evidence.
- [ ] No unrelated role, document section, Comment Sheet, or SLA behavior
      regresses.

## Work log / review

- 2026-08-30 — Planning only: traced the current frontend, route, service,
  lifecycle, and test behavior; confirmed the partial migration and recorded
  the implementation/verification plan. No application code changed.
- 2026-08-30 — Plan review: defined immutable Vendor-institution ownership,
  narrowed read-hardening to the Inspection Item endpoint, made row validation
  measurable, accepted existing last-write-wins collaboration semantics, and
  specified the upload response callback that automatically opens the new
  draft. No application code changed.
- 2026-08-30 — Implementation: backend and frontend changes are in place;
  `prisma validate`, backend build, focused backend tests (10/10), frontend
  build, and frontend tests (24/24) passed. Full backend suite reached 121
  passing tests plus 10 skipped integration tests but the suite could not
  complete because PostgreSQL was unavailable at `localhost:5432`.
- 2026-08-30 — Final review: moved the ITP API/controller logic into the
  document domain, kept Reviewer/Checker rendering read-only, added the
  submitted-state lock confirmation, and corrected non-ITP upload messaging.
  `git diff --check` passed. Manual browser verification and DB-backed
  integration tests remain pending until PostgreSQL is available.
- 2026-08-30 — Additional verification: backend non-DB suite passed 121/121
  when the PostgreSQL integration file was excluded; frontend build/tests and
  backend build were rerun successfully after the final UI adjustments.
- [ ] During implementation, record each completed phase, commands/tests run,
      observed results, remaining risks, and any approved scope changes here.

## 2026-08-30 — BoQ document presence indicators (completed)

### Objective

Make the selected BoQ item's document coverage immediately legible for Field
ITP, Procedure, and Work Method without changing document authorization,
workflow, or approval semantics.

### Scope and decisions

- Reuse the existing authenticated `documentApi.list` response for the selected
  BoQ item; do not add a new readiness or approval concept.
- Show one section-level badge/count for each of the three document sections.
- Count only documents with `is_current === true`; historical/superseded
  revisions remain visible in the existing list but never make a section appear
  populated in the summary.
- Represent loading and API error as unavailable states, not as empty sections.
- Preserve the existing section tabs, uploads, revisions, and document detail
  workflows. No GitHub push or VPS deployment is part of this change.

### Implementation plan

- [x] Trace and document the BoQ page, detail panel, document list API, and
      existing loading/error behavior.
- [x] Refactor the selected-item document query to provide all sections once,
      filter the active list locally, and invalidate the matching cache after
      upload/revision.
- [x] Add a reusable document-presence summary with explicit loading, error,
      empty, current-count, and multi-revision behavior.
- [x] Add focused frontend tests for populated/current-only, empty, loading,
      error, and all three section states.
- [x] Run focused frontend tests, the full frontend test suite, frontend build,
      and relevant backend checks; preserve unrelated dirty files.

### Success criteria

- [x] A selected BoQ item visibly shows Field ITP, Procedure, and Work Method as
      `Empty` or `{N} current` based only on current documents.
- [x] Superseded/historical-only revisions do not count as document presence;
      multiple current documents are represented by their count.
- [x] Loading and request failure are clearly distinguishable from an empty
      section, and the existing document list still explains its own state.
- [x] Existing authorization and BoQ document workflows remain unchanged.
- [x] Tests and build pass, with command results and limitations recorded below.

### Work log / review

- 2026-08-30 — Trace complete: `BoqTreePage` renders `BoqItemDetailPanel`;
  the panel queried one section at a time without an error state; the document
  list API returns current and historical rows (including linked BoQ coverage);
  the backend item summary filters only direct current documents. No code
  changed during tracing.
- 2026-08-30 — Implemented `DocumentPresenceSummary` and changed the selected
  item query to load all sections once. The summary counts only `is_current`
  documents, keeps historical rows out of presence counts, and distinguishes
  loading/error/unavailable from empty. Active-section rows continue to show
  the full revision list; upload/revision mutations now invalidate the shared
  item document cache.
- 2026-08-30 — Verification: focused presence/inspection tests passed 7/7;
  full frontend suite passed 28/28 across 7 files; frontend production build
  passed; backend build passed; backend non-DB regression suite passed 121/121.
  Existing Vite chunk/import warnings remain non-blocking. PostgreSQL-backed
  integration tests and manual browser verification were not run in this
  change; no push or VPS deployment was performed.

## 2026-08-30 — BoQ tree-row document indicators (completed)

### Objective

Make document presence visible directly beside every BoQ tree item, including
items such as Steel Fabrication, before the user opens the detail panel.

### Scope and decisions

- Extend the authenticated BoQ tree response with current-document counts per
  `FIELD_ITP`, `PROCEDURE`, and `WORK_METHOD` section so the tree makes one
  project request rather than issuing one document request per row.
- Count only `Document.is_current === true`; historical/superseded revisions
  do not populate a row indicator.
- Keep indicators limited to presence/current counts. They do not imply review,
  approval, or QC readiness.
- Preserve existing project/document authorization and the detail-panel query;
  show loading/error states for the tree summary without hiding the BoQ tree.

### Implementation plan

- [x] Trace and specify the backend tree response, document coverage joins,
      frontend row rendering, and existing tests.
- [x] Add a scoped current-document summary to the BoQ tree response,
      including linked multi-BoQ coverage where applicable.
- [x] Render compact, obvious per-section badges on every tree row with honest
      loading/error/empty states.
- [x] Add focused backend/frontend tests for current, historical-only, empty,
      loading, error, and multi-section rows.
- [x] Run relevant tests/builds, update evidence, and preserve unrelated dirty
      files. No push/deployment until explicitly authorized.

### Success criteria

- [x] Every visible BoQ item clearly shows Field ITP, Procedure, and Work Method
      as current counts or empty/unavailable states.
- [x] Steel Fabrication (and any item with a current document) is visibly
      distinguishable in the tree without opening the detail panel.
- [x] Historical/superseded-only documents never count as current presence.
- [x] Tree loading/error states remain honest and existing workflows/auth remain
      unchanged.

### Work log / review

- 2026-08-30 — Screenshot follow-up trace: the previous indicator existed only
  in `BoqItemDetailPanel`; `BoqTreePage` had no document fields to render, which
  explains why Steel Fabrication showed no status in the tree. No code changed
  during tracing.
- 2026-08-30 — Implemented project-scoped current-document counts in the BoQ
  tree response, including linked multi-BoQ coverage. Added row badges for ITP,
  Procedure, and Work Method, with explicit Docs…/Docs ? fallback states, and
  invalidated the BoQ tree cache after upload/revision.
- 2026-08-30 — Verification: focused frontend tests passed 6/6; focused
  backend document-count tests passed 2/2; full frontend suite passed 30/30
  across 8 files; backend non-DB suite passed 123/123 across 16 files;
  frontend and backend builds passed. Existing Vite import/chunk warnings are
  non-blocking. PostgreSQL-backed integration and manual browser verification
  remain pending; no push or deployment was performed.
