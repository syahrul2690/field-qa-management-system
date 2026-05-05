# 04 — Data Models (Prisma Schema Reference)

> File: `backend/prisma/schema.prisma`  
> Database: PostgreSQL  
> All IDs: `uuid()` default

---

## Enums

### Role
```
ADMIN | PIC_PROJECT | VENDOR | REVIEWER | CHECKER | APPROVER | VIEWER
```

### UserStatus
```
PENDING | APPROVED | REJECTED | SUSPENDED
```

### InstitutionType
```
OWNER | CONSULTANT | VENDOR
```

### ProjectType
```
TRANSMISSION | DISTRIBUTION | SUBSTATION | GENERATION | OTHER
```

### ProjectUrgency
```
NORMAL | RUPTL | KERAWANAN_SISTEM | KINERJA_KORPORAT
```
- Default: `NORMAL`
- DB sort: `desc` order = KINERJA_KORPORAT first (alphabetically last in enum, Prisma sorts by enum position)

### DocumentSection
```
FIELD_ITP | PROCEDURE | WORK_METHOD
```
- `WORK_METHOD` requires approved FIELD_ITP + PROCEDURE as prerequisites

### ReviewStatus
```
DRAFT | SUBMITTED | IN_REVIEW | APPROVED_A | APPROVED_WITH_COMMENTS_B | REJECTED_C | SUPERSEDED
```
- `DRAFT`: Just uploaded, not submitted for review
- `SUBMITTED`: Vendor submitted, awaiting REVIEWER
- `IN_REVIEW`: REVIEWER has commented, awaiting CHECKER/APPROVER
- `APPROVED_A`: Fully approved, no changes required
- `APPROVED_WITH_COMMENTS_B`: Approved but vendor must address comments
- `REJECTED_C`: Rejected, vendor must resubmit
- `SUPERSEDED`: Replaced by a newer revision

### ActivityAction (used for audit logs)
```
LOGIN | LOGOUT | REGISTER | USER_APPROVED | USER_REJECTED |
PROJECT_CREATED | PROJECT_UPDATED | PROJECT_AMENDED |
BOQ_UPLOADED | DOCUMENT_UPLOADED | DOCUMENT_REVISED |
REVIEW_SUBMITTED | REVIEW_COMMENTED | REVIEW_CHECKED | REVIEW_APPROVED | REVIEW_REJECTED
```

---

## Models

---

### Institution
```prisma
model Institution {
  id      String          @id @default(uuid())
  name    String
  type    InstitutionType
  address String?
  logo    String?          // relative file path

  units               Unit[]
  users               User[]
  project_vendor_visibility ProjectVendorVisibility[]

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
}
```

---

### Unit
```prisma
model Unit {
  id             String  @id @default(uuid())
  institution_id String
  parent_unit_id String?  // self-reference for hierarchy
  name           String
  level          Int
  description    String?

  institution     Institution @relation(...)
  parent          Unit?       @relation("UnitChildren", ...)
  children        Unit[]      @relation("UnitChildren")
  users           User[]
  projects_owned  Project[]

  @@index([institution_id, parent_unit_id])
  @@index([level])
}
```

---

### User
```prisma
model User {
  id                     String     @id @default(uuid())
  email                  String     @unique
  password_hash          String
  name                   String
  phone                  String?
  role                   Role
  status                 UserStatus @default(PENDING)
  institution_id         String
  unit_id                String
  refresh_token          String?
  refresh_token_expires  DateTime?
  approved_by            String?
  approved_at            DateTime?

  institution           Institution
  unit                  Unit
  projects_created      Project[]          @relation("ProjectCreator")
  documents_uploaded    Document[]         @relation("DocumentUploader")
  reviews_as_reviewer   DocumentReview[]   @relation("ReviewReviewer")
  reviews_as_checker    DocumentReview[]   @relation("ReviewChecker")
  reviews_as_approver   DocumentReview[]   @relation("ReviewApprover")
  review_comments       ReviewComment[]
  ams_letters           AmsLetter[]        @relation("AmsUploader")
  activity_logs         ActivityLog[]

  @@index([email])
  @@index([institution_id, unit_id])
  @@index([status])
}
```

---

### Project
```prisma
model Project {
  id                      String      @id @default(uuid())
  name                    String
  description             String?
  contract_signing_date   DateTime
  contract_effective_date DateTime
  duration_days           Int
  warranty_period_days    Int
  project_type            ProjectType
  urgency                 ProjectUrgency @default(NORMAL)
  nominal_values          Json           // [{currency: string, amount: number}]
  owner_unit_id           String
  created_by              String

  owner_unit        Unit
  creator           User               @relation("ProjectCreator", ...)
  amendments        ProjectAmendment[]
  vendor_visibility ProjectVendorVisibility[]
  boq_items         BoqItem[]

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  @@index([owner_unit_id])
}
```

**Computed field (not stored):**
- `end_date` = `contract_effective_date + duration_days` — computed in service

---

### ProjectAmendment
```prisma
model ProjectAmendment {
  id                      String   @id @default(uuid())
  project_id              String
  amendment_no            Int      // sequential per project
  amendment_reason        String
  effective_date          DateTime
  previous_duration_days  Int
  previous_nominal_values Json
  new_duration_days       Int
  new_nominal_values      Json
  amended_by              String   // user id (not FK — historical record)

  project Project

  created_at DateTime @default(now())

  @@unique([project_id, amendment_no])
  @@index([project_id])
}
```

---

### ProjectVendorVisibility
```prisma
model ProjectVendorVisibility {
  id                    String   @id @default(uuid())
  project_id            String
  vendor_institution_id String
  assigned_at           DateTime @default(now())
  assigned_by           String   // user id (not FK)

  project            Project
  vendor_institution Institution

  @@unique([project_id, vendor_institution_id])
  @@index([project_id])
  @@index([vendor_institution_id])
}
```

