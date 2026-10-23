-- Phase 6: Real-Time Collaborative Code Editor Migration

-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

-- CreateTable
CREATE TABLE "code_workspaces" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "session_id" TEXT,
    "creator_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "code_workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "code_workspace_participants" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "WorkspaceRole" NOT NULL DEFAULT 'EDITOR',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "code_workspace_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "code_documents" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'typescript',
    "content" TEXT NOT NULL DEFAULT '',
    "yjs_state" BYTEA,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "code_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_revisions" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "description" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "code_workspaces_creator_id_idx" ON "code_workspaces"("creator_id");
CREATE INDEX "code_workspaces_session_id_idx" ON "code_workspaces"("session_id");

-- CreateIndex
CREATE INDEX "code_workspace_participants_user_id_idx" ON "code_workspace_participants"("user_id");
CREATE INDEX "code_workspace_participants_workspace_id_idx" ON "code_workspace_participants"("workspace_id");
CREATE UNIQUE INDEX "code_workspace_participants_workspace_id_user_id_key" ON "code_workspace_participants"("workspace_id", "user_id");

-- CreateIndex
CREATE INDEX "code_documents_workspace_id_idx" ON "code_documents"("workspace_id");

-- CreateIndex
CREATE INDEX "document_revisions_document_id_created_at_idx" ON "document_revisions"("document_id", "created_at");
CREATE INDEX "document_revisions_workspace_id_idx" ON "document_revisions"("workspace_id");

-- AddForeignKey
ALTER TABLE "code_workspaces" ADD CONSTRAINT "code_workspaces_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_workspaces" ADD CONSTRAINT "code_workspaces_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "learning_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_workspace_participants" ADD CONSTRAINT "code_workspace_participants_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "code_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_workspace_participants" ADD CONSTRAINT "code_workspace_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_documents" ADD CONSTRAINT "code_documents_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "code_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_revisions" ADD CONSTRAINT "document_revisions_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "code_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_revisions" ADD CONSTRAINT "document_revisions_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "code_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_revisions" ADD CONSTRAINT "document_revisions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
