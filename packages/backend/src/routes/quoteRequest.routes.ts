import { Router } from 'express';
import { quoteRequestController } from '../controllers/quoteRequest.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Ruta pública - Crear solicitud de presupuesto
router.post(
  '/',
  quoteRequestController.createQuoteRequest.bind(quoteRequestController)
);

// Rutas protegidas - Solo admin
router.get(
  '/',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  quoteRequestController.getAllQuoteRequests.bind(quoteRequestController)
);

router.get(
  '/stats',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  quoteRequestController.getQuoteStats.bind(quoteRequestController)
);

router.post(
  '/:id/convert-to-order',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  quoteRequestController.convertToOrder.bind(quoteRequestController)
);

router.get(
  '/:id',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  quoteRequestController.getQuoteRequestById.bind(quoteRequestController)
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  quoteRequestController.updateQuoteRequest.bind(quoteRequestController)
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  quoteRequestController.deleteQuoteRequest.bind(quoteRequestController)
);

export default router;
