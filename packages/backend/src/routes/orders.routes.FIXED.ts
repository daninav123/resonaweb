import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// ===========================================
// IMPORTANT: Order matters! 
// Specific routes MUST come BEFORE generic /:id
// ===========================================

// 1. SPECIFIC ACTION ROUTES (before /:id)
router.post('/:id/cancel', authenticate, (req, res, next) => {
  console.log('🚨 HIT /cancel route for order:', req.params.id);
  orderController.cancelOrder(req as any, res, next);
});

router.patch('/:id/status', authenticate, (req, res, next) => {
  console.log('🚨 HIT /status route for order:', req.params.id);
  orderController.updateOrderStatus(req as any, res, next);
});

// 2. COLLECTION ROUTES
router.get(
  '/',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  (req, res, next) => orderController.getAllOrders(req as any, res, next)
);

router.get(
  '/my-orders',
  authenticate,
  (req, res, next) => orderController.getUserOrders(req as any, res, next)
);

router.get(
  '/upcoming',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  (req, res, next) => orderController.getUpcomingEvents(req as any, res, next)
);

router.get(
  '/stats',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  (req, res, next) => orderController.getOrderStats(req as any, res, next)
);

// 3. CREATE NEW ORDER
router.post(
  '/',
  authenticate,
  (req, res, next) => orderController.createOrder(req as any, res, next)
);

// 4. GENERIC /:id ROUTE (MUST BE LAST)
router.get(
  '/:id',
  authenticate,
  (req, res, next) => {
    console.log('🚨 HIT generic /:id route for order:', req.params.id);
    orderController.getOrderById(req as any, res, next);
  }
);

console.log('📋 Orders routes registered in this order:');
console.log('  POST   /:id/cancel');
console.log('  PATCH  /:id/status');
console.log('  GET    /');
console.log('  GET    /my-orders');
console.log('  GET    /upcoming');
console.log('  GET    /stats');
console.log('  POST   /');
console.log('  GET    /:id');

export { router as ordersRouter };
