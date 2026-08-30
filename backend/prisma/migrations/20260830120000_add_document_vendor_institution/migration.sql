-- Preserve the vendor tenant that uploaded each document. This is a
-- historical ownership snapshot and must not follow later project assignment
-- changes.
ALTER TABLE "Document" ADD COLUMN "vendor_institution_id" TEXT;

UPDATE "Document" d
SET "vendor_institution_id" = u."institution_id"
FROM "User" u
WHERE d."uploaded_by" = u."id"
  AND d."vendor_institution_id" IS NULL;

-- Every existing Document has an uploader (enforced by the existing FK), so
-- an unset value indicates corrupt/incomplete legacy data rather than a valid
-- tenant. Fail migration instead of silently assigning the wrong institution.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Document" WHERE "vendor_institution_id" IS NULL) THEN
    RAISE EXCEPTION 'Cannot backfill Document.vendor_institution_id for all documents';
  END IF;
END $$;

ALTER TABLE "Document" ALTER COLUMN "vendor_institution_id" SET NOT NULL;
ALTER TABLE "Document"
  ADD CONSTRAINT "Document_vendor_institution_id_fkey"
  FOREIGN KEY ("vendor_institution_id") REFERENCES "Institution"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "Document_vendor_institution_id_idx" ON "Document"("vendor_institution_id");
