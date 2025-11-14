import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Protected routes - User orders
router.post(
  '/',
  authenticate,
  orderController.createOrder
);

router.get(
  '/my-orders',
  authenticate,
  orderController.getUserOrders
);

router.get(
  '/upcoming',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  orderController.getUpcomingEvents
);

router.get(
  '/stats',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  orderController.getOrderStats
);

router.get(
  '/:id',
  authenticate,
  orderController.getOrderById
);

router.patch(
  '/:id/status',
  authenticate,
  orderController.updateOrderStatus
);

router.post(
  '/:id/cancel',
  authenticate,
  orderController.cancelOrder
);

// Admin routes
router.get(
  '/',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  orderController.getAllOrders
);

export { router as ordersRouter };
