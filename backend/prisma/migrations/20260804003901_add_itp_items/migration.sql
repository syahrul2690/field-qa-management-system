-- CreateEnum
CREATE TYPE "InspectionLevel" AS ENUM ('H', 'W', 'SW', 'R', 'A', 'P');

-- CreateEnum
CREATE TYPE "ItpPhase" AS ENUM ('SHOP', 'FIELD', 'COMMISSIONING');

-- CreateEnum
CREATE TYPE "ItpCategory" AS ENUM ('SIPIL', 'ELEKTRIKAL', 'MEKANIKAL', 'INSTRUMEN_KONTROL');

-- CreateTable
CREATE TABLE "ItpItem" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "seq_no" INTEGER NOT NULL,
    "activity" TEXT NOT NULL,
    "acceptance_criteria" TEXT,
    "reference_standard" TEXT,
    "verifying_document" TEXT,
    "sub_code" "InspectionLevel",
    "pp_code" "InspectionLevel",
    "pln_code" "InspectionLevel",
    "phase" "ItpPhase" NOT NULL DEFAULT 'FIELD',
    "category" "ItpCategory" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItpItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ItpItem_document_id_idx" ON "ItpItem"("document_id");

-- CreateIndex
CREATE UNIQUE INDEX "ItpItem_document_id_seq_no_key" ON "ItpItem"("document_id", "seq_no");

-- AddForeignKey
ALTER TABLE "ItpItem" ADD CONSTRAINT "ItpItem_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
