-- CreateTable
CREATE TABLE "AiProjectSummary" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "summary" JSONB NOT NULL,
    "model_used" TEXT NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "token_usage" INTEGER,

    CONSTRAINT "AiProjectSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiDocumentAnalysis" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "revision_no" INTEGER NOT NULL,
    "analysis" JSONB NOT NULL,
    "model_used" TEXT NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "token_usage" INTEGER,

    CONSTRAINT "AiDocumentAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiProjectSummary_project_id_key" ON "AiProjectSummary"("project_id");

-- CreateIndex
CREATE INDEX "AiProjectSummary_project_id_idx" ON "AiProjectSummary"("project_id");

-- CreateIndex
CREATE INDEX "AiDocumentAnalysis_document_id_idx" ON "AiDocumentAnalysis"("document_id");

-- CreateIndex
CREATE UNIQUE INDEX "AiDocumentAnalysis_document_id_revision_no_key" ON "AiDocumentAnalysis"("document_id", "revision_no");

-- AddForeignKey
ALTER TABLE "AiProjectSummary" ADD CONSTRAINT "AiProjectSummary_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiDocumentAnalysis" ADD CONSTRAINT "AiDocumentAnalysis_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
