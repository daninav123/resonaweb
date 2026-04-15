import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { productUnitController } from '../controllers/productUnit.controller';

const router = express.Router();

// Resumen de inventario general
router.get('/summary', authenticate, productUnitController.getInventorySummary);

// Listar todas las unidades con filtros
router.get('/', authenticate, productUnitController.listUnits);

// Buscar por código de barras
router.get('/barcode/:barcode', authenticate, productUnitController.getUnitByBarcode);

// Obtener unidades de un producto específico (ANTES de /:unitId para evitar conflicto)
router.get('/product/:productId', authenticate, productUnitController.getUnitsByProduct);

// Crear unidades para un producto
router.post('/product/:productId', authenticate, productUnitController.createUnits);

// Obtener unidad por ID (DESPUÉS de rutas con prefijo fijo)
router.get('/:unitId', authenticate, productUnitController.getUnitById);

// Actualizar datos básicos de una unidad
router.put('/:unitId', authenticate, productUnitController.updateUnit);

// Acciones de estado
router.post('/:unitId/broken', authenticate, productUnitController.markBroken);
router.post('/:unitId/repair-start', authenticate, productUnitController.sendToRepair);
router.post('/:unitId/repair-end', authenticate, productUnitController.returnFromRepair);
router.post('/:unitId/available', authenticate, productUnitController.markAvailable);
router.post('/:unitId/retire', authenticate, productUnitController.retireUnit);
router.post('/:unitId/note', authenticate, productUnitController.addNote);

// Checkout / Checkin
router.post('/:unitId/checkout', authenticate, productUnitController.checkOut);
router.post('/:unitId/checkin', authenticate, productUnitController.checkIn);

export { router as productUnitRouter };
