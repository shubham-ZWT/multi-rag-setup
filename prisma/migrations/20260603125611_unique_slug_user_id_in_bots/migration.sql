/*
  Warnings:

  - A unique constraint covering the columns `[slug,user_id]` on the table `bots` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "bots_slug_key";

-- CreateIndex
CREATE UNIQUE INDEX "bots_slug_user_id_key" ON "bots"("slug", "user_id");
