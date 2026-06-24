import { Router } from 'express';
import { logisticsController } from '../controllers/logistics.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All logistics routes require authentication
router.use(authenticate);

// Admin + warehouse routes
router.get(
  '/routes',
  authorize('ADMIN', 'SUPERADMIN', 'WAREHOUSE', 'TECHNICIAN'),
  logisticsController.planDeliveryRoutes
);

router.post(
  '/assign-vehicle',
  authorize('ADMIN', 'SUPERADMIN', 'WAREHOUSE'),
  logisticsController.assignVehicle
);

router.post(
  '/assign-driver',
  authorize('ADMIN', 'SUPERADMIN', 'WAREHOUSE'),
  logisticsController.assignDriver
);

router.get(
  '/schedule',
  authorize('ADMIN', 'SUPERADMIN', 'WAREHOUSE', 'TECHNICIAN'),
  logisticsController.getDeliverySchedule
);

router.get(
  '/returns',
  authorize('ADMIN', 'SUPERADMIN', 'WAREHOUSE', 'TECHNICIAN'),
  logisticsController.getReturnSchedule
);

router.get(
  '/vehicles',
  authorize('ADMIN', 'SUPERADMIN', 'WAREHOUSE'),
  logisticsController.getAvailableVehicles
);

// Delivery operations
router.get(
  '/delivery-note/:orderId',
  logisticsController.generateDeliveryNote
);

router.get(
  '/track/:id',
  logisticsController.trackDelivery
);

router.post(
  '/confirm-delivery/:orderId',
  logisticsController.confirmDelivery
);

router.post(
  '/confirm-pickup/:orderId',
  logisticsController.confirmPickup
);

export { router as logisticsRouter };
