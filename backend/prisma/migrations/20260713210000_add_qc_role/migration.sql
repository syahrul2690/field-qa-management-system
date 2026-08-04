-- CreateEnum
CREATE TYPE "QcRole" AS ENUM ('SUPERVISOR', 'INSPECTOR', 'QC_ENGINEER', 'QC_LEAD');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "qc_role" "QcRole";
