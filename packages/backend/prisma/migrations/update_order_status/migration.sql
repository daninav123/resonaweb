-- Migración para simplificar los estados de pedidos
-- De: PENDING, CONFIRMED, PREPARING, READY, IN_TRANSIT, DELIVERED, RETURNED, COMPLETED, CANCELLED
-- A: PENDING, IN_PROGRESS, COMPLETED, CANCELLED

-- Paso 1: Añadir el nuevo valor IN_PROGRESS al enum actual
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'IN_PROGRESS';

-- Paso 2: Actualizar todos los registros existentes al nuevo sistema
UPDATE "Order" SET status = 
  CASE 
    WHEN status::text = 'PENDING' THEN 'PENDING'
    WHEN status::text IN ('CONFIRMED', 'PREPARING', 'READY', 'IN_TRANSIT', 'DELIVERED', 'RETURNED') THEN 'IN_PROGRESS'
    WHEN status::text = 'COMPLETED' THEN 'COMPLETED'
    WHEN status::text = 'CANCELLED' THEN 'CANCELLED'
    ELSE 'PENDING'
  END::"OrderStatus";

-- Nota: Los valores antiguos del enum permanecerán definidos pero no se usarán
-- Esto evita problemas de migración y mantiene compatibilidad con datos existentes
