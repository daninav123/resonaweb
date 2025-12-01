import { Router } from 'express';
import Stripe from 'stripe';
import { prisma } from '../index';
import { logger } from '../utils/logger';

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
          
          // Si tiene metadata de tipo deposit
          if (paymentIntent.metadata?.type === 'deposit') {
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
          break;
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          logger.warn(`Payment intent failed: ${paymentIntent.id}`);
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
