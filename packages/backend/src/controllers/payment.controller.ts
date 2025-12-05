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
      console.log('💳 Creando payment intent...');
      
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { orderId, orderData, amountToPay } = req.body;
      console.log('📦 Datos recibidos:', { 
        orderId: orderId ? 'presente' : 'no', 
        orderData: orderData ? 'presente' : 'no',
        amountToPay: amountToPay ? `€${amountToPay}` : 'no especificado'
      });

      // Si NO hay orderId, es un pago inicial (nuevo flujo)
      if (!orderId && orderData) {
        console.log('🔄 Flujo nuevo: Creando payment intent sin orden');
        console.log('📦 OrderData completo:', JSON.stringify(orderData, null, 2));
        
        // Validar que items existe y tiene elementos
        if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
          console.error('❌ orderData.items está vacío o no es un array');
          throw new AppError(400, 'No hay items en la orden', 'NO_ITEMS');
        }
        
        // 💳 USAR AMOUNT TO PAY si está presente (25% para calculadora)
        let total: number;
        
        if (amountToPay && amountToPay > 0) {
          // Usar el monto especificado (puede ser 25% de reserva)
          total = Number(amountToPay);
          console.log('💳 USANDO MONTO DE RESERVA:', total, '(enviado desde frontend)');
        } else {
          // Calcular el total completo (100%)
          const subtotal = orderData.items.reduce((sum: number, item: any) => {
            const itemPrice = Number(item.totalPrice) || 0;
            console.log('  Item:', item.productId, '- totalPrice:', itemPrice);
            return sum + itemPrice;
          }, 0);
          
          console.log('💰 Subtotal calculado:', subtotal);
          
          if (subtotal <= 0) {
            console.error('❌ Subtotal es 0 o negativo');
            throw new AppError(400, 'El monto total debe ser mayor a 0', 'INVALID_AMOUNT');
          }
          
          const shippingCost = Number(orderData.shippingCost) || 0;
          const taxAmount = (subtotal + shippingCost) * 0.21;
          total = subtotal + shippingCost + taxAmount;
          
          console.log('💰 Shipping:', shippingCost);
          console.log('💰 Tax (21%):', taxAmount);
          console.log('💰 Total final (100%):', total);
        }
        
        console.log('💰 Total en centavos:', Math.round(total * 100));
        
        if (isNaN(total) || total <= 0) {
          console.error('❌ Total calculado es inválido:', total);
          throw new AppError(400, 'Error en el cálculo del total', 'INVALID_TOTAL');
        }

        // Crear Payment Intent directo sin orden
        const result = await stripeService.createPaymentIntentWithoutOrder(
          Math.round(total * 100), // convertir a centavos
          req.user.id,
          orderData
        );

        return res.json({
          message: 'Payment intent creado',
          ...result,
        });
      }

      // Flujo normal con orderId
      if (!orderId) {
        throw new AppError(400, 'Order ID o Order Data requerido', 'MISSING_DATA');
      }

      console.log('🔄 Flujo normal: Creando payment intent para orden:', orderId);
      const result = await stripeService.createPaymentIntent(orderId, req.user.id);

      res.json({
        message: 'Payment intent creado',
        ...result,
      });
    } catch (error: any) {
      console.error('❌ Error en createPaymentIntent:', {
        message: error.message,
        stack: error.stack,
        code: error.code
      });
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
