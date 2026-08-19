CREATE TABLE "BoqItemInspectionResult" (
  "id" TEXT NOT NULL,
  "boq_item_id" TEXT NOT NULL,
  "inspection_report_id" TEXT NOT NULL,
  "revision_no" INTEGER,
  "status" TEXT NOT NULL,
  "result" TEXT,
  "report_pdf_url" TEXT,
  "payload" JSONB,
  "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "BoqItemInspectionResult_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BoqItemInspectionResult_boq_item_id_inspection_report_id_key"
  ON "BoqItemInspectionResult"("boq_item_id", "inspection_report_id");
CREATE INDEX "BoqItemInspectionResult_boq_item_id_updated_at_idx"
  ON "BoqItemInspectionResult"("boq_item_id", "updated_at");
CREATE INDEX "BoqItemInspectionResult_inspection_report_id_idx"
  ON "BoqItemInspectionResult"("inspection_report_id");

ALTER TABLE "BoqItemInspectionResult"
  ADD CONSTRAINT "BoqItemInspectionResult_boq_item_id_fkey"
  FOREIGN KEY ("boq_item_id") REFERENCES "BoqItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
