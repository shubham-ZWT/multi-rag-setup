-- CreateTable
CREATE TABLE "bot_analytics_daily" (
    "id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "total_conversations" INTEGER NOT NULL DEFAULT 0,
    "total_messages" INTEGER NOT NULL DEFAULT 0,
    "unique_visitors" INTEGER NOT NULL DEFAULT 0,
    "avg_messages_per_conv" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avg_confidence_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_tokens_used" INTEGER NOT NULL DEFAULT 0,
    "avg_latency_ms" INTEGER NOT NULL DEFAULT 0,
    "thumbs_up" INTEGER NOT NULL DEFAULT 0,
    "thumbs_down" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bot_analytics_daily_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bot_analytics_daily_bot_id_date_key" ON "bot_analytics_daily"("bot_id", "date");

-- AddForeignKey
ALTER TABLE "bot_analytics_daily" ADD CONSTRAINT "bot_analytics_daily_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "bots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
