import { PrismaClient } from '@prisma/client';
import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import sgMail from '@sendgrid/mail';
import handlebars from 'handlebars';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || 'SG.test');

interface EmailData {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: string;
  }>;
}

interface NotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  emailSent?: boolean;
}

export class NotificationService {
  private fromEmail: string;

  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@resona.com';
  }

  /**
   * Send email using SendGrid
   */
  async sendEmail(emailData: EmailData) {
    try {
      const msg: any = {
        to: emailData.to,
        from: {
          email: this.fromEmail,
          name: 'ReSona Eventos',
        },
        subject: emailData.subject,
        html: emailData.html,
        attachments: emailData.attachments,
      };

      // Send email
      if (process.env.NODE_ENV === 'production') {
        await sgMail.send(msg);
        logger.info(`Email sent to ${emailData.to}: ${emailData.subject}`);
      } else {
        // In development, just log
        logger.info(`[DEV] Email would be sent to ${emailData.to}: ${emailData.subject}`);
        console.log('Email HTML preview:', emailData.html.substring(0, 200) + '...');
      }

      return {
        success: true,
        message: 'Email enviado exitosamente',
      };
    } catch (error) {
      logger.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(orderId: string) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
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

      const html = `
        <h2>Confirmación de Pedido #${order.orderNumber}</h2>
        <p>Hola ${((order as any).user?.firstName || '')},</p>
        <p>Tu pedido ha sido confirmado exitosamente.</p>
        <h3>Detalles:</h3>
        <ul>
          <li>Fecha del evento: ${new Date(order.startDate).toLocaleDateString('es-ES')} - ${new Date(order.endDate).toLocaleDateString('es-ES')}</li>
          <li>Total: €${order.total}</li>
          <li>Tipo de entrega: ${order.deliveryType === 'DELIVERY' ? 'Entrega a domicilio' : 'Recogida en almacén'}</li>
        </ul>
        <h3>Productos:</h3>
        <ul>
          ${((order as any).items || []).map(item => 
            `<li>${item.product.name} (x${item.quantity}) - €${item.totalPrice}</li>`
          ).join('')}
        </ul>
        <p>Recibirás otro email cuando tu pedido esté listo.</p>
        <p>Gracias por confiar en ReSona Eventos.</p>
      `;

      await this.sendEmail({
        to: ((order as any).user?.email || ''),
        subject: `Confirmación de Pedido #${order.orderNumber}`,
        html,
      });

      // Create notification record
      await this.createNotification({
        userId: order.userId,
        type: 'ORDER_CONFIRMATION',
        title: 'Pedido Confirmado',
        message: `Tu pedido #${order.orderNumber} ha sido confirmado`,
        data: { orderId: order.id },
        emailSent: true,
      });

      logger.info(`Order confirmation email sent for order ${order.orderNumber}`);
    } catch (error) {
      logger.error('Error sending order confirmation:', error);
      throw error;
    }
  }

  /**
   * Send payment received email
   */
  async sendPaymentReceived(paymentId: string) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          order: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!payment) {
        throw new AppError(404, 'Pago no encontrado', 'PAYMENT_NOT_FOUND');
      }

      const html = `
        <h2>Pago Recibido - Pedido #${payment.order.orderNumber}</h2>
        <p>Hola ${((payment.order as any).user?.firstName || '')},</p>
        <p>Hemos recibido tu pago de <strong>€${payment.amount}</strong> para el pedido #${payment.order.orderNumber}.</p>
        <p>Fecha del pago: ${new Date(payment.paidAt || payment.createdAt).toLocaleDateString('es-ES')}</p>
        <p>Método de pago: ${(payment as any).method || 'No especificado'}</p>
        <p>Tu factura estará disponible próximamente en tu cuenta.</p>
        <p>Gracias por tu pago.</p>
      `;

      await this.sendEmail({
        to: ((payment.order as any).user?.email || ''),
        subject: `Pago Recibido - Pedido #${payment.order.orderNumber}`,
        html,
      });

      await this.createNotification({
        userId: payment.order.userId,
        type: 'PAYMENT_RECEIVED',
        title: 'Pago Recibido',
        message: `Hemos recibido tu pago para el pedido #${payment.order.orderNumber}`,
        data: { paymentId: payment.id },
        emailSent: true,
      });

      logger.info(`Payment received email sent for order ${payment.order.orderNumber}`);
    } catch (error) {
      logger.error('Error sending payment received email:', error);
      throw error;
    }
  }

  /**
   * Send order ready email
   */
  async sendOrderReady(orderId: string) {
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

      const html = `
        <h2>Tu Pedido #${order.orderNumber} está Listo</h2>
        <p>Hola ${((order as any).user?.firstName || '')},</p>
        <p>Tu pedido está listo para ${order.deliveryType === 'DELIVERY' ? 'entrega' : 'recogida'}.</p>
        <p>Fecha programada: ${new Date(order.deliveryDate || order.startDate).toLocaleDateString('es-ES')}</p>
        ${order.deliveryAddress ? `<p>Dirección de entrega: ${order.deliveryAddress}</p>` : ''}
        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
      `;

      await this.sendEmail({
        to: ((order as any).user?.email || ''),
        subject: `Tu Pedido #${order.orderNumber} está Listo`,
        html,
      });

      await this.createNotification({
        userId: order.userId,
        type: 'ORDER_READY',
        title: 'Pedido Listo',
        message: `Tu pedido #${order.orderNumber} está listo`,
        data: { orderId: order.id },
        emailSent: true,
      });

      logger.info(`Order ready email sent for order ${order.orderNumber}`);
    } catch (error) {
      logger.error('Error sending order ready email:', error);
      throw error;
    }
  }

  /**
   * Send order delivered email
   */
  async sendOrderDelivered(orderId: string) {
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

      const html = `
        <h2>Pedido #${order.orderNumber} Entregado</h2>
        <p>Hola ${((order as any).user?.firstName || '')},</p>
        <p>Tu pedido ha sido entregado exitosamente.</p>
        <p>Fecha de entrega: ${new Date().toLocaleDateString('es-ES')}</p>
        <p>Fecha de devolución prevista: ${new Date(order.endDate).toLocaleDateString('es-ES')}</p>
        <p>Esperamos que todo esté perfecto para tu evento. ¡Disfrútalo!</p>
      `;

      await this.sendEmail({
        to: ((order as any).user?.email || ''),
        subject: `Pedido #${order.orderNumber} Entregado`,
        html,
      });

      await this.createNotification({
        userId: order.userId,
        type: 'ORDER_DELIVERED',
        title: 'Pedido Entregado',
        message: `Tu pedido #${order.orderNumber} ha sido entregado`,
        data: { orderId: order.id },
        emailSent: true,
      });

      logger.info(`Order delivered email sent for order ${order.orderNumber}`);
    } catch (error) {
      logger.error('Error sending order delivered email:', error);
      throw error;
    }
  }

  /**
   * Send event reminder (24h before)
   */
  async sendEventReminder(orderId: string) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
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

      const html = `
        <h2>Recordatorio: Tu evento es mañana</h2>
        <p>Hola ${((order as any).user?.firstName || '')},</p>
        <p>Te recordamos que tu evento es mañana ${new Date(order.startDate).toLocaleDateString('es-ES')}.</p>
        <p>Pedido: #${order.orderNumber}</p>
        <h3>Productos alquilados:</h3>
        <ul>
          ${((order as any).items || []).map((item: any) => 
            `<li>${item.product.name} (x${item.quantity})</li>`
          ).join('')}
        </ul>
        <p>Si necesitas ayuda, llámanos al +34 900 123 456.</p>
        <p>¡Que tengas un evento exitoso!</p>
      `;

      await this.sendEmail({
        to: ((order as any).user?.email || ''),
        subject: `Recordatorio: Tu evento es mañana`,
        html,
      });

      await this.createNotification({
        userId: order.userId,
        type: 'EVENT_REMINDER',
        title: 'Recordatorio de Evento',
        message: `Tu evento es mañana. Pedido #${order.orderNumber}`,
        data: { orderId: order.id },
        emailSent: true,
      });

      logger.info(`Event reminder email sent for order ${order.orderNumber}`);
    } catch (error) {
      logger.error('Error sending event reminder:', error);
      throw error;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new AppError(404, 'Usuario no encontrado', 'USER_NOT_FOUND');
      }

      const html = `
        <h2>¡Bienvenido a ReSona Eventos!</h2>
        <p>Hola ${user.firstName},</p>
        <p>Tu cuenta ha sido creada exitosamente.</p>
        <p>Ahora puedes:</p>
        <ul>
          <li>Explorar nuestro catálogo de productos</li>
          <li>Crear pedidos de alquiler</li>
          <li>Gestionar tu perfil</li>
          <li>Ver el historial de tus pedidos</li>
        </ul>
        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
        <p>¡Gracias por unirte a ReSona Eventos!</p>
      `;

      await this.sendEmail({
        to: user.email,
        subject: 'Bienvenido a ReSona Eventos',
        html,
      });

      await this.createNotification({
        userId: user.id,
        type: 'WELCOME',
        title: 'Bienvenido a ReSona',
        message: 'Tu cuenta ha sido creada exitosamente',
        emailSent: true,
      });

      logger.info(`Welcome email sent to ${user.email}`);
    } catch (error) {
      logger.error('Error sending welcome email:', error);
      throw error;
    }
  }

  /**
   * Send invoice email with attachment
   */
  async sendInvoiceEmail(invoiceId: string, pdfBuffer: Buffer) {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          order: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!invoice) {
        throw new AppError(404, 'Factura no encontrada', 'INVOICE_NOT_FOUND');
      }

      const html = `
        <h2>Factura #${invoice.invoiceNumber}</h2>
        <p>Hola ${((invoice.order as any).user?.firstName || '')},</p>
        <p>Adjuntamos tu factura para el pedido #${invoice.order.orderNumber}.</p>
        <p>Total: €${invoice.total}</p>
        <p>Fecha de vencimiento: ${new Date(invoice.dueDate).toLocaleDateString('es-ES')}</p>
        <p>Gracias por tu confianza.</p>
      `;

      await this.sendEmail({
        to: ((invoice.order as any).user?.email || ''),
        subject: `Factura #${invoice.invoiceNumber}`,
        html,
        attachments: [{
          content: pdfBuffer.toString('base64'),
          filename: `factura-${invoice.invoiceNumber}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment',
        }],
      });

      logger.info(`Invoice email sent for invoice ${invoice.invoiceNumber}`);
    } catch (error) {
      logger.error('Error sending invoice email:', error);
      throw error;
    }
  }

  /**
   * Create notification record
   */
  async createNotification(data: NotificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          data: data.data || {},
          emailSent: data.emailSent || false,
          read: false,
        },
      });

      logger.info(`Notification created for user ${data.userId}: ${data.type}`);

      return notification;
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: string, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where: { userId },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.notification.count({ where: { userId } }),
      ]);

      return {
        notifications,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    try {
      const notification = await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      return notification;
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      return result;
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
