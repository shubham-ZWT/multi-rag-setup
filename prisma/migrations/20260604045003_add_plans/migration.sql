-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "max_bots" INTEGER NOT NULL DEFAULT 1,
    "max_kb_mb" INTEGER NOT NULL DEFAULT 10,
    "max_messages_month" INTEGER NOT NULL DEFAULT 1000,
    "max_sources_per_bot" INTEGER NOT NULL DEFAULT 5,
    "custom_branding" BOOLEAN NOT NULL DEFAULT false,
    "analytics_access" BOOLEAN NOT NULL DEFAULT false,
    "api_access" BOOLEAN NOT NULL DEFAULT false,
    "price_monthly" DECIMAL(65,30) NOT NULL,
    "price_yearly" DECIMAL(65,30) NOT NULL,
    "stripe_price_id_monthly" TEXT,
    "stripe_price_id_yearly" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plans_slug_key" ON "plans"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "plans_stripe_price_id_monthly_key" ON "plans"("stripe_price_id_monthly");

-- CreateIndex
CREATE UNIQUE INDEX "plans_stripe_price_id_yearly_key" ON "plans"("stripe_price_id_yearly");
