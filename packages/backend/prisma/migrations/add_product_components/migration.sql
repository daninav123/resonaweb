-- Añadir campo isPack a productos
ALTER TABLE "Product" ADD COLUMN "isPack" BOOLEAN NOT NULL DEFAULT false;

-- Crear tabla de componentes de pack
CREATE TABLE "ProductComponent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "packId" TEXT NOT NULL,
  "componentId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "ProductComponent_packId_fkey" FOREIGN KEY ("packId") REFERENCES "Product"("id") ON DELETE CASCADE,
  CONSTRAINT "ProductComponent_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Product"("id") ON DELETE CASCADE,
  CONSTRAINT "ProductComponent_packId_componentId_key" UNIQUE ("packId", "componentId")
);

-- Crear índices
CREATE INDEX "ProductComponent_packId_idx" ON "ProductComponent"("packId");
CREATE INDEX "ProductComponent_componentId_idx" ON "ProductComponent"("componentId");

-- Crear índice para filtrar packs fácilmente
CREATE INDEX "Product_isPack_idx" ON "Product"("isPack");
