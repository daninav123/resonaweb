import { Router } from 'express';
import { contabilidadController } from '../controllers/contabilidad.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación de ADMIN
router.use(authenticate);
router.use(authorize('ADMIN', 'SUPERADMIN'));

/**
 * GET /api/v1/contabilidad/summary
 * Obtener resumen financiero
 */
router.get('/summary', contabilidadController.getFinancialSummary);

/**
 * GET /api/v1/contabilidad/rentabilidad
 * Obtener análisis de rentabilidad
 */
router.get('/rentabilidad', contabilidadController.getRentabilidadAnalysis);

/**
 * GET /api/v1/contabilidad/evolution
 * Obtener evolución mensual
 */
router.get('/evolution', contabilidadController.getMonthlyEvolution);

/**
 * GET /api/v1/contabilidad/cost-breakdown
 * Obtener desglose de costes operativos
 */
router.get('/cost-breakdown', contabilidadController.getCostBreakdown);

/**
 * GET /api/v1/contabilidad/export/pdf
 * Exportar informe a PDF
 */
router.get('/export/pdf', contabilidadController.exportToPDF);

/**
 * GET /api/v1/contabilidad/export/excel
 * Exportar informe a Excel
 */
router.get('/export/excel', contabilidadController.exportToExcel);

/**
 * GET /api/v1/contabilidad/alquileres
 * Obtener lista de alquileres
 */
router.get('/alquileres', contabilidadController.getAlquileres);

/**
 * PUT /api/v1/contabilidad/alquileres/:id/gastos
 * Actualizar gastos reales de un alquiler
 */
router.put('/alquileres/:id/gastos', contabilidadController.updateAlquilerGastos);

/**
 * GET /api/v1/contabilidad/montajes
 * Obtener lista de montajes
 */
router.get('/montajes', contabilidadController.getMontajes);

/**
 * PUT /api/v1/contabilidad/montajes/:id/gastos
 * Actualizar gastos reales de un montaje
 */
router.put('/montajes/:id/gastos', contabilidadController.updateMontajeGastos);

/**
 * GET /api/v1/contabilidad/gastos
 * Obtener gastos operativos
 */
router.get('/gastos', contabilidadController.getGastos);

/**
 * POST /api/v1/contabilidad/gastos
 * Crear gasto operativo
 */
router.post('/gastos', contabilidadController.createGasto);

/**
 * PUT /api/v1/contabilidad/gastos/:id
 * Actualizar gasto operativo
 */
router.put('/gastos/:id', contabilidadController.updateGasto);

/**
 * DELETE /api/v1/contabilidad/gastos/:id
 * Eliminar gasto operativo
 */
router.delete('/gastos/:id', contabilidadController.deleteGasto);

export default router;
