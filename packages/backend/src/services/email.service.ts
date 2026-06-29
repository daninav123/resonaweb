import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import { Resend } from 'resend';
import { logger } from '../utils/logger';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';

interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  template?: string;
  data?: any;
  attachments?: Array<{
    filename: string;
    content?: Buffer;
    path?: string;
  }>;
}

interface EmailProvider {
  send(options: EmailOptions): Promise<void>;
}

// Nodemailer Provider (Gmail, Outlook, etc)
class NodemailerProvider implements EmailProvider {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async send(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@resona.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        ...(options.replyTo && { replyTo: options.replyTo }),
        attachments: options.attachments,
      });
      logger.info(`Email sent via Nodemailer to ${options.to}`);
    } catch (error) {
      logger.error('Nodemailer error:', error);
      throw error;
    }
  }
}

// SendGrid Provider
class SendGridProvider implements EmailProvider {
  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    }
  }

  async send(options: EmailOptions): Promise<void> {
    try {
      await sgMail.send({
        to: options.to,
        from: process.env.EMAIL_FROM || 'noreply@resona.com',
        subject: options.subject,
        html: options.html,
        text: options.text,
        ...(options.replyTo && { replyTo: options.replyTo }),
      });
      logger.info(`Email sent via SendGrid to ${options.to}`);
    } catch (error) {
      logger.error('SendGrid error:', error);
      throw error;
    }
  }
}

// Resend Provider
class ResendProvider implements EmailProvider {
  private resend: Resend;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    logger.info('🔧 [RESEND] Inicializando Resend Provider:', {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length,
      emailFrom: process.env.EMAIL_FROM
    });
    this.resend = new Resend(apiKey);
  }

  async send(options: EmailOptions): Promise<void> {
    try {
      logger.info('📧 [RESEND] Preparando email:', {
        to: options.to,
        subject: options.subject,
        from: process.env.EMAIL_FROM || 'noreply@resona.com',
        hasHtml: !!options.html
      });
      
      const result = await this.resend.emails.send({
        from: process.env.EMAIL_FROM || 'noreply@resona.com',
        to: options.to,
        subject: options.subject,
        html: options.html || '',
        text: options.text,
        ...(options.replyTo && { replyTo: options.replyTo }),
      });
      
      logger.info('✅ [RESEND] Email enviado correctamente:', {
        to: options.to,
        result: result
      });
    } catch (error: any) {
      logger.error('❌ [RESEND] Error al enviar email:', {
        error: error.message,
        statusCode: error.statusCode,
        to: options.to,
        apiKey: process.env.RESEND_API_KEY ? '✅ Configurada' : '❌ NO configurada'
      });
      throw error;
    }
  }
}

// Console Provider (for development)
class ConsoleProvider implements EmailProvider {
  async send(options: EmailOptions): Promise<void> {
    console.log('📧 EMAIL SIMULATION:');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Content:', options.text || options.html?.substring(0, 200));
    logger.info(`Email simulated to ${options.to}`);
  }
}

export class EmailService {
  private provider: EmailProvider;
  private templates: Map<string, string> = new Map();

  constructor() {
    // Select provider based on environment
    const emailProvider = process.env.EMAIL_PROVIDER || 'console';
    
    logger.info('🔧 [EMAIL SERVICE] Inicializando servicio de email:', {
      provider: emailProvider,
      emailFrom: process.env.EMAIL_FROM,
      hasResendKey: !!process.env.RESEND_API_KEY,
      hasSendGridKey: !!process.env.SENDGRID_API_KEY,
      hasSMTPConfig: !!(process.env.SMTP_HOST && process.env.SMTP_USER)
    });
    
    switch (emailProvider) {
      case 'sendgrid':
        this.provider = new SendGridProvider();
        logger.info('✅ [EMAIL SERVICE] Usando SendGrid Provider');
        break;
      case 'resend':
        this.provider = new ResendProvider();
        logger.info('✅ [EMAIL SERVICE] Usando Resend Provider');
        break;
      case 'smtp':
        this.provider = new NodemailerProvider();
        logger.info('✅ [EMAIL SERVICE] Usando SMTP Provider');
        break;
      default:
        this.provider = new ConsoleProvider();
        logger.info('⚠️ [EMAIL SERVICE] Usando Console Provider (solo para desarrollo)');
    }
    
    this.loadTemplates();
  }

