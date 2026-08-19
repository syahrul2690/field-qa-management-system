---
title: Rencana Implementasi Feedback End User — field-qa v1.0 (UX-safe revision)
date: 2026-08-18
status: design-complete — execution gated by baseline snapshot and contract tests
source_basis: end-user feedback 2026-08-18 (7 butir) + tiga putaran klarifikasi; INTEGRATION_PLAN.md rev 2026-07-14; kode field-qa & field-qc pada working tree (uncommitted per 2026-08-18)
supersedes: enduser-feedback-plan-v0.1.md, enduser-feedback-plan-v0.2.md
---

# 1. Keputusan yang sudah final (jangan dibuka ulang)

| # | Butir | Keputusan |
|---|---|---|
| F1 | Multi-BoQ submission | Satu dokumen mencakup N BoQ item. Status C memblokir **seluruh** item yang dicakup. |
| F2 | PIC_ENGINEER | **Gerbang delegasi**, bukan tahap persetujuan. Asman mendelegasikan dokumen ke engineer terkait. **Engineer = REVIEWER**; delegasi Asman menetapkan reviewer, PIC_CONSULTANT tetap menetapkan Checker/Approver. **Jam SLA mulai saat submit**, bukan saat delegasi. Tidak ada aksi tolak. PIC ternotifikasi. |
| F3 | Upload coret-coretan | File markup per tahap, dapat diunduh vendor. Aditif. |
| F4 | PIC_Consultant | Penugasan per proyek; daftar pilihan dibatasi personel institusi CONSULTANT. Proyek lama tanpa penugasan mempertahankan perilaku sekarang. |
| F5 | Inspection Item | Kepemilikan tulis pindah ke VENDOR. Konsultan **hanya berkomentar**. Item disalin ke revisi berikutnya. |
| F6 | Edit flag | Tandai "Edited" hanya bila **CHECKER/APPROVER mengubah teks milik orang lain**. Reviewer menyunting tulisannya sendiri tidak ditandai. |
| F7 | Export Excel | Di **beranda** (dashboard). Tiga sheet: Ringkasan, Proyek, Overdue. |

**Konsekuensi penting F2 + SLA-mulai-saat-submit:** keterlambatan Asman mendelegasikan memakan jatah
waktu reviewer. Perlu peringatan operasional — antrean "menunggu delegasi" harus menampilkan sisa SLA
yang sudah berjalan, dan reminder ke Asman berjalan dari tanggal submit. Ini bukan bug, ini pilihan
sadar; UI harus membuatnya terlihat agar tidak menjadi keluhan reviewer di kemudian hari.

**UX guardrails yang berlaku untuk semua butir:**

- Jangan membuat pengguna mengulang data yang sudah benar; revisi membawa data inspeksi ke depan dan
  memberi Vendor kesempatan menyuntingnya sebelum submit.
- Semua file download tetap melewati autentikasi dan scope check; raw path di bawah `/uploads` tidak
  boleh menjadi jalan pintas akses.
- Setiap perubahan yang memengaruhi audit, assignment, atau integrasi harus terlihat di UI melalui
  status, actor, waktu, dan riwayat yang relevan.
- API integration harus backward-compatible selama rollout; field baru boleh aditif, perubahan
  bentuk respons harus memakai versioning atau compatibility window.

---

# 2. Urutan eksekusi

| Gelombang | Butir | Prasyarat | Dapat dirilis sendiri |
|---|---|---|---|
| **W0** | Baseline snapshot kedua repo + contract freeze | — | ya |
| **W1** | F3 + F7 + F4 (develop separately, migrate sequentially) | W0 + contract freeze | ya, per butir |
| **W2** | F6 | W0 | ya |
| **W3** | F2 | W0, disarankan setelah W1-F4 (keduanya menyentuh penugasan) | ya |
| **W4** | F5 | W0 | ya |
| **W5** | F1 + revisi INTEGRATION_PLAN | W0, W4 | tidak — butuh perubahan field-qc yang serempak |

Satu migrasi Prisma per butir, tidak digabung. Penamaan mengikuti konvensi repo
(`YYYYMMDDHHMMSS_<slug>`).

---

# 3. W0 — Amankan basis

1. Buat baseline snapshot yang dapat dipulihkan untuk **kedua** repo: daftar commit saat ini,
   `git diff` tersimpan sebagai patch, dan daftar file yang sengaja masuk scope. Jangan melakukan
   blind commit terhadap seluruh working tree karena kedua repo sedang memiliki perubahan pengguna.
   W4 dan W5 menulis ulang bagian dari pekerjaan ini — tanpa titik pulih, rollback mustahil.
