-- CreateTable
CREATE TABLE "extra_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '📦',
    "color" TEXT NOT NULL DEFAULT 'purple',
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "extra_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "extra_categories_name_key" ON "extra_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "extra_categories_slug_key" ON "extra_categories"("slug");

-- CreateIndex
CREATE INDEX "extra_categories_isActive_order_idx" ON "extra_categories"("isActive", "order");

-- AddColumn
ALTER TABLE "Product" ADD COLUMN "extraCategoryId" TEXT;

-- CreateIndex
CREATE INDEX "Product_extraCategoryId_idx" ON "Product"("extraCategoryId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_extraCategoryId_fkey" FOREIGN KEY ("extraCategoryId") REFERENCES "extra_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Insert initial categories
INSERT INTO "extra_categories" (id, name, slug, icon, color, "order", description, "createdAt", "updatedAt") VALUES
('cat-disco', 'Disco', 'disco', '🎵', 'purple', 1, 'Equipamiento para ambientar la fiesta', NOW(), NOW()),
('cat-fx', 'FX', 'fx', '✨', 'blue', 2, 'Efectos especiales visuales', NOW(), NOW()),
('cat-decoracion', 'Decoración', 'decoracion', '🎨', 'pink', 3, 'Elementos decorativos', NOW(), NOW()),
('cat-iluminacion', 'Iluminación', 'iluminacion', '💡', 'yellow', 4, 'Iluminación adicional', NOW(), NOW()),
('cat-estructuras', 'Estructuras', 'estructuras', '🏗️', 'gray', 5, 'Escenarios y estructuras', NOW(), NOW()),
('cat-audiovisual', 'Audiovisual', 'audiovisual', '📺', 'indigo', 6, 'Pantallas y proyección', NOW(), NOW()),
('cat-otros', 'Otros', 'otros', '📦', 'slate', 99, 'Otros extras', NOW(), NOW());
