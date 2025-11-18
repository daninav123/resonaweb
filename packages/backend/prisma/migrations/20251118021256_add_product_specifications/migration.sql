-- CreateTable
CREATE TABLE "product_specifications" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "specs" JSON,
    "power" TEXT,
    "connectivity" TEXT,
    "compatibility" TEXT,
    "materials" TEXT,
    "warranty" TEXT,
    "frequency" TEXT,
    "sensitivity" TEXT,
    "impedance" TEXT,
    "maxSPL" TEXT,
    "resolution" TEXT,
    "brightness" TEXT,
    "colorTemp" TEXT,
    "beamAngle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_specifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_specifications_productId_key" ON "product_specifications"("productId");

-- AddForeignKey
ALTER TABLE "product_specifications" ADD CONSTRAINT "product_specifications_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