2. Perbaiki catatan salah di **dua salinan** `INTEGRATION_PLAN.md` §7: enum `QcRole` yang benar adalah
   `SUPERVISOR | INSPECTOR | QC_ENGINEER | QC_LEAD`, bukan `SUB_KONTRAKTOR | FIELD_INSPECTOR |
   SITE_MANAGER`. Pemetaan migrasi ke `qc_function` harus ditulis ulang saat A3 dikerjakan.

---

# 4. W1 — Tiga butir aditif (paralel)

## 4.1 F3 — Upload hasil coret-coretan review

**Skema** — migrasi `add_review_markup_file`:
```
model ReviewMarkupFile {
  id, review_id, stage (REVIEW|CHECK|APPROVE), uploaded_by,
  file_name, file_path, file_size, mime_type, created_at
}
```
Pola disalin dari `AmsLetter` (`backend/prisma/schema.prisma:413`), termasuk penyimpanan relatif di
bawah direktori uploads.

**Backend**
- `backend/src/middlewares/uploadMiddleware.ts` — tambah handler `uploadMarkup` (PDF + gambar,
  multi-file, batas ukuran mengikuti `uploadAmsPdf`).
- `backend/src/services/reviewService.ts` — `uploadReviewMarkup()`, `listReviewMarkup()`,
  `deleteReviewMarkup()` (hanya pengunggah, dan hanya selama tahapnya belum selesai).
- `backend/src/controllers/reviewController.ts` + `routes/reviewRoutes.ts` —
  `POST/GET /reviews/:reviewId/markup`, `GET /reviews/:reviewId/markup/:fileId/download`,
  `DELETE /reviews/:reviewId/markup/:fileId`.
- POST: `REVIEWER/CHECKER/APPROVER`, hanya actor yang ditugaskan pada tahap aktif.
  GET/list/download: semua role yang boleh melihat review, termasuk VENDOR, dengan
  `buildReviewScopeWhere` dan authenticated streaming. Jangan expose `file_path` sebagai public URL.
- Delete: hanya uploader, hanya saat tahap file tersebut masih aktif, dengan scope check and actor
  assignment check. Tambahkan MIME sniffing/extension validation dan total-request size limit.

**Frontend** — `frontend/src/features/reviews/ReviewDetailPage.tsx`: panel unggah per tahap +
daftar unduhan; `frontend/src/services/reviewApi.ts` menambah tiga fungsi.

**Selesai bila:** reviewer mengunggah 3 file pada tahap REVIEW, checker melihat & mengunduhnya,
vendor melihat & mengunduh tetapi tidak dapat mengunggah (403, ada test), penghapusan setelah tahap
selesai ditolak (403).

## 4.2 F7 — Download Excel pada beranda

**Backend** — endpoint `GET /projects/dashboard/export.xlsx`, didaftarkan **sebelum**
`/:id` di `backend/src/routes/projectRoutes.ts` (pola yang sama dipakai `/dashboard`, baris 29–30).
Controller memanggil **fungsi agregasi dashboard yang sama** (`getDashboardData`), lalu menyerahkan
hasilnya ke `backend/src/utils/excelExport/dashboardExport.ts` yang baru. Jangan menulis query
kedua — scope RBAC harus identik dengan layar, kalau tidak export menjadi jalan pintas kebocoran data.
ExcelJS sudah menjadi dependensi backend (dipakai `utils/excelParser/`).

**Sheet & kolom**

| Sheet | Kolom |
|---|---|
| Ringkasan | total proyek, total dokumen, sisa dokumen, review overdue, completion rate, durasi review avg/min/max (hari), total AMS released, tabel durasi bulanan (bulan, avg hari, jumlah) |
| Proyek | nama, tipe, urgency, tanggal efektif kontrak, end date, total/selesai/sisa dokumen, % penyelesaian, jumlah per status (A, B, C, In Review, Submitted, Draft, Superseded), jumlah overdue, avg durasi review, jumlah AMS |
| Overdue | proyek, doc number, judul dokumen, section, tahap, SLA deadline, hari terlambat |

Header dibekukan, lebar kolom otomatis, tanggal bertipe tanggal (bukan string), persentase bertipe
angka. Nama file `Monitoring_YYYY-MM-DD.xlsx`.

