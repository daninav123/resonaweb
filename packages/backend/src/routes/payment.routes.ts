import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import express from 'express';

const router = Router();

// Stripe webhook - no auth, raw body
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleWebhook
);

// Protected routes
router.post(
  '/create-intent',
  authenticate,
  paymentController.createPaymentIntent
);

router.post(
  '/confirm',
  authenticate,
  paymentController.confirmPayment
);

router.post(
  '/refund',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  paymentController.createRefund
);

router.get(
  '/methods',
  authenticate,
  paymentController.getPaymentMethods
);

router.get(
  '/history',
  authenticate,
  paymentController.getPaymentHistory
);

router.get(
  '/:id/status',
  authenticate,
  paymentController.getPaymentStatus
);

export { router as paymentRouter };
