-- AlterEnum NotificationType
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'SESSION_INVITATION_RECEIVED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'SESSION_INVITATION_ACCEPTED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'SESSION_INVITATION_DECLINED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'SESSION_RESCHEDULE_PROPOSED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'SESSION_RESCHEDULE_RESOLVED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'SESSION_CANCELLED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'SESSION_REMINDER';

-- CreateEnum
CREATE TYPE "SessionMode" AS ENUM ('ONLINE', 'IN_PERSON');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'RESCHEDULE_REQUESTED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ParticipantRole" AS ENUM ('ORGANIZER', 'INVITEE');

-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "RescheduleStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('NOTE', 'LINK', 'CODE', 'DOCUMENT');

-- CreateTable
CREATE TABLE "learning_sessions" (
    "id" TEXT NOT NULL,
    "organizer_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "description" TEXT,
    "objectives" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "time_zone" TEXT NOT NULL DEFAULT 'UTC',
    "mode" "SessionMode" NOT NULL DEFAULT 'ONLINE',
    "location" TEXT,
    "meeting_url" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'PENDING',
    "cancel_reason" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_participants" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "ParticipantRole" NOT NULL DEFAULT 'INVITEE',
    "status" "ParticipantStatus" NOT NULL DEFAULT 'PENDING',
    "declined_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reschedule_proposals" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "proposer_id" TEXT NOT NULL,
    "proposed_start_time" TIMESTAMP(3) NOT NULL,
    "proposed_end_time" TIMESTAMP(3) NOT NULL,
    "proposed_time_zone" TEXT NOT NULL,
    "reason" TEXT,
    "status" "RescheduleStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reschedule_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_resources" (
    "id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "session_id" TEXT,
    "target_user_id" TEXT,
    "type" "ResourceType" NOT NULL DEFAULT 'NOTE',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "url" TEXT,
    "language" TEXT,
    "file_key" TEXT,
    "file_name" TEXT,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_reminders" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "minutes_before" INTEGER NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "learning_sessions_organizer_id_idx" ON "learning_sessions"("organizer_id");

-- CreateIndex
CREATE INDEX "learning_sessions_start_time_end_time_idx" ON "learning_sessions"("start_time", "end_time");

-- CreateIndex
CREATE INDEX "learning_sessions_status_idx" ON "learning_sessions"("status");

-- CreateIndex
CREATE INDEX "session_participants_user_id_status_idx" ON "session_participants"("user_id", "status");

-- CreateIndex
CREATE INDEX "session_participants_session_id_idx" ON "session_participants"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_participants_session_id_user_id_key" ON "session_participants"("session_id", "user_id");

-- CreateIndex
CREATE INDEX "reschedule_proposals_session_id_idx" ON "reschedule_proposals"("session_id");

-- CreateIndex
CREATE INDEX "learning_resources_creator_id_idx" ON "learning_resources"("creator_id");

-- CreateIndex
CREATE INDEX "learning_resources_session_id_idx" ON "learning_resources"("session_id");

-- CreateIndex
CREATE INDEX "learning_resources_target_user_id_idx" ON "learning_resources"("target_user_id");

-- CreateIndex
CREATE INDEX "session_reminders_user_id_idx" ON "session_reminders"("user_id");

-- CreateIndex
CREATE INDEX "session_reminders_session_id_idx" ON "session_reminders"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_reminders_session_id_user_id_minutes_before_key" ON "session_reminders"("session_id", "user_id", "minutes_before");

-- AddForeignKey
ALTER TABLE "learning_sessions" ADD CONSTRAINT "learning_sessions_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_participants" ADD CONSTRAINT "session_participants_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "learning_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_participants" ADD CONSTRAINT "session_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reschedule_proposals" ADD CONSTRAINT "reschedule_proposals_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "learning_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reschedule_proposals" ADD CONSTRAINT "reschedule_proposals_proposer_id_fkey" FOREIGN KEY ("proposer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_resources" ADD CONSTRAINT "learning_resources_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_resources" ADD CONSTRAINT "learning_resources_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "learning_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_resources" ADD CONSTRAINT "learning_resources_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_reminders" ADD CONSTRAINT "session_reminders_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "learning_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_reminders" ADD CONSTRAINT "session_reminders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