**Frontend** — tombol "Download Excel" di header `DashboardPage.tsx`. Gunakan query/scope yang sama
dengan dashboard; pada rilis ini tidak menjanjikan filter UI yang belum ada. Jika filter UI ditambah
kemudian, query filter yang sama harus dipakai oleh layar dan export.

**Data semantics** — total/selesai/sisa dan summary memakai current documents, sama dengan kartu
dashboard. Kolom `Superseded` pada sheet Proyek menghitung non-current revisions secara terpisah,
agar tidak selalu bernilai nol dan tidak mengubah completion rate.

**Selesai bila:** VIEWER berscope sempit mengunduh file yang hanya berisi proyek yang terlihat
olehnya (test); angka di sheet Ringkasan sama persis dengan kartu di layar untuk data uji yang sama.

## 4.3 F4 — Penugasan PIC_Consultant per proyek

**Skema** — migrasi `add_project_consultant_pic`:
```
model ProjectConsultantPic { id, project_id, user_id, assigned_by, assigned_at
  @@unique([project_id, user_id]) @@index([project_id]) @@index([user_id]) }
```
Cermin dari `ProjectVendorVisibility` (`schema.prisma:268`).

**Backend**
- `backend/src/services/projectService.ts` — `assignConsultantPics()`, `listConsultantPics()`,
  `removeConsultantPic()`; removal takes effect immediately.
- Management authority: `ADMIN` and `PIC_PROJECT` may assign/remove. Use replace-all semantics in
  the form with an explicit confirmation when removing an existing PIC.
- `backend/src/services/accessScopeService.ts` — bila proyek **punya** minimal satu baris,
  aksi ber-scope PIC_CONSULTANT (terutama `assignReviewTeam`, `reviewService.ts:67`) hanya boleh
  dilakukan PIC yang terdaftar. Bila **tidak punya** baris sama sekali, jalankan aturan unit yang
  ada sekarang — ini fallback yang dikonfirmasi user, agar proyek berjalan tidak membeku saat deploy.
- `GET /projects/:projectId/consultant-pic-candidates` for the project form, restricted to
  `ADMIN/PIC_PROJECT` and the project owner scope. It returns only approved CONSULTANT users and
  includes name, unit, institution, and current assignment state. Avoid a broad unscoped `/users`
  endpoint.

**Frontend** — multi-select PIC di `ProjectFormPage.tsx` dan `ProjectEditPage.tsx`, menampilkan
nama · unit · institusi. Daftar penugasan ditampilkan di `ProjectDetailPage.tsx`.

**Selesai bila:** PIC_CONSULTANT yang tidak terdaftar pada proyek ber-penugasan ⇒ 403 saat assign
(test); pencabutan berlaku seketika; proyek tanpa baris penugasan berperilaku persis seperti
sebelum rilis (test regresi memakai fixture lama).

---

# 5. W2 — F6 edit flag pada comment sheet

**Hambatan yang harus dibereskan lebih dulu.** `saveCommentSheetItems`
(`backend/src/services/reviewService.ts:458`) melakukan `deleteMany` lalu `createMany`
(baris 491–493). Identitas item hilang tiap simpan, sehingga atribusi edit mustahil.

**Langkah**
1. **Ubah ke upsert per `seq_no`** dalam satu transaction: create untuk `seq_no` baru, update untuk
   yang ada (hanya bila teks berubah), and soft-delete rows yang hilang. `id` dipertahankan agar
   audit history tidak putus. Add optimistic version checking so two open tabs cannot silently
   overwrite each other.
2. Migrasi `add_comment_sheet_edit_tracking`:
   - Track ownership separately for `pln_comment` and `contractor_response`; a single row-level
     `author_id` is not sufficient.
   - `CommentSheetItemEdit { id, item_id, field, editor_id, editor_role, previous_text, new_text,
     edited_at }` plus a sequence/review snapshot for soft-deleted rows.
   - Historical author fields are nullable. Backfill only when `review.reviewer_id` exists; otherwise
     display “legacy owner unknown” rather than inventing attribution.
3. **Aturan penandaan (final):** per field, tandai bila `editor_role ∈ {CHECKER, APPROVER}` **dan**
   `editor_id != field_author_id`. Selain itu tidak ditandai — termasuk Reviewer menyunting
   tulisannya sendiri. Field ownership tidak berubah saat diedit orang lain.