---

### BoqItem
```prisma
model BoqItem {
  id             String  @id @default(uuid())
  project_id     String
  parent_item_id String?  // self-reference
  level          Int      // 1, 2, 3...
  item_code      String   // e.g., "1.1.2"
  system_tag     String   @unique  // generated: "{prefix}-L{level}-{code}"
  title          String
  description    String?
  sort_order     Int      @default(0)

  project   Project
  parent    BoqItem?   @relation("BoqChildren", ...)
  children  BoqItem[]  @relation("BoqChildren")
  documents Document[]

  @@unique([project_id, item_code])
  @@index([project_id, parent_item_id])
  @@index([project_id, level])
}
```

**BOQ Tree Display (Frontend `BoqTreePage.tsx`):**
- Level 1: `font-bold text-gray-900`, `py-2.5 border-t border-gray-200`
- Level 2: `font-normal text-gray-700`, `py-2`
- Level 3+: `font-normal text-gray-500`, `py-1.5`

---

### Document
```prisma
model Document {
  id                 String          @id @default(uuid())
  boq_item_id        String
  section            DocumentSection
  doc_number         String
  title              String
  surat_pengantar_no String?
  revision_no        Int             @default(0)
  status             ReviewStatus    @default(DRAFT)
  is_current         Boolean         @default(true)
  uploaded_by        String

  boq_item  BoqItem
  uploader  User           @relation("DocumentUploader", ...)
  files     DocumentFile[]
  reviews   DocumentReview[]

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  @@unique([boq_item_id, section, doc_number, revision_no])
  @@index([boq_item_id, section, is_current])
  @@index([status])
}
```

---

### DocumentFile
```prisma
model DocumentFile {
  id          String @id @default(uuid())
  document_id String
  file_name   String
  file_path   String   // relative path under uploads/
  file_size   Int      // bytes
  mime_type   String

  document Document

  created_at DateTime @default(now())

  @@index([document_id])
}
```

---

### DocumentReview
```prisma
model DocumentReview {
  id          String  @id @default(uuid())
  document_id String
  reviewer_id String?
  checker_id  String?
  approver_id String?
  version     Int     @default(0)    // optimistic locking
  sla_deadline DateTime?
  reviewed_at  DateTime?
  checked_at   DateTime?
  approved_at  DateTime?
  final_status       ReviewStatus?
  comment_sheet_path String?
  qr_hash            String @unique @default(uuid())

  document   Document
  reviewer   User?         @relation("ReviewReviewer", ...)
  checker    User?         @relation("ReviewChecker", ...)
  approver   User?         @relation("ReviewApprover", ...)
  comments   ReviewComment[]
  ams_letter AmsLetter?

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  @@index([document_id])
  @@index([reviewer_id])
  @@index([checker_id])
  @@index([approver_id])
  @@index([final_status])
  @@index([sla_deadline])
}
```

**Computed fields (service layer, not stored):**
- `current_stage`: derived from timestamps (see `slaService.getCurrentStage`)
- `is_overdue`: `final_status IS NULL AND sla_deadline < now()`

---

### AmsLetter
```prisma
model AmsLetter {
  id          String @id @default(uuid())
  review_id   String @unique    // one per review
  file_name   String
  file_path   String             // relative: "ams/{filename}"
  file_size   Int                // bytes
  mime_type   String
  uploaded_by String

  review   DocumentReview @relation(...)
  uploader User           @relation("AmsUploader", ...)

  created_at DateTime @default(now())

  @@index([review_id])
}
```

**Business meaning:**
- Uploaded by REVIEWER after document review is complete
- `created_at` = AMS letter release date
- Duration = `AmsLetter.created_at - DocumentReview.created_at` (days)
- One AMS per review; uploading a new one deletes the old file from disk

---

### ReviewComment
```prisma
model ReviewComment {
  id           String  @id @default(uuid())
  review_id    String
  commenter_id String
  page_ref     String?   // e.g., "Page 3, Section 2.1"
  comment      String
  disposition  String?   // 'MAJOR', 'MINOR', 'INFO' (or 'A', 'B', 'C' legacy)

  review    DocumentReview
  commenter User

  created_at DateTime @default(now())

  @@index([review_id])
}
```

---

### ActivityLog
```prisma
model ActivityLog {
  id          String         @id @default(uuid())
  user_id     String?
  action      ActivityAction
  entity_type String?
  entity_id   String?
  metadata    Json?
  ip_address  String?

  user User?

  created_at DateTime @default(now())

  @@index([user_id])
  @@index([action])
  @@index([entity_type, entity_id])
  @@index([created_at])
}
```

---

## Migration History

| Migration | Description |
|-----------|-------------|
| `20260407150746_init` | Full initial schema |
| `20260408135653_add_project_urgency` | Added `ProjectUrgency` enum + `urgency` field to Project |
| `20260408180000_rename_project_urgency_levels` | Renamed enum values: LOW→NORMAL, MEDIUM→RUPTL, HIGH→KERAWANAN_SISTEM, CRITICAL→KINERJA_KORPORAT |
| `20260408190000_add_ams_letter` | Added `AmsLetter` model |

---

## Important Constraints

1. `Document`: Unique on `[boq_item_id, section, doc_number, revision_no]`
2. `BoqItem`: Unique on `[project_id, item_code]` — used for upsert on re-upload
3. `ProjectVendorVisibility`: Unique on `[project_id, vendor_institution_id]`
4. `ProjectAmendment`: Unique on `[project_id, amendment_no]`
5. `AmsLetter`: Unique on `review_id` — one per review
6. `DocumentReview.qr_hash`: Global unique — for QR verification
7. `User.email`: Global unique
