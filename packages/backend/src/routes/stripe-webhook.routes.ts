import { Router } from 'express';
import Stripe from 'stripe';
import { prisma } from '../index';
import { logger } from '../utils/logger';
import { InstallmentService } from '../services/installment.service';

const router = Router();

/**
 * Stripe Webhook Handler
 * Maneja eventos de Stripe (Payment Links, Payment Intents, etc.)
 */
router.post(
  '/stripe',
  async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      logger.error('Stripe webhook secret not configured');
      return res.status(500).send('Webhook secret not configured');
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });

    let event: Stripe.Event;

    try {
      // Verificar la firma del webhook
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );
    } catch (err: any) {
      logger.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Manejar el evento
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          logger.info(`Checkout session completed: ${session.id}`);
          
          // Verificar si es pago de fianza
          if (session.metadata?.type === 'deposit') {
            const orderId = session.metadata.orderId;
            
            if (orderId) {
              // Actualizar el estado de la fianza a CAPTURED
              await prisma.order.update({
                where: { id: orderId },
                data: {
                  depositStatus: 'CAPTURED',
                  depositPaidAt: new Date(),
                  depositNotes: `Fianza pagada mediante Stripe - Session: ${session.id}`,
                },
              });
              
              logger.info(`Deposit payment captured for order ${orderId}`);
            }
          }
          break;
        }

        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          logger.info(`Payment intent succeeded: ${paymentIntent.id}`);
          
          // Verificar si es un pago de plazo (installment)
          const installmentId = paymentIntent.metadata?.installmentId;
          if (installmentId) {
            try {
              const installmentService = new InstallmentService(prisma);
              const chargeId = paymentIntent.charges?.data[0]?.id;
              
              await installmentService.markInstallmentAsPaid(
                installmentId,
                paymentIntent.id,
                chargeId
              );
              
              logger.info(`✅ Installment ${installmentId} marked as paid via webhook`);
            } catch (installmentError) {
              logger.error(`❌ Error marking installment as paid: ${installmentError}`);
            }
          }
          // Si tiene metadata de tipo deposit
          else if (paymentIntent.metadata?.type === 'deposit') {
            const orderId = paymentIntent.metadata.orderId;
            
            if (orderId) {
              await prisma.order.update({
                where: { id: orderId },
                data: {
                  depositStatus: 'CAPTURED',
                  depositPaidAt: new Date(),
                  depositNotes: `Fianza pagada mediante Stripe - Payment Intent: ${paymentIntent.id}`,
                },
              });
              
              logger.info(`Deposit captured via payment intent for order ${orderId}`);
            }
          }
          // Si es el pago inicial del checkout, buscar orden y marcar primer installment
          else {
            try {
              // Buscar orden que tenga este paymentIntentId
              const order = await prisma.order.findFirst({
                where: { 
                  stripePaymentIntentId: paymentIntent.id 
                },
                include: {
                  installments: {
                    orderBy: {
                      installmentNumber: 'asc'
                    }
                  }
                }
              });
              
              if (order && order.installments && order.installments.length > 0) {
                // Marcar el primer plazo (25%) como pagado
                const firstInstallment = order.installments.find(i => i.installmentNumber === 1);
                
                if (firstInstallment && firstInstallment.status === 'PENDING') {
                  const installmentService = new InstallmentService(prisma);
                  const chargeId = paymentIntent.charges?.data[0]?.id;
                  
                  await installmentService.markInstallmentAsPaid(
                    firstInstallment.id,
                    paymentIntent.id,
                    chargeId
                  );
                  
                  logger.info(`✅ First installment (1/3 - 25%) marked as paid for order ${order.id}`);
                }
              }
            } catch (orderError) {
              logger.error(`❌ Error processing initial payment for installments: ${orderError}`);
              // No fallar el webhook si falla esto
            }
          }
          break;
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          logger.warn(`Payment intent failed: ${paymentIntent.id}`);
          
          // Verificar si es un pago de plazo fallido
          const installmentId = paymentIntent.metadata?.installmentId;
          if (installmentId) {
            try {
              const installmentService = new InstallmentService(prisma);
              const errorMessage = paymentIntent.last_payment_error?.message || 'Pago rechazado por Stripe';
              
              await installmentService.markInstallmentAsFailed(installmentId, errorMessage);
              
              logger.warn(`⚠️ Installment ${installmentId} marked as failed: ${errorMessage}`);
            } catch (installmentError) {
              logger.error(`❌ Error marking installment as failed: ${installmentError}`);
            }
          }
          break;
        }

        default:
          logger.info(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      logger.error('Error processing webhook:', error);
      res.status(500).send('Webhook processing error');
    }
  }
);

export default router;
