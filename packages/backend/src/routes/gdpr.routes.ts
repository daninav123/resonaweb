import { Router } from 'express';
import { GdprController } from '../controllers/gdpr.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const gdprController = new GdprController();

/**
 * RUTAS RGPD (General Data Protection Regulation)
 * Todas requieren autenticación
 */

// Obtener resumen de datos del usuario
router.get(
  '/my-data/summary',
  authenticate,
  gdprController.getMyDataSummary.bind(gdprController)
);

// Descargar todos los datos del usuario (Derecho de Portabilidad)
router.get(
  '/my-data/download',
  authenticate,
  gdprController.downloadMyData.bind(gdprController)
);

// Actualizar consentimientos (Derecho de Rectificación)
router.put(
  '/consents',
  authenticate,
  gdprController.updateConsents.bind(gdprController)
);

// Obtener historial de consentimientos
router.get(
  '/consents/history',
  authenticate,
  gdprController.getConsentHistory.bind(gdprController)
);

// Solicitar eliminación de cuenta (Derecho de Supresión)
router.delete(
  '/my-account',
  authenticate,
  gdprController.requestAccountDeletion.bind(gdprController)
);

export default router;
