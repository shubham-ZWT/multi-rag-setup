-- CreateTable
CREATE TABLE "message_feedback" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "feedback_type" TEXT NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "message_feedback_message_id_idx" ON "message_feedback"("message_id");

-- AddForeignKey
ALTER TABLE "message_feedback" ADD CONSTRAINT "message_feedback_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
