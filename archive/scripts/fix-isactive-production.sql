-- Script para arreglar isActive en producción
-- Ejecuta esto en la base de datos de PRODUCCIÓN

-- 1. Ver el estado actual de los packs
SELECT id, name, category, isActive FROM Pack;

-- 2. Actualizar todos los packs que tienen isActive = NULL a TRUE
UPDATE Pack 
SET isActive = true 
WHERE isActive IS NULL;

-- 3. Si quieres desactivar algunos específicos (los que ocultaste)
-- Reemplaza 'pack-id-1' con los IDs reales de los packs que quieres ocultar
UPDATE Pack 
SET isActive = false 
WHERE id IN ('pack-id-1', 'pack-id-2');

-- 4. Verificar el resultado
SELECT id, name, category, isActive FROM Pack ORDER BY isActive DESC, name;
