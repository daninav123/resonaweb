import { prisma } from '../index';
import { logger } from './logger';

/**
 * Helper para crear notificaciones de forma fácil
 */
export class NotificationHelper {
  /**
   * Enviar notificación a todos los admins
   */
  static async notifyAdmins(type: string, title: string, message: string, metadata?: any) {
    try {
      // Obtener todos los usuarios admin
      const admins = await prisma.user.findMany({
        where: {
          role: { in: ['ADMIN', 'SUPERADMIN'] },
          isActive: true,
        },
        select: { id: true },
      });

      // Crear notificación para cada admin
      const notifications = await Promise.all(
        admins.map((admin) =>
          prisma.notification.create({
            data: {
              userId: admin.id,
              type,
              title,
              message,
              data: metadata,
            },
          })
        )
      );

      logger.info(`📢 Notificación enviada a ${admins.length} admins: ${title}`);
      return notifications;
    } catch (error) {
      logger.error('Error creating admin notifications:', error);
      throw error;
    }
  }

  /**
   * Enviar notificación a un usuario específico
   */
  static async notifyUser(
    userId: string,
    type: string,
    title: string,
    message: string,
    metadata?: any
  ) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          data: metadata,
        },
      });

      logger.info(`📢 Notificación enviada al usuario ${userId}: ${title}`);
      return notification;
    } catch (error) {
      logger.error('Error creating user notification:', error);
      throw error;
    }
  }

  /**
   * Notificación de nuevo pedido (a admins)
   */
  static async notifyNewOrder(orderNumber: string, customerName: string, total: number) {
    return this.notifyAdmins(
      'ORDER_CREATED',
      '🛒 Nuevo Pedido Recibido',
      `Pedido ${orderNumber} de ${customerName} por ${total.toFixed(2)}€`,
      { orderNumber, customerName, total }
    );
  }

  /**
   * Notificación de pago recibido (a admins)
   */
  static async notifyPaymentReceived(orderNumber: string, amount: number) {
    return this.notifyAdmins(
      'PAYMENT_RECEIVED',
      '💳 Pago Recibido',
      `Se ha recibido el pago del pedido ${orderNumber} por ${amount.toFixed(2)}€`,
      { orderNumber, amount }
    );
  }

  /**
   * Notificación de stock bajo (a admins)
   */
  static async notifyLowStock(productName: string, sku: string, currentStock: number, neededStock: number) {
    return this.notifyAdmins(
      'LOW_STOCK',
      '⚠️ Stock Bajo',
      `${productName} (${sku}): Solo quedan ${currentStock} unidades. Se necesitan ${neededStock} para próximos pedidos.`,
      { productName, sku, currentStock, neededStock }
    );
  }

  /**
   * Notificación de pedido confirmado (al cliente)
   */
  static async notifyOrderConfirmed(userId: string, orderNumber: string) {
    return this.notifyUser(
      userId,
      'ORDER_CONFIRMED',
      '✅ Pedido Confirmado',
      `Tu pedido ${orderNumber} ha sido confirmado y está siendo procesado.`,
      { orderNumber }
    );
  }

  /**
   * Notificación de factura disponible (al cliente)
   */
  static async notifyInvoiceReady(userId: string, invoiceNumber: string, orderNumber: string) {
    return this.notifyUser(
      userId,
      'INVOICE_READY',
      '📄 Factura Disponible',
      `Tu factura ${invoiceNumber} para el pedido ${orderNumber} está lista para descargar.`,
      { invoiceNumber, orderNumber }
    );
  }

  /**
   * Notificación de solicitud de presupuesto (a admins)
   */
  static async notifyQuoteRequest(customerEmail: string, eventType: string, attendees: number) {
    return this.notifyAdmins(
      'QUOTE_REQUEST',
      '💬 Nueva Solicitud de Presupuesto',
      `${customerEmail} solicita presupuesto para ${eventType} con ${attendees} asistentes.`,
      { customerEmail, eventType, attendees }
    );
  }
}
