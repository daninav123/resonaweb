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
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async send(options: EmailOptions): Promise<void> {
    try {
      await this.resend.emails.send({
        from: process.env.EMAIL_FROM || 'noreply@resona.com',
        to: options.to,
        subject: options.subject,
        html: options.html || '',
        text: options.text,
      });
      logger.info(`Email sent via Resend to ${options.to}`);
    } catch (error) {
      logger.error('Resend error:', error);
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
    
    switch (emailProvider) {
      case 'sendgrid':
        this.provider = new SendGridProvider();
        break;
      case 'resend':
        this.provider = new ResendProvider();
        break;
      case 'smtp':
        this.provider = new NodemailerProvider();
        break;
      default:
        this.provider = new ConsoleProvider();
    }
    
    logger.info(`Email service initialized with ${emailProvider} provider`);
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
    };
    
    return templates[templateName] || '<p>{{data}}</p>';
  }
}

export const emailService = new EmailService();
