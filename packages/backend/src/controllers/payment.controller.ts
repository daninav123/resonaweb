import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';
import { AppError } from '../middleware/error.middleware';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-11-20.acacia',
});

interface AuthRequest extends Request {
  user?: any;
}

export class PaymentController {
  /**
   * Create payment intent
   */
  async createPaymentIntent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { orderId, amount, currency, paymentMethod, metadata } = req.body;

      if (!orderId || !amount) {
        throw new AppError(400, 'Datos incompletos', 'MISSING_DATA');
      }

      const result = await paymentService.createPaymentIntent({
        orderId,
        amount,
        currency,
        paymentMethod,
        metadata,
      });

      res.json({
        message: 'Payment intent creado',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirm payment
   */
  async confirmPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { paymentIntentId } = req.body;

      if (!paymentIntentId) {
        throw new AppError(400, 'Payment intent ID requerido', 'MISSING_DATA');
      }

      const payment = await paymentService.confirmPayment(paymentIntentId);

      res.json({
        message: 'Pago confirmado',
        payment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create refund
   */
  async createRefund(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { paymentId, amount, reason } = req.body;

      if (!paymentId) {
        throw new AppError(400, 'Payment ID requerido', 'MISSING_DATA');
      }

      const result = await paymentService.createRefund({
        paymentId,
        amount,
        reason,
      });

      res.json({
        message: 'Reembolso procesado',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { id } = req.params;
      const payment = await paymentService.getPaymentStatus(id);

      res.json(payment);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Stripe webhook handler
   */
  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const sig = req.headers['stripe-signature'] as string;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!sig || !webhookSecret) {
        throw new AppError(400, 'Webhook signature missing', 'MISSING_SIGNATURE');
      }

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          webhookSecret
        );
      } catch (err: any) {
        throw new AppError(400, `Webhook Error: ${err.message}`, 'WEBHOOK_ERROR');
      }

      await paymentService.handleWebhook(event);

      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get payment methods
   */
  async getPaymentMethods(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const methods = await paymentService.getPaymentMethods(req.user.id);
      res.json(methods);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const history = await paymentService.getPaymentHistory(req.user.id, page, limit);
      res.json(history);
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
