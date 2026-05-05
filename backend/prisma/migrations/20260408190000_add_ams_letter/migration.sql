-- CreateTable
CREATE TABLE "AmsLetter" (
    "id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AmsLetter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AmsLetter_review_id_key" ON "AmsLetter"("review_id");

-- CreateIndex
CREATE INDEX "AmsLetter_review_id_idx" ON "AmsLetter"("review_id");

-- AddForeignKey
ALTER TABLE "AmsLetter" ADD CONSTRAINT "AmsLetter_review_id_fkey"
    FOREIGN KEY ("review_id") REFERENCES "DocumentReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmsLetter" ADD CONSTRAINT "AmsLetter_uploaded_by_fkey"
    FOREIGN KEY ("uploaded_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
