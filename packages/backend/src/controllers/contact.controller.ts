import { Request, Response } from 'express';
import { EmailService } from '../services/email.service';
import { logger } from '../utils/logger';
import { prisma } from '../index';

const emailService = new EmailService();

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export class ContactController {
  /**
   * Enviar mensaje de contacto
   */
  async sendContactMessage(req: Request, res: Response) {
    try {
      logger.info('🔵 [CONTACT] Petición recibida desde:', req.ip, req.get('origin'));
      
      const { name, email, phone, subject, message }: ContactFormData = req.body;

      // Validar campos requeridos
      if (!name || !email || !subject || !message) {
        logger.warn('⚠️ [CONTACT] Campos requeridos faltantes');
        return res.status(400).json({
          error: 'Faltan campos requeridos: name, email, subject, message'
        });
      }

      logger.info('📧 [CONTACT] Nuevo mensaje de contacto:', { name, email, subject });
      logger.info('🔧 [CONTACT] Variables de entorno:', {
        EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
        EMAIL_FROM: process.env.EMAIL_FROM,
        EMAIL_CONTACT: process.env.EMAIL_CONTACT,
        RESEND_API_KEY: process.env.RESEND_API_KEY ? '✅ Configurada' : '❌ NO configurada',
        FRONTEND_URL: process.env.FRONTEND_URL
      });

      // 1. Guardar en BD para no perder el mensaje
      logger.info('💾 [CONTACT] Guardando mensaje en BD...');
      const contactMessage = await prisma.contactMessage.create({
        data: {
          name,
          email,
          phone: phone || null,
          subject,
          message,
          status: 'NEW',
          source: 'WEBSITE',
          metadata: {
            ip: req.ip,
            userAgent: req.get('user-agent'),
            referrer: req.get('referrer'),
            timestamp: new Date().toISOString()
          }
        }
      });
      logger.info('✅ [CONTACT] Mensaje guardado en BD con ID:', contactMessage.id);

      // 2. Enviar email al equipo
      const contactEmail = process.env.EMAIL_CONTACT || 'info@resonaevents.com';
      logger.info('📤 [CONTACT] Preparando envío de email a:', contactEmail);
      
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #5ebbff 0%, #4a9fd6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .section { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #5ebbff; }
            .section h2 { color: #5ebbff; margin-top: 0; font-size: 18px; }
            .info-row { margin: 10px 0; }
            .info-label { font-weight: bold; color: #555; }
            .info-value { color: #333; }
            .message-box { background: #fff; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px; margin: 15px 0; white-space: pre-wrap; }
            .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
            .badge { display: inline-block; padding: 5px 12px; background: #5ebbff; color: white; border-radius: 12px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📨 Nuevo Mensaje de Contacto</h1>
              <span class="badge">ID: ${contactMessage.id.substring(0, 8)}</span>
            </div>
            
            <div class="content">
              <div class="section">
                <h2>👤 Datos del Contacto</h2>
                <div class="info-row">
                  <span class="info-label">Nombre:</span>
                  <span class="info-value">${name}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Email:</span>
                  <span class="info-value"><a href="mailto:${email}">${email}</a></span>
                </div>
                ${phone ? `
                <div class="info-row">
                  <span class="info-label">Teléfono:</span>
                  <span class="info-value"><a href="tel:${phone}">${phone}</a></span>
                </div>
                ` : ''}
                <div class="info-row">
                  <span class="info-label">Asunto:</span>
                  <span class="info-value"><strong>${subject}</strong></span>
                </div>
              </div>

              <div class="section">
                <h2>📝 Mensaje</h2>
                <div class="message-box">${message}</div>
              </div>

              <div class="section">
                <h2>⏰ Información Adicional</h2>
                <div class="info-row">
                  <span class="info-label">Fecha:</span>
                  <span class="info-value">${new Date().toLocaleString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">IP:</span>
                  <span class="info-value">${req.ip}</span>
                </div>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="mailto:${email}?subject=${encodeURIComponent('Re: ' + subject + ' - Resona Events')}"
                   style="background-color: #5ebbff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  ✉️ Responder a ${name}
                </a>
              </div>
            </div>

            <div class="footer">
              <p>Este email fue enviado automáticamente desde el formulario de contacto de ReSona Events</p>
              <p>&copy; ${new Date().getFullYear()} ReSona Events. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      logger.info('🚀 [CONTACT] Intentando enviar email al equipo...');
      await emailService.send({
        to: contactEmail,
        replyTo: email,
        subject: `📨 Nuevo mensaje de contacto: ${subject}`,
        html: emailHtml
      });

      logger.info('✅ [CONTACT] Email al equipo enviado correctamente a:', contactEmail);

      // 3. Enviar email de confirmación al cliente
      const confirmationHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #5ebbff 0%, #4a9fd6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .message-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #5ebbff; }
            .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Mensaje Recibido</h1>
            </div>
            
            <div class="content">
              <div class="message-box">
                <p>Hola <strong>${name}</strong>,</p>
                
                <p>Hemos recibido tu mensaje correctamente y nos pondremos en contacto contigo lo antes posible.</p>
                
                <p><strong>Tu mensaje:</strong></p>
                <p style="background: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${message}</p>
                
                <p>Normalmente respondemos en <strong>menos de 24 horas</strong> en días laborables.</p>
                
                <p>Si tu consulta es urgente, puedes llamarnos al <strong>+34 613 881 414</strong>.</p>
                
                <p>¡Gracias por contactar con ReSona Events!</p>
              </div>
            </div>

            <div class="footer">
              <p>ReSona Events | C/ de l'Illa Cabrera, 13, València</p>
              <p>info@resonaevents.com | +34 613 881 414</p>
              <p>&copy; ${new Date().getFullYear()} ReSona Events. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      logger.info('🚀 [CONTACT] Intentando enviar email de confirmación al cliente...');
      await emailService.send({
        to: email,
        subject: '✅ Hemos recibido tu mensaje - ReSona Events',
        html: confirmationHtml
      });

      logger.info('✅ [CONTACT] Email de confirmación enviado al cliente:', email);

      // 4. Responder al cliente
      res.status(200).json({
        success: true,
        message: 'Mensaje enviado correctamente. Te responderemos pronto.',
        contactId: contactMessage.id
      });

    } catch (error: any) {
      logger.error('❌ [CONTACT] Error al enviar mensaje de contacto:', {
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        emailProvider: process.env.EMAIL_PROVIDER,
        hasResendKey: !!process.env.RESEND_API_KEY
      });
      res.status(500).json({
        error: 'Error al enviar el mensaje. Por favor, intenta de nuevo o contáctanos directamente.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener mensajes de contacto (Admin)
   */
  async getContactMessages(req: Request, res: Response) {
    try {
      const { status, limit = 50, offset = 0 } = req.query;

      const where: any = {};
      if (status) {
        where.status = status;
      }

      const messages = await prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string)
      });

      const total = await prisma.contactMessage.count({ where });

      res.json({
        messages,
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });
    } catch (error: any) {
      logger.error('Error al obtener mensajes de contacto:', error);
      res.status(500).json({ error: 'Error al obtener mensajes' });
    }
  }

  /**
   * Marcar mensaje como leído/respondido
   */
  async updateContactStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const updated = await prisma.contactMessage.update({
        where: { id },
        data: {
          status,
          ...(notes && { notes }),
          ...(status === 'RESPONDED' && { respondedAt: new Date() })
        }
      });

      res.json(updated);
    } catch (error: any) {
      logger.error('Error al actualizar mensaje:', error);
      res.status(500).json({ error: 'Error al actualizar mensaje' });
    }
  }
}

export const contactController = new ContactController();
