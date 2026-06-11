-- AlterTable
ALTER TABLE "users" ADD COLUMN "refresh_token" TEXT,
ADD COLUMN "refresh_token_expires" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "users_refresh_token_key" ON "users"("refresh_token");
