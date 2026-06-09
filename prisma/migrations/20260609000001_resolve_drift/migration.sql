-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "email_verified";

-- AlterTable
ALTER TABLE "public"."conversations" DROP COLUMN "ended_at";

-- CreateTable
CREATE TABLE "public"."test_table" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_table_pkey" PRIMARY KEY ("id")
);
