# Field QA Management System — Business Process Memory

> **Purpose:** This folder is a complete memory snapshot of the system for use when resuming work in a new conversation. Read `00-INDEX.md` first, then the relevant document for your task.

---

## Document Index

| File | Contents |
|------|----------|
| `01-system-overview.md` | Tech stack, architecture, monorepo structure, key patterns |
| `02-user-roles-and-permissions.md` | All 7 roles, institution types, what each role can/cannot do |
| `03-business-process-flows.md` | Step-by-step flows: registration, project lifecycle, BOQ, document, review |
| `04-data-models.md` | Every Prisma model, all fields, all enums, all relations |
| `05-api-endpoints.md` | Every backend endpoint with method, path, auth, role requirement |
| `06-review-workflow-and-sla.md` | Deep dive: 3-stage review, SLA logic, stage transitions, AMS letter |
| `07-frontend-structure.md` | All pages, routes, components, API service files |
| `08-file-management.md` | Upload middleware, storage directories, URL patterns |
| `09-dashboard-and-reporting.md` | Dashboard data, urgency levels, review duration metric |
| `10-configuration-and-environment.md` | All env vars, config defaults, JWT, CORS, upload limits |

---

## Quick-Start Checklist (New Conversation)

1. Read **`01-system-overview.md`** to orient on tech stack and architecture.
2. Read **`02-user-roles-and-permissions.md`** before touching any auth/role logic.
3. Read **`04-data-models.md`** before any Prisma schema or migration work.
4. Read **`06-review-workflow-and-sla.md`** before touching review/approval logic.
5. Grep the specific service file before editing — functions are well-named.

---

## System Identity

- **Project name:** Field QA Management System
- **Domain:** PLN (Indonesian state electricity company) — contractor document QA/QC for power plant construction projects
- **Stack:** React + TypeScript (frontend) · Express + TypeScript + Prisma (backend) · PostgreSQL
- **Last updated:** 2026-04-08
- **Key business concept:** Vendor submits technical documents → 3-level consultant review (Reviewer → Checker → Approver) → AMS letter released → SLA tracked
