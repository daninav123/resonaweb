/**
 * ORDER EXPIRATION SERVICE
 * 
 * Gestiona la expiración automática de pedidos pendientes de pago.
 * - Expira pedidos después de 30 minutos sin pago
 * - Libera stock automáticamente
 * - Notifica al usuario
 * - Registra en logs
 */

import { PrismaClient, OrderStatus, PaymentStatus } from '@prisma/client';
import { logger } from '../utils/logger';
import { emailService } from './email.service';

const prisma = new PrismaClient();

// Configuración
const EXPIRATION_TIME_MINUTES = parseInt(process.env.ORDER_EXPIRATION_MINUTES || '30');
const CHECK_INTERVAL_MINUTES = parseInt(process.env.ORDER_CHECK_INTERVAL_MINUTES || '5');

interface ExpirationResult {
  total: number;
  expired: string[];
  errors: Array<{ orderId: string; error: string }>;
}

class OrderExpirationService {
  /**
   * Verificar y expirar pedidos pendientes que hayan excedido el tiempo límite
   */
  async checkAndExpireOrders(): Promise<ExpirationResult> {
    const result: ExpirationResult = {
      total: 0,
      expired: [],
      errors: []
    };

    try {
      // Calcular tiempo límite
      const expirationTime = new Date();
      expirationTime.setMinutes(expirationTime.getMinutes() - EXPIRATION_TIME_MINUTES);

      logger.info(`🔍 Checking for expired orders created before ${expirationTime.toISOString()}`);

      // Buscar pedidos pendientes que deban expirar
      const pendingOrders = await prisma.order.findMany({
        where: {
          // Pedidos PENDING sin pago completado
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          // Creados hace más del tiempo de expiración
          createdAt: {
            lt: expirationTime
          },
          // No están ya cancelados
          cancelledAt: null
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      result.total = pendingOrders.length;

      if (pendingOrders.length === 0) {
        logger.info('✅ No orders to expire');
        return result;
      }

      logger.info(`⏰ Found ${pendingOrders.length} orders to expire`);

      // Expirar cada pedido
      for (const order of pendingOrders) {
        try {
          await this.expireOrder(order);
          result.expired.push(order.id);
          
          logger.info(`✅ Order ${order.orderNumber} expired and stock released`);
        } catch (error: any) {
          logger.error(`❌ Error expiring order ${order.orderNumber}:`, error);
          result.errors.push({
            orderId: order.id,
            error: error.message
          });
        }
      }

      // Log resumen
      logger.info(`📊 Expiration summary:
        - Total checked: ${result.total}
        - Successfully expired: ${result.expired.length}
        - Errors: ${result.errors.length}
      `);

    } catch (error: any) {
      logger.error('❌ Error in checkAndExpireOrders:', error);
      throw error;
    }

    return result;
  }

  /**
   * Expirar un pedido específico
   */
  private async expireOrder(order: any): Promise<void> {
    const orderNumber = order.orderNumber;
    
    logger.info(`⏱️  Expiring order ${orderNumber}...`);

    // Usar transacción para garantizar consistencia
    await prisma.$transaction(async (tx) => {
      // 1. Actualizar estado del pedido
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CANCELLED,
          paymentStatus: PaymentStatus.CANCELLED,
          cancelledAt: new Date(),
          cancelReason: `Pedido expirado automáticamente después de ${EXPIRATION_TIME_MINUTES} minutos sin pago.`,
          updatedAt: new Date()
        }
      });

      // 2. Liberar stock de los productos
      for (const item of order.items) {
        if (item.product) {
          // Incrementar stock disponible
          await tx.product.update({
            where: { id: item.product.id },
            data: {
              stock: {
                increment: item.quantity
              },
              updatedAt: new Date()
            }
          });

          logger.info(`  📦 Released ${item.quantity} units of ${item.product.name} (ID: ${item.product.id})`);
        }
      }

      // 3. Añadir nota al pedido
      await tx.orderNote.create({
        data: {
          orderId: order.id,
          userId: order.userId, // Usuario del pedido
          content: `Pedido expirado automáticamente. El tiempo límite de pago (${EXPIRATION_TIME_MINUTES} minutos) fue excedido. Stock liberado.`,
          isInternal: true
        }
      });
    });

    // 4. Enviar notificación al usuario (fuera de la transacción)
    try {
      await this.sendExpirationEmail(order);
    } catch (emailError: any) {
      // No fallar si el email falla, solo log
      logger.error(`⚠️  Failed to send expiration email for order ${orderNumber}:`, emailError);
    }
  }

