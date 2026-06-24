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

// Crear solicitud + Stripe Checkout Session para señal - PÚBLICO
router.post(
  '/public/with-payment',
  quoteRequestController.createQuoteRequestWithPayment.bind(quoteRequestController)
);

// Obtener datos de pago por token - PÚBLICO
router.get(
  '/payment/:token',
  quoteRequestController.getByPaymentToken.bind(quoteRequestController)
);

// ============================================
// RUTAS PROTEGIDAS (SOLO ADMIN)
// ============================================
const admin = [authenticate, authorize('ADMIN', 'SUPERADMIN')];

router.post('/', ...admin, quoteRequestController.createQuoteRequest.bind(quoteRequestController));
router.get('/', ...admin, quoteRequestController.getAllQuoteRequests.bind(quoteRequestController));
router.get('/stats', ...admin, quoteRequestController.getQuoteStats.bind(quoteRequestController));
router.post('/:id/convert-to-order', ...admin, quoteRequestController.convertToOrder.bind(quoteRequestController));
router.get('/:id', ...admin, quoteRequestController.getQuoteRequestById.bind(quoteRequestController));
router.put('/:id', ...admin, quoteRequestController.updateQuoteRequest.bind(quoteRequestController));
router.delete('/:id', ...admin, quoteRequestController.deleteQuoteRequest.bind(quoteRequestController));

export default router;
