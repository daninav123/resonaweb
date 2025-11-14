import { Router } from 'express';
import { logisticsController } from '../controllers/logistics.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All logistics routes require authentication
router.use(authenticate);

// Admin routes
router.get(
  '/routes',
  authorize('ADMIN', 'SUPERADMIN'),
  logisticsController.planDeliveryRoutes
);

router.post(
  '/assign-vehicle',
  authorize('ADMIN', 'SUPERADMIN'),
  logisticsController.assignVehicle
);

router.post(
  '/assign-driver',
  authorize('ADMIN', 'SUPERADMIN'),
  logisticsController.assignDriver
);

router.get(
  '/schedule',
  authorize('ADMIN', 'SUPERADMIN'),
  logisticsController.getDeliverySchedule
);

router.get(
  '/returns',
  authorize('ADMIN', 'SUPERADMIN'),
  logisticsController.getReturnSchedule
);

router.get(
  '/vehicles',
  authorize('ADMIN', 'SUPERADMIN'),
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
