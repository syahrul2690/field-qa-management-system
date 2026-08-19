---
title: Rencana Implementasi Feedback End User — field-qa
date: 2026-08-18
status: draft — pending confirmation on 3 open items (§8)
source_basis: end-user feedback 2026-08-18 (7 butir) + jawaban klarifikasi; INTEGRATION_PLAN.md rev 2026-07-14; kode field-qa & field-qc pada working tree (uncommitted)
---

# 1. Ringkasan

Tujuh butir feedback, semuanya jatuh di **field-qa**. Dua di antaranya (multi-BoQ submission,
pemindahan Inspection Item ke kontraktor) mengubah asumsi inti INTEGRATION_PLAN dan wajib
diselesaikan sebelum fase QC lanjut. Sisanya terkontain.

Urutan eksekusi yang direkomendasikan:

| Gelombang | Butir | Alasan |
|---|---|---|
| **W0** | Commit/tag working tree kedua repo | A1–A3/B1–B3 masih uncommitted; F1 & F5 menimpanya |
| **W1** | F3 markup, F7 export Excel, F4 PIC_Consultant | Independen, aditif, tanpa perubahan state machine |
| **W2** | F6 edit flag comment sheet | Prasyarat: identitas item stabil (lihat §2.6) |
| **W3** | F2 PIC_ENGINEER sebagai approval step | Mengubah state machine review — dilakukan sendirian |
| **W4** | F5 Inspection Item → kontraktor | Sebelum data ITP bertambah di model kepemilikan lama |
| **W5** | F1 multi-BoQ submission + revisi INTEGRATION_PLAN | Migrasi terbesar, dampak lintas repo |

---

# 2. Rencana per butir

## 2.1 F1 — Satu submission dokumen untuk beberapa BoQ  *(W5, High)*

**Kondisi saat ini.** `Document.boq_item_id` FK wajib tunggal, dengan
`@@unique([boq_item_id, section, doc_number, revision_no])`. Seluruh query hilir memakai kunci itu.

**Perubahan.**
1. Tabel join `DocumentBoqItem (document_id, boq_item_id)`, unique pasangan, index dua arah.
2. `Document.boq_item_id` dipertahankan sementara sebagai `primary_boq_item_id` (nullable setelah
   backfill) untuk penomoran dokumen dan tampilan pohon BoQ; unique constraint dipindah ke
   `[primary_boq_item_id, section, doc_number, revision_no]`.
3. Migrasi backfill: satu baris join per dokumen eksisting. Idempoten, dapat di-rerun.
4. `buildDocumentScopeWhere` / `buildBoqItemScopeWhere` diubah ke relasi join.
5. UI upload: pemilih BoQ multi-select (minimal satu), dengan ringkasan "dokumen ini mencakup N item".

**Konsekuensi yang sudah dikonfirmasi user.** Status C pada satu dokumen memblokir **seluruh**
BoQ item yang dicakupnya. Ini menyederhanakan gate: readiness dihitung dari dokumen, bukan
diagregasi per item.

**Dampak integrasi (wajib bersamaan).**
- `GET /api/integration/boq-items/:id/qc-readiness` berubah dari lookup per item menjadi resolusi
  "dokumen mana yang mencakup item ini, per section" — masih mengembalikan bentuk respons yang sama,
  jadi field-qc tidak perlu berubah untuk membaca.
- Write-back A4 (`inspection-result`) menjadi fan-out: satu report QC yang disetujui menandai N BoQ
  item. Idempotensi tetap by report id, tapi kuncinya menjadi `(report_id, boq_item_id)`.
- INTEGRATION_PLAN keputusan 5 dan fase A2/A4 harus ditulis ulang di commit yang sama.

**Uji.** Migrasi bersih di atas salinan data nyata; readiness benar untuk dokumen 1-BoQ dan N-BoQ;
Status C pada dokumen N-BoQ ⇒ readiness false untuk semua N (test eksplisit); write-back sekali per
pasangan report×item.

## 2.2 F2 — PIC_ENGINEER sebagai approval step  *(W3, Medium)*

Dikonfirmasi user: **memblokir progres**, bukan sekadar notifikasi. Diisi Atasan (Asman terkait),
dan PIC ternotifikasi.

**Perubahan.**
1. `Role` + `PIC_ENGINEER`.
2. `DocumentReview` + `pic_engineer_id`, `pic_engineer_at`, `pic_engineer_qr_at`.
3. `getCurrentStage()` bertambah satu tahap; `assignReviewTeam` dapat menetapkan PIC_ENGINEER.
4. Endpoint `POST /reviews/:reviewId/engineer-endorse` (comment wajib, seperti tahap lain).
5. Comment-sheet PDF bertambah satu blok stempel QR.
6. Notifikasi ke PIC saat tahap masuk dan saat diputuskan.

