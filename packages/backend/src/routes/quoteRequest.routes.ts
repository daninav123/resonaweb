import { Router } from 'express';
import { quoteRequestController } from '../controllers/quoteRequest.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// ============================================
// RUTAS PÚBLICAS (SIN AUTENTICACIÓN)
// ============================================

// Crear solicitud de presupuesto - PÚBLICO (cualquier usuario)
router.post(
  '/public',
  quoteRequestController.createQuoteRequest.bind(quoteRequestController)
);

// ============================================
// RUTAS PROTEGIDAS (SOLO ADMIN)
// ============================================

// Aplicar middlewares de autenticación a todas las rutas siguientes
router.use(authenticate);
router.use(authorize('ADMIN', 'SUPERADMIN'));

// Crear solicitud de presupuesto desde panel (ADMIN/SUPERADMIN)
router.post(
  '/',
  quoteRequestController.createQuoteRequest.bind(quoteRequestController)
);

// Obtener todas las solicitudes
router.get(
  '/',
  quoteRequestController.getAllQuoteRequests.bind(quoteRequestController)
);

// Obtener estadísticas
router.get(
  '/stats',
  quoteRequestController.getQuoteStats.bind(quoteRequestController)
);

// Convertir solicitud a pedido
router.post(
  '/:id/convert-to-order',
  quoteRequestController.convertToOrder.bind(quoteRequestController)
);

// Obtener solicitud por ID
router.get(
  '/:id',
  quoteRequestController.getQuoteRequestById.bind(quoteRequestController)
);

// Actualizar solicitud
router.put(
  '/:id',
  quoteRequestController.updateQuoteRequest.bind(quoteRequestController)
);

// Eliminar solicitud
router.delete(
  '/:id',
  quoteRequestController.deleteQuoteRequest.bind(quoteRequestController)
);

export default router;
