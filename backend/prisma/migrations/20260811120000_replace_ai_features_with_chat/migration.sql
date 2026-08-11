-- Replaces the two one-shot AI features (project summary card, document review
-- assistant) with a tool-calling chat assistant.
--
-- AiProjectSummary and AiDocumentAnalysis were caches for those features. Both
-- lose their only readers in this change, so they are dropped rather than left
-- to accumulate rows. The cached payloads are regenerable and carry no data not
-- derivable from the source records, so no backfill is needed.

-- DropTable
DROP TABLE "AiProjectSummary";

-- DropTable
DROP TABLE "AiDocumentAnalysis";

-- CreateEnum
CREATE TYPE "ChatRole" AS ENUM ('USER', 'ASSISTANT', 'TOOL');

-- CreateTable
CREATE TABLE "ChatConversation" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT,
    "project_id" TEXT,
    "scope_fingerprint" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "seq_no" INTEGER NOT NULL,
    "role" "ChatRole" NOT NULL,
    "content" TEXT,
    "tool_calls" JSONB,
    "tool_call_id" TEXT,
    "tool_name" TEXT,
    "model_used" TEXT,
    "prompt_tokens" INTEGER,
    "completion_tokens" INTEGER,
    "latency_ms" INTEGER,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatConversation_user_id_updated_at_idx" ON "ChatConversation"("user_id", "updated_at");

-- CreateIndex
CREATE INDEX "ChatConversation_project_id_idx" ON "ChatConversation"("project_id");

-- CreateIndex
CREATE INDEX "ChatMessage_conversation_id_idx" ON "ChatMessage"("conversation_id");

-- CreateIndex
CREATE UNIQUE INDEX "ChatMessage_conversation_id_seq_no_key" ON "ChatMessage"("conversation_id", "seq_no");

-- AddForeignKey
ALTER TABLE "ChatConversation" ADD CONSTRAINT "ChatConversation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "ChatConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
