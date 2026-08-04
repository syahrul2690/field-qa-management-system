-- Fixes drift introduced by 20260409100000_add_ams_letter_metadata, which created
-- ams_date as TIMESTAMPTZ while schema.prisma has always declared it as `DateTime?`
-- (Prisma's default TIMESTAMP(3), no time zone). Unrelated to the ITP items feature —
-- split out so it isn't misattributed to that change.
ALTER TABLE "AmsLetter" ALTER COLUMN "ams_date" SET DATA TYPE TIMESTAMP(3);
