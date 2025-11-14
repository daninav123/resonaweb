import Stripe from 'stripe';
import { PrismaClient, PaymentStatus, PaymentMethod } from '@prisma/client';
import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

interface CreatePaymentData {
  orderId: string;
  amount: number;
  currency?: string;
  paymentMethod?: PaymentMethod;
  metadata?: Record<string, string>;
}

interface RefundData {
  paymentId: string;
  amount?: number;
  reason?: string;
}

export class PaymentService {
  /**
   * Create a payment intent with Stripe
   */
  async createPaymentIntent(data: CreatePaymentData) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: data.orderId },
        include: { user: true },
      });

      if (!order) {
        throw new AppError(404, 'Pedido no encontrado', 'ORDER_NOT_FOUND');
      }

      // Create or get customer in Stripe
      let stripeCustomer;
      let stripeCustomerId = (order as any).user.stripeCustomerId;
      
      if (!stripeCustomerId) {
        stripeCustomer = await stripe.customers.create({
          email: order.user.email,
          name: `${order.user.firstName} ${order.user.lastName}`,
          phone: order.user.phone || undefined,
        });

        stripeCustomerId = stripeCustomer.id;
        
        // Update user with Stripe customer ID
        await prisma.user.update({
          where: { id: order.user.id },
          data: { stripeCustomerId: stripeCustomerId,
          },
        });
      } else {
        stripeCustomer = await stripe.customers.retrieve(stripeCustomerId);
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency || 'eur',
        customer: stripeCustomerId,
        metadata: {
          orderId: data.orderId,
          orderNumber: order.orderNumber,
          ...data.metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Create payment record in database
      const payment = await prisma.payment.create({
        data: {
          amount: data.amount,
          currency: data.currency || 'EUR',
          stripePaymentIntentId: paymentIntent.id,
          stripeCustomerId: stripeCustomerId,
          order: { connect: { id: data.orderId } },
          status: PaymentStatus.PENDING,
          method: data.metadata?.paymentMethod === 'card' ? PaymentMethod.STRIPE : PaymentMethod.STRIPE,
        },
      });

      logger.info(`Payment intent created for order ${order.orderNumber}: ${paymentIntent.id}`);

      return {
        payment,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      logger.error('Error creating payment intent:', error);
      throw error;
    }
  }

  /**
   * Confirm payment
   */
  async confirmPayment(paymentIntentId: string) {
    try {
      // Get payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      // Find payment in database
      const payment = await prisma.payment.findUnique({
        where: { stripePaymentIntentId: paymentIntentId },
        include: { order: true as any,
        },
      });

      if (!payment) {
        throw new AppError(404, 'Pago no encontrado', 'PAYMENT_NOT_FOUND');
      }

      // Map Stripe status to our status
      let status: PaymentStatus;
      switch (paymentIntent.status) {
        case 'succeeded':
          status = PaymentStatus.SUCCEEDED;
          break;
        case 'processing':
          status = PaymentStatus.PROCESSING;
          break;
        case 'requires_payment_method':
        case 'requires_confirmation':
        case 'requires_action':
          status = PaymentStatus.PENDING;
          break;
        case 'canceled':
          status = PaymentStatus.CANCELLED;
          break;
        default:
          status = PaymentStatus.FAILED;
      }

      // Update payment status
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status,
          stripePaymentIntentId: paymentIntent.id,
          ...(status === PaymentStatus.SUCCEEDED && { paidAt: new Date() }),
        },
      });

      // Update order payment status if there's an orderId
      if ((payment as any).orderId) {
        await prisma.order.update({
          where: { id: (payment as any).orderId },
          data: {
            paymentStatus: status,
            ...(status === PaymentStatus.SUCCEEDED && {
              status: 'CONFIRMED',
              confirmedAt: new Date(),
            }),
          },
        });
      }

      logger.info(`Payment confirmed for order ${payment.order?.orderNumber || 'N/A'}: ${status}`);

      return updatedPayment;
    } catch (error) {
      logger.error('Error confirming payment:', error);
      throw error;
    }
  }

  /**
   * Create refund
   */
  async createRefund(data: RefundData) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: data.paymentId },
        include: { order: true as any },
      });

      if (!payment) {
        throw new AppError(404, 'Pago no encontrado', 'PAYMENT_NOT_FOUND');
      }

      if (payment.status !== PaymentStatus.SUCCEEDED) {
        throw new AppError(400, 'Solo se pueden reembolsar pagos completados', 'INVALID_PAYMENT_STATUS');
      }

      if (!payment.stripePaymentIntentId) {
        throw new AppError(400, 'No se encontró el ID de pago de Stripe', 'NO_STRIPE_ID');
      }

      // Create refund in Stripe
      const refund = await stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        amount: data.amount ? Math.round(data.amount * 100) : undefined, // Partial refund if amount specified
        reason: data.reason as Stripe.RefundCreateParams.Reason || 'requested_by_customer',
      });

      // Update payment status
      const refundedAmount = (refund.amount / 100);
      const isFullRefund = refundedAmount >= Number(Number(payment.amount));

      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: isFullRefund ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED,
          refundedAmount: refundedAmount as any,
          refundedAt: new Date(),
        },
      });

      // Update order status if fully refunded and has orderId
      if (isFullRefund && (payment as any).orderId) {
        await prisma.order.update({
          where: { id: (payment as any).orderId },
          data: {
            paymentStatus: PaymentStatus.REFUNDED,
            status: 'CANCELLED',
            cancelledAt: new Date(),
          },
        });
      }

      logger.info(`Refund created for payment ${payment.id}: ${refund.id}`);

      return {
        payment: updatedPayment,
        refund,
      };
    } catch (error) {
      logger.error('Error creating refund:', error);
      throw error;
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { order: true as any,
        },
      });

      if (!payment) {
        throw new AppError(404, 'Pago no encontrado', 'PAYMENT_NOT_FOUND');
      }

      // If payment has Stripe ID, get latest status from Stripe
      if (payment.stripePaymentIntentId) {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);
          
          return {
            payment,
            stripeStatus: paymentIntent.status,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
          };
        } catch (stripeError) {
          logger.warn('Could not retrieve Stripe payment intent:', stripeError);
        }
      }

      return payment;
    } catch (error) {
      logger.error('Error getting payment status:', error);
      throw error;
    }
  }

  /**
   * Handle Stripe webhook
   */
  async handleWebhook(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await this.confirmPayment(paymentIntent.id);
          break;

        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object as Stripe.PaymentIntent;
          await this.updatePaymentStatus(failedPayment.id, PaymentStatus.FAILED);
          break;

        case 'charge.refunded':
          const charge = event.data.object as Stripe.Charge;
          if (charge.payment_intent) {
            await this.handleRefundWebhook(charge.payment_intent as string, charge.amount_refunded);
          }
          break;

        default:
          logger.info(`Unhandled webhook event type: ${event.type}`);
      }
    } catch (error) {
      logger.error('Error handling webhook:', error);
      throw error;
    }
  }

  /**
   * Update payment status
   */
  private async updatePaymentStatus(paymentIntentId: string, status: PaymentStatus) {
    try {
      const payment = await prisma.payment.findFirst({
        where: { stripePaymentIntentId: paymentIntentId },
      });

      if (!payment) {
        logger.warn(`Payment not found for intent: ${paymentIntentId}`);
        return;
      }

      await prisma.payment.update({
        where: { id: payment.id },
        data: { 
          status,
          ...(status === PaymentStatus.FAILED && { failedAt: new Date() }),
        },
      });

      if ((payment as any).orderId) {
        await prisma.order.update({
          where: { id: (payment as any).orderId },
          data: { paymentStatus: status },
        });
      }

      logger.info(`Payment status updated to ${status} for intent: ${paymentIntentId}`);
    } catch (error) {
      logger.error('Error updating payment status:', error);
      throw error;
    }
  }

  /**
   * Handle refund webhook
   */
  private async handleRefundWebhook(paymentIntentId: string, amountRefunded: number) {
    try {
      const payment = await prisma.payment.findFirst({
        where: { stripePaymentIntentId: paymentIntentId },
      });

      if (!payment) {
        logger.warn(`Payment not found for refund: ${paymentIntentId}`);
        return;
      }

      const refundedAmount = amountRefunded / 100;
      const isFullRefund = refundedAmount >= Number(Number(payment.amount));

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: isFullRefund ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED,
          refundedAmount: refundedAmount as any,
          refundedAt: new Date(),
        },
      });

      logger.info(`Refund processed for payment: ${payment.id}`);
    } catch (error) {
      logger.error('Error handling refund webhook:', error);
      throw error;
    }
  }

  /**
   * Get payment methods for user
   */
  async getPaymentMethods(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || !(user as any).stripeCustomerId) {
        return [];
      }

      const paymentMethods = await stripe.paymentMethods.list({
        customer: (user as any).stripeCustomerId,
        type: 'card',
      });

      return paymentMethods.data.map(pm => ({
        id: pm.id,
        type: pm.type,
        card: pm.card ? {
          brand: pm.card.brand,
          last4: pm.card.last4,
          expMonth: pm.card.exp_month,
          expYear: pm.card.exp_year,
        } : null,
      }));
    } catch (error) {
      logger.error('Error getting payment methods:', error);
      throw error;
    }
  }

  /**
   * Get payment history for user
   */
  async getPaymentHistory(userId: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where: {
            order: {
              userId,
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: { order: true as any,
          },
        }),
        prisma.payment.count({
          where: {
            order: {
              userId,
            },
          },
        }),
      ]);

      return {
        payments,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error getting payment history:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
