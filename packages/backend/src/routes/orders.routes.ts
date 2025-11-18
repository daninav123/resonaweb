import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

console.log('🔥 REGISTRANDO RUTAS DE ORDERS - orders.routes.ts CARGADO');

// Specific routes MUST BE BEFORE generic /:id routes
// Cancel order (specific action on order)
router.post('/:id/cancel', authenticate, (req, res, next) => {
  console.log('🎯 RUTA /cancel EJECUTADA para order:', req.params.id);
  orderController.cancelOrder.bind(orderController)(req, res, next);
});

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
  orderController.createOrder.bind(orderController)
);

router.get(
  '/:id',
  authenticate,
  orderController.getOrderById.bind(orderController)
);

console.log('✅ RUTAS DE ORDERS REGISTRADAS:');
console.log('   POST   /:id/cancel');
console.log('   PATCH  /:id/status');
console.log('   GET    /');
console.log('   GET    /my-orders');
console.log('   GET    /upcoming');
console.log('   GET    /stats');
console.log('   POST   /');
console.log('   GET    /:id');

export { router as ordersRouter };
