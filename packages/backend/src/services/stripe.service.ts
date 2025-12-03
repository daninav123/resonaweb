import Stripe from 'stripe';
import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { emailService } from './email.service';

export class StripeService {
  private stripe: Stripe;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!secretKey) {
      logger.warn('Stripe secret key not configured');
      throw new Error('Stripe secret key is required');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
      typescript: true,
    });

    logger.info('Stripe service initialized');
  }

  /**
   * Crear Payment Intent para un pedido
   */
  async createPaymentIntent(orderId: string, userId: string) {
    try {
      // Obtener el pedido
      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          userId,
        },
        include: {
          user: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        throw new AppError(404, 'Pedido no encontrado', 'ORDER_NOT_FOUND');
      }

      // Verificar si ya existe un payment intent
      if (order.stripePaymentIntentId) {
        // Recuperar el payment intent existente
        const existingIntent = await this.stripe.paymentIntents.retrieve(
          order.stripePaymentIntentId
        );

        if (existingIntent.status !== 'canceled') {
          logger.info(`Using existing payment intent: ${existingIntent.id}`);
          return {
            clientSecret: existingIntent.client_secret,
            paymentIntentId: existingIntent.id,
          };
        }
      }

      // Calcular el monto (Stripe usa centavos)
      const amount = Math.round(Number(order.total) * 100);

      // Crear Payment Intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency: 'eur',
        payment_method_types: ['card'],
        metadata: {
          orderId: order.id,
          userId: order.userId,
          orderNumber: order.orderNumber,
        },
        description: `Pedido ${order.orderNumber} - ReSona Events`,
        receipt_email: order.user.email,
      });

      // Guardar el payment intent ID en el pedido
      await prisma.order.update({
        where: { id: orderId },
        data: {
          stripePaymentIntentId: paymentIntent.id,
        },
      });

      logger.info(`Payment Intent created: ${paymentIntent.id} for order ${order.orderNumber}`);

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      logger.error('Error creating payment intent:', error);
      throw error;
    }
  }

  /**
   * Crear Payment Intent SIN orden (nuevo flujo - orden se crea después del pago)
   */
  async createPaymentIntentWithoutOrder(amount: number, userId: string, orderData: any) {
    try {
      // Obtener datos del usuario
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new AppError(404, 'Usuario no encontrado', 'USER_NOT_FOUND');
      }

      // Crear Payment Intent
      // IMPORTANTE: Stripe metadata tiene límite de 500 caracteres por valor
      // Los datos completos se guardan en sessionStorage del frontend
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency: 'eur',
        payment_method_types: ['card'],
        metadata: {
          userId: userId,
          itemCount: orderData.items?.length?.toString() || '0',
          deliveryType: orderData.deliveryType || 'PICKUP',
          totalAmount: (amount / 100).toString(), // en euros
        },
        description: `Pedido ReSona - ${orderData.items?.length || 0} items`,
        receipt_email: user.email,
      });

      logger.info(`Payment Intent created without order: ${paymentIntent.id} for user ${user.email}`);

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      logger.error('Error creating payment intent without order:', error);
      throw error;
    }
  }

  /**
   * Confirmar pago y actualizar pedido
   */
  async confirmPayment(paymentIntentId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        throw new AppError(400, 'El pago no ha sido completado', 'PAYMENT_NOT_COMPLETED');
      }

      const orderId = paymentIntent.metadata.orderId;

      // Actualizar el pedido
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'COMPLETED',
          status: 'CONFIRMED',
          paidAt: new Date(),
        },
        include: {
          user: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Crear registro de pago
      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: Number(order.total),
          method: 'STRIPE',
          status: 'COMPLETED',
          stripePaymentIntentId: paymentIntent.id,
          stripeChargeId: paymentIntent.latest_charge as string,
          metadata: {
            paymentIntent: paymentIntentId,
            chargeId: paymentIntent.latest_charge,
          } as any,
        },
      });

      // Enviar email de confirmación
      try {
        await emailService.sendOrderConfirmationEmail(order);
      } catch (emailError) {
        logger.error('Error sending confirmation email:', emailError);
      }

      logger.info(`Payment confirmed for order ${order.orderNumber}`);

      return order;
    } catch (error) {
      logger.error('Error confirming payment:', error);
      throw error;
    }
  }

  /**
   * Procesar reembolso
   */
  async createRefund(orderId: string, amount?: number, reason?: string) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { user: true },
      });

      if (!order) {
        throw new AppError(404, 'Pedido no encontrado', 'ORDER_NOT_FOUND');
      }

      if (!order.stripePaymentIntentId) {
        throw new AppError(400, 'No hay pago asociado a este pedido', 'NO_PAYMENT');
      }

      // Crear reembolso
      const refundAmount = amount
        ? Math.round(amount * 100)
        : Math.round(Number(order.total) * 100);

      const refund = await this.stripe.refunds.create({
        payment_intent: order.stripePaymentIntentId,
        amount: refundAmount,
        reason: reason as any || 'requested_by_customer',
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
        },
      });

      // Actualizar el pedido
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: refund.amount === Math.round(Number(order.total) * 100)
            ? 'REFUNDED'
            : 'PARTIALLY_REFUNDED',
          status: 'CANCELLED',
        },
      });

      // Crear registro de pago (reembolso)
      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: -(refundAmount / 100),
          method: 'STRIPE',
          status: 'COMPLETED',
          stripePaymentIntentId: refund.id,
          metadata: {
            refundId: refund.id,
            paymentIntent: order.stripePaymentIntentId,
            reason: reason || 'requested_by_customer',
          } as any,
        },
      });

      logger.info(`Refund created: ${refund.id} for order ${order.orderNumber}`);

      return refund;
    } catch (error) {
      logger.error('Error creating refund:', error);
      throw error;
    }
  }

  /**
   * Obtener detalles de un pago
   */
  async getPaymentDetails(paymentIntentId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      logger.error('Error retrieving payment details:', error);
      throw error;
    }
  }

  /**
   * Cancelar Payment Intent
   */
  async cancelPaymentIntent(paymentIntentId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.cancel(paymentIntentId);
      
      logger.info(`Payment Intent cancelled: ${paymentIntentId}`);
      
      return paymentIntent;
    } catch (error) {
      logger.error('Error cancelling payment intent:', error);
      throw error;
    }
  }

  /**
   * Procesar webhook de Stripe
   */
  async handleWebhook(rawBody: string | Buffer, signature: string) {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!webhookSecret) {
        throw new Error('Stripe webhook secret not configured');
      }

      // Verificar la firma del webhook
      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );

      logger.info(`Webhook received: ${event.type}`);

      // Procesar eventos
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.canceled':
          await this.handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent);
          break;

        case 'charge.refunded':
          await this.handleChargeRefunded(event.data.object as Stripe.Charge);
          break;

        case 'charge.dispute.created':
          await this.handleDisputeCreated(event.data.object as Stripe.Dispute);
          break;

        default:
          logger.info(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      logger.error('Error handling webhook:', error);
      throw error;
    }
  }

  /**
   * Manejar pago exitoso
   */
  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    try {
      const orderId = paymentIntent.metadata.orderId;

      if (!orderId) {
        logger.warn(`Payment intent ${paymentIntent.id} has no order ID`);
        return;
      }

      await this.confirmPayment(paymentIntent.id);
      
      logger.info(`Payment succeeded for order ${orderId}`);
    } catch (error) {
      logger.error('Error handling payment_intent.succeeded:', error);
    }
  }

  /**
   * Manejar pago fallido
   */
  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    try {
      const orderId = paymentIntent.metadata.orderId;

      if (!orderId) return;

      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'FAILED',
        },
      });

      logger.info(`Payment failed for order ${orderId}`);
    } catch (error) {
      logger.error('Error handling payment_intent.payment_failed:', error);
    }
  }

  /**
   * Manejar pago cancelado
   */
  private async handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
    try {
      const orderId = paymentIntent.metadata.orderId;

      if (!orderId) return;

      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'CANCELLED',
        },
      });

      logger.info(`Payment cancelled for order ${orderId}`);
    } catch (error) {
      logger.error('Error handling payment_intent.canceled:', error);
    }
  }

  /**
   * Manejar reembolso de cargo
   */
  private async handleChargeRefunded(charge: Stripe.Charge) {
    try {
      logger.info(`Charge refunded: ${charge.id}`);
      // Lógica adicional si es necesario
    } catch (error) {
      logger.error('Error handling charge.refunded:', error);
    }
  }

  /**
   * Manejar disputa creada
   */
  private async handleDisputeCreated(dispute: Stripe.Dispute) {
    try {
      logger.warn(`Dispute created: ${dispute.id} - Amount: ${dispute.amount}`);
      
      // Enviar notificación al admin
      // TODO: Implementar notificación
      
    } catch (error) {
      logger.error('Error handling charge.dispute.created:', error);
    }
  }

  /**
   * Crear reembolso por Payment Intent
   */
  async createRefundByPaymentIntent(paymentIntentId: string, amount: number, reason?: string) {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: Math.round(amount), // amount en centavos
        reason: 'requested_by_customer',
        metadata: {
          reason: reason || 'Modificación de pedido',
        },
      });

      logger.info(`Refund created: ${refund.id} for ${amount / 100}€`);
      return refund;
    } catch (error) {
      logger.error('Error creating refund:', error);
      throw new AppError(500, 'Error procesando reembolso', 'REFUND_ERROR');
    }
  }

  /**
   * Crear pago adicional (para modificaciones de pedido)
   */
  async createAdditionalPayment(orderId: string, userId: string, amount: number, description?: string) {
    try {
      const order = await prisma.order.findFirst({
        where: { id: orderId, userId },
        include: { user: true },
      });

      if (!order) {
        throw new AppError(404, 'Pedido no encontrado', 'ORDER_NOT_FOUND');
      }

      const amountInCents = Math.round(amount * 100);

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'eur',
        payment_method_types: ['card'],
        customer: order.stripeCustomerId || undefined,
        description: description || `Cargo adicional - Pedido ${order.orderNumber}`,
        metadata: {
          orderId: order.id,
          userId: order.userId,
          orderNumber: order.orderNumber,
          type: 'additional_charge',
        },
      });

      logger.info(`Additional payment created: ${paymentIntent.id} for €${amount}`);
      return paymentIntent;
    } catch (error) {
      logger.error('Error creating additional payment:', error);
      throw new AppError(500, 'Error creando cargo adicional', 'PAYMENT_ERROR');
    }
  }

  /**
   * Crear Payment Link para cobro de fianza
   */
  async createDepositPaymentLink(orderId: string, depositAmount: number) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: true,
        },
      });

      if (!order) {
        throw new AppError(404, 'Pedido no encontrado', 'ORDER_NOT_FOUND');
      }

      // Convertir a centavos
      const amount = Math.round(depositAmount * 100);

      // Crear un Payment Link
      const paymentLink = await this.stripe.paymentLinks.create({
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `Fianza - Pedido ${order.orderNumber}`,
                description: `Cobro de fianza para el pedido ${order.orderNumber}`,
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        after_completion: {
          type: 'redirect',
          redirect: {
            url: `${process.env.APP_URL || 'http://localhost:3000'}/payment-success?orderId=${orderId}&type=deposit`,
          },
        },
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          type: 'deposit',
          userId: order.userId,
        },
        phone_number_collection: {
          enabled: true,
        },
        customer_creation: 'always',
      });

      logger.info(`Deposit payment link created: ${paymentLink.url} for order ${order.orderNumber}`);

      return {
        url: paymentLink.url,
        id: paymentLink.id,
      };
    } catch (error) {
      logger.error('Error creating deposit payment link:', error);
      throw new AppError(500, 'Error creando link de pago para fianza', 'PAYMENT_LINK_ERROR');
    }
  }

  /**
   * Crear Terminal Connection Token para Tap to Pay
   */
  async createTerminalConnectionToken() {
    try {
      const connectionToken = await this.stripe.terminal.connectionTokens.create();
      
      logger.info('Terminal connection token created');
      
      return {
        secret: connectionToken.secret,
      };
    } catch (error) {
      logger.error('Error creating terminal connection token:', error);
      throw new AppError(500, 'Error creando token de terminal', 'TERMINAL_TOKEN_ERROR');
    }
  }

  /**
   * Crear Payment Intent para Terminal (Tap to Pay)
   */
  async createTerminalPaymentIntent(orderId: string, amount: number, description: string) {
    try {
      const amountInCents = Math.round(amount * 100);

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'eur',
        payment_method_types: ['card_present'],
        capture_method: 'automatic',
        metadata: {
          orderId,
          type: 'deposit',
        },
        description,
      });

      logger.info(`Terminal Payment Intent created: ${paymentIntent.id} for order ${orderId}`);

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: amountInCents,
      };
    } catch (error) {
      logger.error('Error creating terminal payment intent:', error);
      throw new AppError(500, 'Error creando intención de pago para terminal', 'TERMINAL_PAYMENT_ERROR');
    }
  }

  /**
   * Confirmar pago de Terminal
   */
  async confirmTerminalPayment(paymentIntentId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      logger.info(`Terminal payment confirmed: ${paymentIntentId}`);
      
      return paymentIntent;
    } catch (error) {
      logger.error('Error confirming terminal payment:', error);
      throw new AppError(500, 'Error confirmando pago de terminal', 'TERMINAL_CONFIRM_ERROR');
    }
  }

  /**
   * Obtener configuración pública de Stripe
   */
  getPublicConfig() {
    return {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      currency: 'eur',
      country: 'ES',
    };
  }
}

export const stripeService = new StripeService();
