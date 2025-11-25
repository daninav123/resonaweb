-- Actualizar todos los productos con stockStatus ON_DEMAND a IN_STOCK
UPDATE "Product" 
SET "stockStatus" = 'IN_STOCK' 
WHERE "stockStatus" = 'ON_DEMAND' AND stock > 0;