4. **Buka akses Approver.** Saat ini `allowedRoles = [REVIEWER, CHECKER]` (`reviewService.ts:471`)
   — Approver sama sekali tidak bisa mengedit. Tambahkan APPROVER dengan syarat tahap `APPROVE` dan
   `review.approver_id === actorId`.
5. **UI** — `ReviewDetailPage.tsx`: badge "Edited" + tooltip (editor, peran, waktu, teks sebelumnya).
6. **PDF** — `backend/src/utils/pdfEngine/commentSheetGenerator.ts`: penanda yang sama pada baris
   yang diedit, agar cetakan konsisten dengan layar.

**Selesai bila:** menyimpan tanpa perubahan teks tidak membuat entri riwayat dan tidak mengubah
`id`; Checker mengubah salah satu field milik Reviewer ⇒ badge + satu entri field-specific; Reviewer
menyunting teksnya sendiri ⇒ tidak ada badge; deleted rows tetap punya audit history; Approver dapat
mengedit hanya pada tahap APPROVE; snapshot PDF memuat penanda.

---

# 6. W3 — F2 gerbang delegasi PIC_ENGINEER

State machine review **tidak berubah** (Reviewer→Checker→Approver). Yang ditambah adalah gerbang
sebelum tahap REVIEW boleh berjalan.

**Skema** — migrasi `add_pic_engineer_delegation`:
- `Role` + `PIC_ENGINEER`.
- `DocumentReview` + `delegated_engineer_id` (FK User, nullable), `delegated_by` (FK User, nullable),
  `delegated_at` (nullable). Tidak ada kolom keputusan, tidak ada `_qr_at`.
- `ActivityAction` + `REVIEW_DELEGATED`.

**Aturan**
1. Dokumen `SUBMITTED` masuk antrean "menunggu delegasi".
2. `addReviewerAndComments` (`reviewService.ts:124`) menolak (400) bila `delegated_at` masih null.
3. Delegasi **menetapkan reviewer**: `delegated_engineer_id` mengisi `review.reviewer_id`.
   `assignReviewTeam` milik PIC_CONSULTANT tetap menetapkan Checker/Approver, tetapi **tidak lagi
   menerima atau mengubah `reviewer_id`** — ini perubahan perilaku yang harus disebut di catatan
   rilis. The assignment payload becomes `{ checker_id, approver_id }`.
4. Re-delegasi diizinkan selama `reviewed_at` masih null; setiap perubahan tercatat di `ActivityLog`.
5. **Tidak ada aksi tolak** pada tahap ini.
6. `PIC_ENGINEER` must belong to the OWNER institution. “Project scope” means the same owner-unit
   scope used by the project dashboard; the selected REVIEWER must be APPROVED, CONSULTANT, and
   eligible for the document section's unit-level rule.
7. **SLA tetap mulai saat submit** — `calculateSlaDeadline(submittedAt)` di `slaService.ts:4` tidak
   berubah. Antrean delegasi menampilkan sisa hari SLA yang sudah berjalan, dan reminder ke Asman
   dihitung dari tanggal submit.

**API** — `POST /reviews/:reviewId/delegate`, `requireRole(PIC_ENGINEER)`,
body `{ engineer_id, note? }`. Validasi: engineer berstatus APPROVED, berperan REVIEWER, dan berada
dalam scope proyek.

**Notifikasi** (`getNotifications`, `reviewService.ts:891`) — target by user id, not only by role:
to the delegated engineer and the delegating PIC. Computed notifications may reuse the existing
model, but must filter by `delegated_engineer_id` / `delegated_by`; reminders must be deterministic
and deduplicated by review + reminder window.

**Frontend** — halaman antrean delegasi untuk PIC_ENGINEER (daftar + pemilih engineer + catatan),
badge "menunggu delegasi" pada detail review, kolom sisa SLA di antrean.

**Selesai bila:** review tanpa `delegated_at` menolak aksi reviewer (400, test); PIC_CONSULTANT
tidak lagi dapat menetapkan reviewer (403, test); re-delegasi setelah `reviewed_at` terisi ditolak;
deadline SLA untuk dokumen yang didelegasikan terlambat **tetap** dihitung dari tanggal submit
(test eksplisit — ini konsekuensi yang disengaja); engineer & PIC keduanya menerima notifikasi.

---

# 7. W4 — F5 Inspection Item pindah ke kontraktor

Membalik fase A1 `INTEGRATION_PLAN.md`.

