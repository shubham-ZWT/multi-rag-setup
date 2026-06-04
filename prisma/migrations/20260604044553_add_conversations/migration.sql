-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "visitor_id" TEXT NOT NULL,
    "page_url" TEXT,
    "referrer" TEXT,
    "ip_address" TEXT,
    "country_code" TEXT,
    "user_agent" TEXT,
    "message_count" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_message_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "conversations_bot_id_session_id_idx" ON "conversations"("bot_id", "session_id");

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "bots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
