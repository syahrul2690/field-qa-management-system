-- Project-scoped consultant PIC assignment.
CREATE TABLE "ProjectConsultantPic" (
  "id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "consultant_id" TEXT NOT NULL,
  "assigned_by" TEXT NOT NULL,
  "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ProjectConsultantPic_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProjectConsultantPic_project_id_consultant_id_key"
  ON "ProjectConsultantPic"("project_id", "consultant_id");
CREATE INDEX "ProjectConsultantPic_project_id_idx"
  ON "ProjectConsultantPic"("project_id");
CREATE INDEX "ProjectConsultantPic_consultant_id_idx"
  ON "ProjectConsultantPic"("consultant_id");

ALTER TABLE "ProjectConsultantPic"
  ADD CONSTRAINT "ProjectConsultantPic_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectConsultantPic"
  ADD CONSTRAINT "ProjectConsultantPic_consultant_id_fkey"
  FOREIGN KEY ("consultant_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
