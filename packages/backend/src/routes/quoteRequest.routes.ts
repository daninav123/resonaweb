import { Router } from 'express';
import { quoteRequestController } from '../controllers/quoteRequest.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Ruta pública - Crear solicitud de presupuesto (DEBE IR PRIMERO)
router.post(
  '/',
  quoteRequestController.createQuoteRequest.bind(quoteRequestController)
);

// Rutas protegidas - Solo admin (todas las demás rutas requieren autenticación)
router.use(authenticate);
router.use(authorize('ADMIN', 'SUPERADMIN'));

router.get(
  '/',
  quoteRequestController.getAllQuoteRequests.bind(quoteRequestController)
);

router.get(
  '/stats',
  quoteRequestController.getQuoteStats.bind(quoteRequestController)
);

router.post(
  '/:id/convert-to-order',
  quoteRequestController.convertToOrder.bind(quoteRequestController)
);

router.get(
  '/:id',
  quoteRequestController.getQuoteRequestById.bind(quoteRequestController)
);

router.put(
  '/:id',
  quoteRequestController.updateQuoteRequest.bind(quoteRequestController)
);

router.delete(
  '/:id',
  quoteRequestController.deleteQuoteRequest.bind(quoteRequestController)
);

export default router;