  private async loadTemplates() {
    try {
      const templatesDir = path.join(__dirname, '../../templates/emails');
      const files = await fs.readdir(templatesDir).catch(() => []);
      
      for (const file of files) {
        if (file.endsWith('.hbs')) {
          const name = file.replace('.hbs', '');
          const content = await fs.readFile(path.join(templatesDir, file), 'utf-8');
          this.templates.set(name, content);
        }
      }
      
      logger.info(`Loaded ${this.templates.size} email templates`);
    } catch (error) {
      logger.warn('Could not load email templates:', error);
    }
  }

  async send(options: EmailOptions): Promise<void> {
    try {
      let html = options.html;
      
      // If template is specified, compile it
      if (options.template && options.data) {
        const templateContent = this.templates.get(options.template) || this.getDefaultTemplate(options.template);
        const template = handlebars.compile(templateContent);
        html = template(options.data);
      }
      
      await this.provider.send({
        ...options,
        html,
      });
    } catch (error) {
      logger.error('Failed to send email:', error);
      // Don't throw in production to avoid breaking the flow
      if (process.env.NODE_ENV === 'development') {
        throw error;
      }
    }
  }

  // Email methods for specific use cases
  async sendWelcomeEmail(user: { email: string; firstName?: string }) {
    await this.send({
      to: user.email,
      subject: 'Bienvenido a ReSona Events',
      template: 'welcome',
      data: {
        name: user.firstName || 'Cliente',
        loginUrl: `${process.env.FRONTEND_URL}/login`,
      },
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    await this.send({
      to: email,
      subject: 'Restablecer contraseña - ReSona Events',
      template: 'password-reset',
      data: {
        resetUrl,
        expiresIn: '1 hora',
      },
    });
  }

  async sendOrderConfirmationEmail(order: any) {
    await this.send({
      to: order.user.email,
      subject: `Confirmación de pedido #${order.orderNumber}`,
      template: 'order-confirmation',
      data: {
        orderNumber: order.orderNumber,
        customerName: order.user.firstName,
        items: order.items,
        total: order.total,
        deliveryDate: order.startDate,
        viewOrderUrl: `${process.env.FRONTEND_URL}/orders/${order.id}`,
      },
    });
  }

  async sendPaymentReminderEmail(order: any) {
    await this.send({
      to: order.user.email,
      subject: `Recordatorio de pago - Pedido #${order.orderNumber}`,
      template: 'payment-reminder',
      data: {
        orderNumber: order.orderNumber,
        customerName: order.user.firstName,
        amountDue: order.remainingAmount,
        dueDate: order.remainingPaymentDue,
        paymentUrl: `${process.env.FRONTEND_URL}/orders/${order.id}/payment`,
      },
    });
  }

  async sendEventReminderEmail(order: any, daysUntilEvent: number) {
    await this.send({
      to: order.user.email,
      subject: `Tu evento está próximo - ${daysUntilEvent} día${daysUntilEvent > 1 ? 's' : ''}`,
      template: 'event-reminder',
      data: {
        orderNumber: order.orderNumber,
        customerName: order.user.firstName,
        eventDate: order.startDate,
        daysUntilEvent,
        items: order.items,
        deliveryMethod: order.deliveryMethod,
        deliveryAddress: order.deliveryAddress,
      },
    });
  }

  async sendReturnReminderEmail(order: any) {
    await this.send({
      to: order.user.email,
      subject: `Recordatorio de devolución - Pedido #${order.orderNumber}`,
      template: 'return-reminder',
      data: {
        orderNumber: order.orderNumber,
        customerName: order.user.firstName,
        returnDate: order.endDate,
        items: order.items,
        returnInstructions: 'Por favor, asegúrese de que todos los equipos estén limpios y en su embalaje original.',
      },
    });
  }

  async sendReviewRequestEmail(order: any) {
    await this.send({
      to: order.user.email,
      subject: '¿Cómo fue tu experiencia con ReSona Events?',
      template: 'review-request',
      data: {
        orderNumber: order.orderNumber,
        customerName: order.user.firstName,
        reviewUrl: `${process.env.FRONTEND_URL}/orders/${order.id}/review`,
      },
    });
  }

  async sendInvoiceEmail(invoice: any) {
    await this.send({
      to: invoice.order.user.email,
      subject: `Factura ${invoice.invoiceNumber} - ReSona Events`,
      template: 'invoice',
      data: {
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.order.user.firstName,
        total: invoice.total,
        downloadUrl: `${process.env.FRONTEND_URL}/invoices/${invoice.id}/download`,
      },
    });
  }

  async sendOrderExpirationEmail(data: {
    to: string;
    userName: string;
    orderNumber: string;
    orderTotal: string;
    expirationMinutes: number;
    items: Array<{ name: string; quantity: number; price: string }>;
  }) {
    await this.send({
      to: data.to,
      subject: `Pedido #${data.orderNumber} expirado - ReSona Events`,
      template: 'order-expiration',
      data: {
        userName: data.userName,
        orderNumber: data.orderNumber,
        orderTotal: data.orderTotal,
        expirationMinutes: data.expirationMinutes,
        items: data.items,
        shopUrl: `${process.env.FRONTEND_URL}/products`,
        contactUrl: `${process.env.FRONTEND_URL}/contact`,
      },
    });
  }

  private getDefaultTemplate(templateName: string): string {
    // Default templates if files don't exist
    const templates: Record<string, string> = {
      welcome: `
        <h1>¡Bienvenido a ReSona Events!</h1>
        <p>Hola {{name}},</p>
        <p>Gracias por registrarte en ReSona Events. Estamos encantados de tenerte con nosotros.</p>
        <p><a href="{{loginUrl}}">Inicia sesión aquí</a></p>
      `,
      'password-reset': `
        <h1>Restablecer Contraseña</h1>
        <p>Has solicitado restablecer tu contraseña.</p>
        <p><a href="{{resetUrl}}">Haz clic aquí para crear una nueva contraseña</a></p>
        <p>Este enlace expirará en {{expiresIn}}.</p>
        <p>Si no solicitaste esto, ignora este email.</p>
      `,
      'order-confirmation': `
        <h1>¡Pedido Confirmado!</h1>
        <p>Hola {{customerName}},</p>
        <p>Tu pedido #{{orderNumber}} ha sido confirmado.</p>
        <p>Total: €{{total}}</p>
        <p>Fecha de entrega: {{deliveryDate}}</p>
        <p><a href="{{viewOrderUrl}}">Ver detalles del pedido</a></p>
      `,
      'payment-reminder': `
        <h1>Recordatorio de Pago</h1>
        <p>Hola {{customerName}},</p>
        <p>Te recordamos que tienes un pago pendiente de €{{amountDue}} para el pedido #{{orderNumber}}.</p>
        <p>Fecha límite: {{dueDate}}</p>
        <p><a href="{{paymentUrl}}">Realizar pago</a></p>
      `,
      'event-reminder': `
        <h1>Tu evento está cerca</h1>
        <p>Hola {{customerName}},</p>
        <p>Te recordamos que tu evento es en {{daysUntilEvent}} día{{#if (gt daysUntilEvent 1)}}s{{/if}}.</p>
        <p>Fecha: {{eventDate}}</p>
        <p>Pedido: #{{orderNumber}}</p>
      `,
      'return-reminder': `
        <h1>Recordatorio de Devolución</h1>
        <p>Hola {{customerName}},</p>
        <p>Te recordamos que debes devolver el material del pedido #{{orderNumber}} el {{returnDate}}.</p>
        <p>{{returnInstructions}}</p>
      `,
      'review-request': `
        <h1>¿Cómo fue tu experiencia?</h1>
        <p>Hola {{customerName}},</p>
        <p>Esperamos que hayas disfrutado de nuestro servicio.</p>
        <p>Nos encantaría conocer tu opinión sobre el pedido #{{orderNumber}}.</p>
        <p><a href="{{reviewUrl}}">Dejar una reseña</a></p>
      `,
      invoice: `
        <h1>Factura {{invoiceNumber}}</h1>
        <p>Hola {{customerName}},</p>
        <p>Tu factura está lista.</p>
        <p>Total: €{{total}}</p>
        <p><a href="{{downloadUrl}}">Descargar factura</a></p>
      `,
      'order-expiration': `
        <h1>Pedido Expirado</h1>
        <p>Hola {{userName}},</p>
        <p>Lamentamos informarte que tu pedido <strong>#{{orderNumber}}</strong> ha expirado.</p>
        <p>El pedido no fue completado en el tiempo límite de {{expirationMinutes}} minutos y ha sido cancelado automáticamente.</p>
        <h3>Detalles del pedido cancelado:</h3>
        <ul>
          {{#each items}}
          <li>{{this.name}} - Cantidad: {{this.quantity}} - Precio: €{{this.price}}</li>
          {{/each}}
        </ul>
        <p><strong>Total:</strong> €{{orderTotal}}</p>
        <p>Si todavía estás interesado en estos productos, puedes crear un nuevo pedido.</p>
        <p><a href="{{shopUrl}}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">Ver productos</a></p>
        <p>Si necesitas ayuda, no dudes en <a href="{{contactUrl}}">contactarnos</a>.</p>
        <p>Gracias por tu interés en ReSona Events.</p>
      `,
    };
    
    return templates[templateName] || '<p>{{data}}</p>';
  }

  /**
   * Send installment payment reminder
   */
  async sendInstallmentReminderEmail(installment: any, order: any, daysUntilDue: number) {
    try {
      const userName = order.user?.firstName 
        ? `${order.user.firstName} ${order.user.lastName || ''}`
        : order.user?.email || 'Cliente';

      const subject = `Recordatorio: Pago de plazo ${installment.installmentNumber}/3 próximo a vencer`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5ebbff;">Recordatorio de Pago a Plazos</h2>
          
          <p>Hola ${userName},</p>
          
          <p>Te recordamos que tienes un pago pendiente para tu pedido <strong>#${order.orderNumber}</strong>.</p>
          
          <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #856404;">📅 Plazo ${installment.installmentNumber}/3 (${installment.percentage}%)</h3>
            <p style="margin: 10px 0;"><strong>Monto:</strong> €${Number(installment.amount).toFixed(2)}</p>
            <p style="margin: 10px 0;"><strong>Fecha de vencimiento:</strong> ${new Date(installment.dueDate).toLocaleDateString('es-ES', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}</p>
            <p style="margin: 10px 0;"><strong>⏰ Vence en ${daysUntilDue} ${daysUntilDue === 1 ? 'día' : 'días'}</strong></p>
          </div>

          <p><strong>Detalles del evento:</strong></p>
          <ul>
            <li>Tipo de evento: ${order.eventType || 'Evento'}</li>
            <li>Fecha del evento: ${new Date(order.startDate).toLocaleDateString('es-ES')}</li>
            <li>Total del pedido: €${Number(order.total).toFixed(2)}</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://resona.com'}/mis-pedidos/${order.id}" 
               style="background-color: #5ebbff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              💳 Pagar Ahora
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">
            <strong>Nota:</strong> Este pago se procesará automáticamente si has configurado un método de pago recurrente. 
            De lo contrario, por favor realiza el pago antes de la fecha de vencimiento.
          </p>

          <p>Gracias por confiar en ReSona Eventos.</p>
        </div>
      `;

      await this.send({
        to: order.user.email,
        subject,
        html
      });

      logger.info(`Installment reminder sent for order ${order.orderNumber}, installment ${installment.installmentNumber}`);
    } catch (error) {
      logger.error('Error sending installment reminder email:', error);
      throw error;
    }
  }

  /**
   * Send installment overdue notification
   */
  async sendInstallmentOverdueEmail(installment: any, order: any) {
    try {
      const userName = order.user?.firstName 
        ? `${order.user.firstName} ${order.user.lastName || ''}`
        : order.user?.email || 'Cliente';

      const subject = `⚠️ Plazo vencido - Pedido #${order.orderNumber}`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">⚠️ Plazo de Pago Vencido</h2>
          
          <p>Hola ${userName},</p>
          
          <p>Lamentamos informarte que el plazo de pago ${installment.installmentNumber}/3 para tu pedido <strong>#${order.orderNumber}</strong> ha vencido.</p>
          
          <div style="background-color: #f8d7da; padding: 15px; border-left: 4px solid #dc3545; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #721c24;">💳 Plazo ${installment.installmentNumber}/3 - VENCIDO</h3>
            <p style="margin: 10px 0;"><strong>Monto pendiente:</strong> €${Number(installment.amount).toFixed(2)}</p>
            <p style="margin: 10px 0;"><strong>Fecha de vencimiento:</strong> ${new Date(installment.dueDate).toLocaleDateString('es-ES', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}</p>
            <p style="margin: 10px 0; color: #dc3545;"><strong>Estado:</strong> Vencido</p>
          </div>

          <p>Por favor, realiza el pago lo antes posible para evitar cargos adicionales o la cancelación de tu pedido.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://resona.com'}/mis-pedidos/${order.id}" 
               style="background-color: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              💳 Pagar Ahora
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">
            Si ya has realizado el pago, por favor ignora este mensaje. Si tienes alguna duda o necesitas ayuda, 
            <a href="mailto:${process.env.BUSINESS_EMAIL || 'info@resona.com'}">contáctanos</a>.
          </p>

          <p>Gracias por tu comprensión.</p>
        </div>
      `;

      await this.send({
        to: order.user.email,
        subject,
        html
      });

      logger.info(`Installment overdue notification sent for order ${order.orderNumber}, installment ${installment.installmentNumber}`);
    } catch (error) {
      logger.error('Error sending installment overdue email:', error);
      throw error;
    }
  }

  /**
   * Send installment paid confirmation
   */
  async sendInstallmentPaidEmail(installment: any, order: any) {
    try {
      const userName = order.user?.firstName 
        ? `${order.user.firstName} ${order.user.lastName || ''}`
        : order.user?.email || 'Cliente';

      const subject = `✅ Pago confirmado - Plazo ${installment.installmentNumber}/3`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">✅ Pago Confirmado</h2>
          
          <p>Hola ${userName},</p>
          
          <p>Hemos recibido correctamente el pago del plazo ${installment.installmentNumber}/3 para tu pedido <strong>#${order.orderNumber}</strong>.</p>
          
          <div style="background-color: #d4edda; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #155724;">💳 Plazo ${installment.installmentNumber}/3 - PAGADO</h3>
            <p style="margin: 10px 0;"><strong>Monto:</strong> €${Number(installment.amount).toFixed(2)}</p>
            <p style="margin: 10px 0;"><strong>Fecha de pago:</strong> ${new Date(installment.paidDate || new Date()).toLocaleDateString('es-ES', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>

          <p><strong>Resumen de plazos:</strong></p>
          <ul>
            ${order.installments?.map((inst: any, idx: number) => `
              <li>
                Plazo ${idx + 1}/3 (${inst.percentage}%): €${Number(inst.amount).toFixed(2)} - 
                <strong style="color: ${inst.status === 'COMPLETED' ? '#28a745' : '#ffc107'}">
                  ${inst.status === 'COMPLETED' ? '✓ Pagado' : '⏳ Pendiente'}
                </strong>
              </li>
            `).join('') || ''}
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://resona.com'}/mis-pedidos/${order.id}" 
               style="background-color: #5ebbff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              📋 Ver Detalles del Pedido
            </a>
          </div>

          <p>Gracias por tu pago puntual. ¡Estamos deseando hacer de tu evento un éxito!</p>
        </div>
      `;

      await this.send({
        to: order.user.email,
        subject,
        html
      });

      logger.info(`Installment paid confirmation sent for order ${order.orderNumber}, installment ${installment.installmentNumber}`);
    } catch (error) {
      logger.error('Error sending installment paid email:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService();
