ALTER TABLE "CommentSheetItem"
  ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "deleted_at" TIMESTAMP(3),
  ADD COLUMN "deleted_by" TEXT;

CREATE INDEX "CommentSheetItem_review_id_deleted_at_idx"
  ON "CommentSheetItem"("review_id", "deleted_at");

CREATE TABLE "CommentSheetItemAudit" (
  "id" TEXT NOT NULL,
  "review_id" TEXT NOT NULL,
  "item_id" TEXT,
  "field_name" TEXT NOT NULL,
  "old_value" TEXT,
  "new_value" TEXT,
  "changed_by" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CommentSheetItemAudit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CommentSheetItemAudit_review_id_created_at_idx"
  ON "CommentSheetItemAudit"("review_id", "created_at");
CREATE INDEX "CommentSheetItemAudit_item_id_created_at_idx"
  ON "CommentSheetItemAudit"("item_id", "created_at");

ALTER TABLE "CommentSheetItemAudit"
  ADD CONSTRAINT "CommentSheetItemAudit_review_id_fkey"
  FOREIGN KEY ("review_id") REFERENCES "DocumentReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommentSheetItemAudit"
  ADD CONSTRAINT "CommentSheetItemAudit_item_id_fkey"
  FOREIGN KEY ("item_id") REFERENCES "CommentSheetItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CommentSheetItemAudit"
  ADD CONSTRAINT "CommentSheetItemAudit_changed_by_fkey"
  FOREIGN KEY ("changed_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
