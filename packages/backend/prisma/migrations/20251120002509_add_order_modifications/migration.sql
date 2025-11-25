-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('NONE', 'PARTIAL', 'FULL', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ModificationType" AS ENUM ('ADD_ITEMS', 'REMOVE_ITEMS', 'MODIFY_ITEMS', 'CHANGE_DATES', 'CANCEL');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "cancelReason" TEXT,
ADD COLUMN     "isModified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastModifiedAt" TIMESTAMP(3),
ADD COLUMN     "modificationCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "originalTotal" DECIMAL(10,2),
ADD COLUMN     "refundAmount" DECIMAL(10,2),
ADD COLUMN     "refundProcessedAt" TIMESTAMP(3),
ADD COLUMN     "refundStatus" "RefundStatus" NOT NULL DEFAULT 'NONE';

-- CreateTable
CREATE TABLE "order_modifications" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "modifiedBy" TEXT NOT NULL,
    "type" "ModificationType" NOT NULL,
    "reason" TEXT,
    "oldTotal" DECIMAL(10,2) NOT NULL,
    "oldItems" JSONB,
    "oldDates" JSONB,
    "newTotal" DECIMAL(10,2) NOT NULL,
    "newItems" JSONB,
    "newDates" JSONB,
    "difference" DECIMAL(10,2) NOT NULL,
    "stripePaymentId" TEXT,
    "stripeRefundId" TEXT,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "itemsAdded" JSONB,
    "itemsRemoved" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "order_modifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "order_modifications_orderId_idx" ON "order_modifications"("orderId");

-- CreateIndex
CREATE INDEX "order_modifications_modifiedBy_idx" ON "order_modifications"("modifiedBy");

-- CreateIndex
CREATE INDEX "order_modifications_type_idx" ON "order_modifications"("type");

-- CreateIndex
CREATE INDEX "order_modifications_createdAt_idx" ON "order_modifications"("createdAt");

-- AddForeignKey
ALTER TABLE "order_modifications" ADD CONSTRAINT "order_modifications_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_modifications" ADD CONSTRAINT "order_modifications_modifiedBy_fkey" FOREIGN KEY ("modifiedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
