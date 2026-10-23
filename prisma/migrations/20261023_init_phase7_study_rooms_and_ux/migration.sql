-- Phase 7: Interactive Study Rooms, Whiteboards & Preferences Migration

-- CreateEnum
CREATE TYPE "StudyRoomRole" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

-- CreateTable
CREATE TABLE "study_rooms" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "description" TEXT,
    "session_id" TEXT,
    "creator_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_room_participants" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "StudyRoomRole" NOT NULL DEFAULT 'EDITOR',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),

    CONSTRAINT "study_room_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whiteboard_documents" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Main Board',
    "elements" JSONB NOT NULL DEFAULT '[]',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whiteboard_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whiteboard_revisions" (
    "id" TEXT NOT NULL,
    "board_id" TEXT NOT NULL,
    "elements" JSONB NOT NULL,
    "description" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whiteboard_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "email_notifications" BOOLEAN NOT NULL DEFAULT true,
    "sound_enabled" BOOLEAN NOT NULL DEFAULT true,
    "reduced_motion" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes
CREATE INDEX "study_rooms_creator_id_idx" ON "study_rooms"("creator_id");
CREATE INDEX "study_rooms_session_id_idx" ON "study_rooms"("session_id");
CREATE INDEX "study_rooms_is_active_idx" ON "study_rooms"("is_active");

CREATE UNIQUE INDEX "study_room_participants_room_id_user_id_key" ON "study_room_participants"("room_id", "user_id");
CREATE INDEX "study_room_participants_user_id_idx" ON "study_room_participants"("user_id");
CREATE INDEX "study_room_participants_room_id_idx" ON "study_room_participants"("room_id");

CREATE INDEX "whiteboard_documents_room_id_idx" ON "whiteboard_documents"("room_id");
CREATE INDEX "whiteboard_revisions_board_id_created_at_idx" ON "whiteboard_revisions"("board_id", "created_at");

CREATE UNIQUE INDEX "user_preferences_user_id_key" ON "user_preferences"("user_id");

-- AddForeignKey
ALTER TABLE "study_rooms" ADD CONSTRAINT "study_rooms_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "study_rooms" ADD CONSTRAINT "study_rooms_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "learning_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "study_room_participants" ADD CONSTRAINT "study_room_participants_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "study_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "study_room_participants" ADD CONSTRAINT "study_room_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "whiteboard_documents" ADD CONSTRAINT "whiteboard_documents_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "study_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "whiteboard_revisions" ADD CONSTRAINT "whiteboard_revisions_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "whiteboard_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "whiteboard_revisions" ADD CONSTRAINT "whiteboard_revisions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
