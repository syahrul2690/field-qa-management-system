-- Add AMS letter metadata fields: number, date, title
ALTER TABLE "AmsLetter"
  ADD COLUMN "ams_number" TEXT,
  ADD COLUMN "ams_date"   TIMESTAMPTZ,
  ADD COLUMN "ams_title"  TEXT;
