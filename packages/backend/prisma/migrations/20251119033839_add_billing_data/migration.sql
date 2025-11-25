-- CreateTable
CREATE TABLE "BillingData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT,
    "taxId" TEXT NOT NULL,
    "taxIdType" TEXT NOT NULL DEFAULT 'NIF',
    "address" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'España',
    "phone" TEXT,
    "email" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BillingData_userId_key" ON "BillingData"("userId");

-- CreateIndex
CREATE INDEX "BillingData_userId_idx" ON "BillingData"("userId");

-- CreateIndex
CREATE INDEX "BillingData_taxId_idx" ON "BillingData"("taxId");

-- AddForeignKey
ALTER TABLE "BillingData" ADD CONSTRAINT "BillingData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
