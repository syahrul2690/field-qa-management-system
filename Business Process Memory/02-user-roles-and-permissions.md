# 02 — User Roles and Permissions

## Institution Types

Every user belongs to an **Institution** of one of three types:

| Type | Description | Typical Users |
|------|-------------|---------------|
| `OWNER` | PLN unit that owns the project (e.g., PLN UIP) | ADMIN, PIC_PROJECT |
| `CONSULTANT` | Consulting firm hired to review documents | REVIEWER, CHECKER, APPROVER |
| `VENDOR` | Contractor/vendor submitting documents | VENDOR role users |

---

## User Roles (7 total)

### ADMIN
- **Institution:** OWNER
- **What they do:** System administration
- **Capabilities:**
  - Approve / reject / suspend user registrations
  - Manage institutions and units
  - Change any user's role (only role that can do this)
  - Create and edit projects
  - Upload BOQ
  - View everything
- **Frontend pages visible:** All pages including `/admin/users` and `/admin/institutions`

---

### PIC_PROJECT (Person In Charge — Project)
- **Institution:** OWNER
- **What they do:** Manage the project lifecycle
- **Capabilities:**
  - Create new projects (POST /projects)
  - Edit project data (PATCH /projects/:id)
  - Create project amendments (change duration/contract value)
  - Assign and remove vendor access to a project
  - Upload BOQ
  - View all project data and documents
- **Cannot:** Approve users, manage institutions, submit documents, review documents
- **Frontend pages visible:** Dashboard, Projects, BOQ (read + upload), Profile

---

### VENDOR
- **Institution:** VENDOR
- **What they do:** Upload technical documents for review
- **Capabilities:**
  - Upload BOQ (for project that has granted them visibility)
  - Submit new documents (POST /documents)
  - Create document revisions (POST /documents/:id/revisions) — only for REJECTED_C or APPROVED_WITH_COMMENTS_B docs
  - Submit documents for review (POST /reviews)
  - View their own project documents
- **Cannot:** Review documents, view other vendors' data, manage projects
- **Key constraint:** Can only upload documents to projects they have been granted visibility on

---

### REVIEWER
- **Institution:** CONSULTANT
- **What they do:** First stage of the 3-step review; also manages AMS letter
- **Capabilities:**
  - View submitted documents
  - Add review comments (page_ref, comment, disposition: MAJOR/MINOR/INFO)
  - Assign CHECKER and APPROVER for the review
  - Submit review package (moves review from REVIEW → CHECK stage)
  - **Upload AMS Letter** (PDF) once review process is complete
  - Replace existing AMS letter with a new file
- **Cannot:** Check documents (CHECKER's job), approve documents (APPROVER's job)
- **Frontend pages visible:** Dashboard, Review Queue, Review Detail, Profile

---

### CHECKER
- **Institution:** CONSULTANT
- **What they do:** Second stage verification
- **Capabilities:**
  - View review in CHECK stage (assigned to them)
  - Add optional notes
  - Confirm check (moves review from CHECK → APPROVE stage)
- **Cannot:** Add initial review comments, set final status
- **Frontend pages visible:** Dashboard, Review Queue, Review Detail, Profile

---

### APPROVER
- **Institution:** CONSULTANT
- **What they do:** Final decision maker (third stage)
- **Capabilities:**
  - View review in APPROVE stage (assigned to them)
  - Set final status:
    - **Status A** (`APPROVED_A`) — Approved without comments
    - **Status B** (`APPROVED_WITH_COMMENTS_B`) — Approved with required changes
    - **Status C** (`REJECTED_C`) — Rejected, vendor must resubmit
  - Add optional approval notes
  - This triggers: document status update + PDF comment sheet generation (for Status A)
- **Cannot:** Add review comments, confirm check
- **Frontend pages visible:** Dashboard, Review Queue, Review Detail, Profile

---

### VIEWER
- **Institution:** Any
- **What they do:** Read-only access
- **Capabilities:**
  - View projects, documents, reviews
  - Download comment sheets
- **Cannot:** Create anything, upload anything, review anything
- **Frontend pages visible:** Dashboard, Projects (read), BOQ (read), Review Queue (read)

---

## User Registration Flow

```
1. User fills Register form:
   - Name, email, password
   - Institution (dropdown from GET /institutions)
   - Unit within institution
   - Role selection

2. Account created with status = PENDING

3. User sees /pending-approval page — cannot access main app

4. ADMIN sees pending users at /admin/users

5. ADMIN approves → status = APPROVED → user can log in
   ADMIN rejects → status = REJECTED → user notified
   ADMIN can later suspend → status = SUSPENDED

6. Only APPROVED users with valid JWT can access protected routes
```

---

## Profile Management

- All users can edit their own **name** and **phone** at `/profile`
- **Role** field is locked on the profile form for all roles except ADMIN
- ADMIN can change any user's role via the profile form (dropdown enabled)
- Email is always read-only (cannot be changed)
- Backend: `PATCH /auth/me` — role change is guarded server-side (only ADMIN can change role)

---

## Sidebar Navigation Visibility by Role

| Nav Item | ADMIN | PIC | VENDOR | REVIEWER | CHECKER | APPROVER | VIEWER |
|----------|-------|-----|--------|----------|---------|----------|--------|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Projects | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Review Queue | — | — | — | ✓ | ✓ | ✓ | — |
| User Management | ✓ | — | — | — | — | — | — |
| Institutions | ✓ | — | — | — | — | — | — |

> Note: Review Queue (`/reviews`) is only visible to REVIEWER, CHECKER, APPROVER roles.

---

## Role Color Coding (Sidebar Badge)

| Role | Color |
|------|-------|
| ADMIN | Purple (`bg-purple-500`) |
| PIC_PROJECT | Teal (`bg-primary-400`) |
| REVIEWER | Yellow (`bg-yellow-500`) |
| CHECKER | Orange (`bg-orange-500`) |
| APPROVER | Green (`bg-green-600`) |
| VENDOR | Pink (`bg-pink-500`) |
| VIEWER | Gray (`bg-gray-500`) |
