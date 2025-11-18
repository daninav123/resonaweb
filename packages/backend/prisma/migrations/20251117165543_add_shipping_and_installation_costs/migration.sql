-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "installationComplexity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "installationCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "installationTimeMinutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "requiresInstallation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shippingCost" DECIMAL(10,2) NOT NULL DEFAULT 0;
