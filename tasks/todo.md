# Field QA Management System — Implementation Tracker

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
