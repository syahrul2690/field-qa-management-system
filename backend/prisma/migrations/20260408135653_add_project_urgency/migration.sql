-- CreateEnum
CREATE TYPE "ProjectUrgency" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "urgency" "ProjectUrgency" NOT NULL DEFAULT 'MEDIUM';
