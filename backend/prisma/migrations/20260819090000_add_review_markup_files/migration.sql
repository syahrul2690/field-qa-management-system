-- Secure review markup attachments. Files are served through an authenticated
-- controller; this table intentionally stores only relative paths.
CREATE TYPE "ReviewMarkupStage" AS ENUM ('REVIEW', 'CHECK', 'APPROVE');

CREATE TABLE "ReviewMarkupFile" (
  "id" TEXT NOT NULL,
  "review_id" TEXT NOT NULL,
  "uploaded_by" TEXT NOT NULL,
  "stage" "ReviewMarkupStage" NOT NULL,
  "file_name" TEXT NOT NULL,
  "file_path" TEXT NOT NULL,
  "file_size" INTEGER NOT NULL,
  "mime_type" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ReviewMarkupFile_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ReviewMarkupFile_review_id_stage_created_at_idx"
  ON "ReviewMarkupFile"("review_id", "stage", "created_at");
CREATE INDEX "ReviewMarkupFile_uploaded_by_idx"
  ON "ReviewMarkupFile"("uploaded_by");

ALTER TABLE "ReviewMarkupFile"
  ADD CONSTRAINT "ReviewMarkupFile_review_id_fkey"
  FOREIGN KEY ("review_id") REFERENCES "DocumentReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReviewMarkupFile"
  ADD CONSTRAINT "ReviewMarkupFile_uploaded_by_fkey"
  FOREIGN KEY ("uploaded_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
