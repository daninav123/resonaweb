import { Router } from 'express';
import { calculatorConfigController } from '../controllers/calculatorConfig.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// DIAGNOSTIC: Version check endpoint (temporal)
router.get('/version', (req, res) => {
  res.json({
    version: 'v2.0-public-endpoint',
    timestamp: new Date().toISOString(),
    message: 'GET /calculator-config debe ser PUBLICO sin auth',
    authenticated: !!req.headers.authorization
  });
});

/**
 * GET /api/v1/calculator-config
 * Obtener configuración (PÚBLICO - sin autenticación, para cargar en frontend)
 * IMPORTANTE: No añadir authenticate ni authorize a esta ruta
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
