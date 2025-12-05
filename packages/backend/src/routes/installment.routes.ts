import { Router } from 'express';
import { 
  getOrderInstallments,
  createInstallmentPaymentIntent,
  confirmInstallmentPayment,
  getNextPendingInstallment
} from '../controllers/installment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * GET /api/v1/installments/order/:orderId
 * Obtener todos los plazos de un pedido
 */
router.get('/order/:orderId', getOrderInstallments);

/**
 * GET /api/v1/installments/order/:orderId/next
 * Obtener el siguiente plazo pendiente
 */
router.get('/order/:orderId/next', getNextPendingInstallment);

/**
 * POST /api/v1/installments/:installmentId/payment-intent
 * Crear Payment Intent para pagar un plazo
 */
router.post('/:installmentId/payment-intent', createInstallmentPaymentIntent);

/**
 * POST /api/v1/installments/:installmentId/confirm
 * Confirmar pago de un plazo
 */
router.post('/:installmentId/confirm', confirmInstallmentPayment);

export default router;