  /**
   * Enviar email de notificación al usuario
   */
  private async sendExpirationEmail(order: any): Promise<void> {
    if (!order.user || !order.user.email) {
      logger.warn(`⚠️  No user email for order ${order.orderNumber}`);
      return;
    }

    const userName = order.user.firstName 
      ? `${order.user.firstName} ${order.user.lastName || ''}`.trim()
      : order.user.email;

    try {
      await emailService.sendOrderExpirationEmail({
        to: order.user.email,
        userName,
        orderNumber: order.orderNumber,
        orderTotal: order.total.toString(),
        expirationMinutes: EXPIRATION_TIME_MINUTES,
        items: order.items.map((item: any) => ({
          name: item.name || item.product?.name || 'Producto',
          quantity: item.quantity,
          price: item.price.toString()
        }))
      });

      logger.info(`📧 Expiration email sent to ${order.user.email}`);
    } catch (error: any) {
      logger.error(`❌ Error sending expiration email:`, error);
      throw error;
    }
  }

  /**
   * Expirar manualmente un pedido específico por ID
   */
  async expireOrderById(orderId: string, reason?: string): Promise<void> {
    logger.info(`🔧 Manual expiration requested for order ${orderId}`);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new Error(`Order ${orderId} is already cancelled`);
    }

    if (order.paymentStatus === PaymentStatus.COMPLETED || order.paymentStatus === PaymentStatus.SUCCEEDED) {
      throw new Error(`Order ${orderId} has been paid and cannot be expired`);
    }

    // Modificar el cancel reason si se proporciona
    if (reason) {
      order.cancelReason = reason;
    }

    await this.expireOrder(order);
    logger.info(`✅ Order ${order.orderNumber} expired manually`);
  }

  /**
   * Obtener estadísticas de expiración
   */
  async getExpirationStats() {
    const now = new Date();
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() - EXPIRATION_TIME_MINUTES);

    const [
      pendingCount,
      expiringSoonCount,
      expiredTodayCount
    ] = await Promise.all([
      // Pedidos pendientes actualmente
      prisma.order.count({
        where: {
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          cancelledAt: null
        }
      }),

      // Pedidos que expirarán en los próximos 10 minutos
      prisma.order.count({
        where: {
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          cancelledAt: null,
          createdAt: {
            lt: new Date(now.getTime() - (EXPIRATION_TIME_MINUTES - 10) * 60000),
            gte: expirationTime
          }
        }
      }),

      // Pedidos expirados hoy
      prisma.order.count({
        where: {
          status: OrderStatus.CANCELLED,
          cancelReason: {
            contains: 'expirado automáticamente'
          },
          cancelledAt: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
          }
        }
      })
    ]);

    return {
      expirationTimeMinutes: EXPIRATION_TIME_MINUTES,
      checkIntervalMinutes: CHECK_INTERVAL_MINUTES,
      currentPendingOrders: pendingCount,
      expiringSoon: expiringSoonCount,
      expiredToday: expiredTodayCount
    };
  }
}

// Exportar instancia única
export const orderExpirationService = new OrderExpirationService();
export { EXPIRATION_TIME_MINUTES, CHECK_INTERVAL_MINUTES };
