-- CreateTable
-- CommentSheetItem has existed in schema.prisma since the initial commit and
-- was present in dev databases (added via db push), but no tracked migration
-- ever created it, so `prisma migrate deploy` never created it in production.
CREATE TABLE IF NOT EXISTS "CommentSheetItem" (
    "id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "seq_no" INTEGER NOT NULL,
    "pln_comment" TEXT NOT NULL,
    "contractor_response" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommentSheetItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CommentSheetItem_review_id_idx" ON "CommentSheetItem"("review_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CommentSheetItem_review_id_seq_no_key" ON "CommentSheetItem"("review_id", "seq_no");

-- AddForeignKey
ALTER TABLE "CommentSheetItem" ADD CONSTRAINT "CommentSheetItem_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "DocumentReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
