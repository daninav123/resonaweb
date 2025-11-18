import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import express from 'express';

const router = Router();

// Public routes
router.get(
  '/config',
  paymentController.getConfig
);

// Stripe webhook - no auth, raw body required
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
  '/cancel',
  authenticate,
  paymentController.cancelPaymentIntent
);

router.get(
  '/details/:paymentIntentId',
  authenticate,
  paymentController.getPaymentDetails
);

// Admin only routes
router.post(
  '/refund',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  paymentController.createRefund
);

export { router as paymentRouter };
