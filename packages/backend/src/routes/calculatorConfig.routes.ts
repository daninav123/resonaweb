import { Router } from 'express';
import { calculatorConfigController } from '../controllers/calculatorConfig.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/v1/calculator-config
 * Obtener configuración (público, para cargar en frontend)
 */
router.get('/', calculatorConfigController.getConfig.bind(calculatorConfigController));

/**
 * POST /api/v1/calculator-config
 * Guardar configuración (solo admin)
 */
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  calculatorConfigController.saveConfig.bind(calculatorConfigController)
);

/**
 * POST /api/v1/calculator-config/reset
 * Resetear a valores por defecto (solo admin)
 */
router.post(
  '/reset',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  calculatorConfigController.resetConfig.bind(calculatorConfigController)
);

export default router;
