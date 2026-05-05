# 01 — System Overview

## What This System Does

Field QA Management System is a **document quality assurance platform** for PLN (Perusahaan Listrik Negara) power infrastructure projects. It manages the full lifecycle of technical documents submitted by construction vendors — from initial BOQ (Bill of Quantities) setup through a 3-stage review workflow, culminating in an AMS (Approval Monitoring Sheet) letter release.

### Core Problem Solved
Vendors submit technical documents (Inspection & Test Plans, Procedures, Work Methods) for consultant approval. Previously this was manual, untracked, with no SLA enforcement. This system:
- Tracks every document against a structured BOQ
- Enforces a 3-step review workflow (Reviewer → Checker → Approver)
- Measures SLA compliance
- Tracks average review duration (submission → AMS letter)
- Provides project-level criticality view via urgency levels

---

## Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (TypeScript) |
| Framework | Express.js |
| ORM | Prisma 5.x |
| Database | PostgreSQL |
| Auth | JWT (access token 15m + refresh token 7d httpOnly cookie) |
| File Uploads | multer (disk storage) |
| PDF Generation | Custom PDF engine (`/backend/src/utils/pdfEngine/`) |
| Validation | Zod (controllers) |
| Password | bcrypt |

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript + Vite |
| Routing | React Router v6 |
| State | Zustand (`authStore`, `uiStore`) |
| Server State | TanStack Query (React Query) v5 |
| HTTP Client | Axios (with interceptor for auto-refresh) |
| Styling | Tailwind CSS (custom `card`, `btn-primary`, `btn-secondary`, `input`, `label` classes) |
| Date Handling | date-fns |

---

## Monorepo Structure

```
field-qa-management-system/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma           ← single source of truth for DB
│   │   └── migrations/             ← all migration SQL files
│   ├── src/
│   │   ├── config/                 ← env config + database singleton
│   │   ├── controllers/            ← HTTP layer (validate + call service)
│   │   ├── middlewares/            ← auth, role, upload, rate-limit, error
│   │   ├── routes/                 ← Express Router instances
│   │   ├── services/               ← business logic (call prisma here)
│   │   └── utils/                  ← AppError, asyncHandler, pdfEngine, etc.
│   ├── uploads/                    ← all uploaded files (served statically)
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/             ← shared UI (layout, guards, ui primitives)
│   │   ├── features/               ← page-level components per domain
│   │   ├── hooks/                  ← useAuth, etc.
│   │   ├── services/               ← axios API client wrappers per domain
│   │   └── store/                  ← Zustand stores
│   └── .env
├── Business Process Memory/        ← THIS FOLDER
└── tasks/
    ├── todo.md
    └── lessons.md
```

---

## Key Architectural Patterns

### 1. Controller → Service → Prisma (3-layer)
- **Controllers** only: parse request, validate with Zod, call service, send JSON
- **Services** only: business logic, Prisma calls, throw `AppError`
- **Never** put Prisma calls in controllers

### 2. Auth Middleware Stack (order matters)
```
authMiddleware → requireRole(...roles) → requireInstitution(...types) → controller
```

### 3. Optimistic Locking on DocumentReview
`DocumentReview.version` field prevents concurrent stage updates. `updateMany` with version condition; throw 409 if 0 rows affected.

### 4. File Storage Pattern
Files uploaded to temp → moved to structured permanent path by `fileStorageService`:
```
uploads/documents/{projectId}/{boqItemId}/{docNumber}/rev{N}/{filename}
uploads/ams/{timestamp}-{random}-{safeName}.pdf
uploads/comment-sheets/{reviewId}.pdf
```
Served statically at `/uploads/{relativePath}`.

### 5. Revision Immutability
When a document is revised, the old document is marked `is_current=false` and `status=SUPERSEDED`. The new revision gets `revision_no + 1`. History is never deleted.

### 6. SLA State Machine
Review workflow is a linear state machine. Stage computed from timestamps, never stored:
- `reviewed_at IS NULL` → stage = REVIEW
- `checked_at IS NULL` → stage = CHECK  
- `approved_at IS NULL` → stage = APPROVE
- all set → stage = COMPLETE

### 7. Activity Logging
All mutations fire `logActivity()` which is async and swallows errors — never blocks requests.

### 8. Phase Prerequisites (WORK_METHOD gate)
Before a WORK_METHOD document can be uploaded, the same BOQ item must have an `APPROVED_A` FIELD_ITP document AND an `APPROVED_A` PROCEDURE document.

---

## Database Schema Domains

```
IAM Domain          → Institution, Unit, User
Project Domain      → Project, ProjectAmendment, ProjectVendorVisibility
BOQ Domain          → BoqItem
Document Domain     → Document, DocumentFile
Workflow Domain     → DocumentReview, ReviewComment, AmsLetter
Audit Domain        → ActivityLog
```

---

## Development Notes

- Backend TypeScript: `cd backend && npx ts-node src/index.ts` (or `npm run dev`)
- Frontend: `cd frontend && npm run dev`
- Database migrations: **NEVER use `prisma migrate dev` in non-interactive shells** — create migration SQL manually and use `prisma migrate deploy`
- After schema change: `npx prisma generate` to regenerate client
- Default SLA: 7 days (configurable via `DEFAULT_SLA_DAYS` env var)