**Asumsi yang harus dikonfirmasi (§8-a).** Posisi tahap: **setelah Approver, sebelum rilis AMS
letter** — karena Asman adalah atasan sisi Owner/PLN dan endorsement-nya membaca hasil review
konsultan yang sudah final. Alternatifnya PIC_ENGINEER mendahului Reviewer sebagai gerbang masuk.
Kedua opsi biayanya mirip, tapi artinya berbeda total; jangan dibangun sebelum dipastikan.

**Catatan risiko.** Semua query dashboard/pending/SLA memakai kombinasi timestamp tahap. Menambah
tahap menyentuh `getPendingReviews`, `getNotifications`, `slaService`, dan agregasi beranda. Kerjakan
terpisah dari butir lain agar regresi mudah dilokalisasi.

## 2.3 F3 — Upload hasil coret-coretan review  *(W1, Low)*

Model baru `ReviewMarkupFile (review_id, stage, uploaded_by, file_name, file_path, file_size,
mime_type, created_at)`, mengikuti pola `AmsLetter`. Upload oleh Reviewer/Checker/Approver
(dan PIC_ENGINEER setelah F2) pada tahap masing-masing; dapat diunduh vendor bersama comment sheet.
Multi-file, PDF/gambar. Tidak menyentuh state machine.

## 2.4 F4 — Pemilihan PIC_Consultant (Pusmanpro) sebagai batas aksi  *(W1, Medium)*

Role `PIC_CONSULTANT` sudah ada dan sudah menugaskan tim review, tetapi belum ada ikatan per proyek —
kewenangan sekarang diturunkan dari aturan unit di `accessScopeService.ts`.

Tambah `ProjectConsultantPic (project_id, user_id, assigned_by, assigned_at)`, cermin dari
`ProjectVendorVisibility`. `assignReviewTeam` dan seluruh aksi ber-scope PIC_CONSULTANT memeriksa
keanggotaan tabel ini. UI: pemilih PIC pada form proyek (multi, minimal satu).

**Uji.** PIC_CONSULTANT yang tidak ditugaskan ⇒ 403 pada assign/aksi proyek tsb; PIC lama yang
dicabut kehilangan akses langsung; tidak ada regresi pada proyek yang belum punya baris penugasan
(default: perilaku lama sampai baris pertama dibuat — hindari mengunci seluruh proyek eksisting).

## 2.5 F5 — Inspection Item dipindah ke role Kontraktor  *(W4, High)*

Membalik fase A1 INTEGRATION_PLAN. Dikonfirmasi user: konsultan **hanya boleh berkomentar**, tidak
mengedit.

**Perubahan.**
1. Kepemilikan tulis `ItpItem` → VENDOR, saat dokumen berstatus DRAFT atau setelah REJECTED_C.
2. Batas kunci bergeser: terkunci saat `SUBMITTED` (bukan saat final status).
3. `saveItpItems` pindah dari `reviewService` ke `documentService`; endpoint pindah dari
   `/reviews/*` ke `/documents/:id/itp-items`; `requireRole(VENDOR)`.
4. Komentar konsultan per item: `ItpItemComment (itp_item_id, commenter_id, comment, created_at)`,
   read-only bagi vendor sampai revisi berikutnya.
5. **Copy-forward wajib.** Revisi baru saat ini memulai dengan set item kosong. Itu tertahankan
   ketika konsultan mengetik 5 item; fatal ketika kontraktor mengetik 80 lalu kena Status C. Saat
   `reviseDocument`, salin seluruh `ItpItem` revisi sebelumnya ke revisi baru, komentar tidak ikut
   disalin (tetap queryable pada revisi lama).

**Uji.** Vendor dapat menulis pada DRAFT/REJECTED_C, 403 saat SUBMITTED/IN_REVIEW/final; konsultan
403 pada tulis item, 200 pada tulis komentar; revisi N+1 lahir dengan item identik revisi N;
item revisi lama tetap terbaca oleh endpoint integrasi.

## 2.6 F6 — Edit flag pada comment sheet  *(W2, Medium)*

Dikonfirmasi user: begitu **Checker atau Approver** mengubah sesuatu di comment sheet, riwayat
komentar menandai "Edited" beserta user yang mengedit.

**Hambatan yang ditemukan di kode.** `saveCommentSheetItems` melakukan *delete-all lalu
re-create* (`reviewService.ts:491`). Identitas item hilang setiap simpan, sehingga "item ini diedit
oleh X" tidak mungkin dinyatakan. Ini harus diperbaiki lebih dulu.

**Perubahan.**
1. `saveCommentSheetItems` diubah menjadi upsert per `seq_no` (create/update/delete selisih),
   mempertahankan `id`.
2. `CommentSheetItem` + `original_pln_comment`, `is_edited`, `last_edited_by`, `last_edited_at`.
3. `CommentSheetItemEdit (item_id, editor_id, editor_role, previous_text, new_text, edited_at)` —
   riwayat penuh, karena "Edited" tanpa isi perubahan sulit diaudit.
4. **Approver saat ini tidak boleh mengedit sama sekali** (`allowedRoles = [REVIEWER, CHECKER]`,
   `reviewService.ts:471`). Daftar role diperluas ke APPROVER dengan aturan tahap `APPROVE`.
