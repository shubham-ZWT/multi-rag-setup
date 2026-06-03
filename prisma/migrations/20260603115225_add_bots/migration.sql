-- CreateTable
CREATE TABLE "bots" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "system_prompt" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "max_tokens" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "embed_key" TEXT NOT NULL,
    "widget_config" JSONB NOT NULL DEFAULT '{}',
    "allowed_domains" JSONB NOT NULL DEFAULT '[]',
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "message_count" INTEGER NOT NULL DEFAULT 0,
    "last_active_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "bots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bots_slug_key" ON "bots"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "bots_embed_key_key" ON "bots"("embed_key");

-- AddForeignKey
ALTER TABLE "bots" ADD CONSTRAINT "bots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