**Skema** — migrasi `add_itp_item_comments`:
```
model ItpItemComment { id, itp_item_id, commenter_id, comment, created_at
  @@index([itp_item_id]) }
```

**Perpindahan kode**
- `getItpItems` / `saveItpItems` (`reviewService.ts:1190`, `:1202`) pindah ke
  `backend/src/services/documentService.ts`.
- Endpoint pindah dari `/reviews/*` ke `POST/GET /documents/:documentId/itp-items`,
  `requireRole(VENDOR)` untuk tulis.
- Endpoint komentar: `POST /documents/:documentId/itp-items/:itemId/comments`,
  `requireRole(REVIEWER, CHECKER, APPROVER)` plus CONSULTANT-institution validation; the item id must
  belong to the document id.
- Vendor write access is limited to the document's owning vendor context, not merely any Vendor with
  project visibility, unless an explicit project-level vendor collaboration rule exists.
- `buildItpItemScopeWhere` (`accessScopeService.ts:67`) menyesuaikan jalur baru.
- `backend/src/__tests__/reviewService.itpItems.test.ts` dipindah & ditulis ulang sebagai
  `documentService.itpItems.test.ts`.

**Aturan kunci (berubah)**
- Vendor boleh menulis saat `document.status ∈ {DRAFT, REJECTED_C}`.
- Terkunci sejak `SUBMITTED` — bukan lagi sejak final status.
- Konsultan tidak pernah boleh menulis item; hanya komentar. Komentar boleh pada tahap review mana pun.

**Copy-forward (wajib).** `createRevision` (`documentService.ts:141`) menyalin seluruh `ItpItem`
revisi sebelumnya ke dokumen revisi baru. Komentar **tidak** ikut disalin — tetap terbaca pada
revisi lama. Tanpa ini, kontraktor yang mengetik 80 item dan kena Status C harus mengetik ulang
semuanya.

**Revision UX decision:** creating a revision produces an editable `DRAFT`; the Vendor explicitly
submits it after checking the copied items and uploaded files. This removes the current surprise
where `createRevision()` immediately submits and locks the new document. The submit action remains
the SLA start point.

**Selesai bila:** vendor menulis pada DRAFT/REJECTED_C berhasil, pada SUBMITTED/IN_REVIEW/final ⇒
403; konsultan tulis item ⇒ 403, tulis komentar ⇒ 200; revisi N+1 lahir dengan item identik revisi N
dan tanpa komentar; endpoint integrasi `GET /api/integration/documents/:id` tetap mengembalikan
the existing role matrix (`sub_code`, `pp_code`, `pln_code`) and may add an aditif
`inspection_level` compatibility alias derived from `pln_code`; no existing field is renamed.

---

# 8. W5 — F1 multi-BoQ submission

Gelombang terbesar; satu-satunya yang butuh perubahan serempak di field-qc.

**Skema** — migrasi `add_document_boq_items`:
1. `DocumentBoqItem { id, document_id, boq_item_id, created_at @@unique([document_id, boq_item_id])
   @@index([boq_item_id]) }`.
2. `Document.boq_item_id` → `primary_boq_item_id` (tetap NOT NULL untuk sementara; dipakai penomoran
   dokumen & posisi di pohon BoQ).
3. Unique berubah menjadi `[primary_boq_item_id, section, doc_number, revision_no]`.
4. **Backfill idempoten:** satu baris join per dokumen eksisting (`document_id`, `boq_item_id` lama).
   Dijalankan sebagai bagian migrasi, dapat di-rerun tanpa duplikasi.

**Backend field-qa**
- `documentService.createDocument` menerima `boq_item_ids: string[]` (min 1); elemen pertama menjadi
  primary. `createRevision` mewarisi seluruh himpunan cakupan.
- `checkPhase1Prerequisites` (`documentService.ts:33`) dievaluasi terhadap seluruh item tercakup.
- `buildDocumentScopeWhere` / `buildBoqItemScopeWhere` (`accessScopeService.ts:55`, `:59`) beralih ke
  relasi join.
- `boqTreeService` menampilkan dokumen pada setiap item yang dicakupnya, ditandai "mencakup N item"
  agar tidak terlihat seperti duplikat.

**Integrasi (harus satu rilis dengan field-qa)**
- `GET /api/integration/boq-items/:id/qc-readiness` — resolusi berubah menjadi "dokumen mana yang
  mencakup item ini, per section, revisi berjalan". Existing response fields remain stable; any
  compatibility additions are additive, so `QaIntegrationModule` does not need a breaking read
  change.
