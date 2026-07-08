-- AlterTable
-- These columns exist in schema.prisma since the initial commit but were
-- never included in a tracked migration (added to dev DBs via `db push`),
-- so `prisma migrate deploy` never created them in production.
ALTER TABLE "DocumentReview" ADD COLUMN IF NOT EXISTS "reviewer_qr_at" TIMESTAMP(3);
ALTER TABLE "DocumentReview" ADD COLUMN IF NOT EXISTS "checker_qr_at" TIMESTAMP(3);
ALTER TABLE "DocumentReview" ADD COLUMN IF NOT EXISTS "approver_qr_at" TIMESTAMP(3);
