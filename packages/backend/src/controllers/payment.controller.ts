import { Request, Response, NextFunction } from 'express';
import { stripeService } from '../services/stripe.service';
import { AppError } from '../middleware/error.middleware';

interface AuthRequest extends Request {
  user?: any;
}

export class PaymentController {
  /**
   * Get Stripe public config
   */
  async getConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const config = stripeService.getPublicConfig();
      res.json(config);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create payment intent for an order
   */
  async createPaymentIntent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { orderId } = req.body;

      if (!orderId) {
        throw new AppError(400, 'Order ID requerido', 'MISSING_DATA');
      }

      const result = await stripeService.createPaymentIntent(orderId, req.user.id);

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

      const order = await stripeService.confirmPayment(paymentIntentId);

      res.json({
        message: 'Pago confirmado',
        order,
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

      // Solo admins pueden hacer reembolsos
      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'No autorizado', 'FORBIDDEN');
      }

      const { orderId, amount, reason } = req.body;

      if (!orderId) {
        throw new AppError(400, 'Order ID requerido', 'MISSING_DATA');
      }

      const refund = await stripeService.createRefund(orderId, amount, reason);

      res.json({
        message: 'Reembolso procesado',
        refund,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { paymentIntentId } = req.params;
      const payment = await stripeService.getPaymentDetails(paymentIntentId);

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

      if (!sig) {
        throw new AppError(400, 'Webhook signature missing', 'MISSING_SIGNATURE');
      }

      // El body debe ser raw para la verificación de firma
      const rawBody = req.body;

      await stripeService.handleWebhook(rawBody, sig);

      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel payment intent
   */
  async cancelPaymentIntent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { paymentIntentId } = req.body;

      if (!paymentIntentId) {
        throw new AppError(400, 'Payment Intent ID requerido', 'MISSING_DATA');
      }

      const result = await stripeService.cancelPaymentIntent(paymentIntentId);

      res.json({
        message: 'Payment Intent cancelado',
        result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
