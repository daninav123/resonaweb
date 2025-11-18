import { Router } from 'express';
import { couponController } from '../controllers/coupon.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Rutas públicas (requieren autenticación)
router.post(
  '/validate',
  authenticate,
  couponController.validateCoupon
);

router.get(
  '/my-discount',
  authenticate,
  couponController.getMyDiscount
);

// Rutas de administración
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  couponController.createCoupon
);

router.get(
  '/',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  couponController.listCoupons
);

router.get(
  '/:id',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  couponController.getCouponById
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  couponController.updateCoupon
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  couponController.deleteCoupon
);

// Rutas de descuentos de usuarios VIP
router.post(
  '/user-discounts',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  couponController.createUserDiscount
);

router.get(
  '/user-discounts',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  couponController.listUserDiscounts
);

router.put(
  '/user-discounts/:userId',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  couponController.updateUserDiscount
);

export { router as couponRouter };
