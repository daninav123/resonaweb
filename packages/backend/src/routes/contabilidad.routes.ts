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

export default router;
