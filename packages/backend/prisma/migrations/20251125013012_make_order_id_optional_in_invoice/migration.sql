-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('PENDING', 'CONTACTED', 'QUOTED', 'CONVERTED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_orderId_fkey";

-- DropForeignKey
ALTER TABLE "ProductComponent" DROP CONSTRAINT "ProductComponent_componentId_fkey";

-- DropForeignKey
ALTER TABLE "ProductComponent" DROP CONSTRAINT "ProductComponent_packId_fkey";

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "orderId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "quote_requests" (
    "id" TEXT NOT NULL,
    "customerName" TEXT,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "eventType" TEXT NOT NULL,
    "attendees" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "durationType" TEXT NOT NULL,
    "eventDate" TEXT,
    "eventLocation" TEXT,
    "selectedPack" TEXT,
    "selectedExtras" JSONB NOT NULL,
    "estimatedTotal" DECIMAL(10,2),
    "status" "QuoteStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quote_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quote_requests_status_idx" ON "quote_requests"("status");

-- CreateIndex
CREATE INDEX "quote_requests_customerEmail_idx" ON "quote_requests"("customerEmail");

-- CreateIndex
CREATE INDEX "quote_requests_createdAt_idx" ON "quote_requests"("createdAt");

-- AddForeignKey
ALTER TABLE "ProductComponent" ADD CONSTRAINT "ProductComponent_packId_fkey" FOREIGN KEY ("packId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductComponent" ADD CONSTRAINT "ProductComponent_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
