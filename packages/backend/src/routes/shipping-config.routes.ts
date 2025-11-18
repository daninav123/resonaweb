import { Router } from 'express';
import { shippingConfigController } from '../controllers/shipping-config.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', shippingConfigController.getConfig);
router.post('/calculate', shippingConfigController.calculateShipping);

// Admin routes
router.put(
  '/',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  shippingConfigController.updateConfig
);

export { router as shippingConfigRouter };
