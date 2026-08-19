ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'PIC_ENGINEER';
ALTER TYPE "ActivityAction" ADD VALUE IF NOT EXISTS 'REVIEW_DELEGATED';

ALTER TABLE "DocumentReview"
  ADD COLUMN "delegated_engineer_id" TEXT,
  ADD COLUMN "delegated_by" TEXT,
  ADD COLUMN "delegated_at" TIMESTAMP(3);

CREATE INDEX "DocumentReview_delegated_engineer_id_idx"
  ON "DocumentReview"("delegated_engineer_id");
CREATE INDEX "DocumentReview_delegated_by_idx"
  ON "DocumentReview"("delegated_by");

ALTER TABLE "DocumentReview"
  ADD CONSTRAINT "DocumentReview_delegated_engineer_id_fkey"
  FOREIGN KEY ("delegated_engineer_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DocumentReview"
  ADD CONSTRAINT "DocumentReview_delegated_by_fkey"
  FOREIGN KEY ("delegated_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