- Status C pada dokumen N-item ⇒ readiness false untuk seluruh N (konsekuensi yang dikonfirmasi user).
- Add a QA inspection-result ledger (for example `BoqItemInspectionResult`) with unique
  `(report_id, boq_item_id)`, result/status, inspected_at, report number, and PDF reference. The
  UI derives the latest “Inspection done” badge from this ledger; it does not overwrite history.
- Write-back A4 `POST /api/integration/boq-items/:id/inspection-result` becomes fan-out: one QC
  report marks every BoQ item covered by its FIELD_ITP document. The field-qc retry queue carries
  `report_id`, `boq_item_id`, report number, and PDF reference, and is idempotent by
  `(report_id, boq_item_id)`.
- Readiness resolution is deterministic: one current document per section/item, ordered by revision;
  ambiguity is rejected and reported rather than silently choosing `findFirst()`.
- `checkPhase1Prerequisites` retains its existing Status A rule for Work Method creation; the QC
  readiness API remains the separate minimum-A-or-B gate.

**Frontend** — `DocumentUploadForm.tsx` menerima multi-select BoQ (saat ini `boqItemId: string`
tunggal, baris 11) dengan ringkasan cakupan; `DocumentDetailModal.tsx` menampilkan daftar item
tercakup.

**Revisi kedua salinan INTEGRATION_PLAN (commit yang sama)** — keputusan 3, 5, 16; fase A1, A2,
A4; §7; API payload/response and write-back compatibility window.

**Selesai bila:** migrasi bersih di atas salinan data produksi; dokumen 1-item dan N-item keduanya
menghasilkan readiness benar; Status C pada dokumen N-item ⇒ N readiness false (test); write-back
dua kali untuk report yang sama ⇒ satu update per item (test); walkthrough §6 INTEGRATION_PLAN
lolos ujung-ke-ujung.

---

# 9. Ringkasan migrasi

| Urutan | Nama | Butir |
|---|---|---|
| 1 | `add_review_markup_file` | F3 |
| 2 | `add_project_consultant_pic` | F4 |
| 3 | `add_comment_sheet_edit_tracking` | F6 |
| 4 | `add_pic_engineer_delegation` | F2 |
| 5 | `add_itp_item_comments` | F5 |
| 6 | `add_document_boq_items` | F1 |

F7 tidak butuh migrasi.

---

# 10. Gerbang regresi

Suite test field-qa yang ada adalah gerbangnya — tidak boleh ada perubahan perilaku workflow di luar
yang dinyatakan di dokumen ini. Tambahan wajib:

- `accessScope.test.ts` diperluas untuk `ProjectConsultantPic` (W1), authenticated file download,
  and relasi join dokumen (W5).
- Test baru: `reviewService.delegation.test.ts` (W3), `commentSheetEdit.test.ts` (W2),
  `documentService.itpItems.test.ts` (W4, pindahan), `documentBoqCoverage.test.ts` (W5).
- Snapshot PDF comment sheet untuk W2 (penanda Edited).
- Uji migrasi W5 di atas salinan data nyata sebelum rilis.
- Contract tests in both repositories for readiness, document item shape, and idempotent write-back.
- UX acceptance walkthrough: Vendor creates revision → reviews copied items → submits; Vendor can
  download review markup; Approver sees edit provenance; PIC sees only assigned project work.
- Dua perubahan perilaku yang **harus** masuk catatan rilis: PIC_CONSULTANT kehilangan kemampuan
  menetapkan reviewer (W3), dan Approver memperoleh kemampuan mengedit comment sheet (W2).

# 11. Contract decisions locked by this revision

- Revision creation is draft-first; submission is explicit and starts SLA.
- Comment-sheet edit provenance is field-specific, preserves deleted-row history, and uses optimistic
  locking.
- Review markup downloads are authenticated and scope-checked.
- PIC management is project-scoped, with immediate removal and explicit management authority.
- Delegation notifications target users, not broad roles.
- Multi-BoQ inspection write-back uses an auditable idempotent ledger in both repositories.

# 12. Di luar cakupan

- Perubahan field-qc selain yang dipaksa F1 (readiness resolution & write-back fan-out).
- Parsing Excel untuk `ItpItem` (tetap Iterasi 2 INTEGRATION_PLAN).
- Export Excel di layar selain beranda.
- Aksi tolak/kembalikan pada gerbang delegasi PIC_ENGINEER.
