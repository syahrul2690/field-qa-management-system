-- CreateEnum
CREATE TYPE "InstitutionType" AS ENUM ('OWNER', 'CONSULTANT', 'VENDOR');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PIC_PROJECT', 'VENDOR', 'REVIEWER', 'CHECKER', 'APPROVER', 'VIEWER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('TRANSMISSION', 'DISTRIBUTION', 'SUBSTATION', 'GENERATION', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentSection" AS ENUM ('FIELD_ITP', 'PROCEDURE', 'WORK_METHOD');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED_A', 'APPROVED_WITH_COMMENTS_B', 'REJECTED_C', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('LOGIN', 'LOGOUT', 'REGISTER', 'USER_APPROVED', 'USER_REJECTED', 'PROJECT_CREATED', 'PROJECT_UPDATED', 'PROJECT_AMENDED', 'BOQ_UPLOADED', 'DOCUMENT_UPLOADED', 'DOCUMENT_REVISED', 'REVIEW_SUBMITTED', 'REVIEW_COMMENTED', 'REVIEW_CHECKED', 'REVIEW_APPROVED', 'REVIEW_REJECTED');

-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "InstitutionType" NOT NULL,
    "address" TEXT,
    "logo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "institution_id" TEXT NOT NULL,
    "parent_unit_id" TEXT,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "institution_id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "refresh_token_expires" TIMESTAMP(3),
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "contract_signing_date" TIMESTAMP(3) NOT NULL,
    "contract_effective_date" TIMESTAMP(3) NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "warranty_period_days" INTEGER NOT NULL,
    "project_type" "ProjectType" NOT NULL,
    "nominal_values" JSONB NOT NULL,
    "owner_unit_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectAmendment" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "amendment_no" INTEGER NOT NULL,
    "amendment_reason" TEXT NOT NULL,
    "effective_date" TIMESTAMP(3) NOT NULL,
    "previous_duration_days" INTEGER,
    "previous_nominal_values" JSONB,
    "new_duration_days" INTEGER,
    "new_nominal_values" JSONB,
    "amended_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectAmendment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectVendorVisibility" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "vendor_institution_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigned_by" TEXT NOT NULL,

    CONSTRAINT "ProjectVendorVisibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoqItem" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "parent_item_id" TEXT,
    "level" INTEGER NOT NULL,
    "item_code" TEXT NOT NULL,
    "system_tag" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoqItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "boq_item_id" TEXT NOT NULL,
    "section" "DocumentSection" NOT NULL,
    "doc_number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "surat_pengantar_no" TEXT,
    "revision_no" INTEGER NOT NULL DEFAULT 0,
    "status" "ReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "uploaded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentFile" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentReview" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "reviewer_id" TEXT,
    "checker_id" TEXT,
    "approver_id" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "sla_deadline" TIMESTAMP(3),
    "reviewed_at" TIMESTAMP(3),
    "checked_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "final_status" "ReviewStatus",
    "comment_sheet_path" TEXT,
    "qr_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewComment" (
    "id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "commenter_id" TEXT NOT NULL,
    "page_ref" TEXT,
    "comment" TEXT NOT NULL,
    "disposition" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" "ActivityAction" NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "metadata" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Institution_type_idx" ON "Institution"("type");

-- CreateIndex
CREATE INDEX "Unit_institution_id_parent_unit_id_idx" ON "Unit"("institution_id", "parent_unit_id");

-- CreateIndex
CREATE INDEX "Unit_level_idx" ON "Unit"("level");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_institution_id_unit_id_idx" ON "User"("institution_id", "unit_id");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "Project_owner_unit_id_idx" ON "Project"("owner_unit_id");

-- CreateIndex
CREATE INDEX "ProjectAmendment_project_id_idx" ON "ProjectAmendment"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectAmendment_project_id_amendment_no_key" ON "ProjectAmendment"("project_id", "amendment_no");

-- CreateIndex
CREATE INDEX "ProjectVendorVisibility_project_id_idx" ON "ProjectVendorVisibility"("project_id");

-- CreateIndex
CREATE INDEX "ProjectVendorVisibility_vendor_institution_id_idx" ON "ProjectVendorVisibility"("vendor_institution_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectVendorVisibility_project_id_vendor_institution_id_key" ON "ProjectVendorVisibility"("project_id", "vendor_institution_id");

-- CreateIndex
CREATE UNIQUE INDEX "BoqItem_system_tag_key" ON "BoqItem"("system_tag");

-- CreateIndex
CREATE INDEX "BoqItem_project_id_parent_item_id_idx" ON "BoqItem"("project_id", "parent_item_id");

-- CreateIndex
CREATE INDEX "BoqItem_project_id_level_idx" ON "BoqItem"("project_id", "level");

-- CreateIndex
CREATE UNIQUE INDEX "BoqItem_project_id_item_code_key" ON "BoqItem"("project_id", "item_code");

-- CreateIndex
CREATE INDEX "Document_boq_item_id_section_is_current_idx" ON "Document"("boq_item_id", "section", "is_current");

-- CreateIndex
CREATE INDEX "Document_status_idx" ON "Document"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Document_boq_item_id_section_doc_number_revision_no_key" ON "Document"("boq_item_id", "section", "doc_number", "revision_no");

-- CreateIndex
CREATE INDEX "DocumentFile_document_id_idx" ON "DocumentFile"("document_id");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentReview_qr_hash_key" ON "DocumentReview"("qr_hash");

-- CreateIndex
CREATE INDEX "DocumentReview_document_id_idx" ON "DocumentReview"("document_id");

-- CreateIndex
CREATE INDEX "DocumentReview_reviewer_id_idx" ON "DocumentReview"("reviewer_id");

-- CreateIndex
CREATE INDEX "DocumentReview_checker_id_idx" ON "DocumentReview"("checker_id");

-- CreateIndex
CREATE INDEX "DocumentReview_approver_id_idx" ON "DocumentReview"("approver_id");

-- CreateIndex
CREATE INDEX "DocumentReview_final_status_idx" ON "DocumentReview"("final_status");

-- CreateIndex
CREATE INDEX "DocumentReview_sla_deadline_idx" ON "DocumentReview"("sla_deadline");

-- CreateIndex
CREATE INDEX "ReviewComment_review_id_idx" ON "ReviewComment"("review_id");

-- CreateIndex
CREATE INDEX "ActivityLog_user_id_idx" ON "ActivityLog"("user_id");

-- CreateIndex
CREATE INDEX "ActivityLog_action_idx" ON "ActivityLog"("action");

-- CreateIndex
CREATE INDEX "ActivityLog_entity_type_entity_id_idx" ON "ActivityLog"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "ActivityLog_created_at_idx" ON "ActivityLog"("created_at");

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_parent_unit_id_fkey" FOREIGN KEY ("parent_unit_id") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_owner_unit_id_fkey" FOREIGN KEY ("owner_unit_id") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAmendment" ADD CONSTRAINT "ProjectAmendment_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVendorVisibility" ADD CONSTRAINT "ProjectVendorVisibility_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVendorVisibility" ADD CONSTRAINT "ProjectVendorVisibility_vendor_institution_id_fkey" FOREIGN KEY ("vendor_institution_id") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoqItem" ADD CONSTRAINT "BoqItem_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoqItem" ADD CONSTRAINT "BoqItem_parent_item_id_fkey" FOREIGN KEY ("parent_item_id") REFERENCES "BoqItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_boq_item_id_fkey" FOREIGN KEY ("boq_item_id") REFERENCES "BoqItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentFile" ADD CONSTRAINT "DocumentFile_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentReview" ADD CONSTRAINT "DocumentReview_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentReview" ADD CONSTRAINT "DocumentReview_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentReview" ADD CONSTRAINT "DocumentReview_checker_id_fkey" FOREIGN KEY ("checker_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentReview" ADD CONSTRAINT "DocumentReview_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewComment" ADD CONSTRAINT "ReviewComment_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "DocumentReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewComment" ADD CONSTRAINT "ReviewComment_commenter_id_fkey" FOREIGN KEY ("commenter_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
