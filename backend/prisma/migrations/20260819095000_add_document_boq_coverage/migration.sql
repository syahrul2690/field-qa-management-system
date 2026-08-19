CREATE TABLE "DocumentBoqItem" (
  "id" TEXT NOT NULL,
  "document_id" TEXT NOT NULL,
  "boq_item_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "DocumentBoqItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DocumentBoqItem_document_id_boq_item_id_key"
  ON "DocumentBoqItem"("document_id", "boq_item_id");
CREATE INDEX "DocumentBoqItem_boq_item_id_idx" ON "DocumentBoqItem"("boq_item_id");

INSERT INTO "DocumentBoqItem" ("id", "document_id", "boq_item_id")
SELECT gen_random_uuid()::text, "id", "boq_item_id"
FROM "Document"
ON CONFLICT ("document_id", "boq_item_id") DO NOTHING;

ALTER TABLE "DocumentBoqItem"
  ADD CONSTRAINT "DocumentBoqItem_document_id_fkey"
  FOREIGN KEY ("document_id") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentBoqItem"
  ADD CONSTRAINT "DocumentBoqItem_boq_item_id_fkey"
  FOREIGN KEY ("boq_item_id") REFERENCES "BoqItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
