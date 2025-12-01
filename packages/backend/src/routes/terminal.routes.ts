import { Router } from 'express';
import { stripeService } from '../services/stripe.service';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Obtener lista de pedidos con fianza pendiente
 */
router.get(
  '/pending-deposits',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  async (req, res, next) => {
    try {
      // Obtener pedidos con fianza pendiente o autorizada
      const orders = await prisma.order.findMany({
        where: {
          depositAmount: {
            gt: 0,
          },
          depositStatus: {
            in: ['PENDING', 'AUTHORIZED'],
          },
          status: {
            not: 'CANCELLED',
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          items: {
            select: {
              id: true,
              quantity: true,
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 50, // Limitar a 50 pedidos más recientes
      });

      // Formatear para la app móvil
      const formattedOrders = orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        depositAmount: Number(order.depositAmount),
        depositStatus: order.depositStatus,
        status: order.status,
        createdAt: order.createdAt,
        startDate: order.startDate,
        endDate: order.endDate,
        customer: {
          name: `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || order.user.email,
          email: order.user.email,
          phone: order.user.phone,
        },
        itemsCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        itemsSummary: order.items
          .map(item => `${item.quantity}x ${item.product.name}`)
          .slice(0, 3)
          .join(', '),
      }));

      res.json({
        success: true,
        count: formattedOrders.length,
        data: formattedOrders,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Crear Connection Token para Stripe Terminal
 * Este token permite que el SDK de Terminal se conecte a Stripe
 */
router.post(
  '/connection-token',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  async (req, res, next) => {
    try {
      const token = await stripeService.createTerminalConnectionToken();
      res.json(token);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Crear Payment Intent para cobrar fianza con Terminal
 */
router.post(
  '/deposit-payment-intent',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  async (req, res, next) => {
    try {
      const { orderId } = req.body;

      if (!orderId) {
        throw new AppError(400, 'Order ID requerido', 'ORDER_ID_REQUIRED');
      }

      // Obtener el pedido
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: true,
        },
      });

      if (!order) {
        throw new AppError(404, 'Pedido no encontrado', 'ORDER_NOT_FOUND');
      }

      if (order.depositStatus === 'CAPTURED') {
        throw new AppError(400, 'La fianza ya ha sido cobrada', 'DEPOSIT_ALREADY_CAPTURED');
      }

      if (Number(order.depositAmount) <= 0) {
        throw new AppError(400, 'El pedido no tiene fianza a cobrar', 'NO_DEPOSIT');
      }

      // Crear Payment Intent para Terminal
      const paymentIntent = await stripeService.createTerminalPaymentIntent(
        order.id,
        Number(order.depositAmount),
        `Fianza - Pedido ${order.orderNumber}`
      );

      logger.info(`Terminal Payment Intent created for order ${order.orderNumber}`);

      res.json({
        success: true,
        data: paymentIntent,
        order: {
          orderNumber: order.orderNumber,
          depositAmount: order.depositAmount,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Confirmar que el pago de Terminal se completó
 */
router.post(
  '/confirm-payment',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  async (req, res, next) => {
    try {
      const { paymentIntentId, orderId } = req.body;

      if (!paymentIntentId || !orderId) {
        throw new AppError(400, 'Payment Intent ID y Order ID requeridos', 'MISSING_PARAMS');
      }

      // Verificar el pago en Stripe
      const paymentIntent = await stripeService.confirmTerminalPayment(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        // Actualizar el pedido
        await prisma.order.update({
          where: { id: orderId },
          data: {
            depositStatus: 'CAPTURED',
            depositPaidAt: new Date(),
            depositNotes: `Fianza cobrada con Terminal - Payment Intent: ${paymentIntentId}`,
          },
        });

        logger.info(`Deposit captured via Terminal for order ${orderId}`);

        res.json({
          success: true,
          message: 'Fianza cobrada correctamente',
        });
      } else {
        throw new AppError(400, 'El pago no se completó correctamente', 'PAYMENT_NOT_COMPLETED');
      }
    } catch (error) {
      next(error);
    }
  }
);

export default router;