5. UI: badge "Edited" + tooltip (editor, waktu, teks sebelumnya); comment-sheet PDF menampilkan
   penanda yang sama agar dokumen cetak konsisten dengan layar.

**Uji.** Edit oleh Checker menyisakan `id` item tidak berubah; badge muncul hanya untuk item yang
benar-benar berubah teksnya (bukan reorder); edit oleh Reviewer pada tahap REVIEW **tidak**
menandai Edited (itu penulisan awal, bukan revisi) — konfirmasi §8-b.

## 2.7 F7 — Download Excel pada Beranda  *(W1, Low)*

Target: `frontend/src/features/dashboard/DashboardPage.tsx` (beranda). ExcelJS sudah menjadi
dependensi backend (parser BoQ), jadi biayanya rendah.

Endpoint `GET /dashboard/export.xlsx` yang memakai **query dan scope yang sama persis** dengan
endpoint dashboard, agar RBAC tidak bisa ditembus lewat export. Tiga sheet:

| Sheet | Isi |
|---|---|
| Ringkasan | metrik `summary` (total proyek/dokumen, sisa, overdue, completion rate, durasi review avg/min/max, AMS released) |
| Proyek | satu baris per proyek: nama, tipe, urgency, tanggal efektif, end date, total/selesai/sisa dokumen, % penyelesaian, breakdown status A/B/C/In Review/Submitted/Draft, jumlah overdue, avg durasi, jumlah AMS |
| Overdue | satu baris per review terlambat: proyek, doc number, judul, section, tahap, SLA deadline, hari terlambat |

Nama file `Monitoring_YYYY-MM-DD.xlsx`. Header dibekukan, kolom auto-width, tanggal sebagai tipe
tanggal (bukan string).

---

# 3. Ringkasan perubahan skema

| Objek | Jenis | Butir |
|---|---|---|
| `DocumentBoqItem` | tabel baru | F1 |
| `Document.primary_boq_item_id` + unique baru | ubah | F1 |
| `Role.PIC_ENGINEER` | enum | F2 |
| `DocumentReview.pic_engineer_id/_at/_qr_at` | kolom | F2 |
| `ReviewMarkupFile` | tabel baru | F3 |
| `ProjectConsultantPic` | tabel baru | F4 |
| `ItpItemComment` | tabel baru | F5 |
| `CommentSheetItem.original_pln_comment/is_edited/last_edited_by/last_edited_at` | kolom | F6 |
| `CommentSheetItemEdit` | tabel baru | F6 |

Sembilan migrasi terpisah, satu per butir, tidak digabung — agar tiap gelombang dapat dirilis dan
di-rollback sendiri.

# 4. Dampak ke INTEGRATION_PLAN

Harus direvisi bersamaan dengan W4–W5:
- Keputusan 3 & fase A1: kepemilikan ItpItem berubah (konsultan → kontraktor), aturan kunci berubah.
- Keputusan 5 & fase A2: readiness gate menjadi berbasis dokumen-mencakup-N-item.
- Fase A4 & keputusan 16: write-back menjadi fan-out, kunci idempotensi `(report_id, boq_item_id)`.
- §7 catatan `QcRole`: pemetaan yang tertulis salah. Enum nyata di field-qa adalah
  `SUPERVISOR | INSPECTOR | QC_ENGINEER | QC_LEAD`, bukan `SUB_KONTRAKTOR | FIELD_INSPECTOR |
  SITE_MANAGER`. Perbaiki saat A3 dikerjakan ulang.

# 5. Yang TIDAK termasuk

- Perubahan apa pun di field-qc selain penyesuaian yang dipaksa F1 (readiness & write-back).
- Parsing Excel untuk ItpItem (tetap Iterasi 2).
- Export Excel di layar selain beranda.

# 6. Gerbang regresi

Suite test field-qa yang ada adalah gerbangnya: tidak boleh ada perubahan perilaku workflow selain
yang dinyatakan di sini. Tambahan wajib per gelombang: test migrasi F1 di atas salinan data nyata,
dan snapshot comment-sheet PDF untuk F2/F6 (stempel dan penanda Edited).

# 7. Estimasi urutan kerja

W1 (F3+F7+F4) dapat berjalan paralel — tidak saling menyentuh file. W2–W5 berurutan; W5 paling
lama karena migrasi data dan revisi lintas repo.

# 8. Item terbuka — perlu jawaban sebelum gelombang terkait dimulai

a. **F2:** PIC_ENGINEER duduk di mana — setelah Approver (asumsi kerja saat ini) atau sebelum
   Reviewer? Boleh menolak, atau hanya menyetujui?
b. **F6:** apakah "Edited" hanya berlaku untuk perubahan oleh Checker/Approver atas komentar yang
   ditulis Reviewer, atau juga saat Reviewer mengedit tulisannya sendiri?
c. **F4:** untuk proyek yang sudah ada dan belum punya penugasan PIC_Consultant — pertahankan
   perilaku lama (asumsi kerja), atau kunci sampai admin menugaskan?
