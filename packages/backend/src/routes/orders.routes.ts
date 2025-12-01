import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { orderCreationRateLimiter } from '../middleware/rateLimiters';

const router = Router();

// Specific routes MUST BE BEFORE generic /:id routes
// Cancel order (specific action on order)
router.post('/:id/cancel', authenticate, (req, res, next) => {
  orderController.cancelOrder.bind(orderController)(req, res, next);
});

// Mark order as returned (Admin only)
router.post('/:id/returned', authenticate, authorize('ADMIN', 'SUPERADMIN'), (req, res, next) => {
  orderController.markAsReturned.bind(orderController)(req, res, next);
});

// Deposit management (Admin only)
router.post('/:id/deposit/capture', authenticate, authorize('ADMIN', 'SUPERADMIN'), (req, res, next) => {
  orderController.captureDeposit.bind(orderController)(req, res, next);
});

router.post('/:id/deposit/release', authenticate, authorize('ADMIN', 'SUPERADMIN'), (req, res, next) => {
  orderController.releaseDeposit.bind(orderController)(req, res, next);
});

// Update order (Edit - Admin only)
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  orderController.updateOrder.bind(orderController)
);

// Update order status
router.patch('/:id/status', authenticate, orderController.updateOrderStatus.bind(orderController));

// Admin routes
router.get(
  '/',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  orderController.getAllOrders.bind(orderController)
);

router.get(
  '/my-orders',
  authenticate,
  orderController.getUserOrders.bind(orderController)
);

router.get(
  '/upcoming',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  orderController.getUpcomingEvents.bind(orderController)
);

router.get(
  '/stats',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  orderController.getOrderStats.bind(orderController)
);

// Protected routes - User orders
router.post(
  '/',
  authenticate,
  orderCreationRateLimiter, // 3 pedidos cada 5 minutos
  orderController.createOrder.bind(orderController)
);

// Crear pedido desde calculadora (pago directo)
router.post(
  '/create-from-calculator',
  authenticate,
  orderCreationRateLimiter,
  orderController.createOrderFromCalculator.bind(orderController)
);

router.get(
  '/:id',
  authenticate,
  orderController.getOrderById.bind(orderController)
);


export { router as ordersRouter };
