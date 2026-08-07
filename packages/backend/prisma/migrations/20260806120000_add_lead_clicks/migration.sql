-- CreateTable
CREATE TABLE "lead_clicks" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "app" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "referrer" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "gclid" TEXT,
    "device" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lead_clicks_ref_key" ON "lead_clicks"("ref");

-- CreateIndex
CREATE INDEX "lead_clicks_createdAt_idx" ON "lead_clicks"("createdAt");

-- CreateIndex
CREATE INDEX "lead_clicks_app_createdAt_idx" ON "lead_clicks"("app", "createdAt");
