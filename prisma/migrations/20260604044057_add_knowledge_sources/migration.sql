-- CreateTable
CREATE TABLE "knowledge_sources" (
    "id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content_raw" TEXT NOT NULL,
    "file_url" TEXT,
    "file_mime_type" TEXT,
    "file_size_bytes" INTEGER,
    "url" TEXT,
    "chunk_count" INTEGER DEFAULT 0,
    "index_status" TEXT NOT NULL DEFAULT 'pending',
    "index_error" TEXT,
    "indexed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_sources_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "knowledge_sources" ADD CONSTRAINT "knowledge_sources_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "bots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_sources" ADD CONSTRAINT "knowledge_sources_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
