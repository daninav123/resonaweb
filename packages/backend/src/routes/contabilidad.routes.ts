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

export default router;
