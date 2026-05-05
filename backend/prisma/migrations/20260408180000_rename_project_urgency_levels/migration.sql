-- Step 1: Drop the column default (it depends on the enum type)
ALTER TABLE "Project" ALTER COLUMN "urgency" DROP DEFAULT;

-- Step 2: Cast column to text so we can remap values freely
ALTER TABLE "Project" ALTER COLUMN "urgency" TYPE TEXT;

-- Step 3: Remap existing values (old → new)
UPDATE "Project" SET "urgency" = 'NORMAL'            WHERE "urgency" = 'LOW';
UPDATE "Project" SET "urgency" = 'RUPTL'             WHERE "urgency" = 'MEDIUM';
UPDATE "Project" SET "urgency" = 'KERAWANAN_SISTEM'  WHERE "urgency" = 'HIGH';
UPDATE "Project" SET "urgency" = 'KINERJA_KORPORAT'  WHERE "urgency" = 'CRITICAL';

-- Step 4: Drop old enum type (no dependents remain)
DROP TYPE "ProjectUrgency";

-- Step 5: Create new enum type
CREATE TYPE "ProjectUrgency" AS ENUM ('NORMAL', 'RUPTL', 'KERAWANAN_SISTEM', 'KINERJA_KORPORAT');

-- Step 6: Cast column back to new enum and restore default + NOT NULL
ALTER TABLE "Project" ALTER COLUMN "urgency" TYPE "ProjectUrgency" USING "urgency"::"ProjectUrgency";
ALTER TABLE "Project" ALTER COLUMN "urgency" SET DEFAULT 'NORMAL'::"ProjectUrgency";
ALTER TABLE "Project" ALTER COLUMN "urgency" SET NOT NULL;
