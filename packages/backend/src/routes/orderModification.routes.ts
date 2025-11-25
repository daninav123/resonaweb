import { Router } from 'express';
import { orderModificationController } from '../controllers/orderModification.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Rutas ADMIN
router.get('/pending-refunds', authenticate, authorize('ADMIN', 'SUPERADMIN'), orderModificationController.getPendingRefunds.bind(orderModificationController));
router.post('/approve-refund/:modificationId', authenticate, authorize('ADMIN', 'SUPERADMIN'), orderModificationController.approveRefund.bind(orderModificationController));

// Verificar si se puede modificar
router.get('/:orderId/can-modify', authenticate, orderModificationController.checkCanModify.bind(orderModificationController));

// Añadir items
router.post('/:orderId/add-items', authenticate, orderModificationController.addItems.bind(orderModificationController));

// Eliminar items
router.post('/:orderId/remove-items', authenticate, orderModificationController.removeItems.bind(orderModificationController));

// Cancelar con reembolso
router.post('/:orderId/cancel-refund', authenticate, orderModificationController.cancelWithRefund.bind(orderModificationController));

// Obtener payment intent
router.get('/:orderId/payment-intent', authenticate, orderModificationController.getPaymentIntent.bind(orderModificationController));

export default router;
