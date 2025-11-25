-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "facturaeGenerated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "facturaeSeries" TEXT DEFAULT 'A',
ADD COLUMN     "facturaeUrl" TEXT,
ADD COLUMN     "facturaeXml" TEXT;
