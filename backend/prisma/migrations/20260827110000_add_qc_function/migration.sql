-- Additive PowerQC workflow permission. Institution type continues to define
-- the organization side; this value defines the user's function in that side.
CREATE TYPE "QcFunction" AS ENUM ('MAKER', 'CHECKER', 'APPROVER', 'ADMIN');

ALTER TABLE "User" ADD COLUMN "qc_function" "QcFunction";

-- Preserve the unambiguous portion of the legacy role model. MAKER and ADMIN
-- have no safe equivalent in QcRole and must be assigned explicitly by an admin.
UPDATE "User"
SET "qc_function" = 'CHECKER'
WHERE "qc_role" IN ('INSPECTOR', 'QC_ENGINEER');

UPDATE "User"
SET "qc_function" = 'APPROVER'
WHERE "qc_role" IN ('SUPERVISOR', 'QC_LEAD');
