# 🔔 Sistema de Notificaciones - ReSona

## 🎯 Objetivo

Sistema completo de notificaciones automáticas por email para todas las etapas del pedido y eventos importantes.

## 📧 Stack Tecnológico

```typescript
// Email Service Provider
- SendGrid / Mailgun / AWS SES (recomendado: SendGrid)

// Template Engine
- Handlebars para plantillas HTML

// Queue System
- Bull + Redis para envíos asíncronos

// Database
- Tracking de emails enviados en PostgreSQL
```

## 📊 Modelo de Datos

```typescript
model EmailNotification {
  id            String   @id @default(uuid())
  
  // Destinatario
  userId        String?
  user          User?    @relation(fields: [userId], references: [id])
  email         String
  
  // Tipo de notificación
  type          NotificationType
  template      String
  
  // Contexto
  orderId       String?
  order         Order?   @relation(fields: [orderId], references: [id])
  
  // Contenido
  subject       String
  body          String   @db.Text
  metadata      Json?
  
  // Estado
  status        EmailStatus  @default(PENDING)
  sentAt        DateTime?
  deliveredAt   DateTime?
  openedAt      DateTime?
  clickedAt     DateTime?
  failedAt      DateTime?
  errorMessage  String?
  
  // Tracking
  sendgridId    String?  @unique
  attempts      Int      @default(0)
  maxAttempts   Int      @default(3)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([userId])
  @@index([orderId])
  @@index([type])
  @@index([status])
}

enum NotificationType {
  // Pedidos
  ORDER_CONFIRMATION
  ORDER_PAYMENT_RECEIVED
  ORDER_PAYMENT_PENDING
  ORDER_PAYMENT_FAILED
  ORDER_STATUS_UPDATE
  ORDER_CANCELLED
  
  // Recordatorios
  REMINDER_PAYMENT_DUE
  REMINDER_3_DAYS_BEFORE
  REMINDER_1_DAY_BEFORE
  REMINDER_DAY_OF_EVENT
  REMINDER_RETURN_DUE
  
  // Post-evento
  RETURN_CONFIRMATION
  REVIEW_REQUEST
  DEPOSIT_RELEASED
  DEPOSIT_RETAINED
  
  // Marketing
  WELCOME_EMAIL
  ABANDONED_CART
  SPECIAL_OFFER
  
  // Admin
  NEW_ORDER_ADMIN
  HIGH_DEMAND_ALERT
  LOW_STOCK_ALERT
}

enum EmailStatus {
  PENDING
  QUEUED
  SENDING
  SENT
  DELIVERED
  OPENED
  CLICKED
  FAILED
  BOUNCED
}
```

## 📨 Servicio de Notificaciones

```typescript
// services/notification.service.ts

import sgMail from '@sendgrid/mail';
import { Queue } from 'bull';
import Handlebars from 'handlebars';

export class NotificationService {
  private emailQueue: Queue;
  
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    this.emailQueue = new Queue('emails', {
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT)
      }
    });
    
    this.setupQueueProcessor();
  }
  
  /**
   * Envía notificación (añade a cola)
   */
  async sendNotification(params: {
    type: NotificationType;
    userId?: string;
    email: string;
    orderId?: string;
    data: any;
  }) {
    // 1. Crear registro en BD
    const notification = await prisma.emailNotification.create({
      data: {
        type: params.type,
        userId: params.userId,
        email: params.email,
        orderId: params.orderId,
        template: this.getTemplateName(params.type),
        subject: await this.getSubject(params.type, params.data),
        body: '',  // Se generará al enviar
        status: 'PENDING',
        metadata: params.data
      }
    });
    
    // 2. Añadir a cola
    await this.emailQueue.add({
      notificationId: notification.id
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      }
    });
    
    return notification;
  }
  
  /**
   * Procesa cola de emails
   */
  private setupQueueProcessor() {
    this.emailQueue.process(async (job) => {
      const { notificationId } = job.data;
      
      const notification = await prisma.emailNotification.findUnique({
        where: { id: notificationId },
        include: { order: true, user: true }
      });
      
      if (!notification) {
        throw new Error('Notification not found');
      }
      
      try {
        // 1. Generar HTML desde template
        const html = await this.renderTemplate(
          notification.template,
          notification.metadata
        );
        
        // 2. Enviar con SendGrid
        const result = await sgMail.send({
          to: notification.email,
          from: {
            email: 'no-reply@resona.com',
            name: 'ReSona'
          },
          subject: notification.subject,
          html: html,
          trackingSettings: {
            clickTracking: { enable: true },
            openTracking: { enable: true }
          },
          customArgs: {
            notificationId: notification.id
          }
        });
        
        // 3. Actualizar estado
        await prisma.emailNotification.update({
          where: { id: notification.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
            sendgridId: result[0].headers['x-message-id'],
            body: html
          }
        });
        
        return result;
        
      } catch (error) {
        // Actualizar con error
        await prisma.emailNotification.update({
          where: { id: notification.id },
          data: {
            status: 'FAILED',
            failedAt: new Date(),
            errorMessage: error.message,
            attempts: notification.attempts + 1
          }
        });
        
        throw error;
      }
    });
  }
  
  /**
   * Renderiza template con Handlebars
   */
  private async renderTemplate(templateName: string, data: any): Promise<string> {
    const templatePath = `./email-templates/${templateName}.hbs`;
    const templateSource = await fs.readFile(templatePath, 'utf-8');
    const template = Handlebars.compile(templateSource);
    
    // Añadir helpers y datos globales
    const context = {
      ...data,
      siteUrl: process.env.FRONTEND_URL,
      supportEmail: 'soporte@resona.com',
      currentYear: new Date().getFullYear()
    };
    
    return template(context);
  }
  
  /**
   * Obtiene nombre de template según tipo
   */
  private getTemplateName(type: NotificationType): string {
    const templates = {
      ORDER_CONFIRMATION: 'order-confirmation',
      ORDER_PAYMENT_RECEIVED: 'payment-received',
      REMINDER_3_DAYS_BEFORE: 'reminder-3-days',
      REMINDER_1_DAY_BEFORE: 'reminder-1-day',
      REVIEW_REQUEST: 'review-request',
      // ... más mappings
    };
    
    return templates[type] || 'generic';
  }
  
  /**
   * Genera asunto dinámico
   */
  private async getSubject(type: NotificationType, data: any): Promise<string> {
    const subjects = {
      ORDER_CONFIRMATION: `Pedido confirmado ${data.orderNumber} - ReSona`,
      REMINDER_3_DAYS_BEFORE: `Tu evento es en 3 días - Pedido ${data.orderNumber}`,
      REMINDER_1_DAY_BEFORE: `¡Mañana es tu evento! - Pedido ${data.orderNumber}`,
      REVIEW_REQUEST: `¿Cómo fue tu experiencia? - Pedido ${data.orderNumber}`,
      // ...
    };
    
    return subjects[type] || 'Notificación de ReSona';
  }
}
```

## 📅 Sistema de Recordatorios Automáticos

### Cron Jobs

```typescript
// jobs/emailReminders.job.ts

import cron from 'node-cron';

export function setupEmailReminders() {
  
  // Ejecutar cada hora
  cron.schedule('0 * * * *', async () => {
    await sendPaymentReminders();
    await send3DayReminders();
    await send1DayReminders();
    await sendDayOfEventReminders();
    await sendReturnReminders();
    await sendReviewRequests();
  });
}

/**
 * Recordatorio de pago pendiente (1 día antes de vencimiento)
 */
async function sendPaymentReminders() {
  const tomorrow = addDays(new Date(), 1);
  
  const orders = await prisma.order.findMany({
    where: {
      remainingPaymentDue: {
        gte: startOfDay(tomorrow),
        lte: endOfDay(tomorrow)
      },
      remainingPaymentStatus: 'PENDING'
    },
    include: { user: true }
  });
  
  for (const order of orders) {
    await notificationService.sendNotification({
      type: 'REMINDER_PAYMENT_DUE',
      userId: order.userId,
      email: order.user.email,
      orderId: order.id,
      data: {
        orderNumber: order.orderNumber,
        amount: order.remainingPaymentAmount,
        dueDate: order.remainingPaymentDue,
        paymentUrl: `${process.env.FRONTEND_URL}/orders/${order.id}/pay`
      }
    });
  }
}

/**
 * Recordatorio 3 días antes del evento
 */
async function send3DayReminders() {
  const in3Days = addDays(new Date(), 3);
  
  const orders = await prisma.order.findMany({
    where: {
      startDate: {
        gte: startOfDay(in3Days),
        lte: endOfDay(in3Days)
      },
      status: 'CONFIRMED'
    },
    include: { user: true, items: { include: { product: true } } }
  });
  
  for (const order of orders) {
    await notificationService.sendNotification({
      type: 'REMINDER_3_DAYS_BEFORE',
      userId: order.userId,
      email: order.user.email,
      orderId: order.id,
      data: {
        orderNumber: order.orderNumber,
        eventDate: order.startDate,
        location: order.eventLocation,
        items: order.items.map(item => ({
          name: item.product.name,
          quantity: item.quantity
        })),
        deliveryType: order.deliveryType
      }
    });
  }
}

/**
 * Recordatorio 1 día antes
 */
async function send1DayReminders() {
  const tomorrow = addDays(new Date(), 1);
  
  const orders = await prisma.order.findMany({
    where: {
      startDate: {
        gte: startOfDay(tomorrow),
        lte: endOfDay(tomorrow)
      },
      status: { in: ['CONFIRMED', 'READY'] }
    },
    include: { user: true }
  });
  
  for (const order of orders) {
    await notificationService.sendNotification({
      type: 'REMINDER_1_DAY_BEFORE',
      userId: order.userId,
      email: order.user.email,
      orderId: order.id,
      data: {
        orderNumber: order.orderNumber,
        contactPhone: process.env.BUSINESS_PHONE,
        deliveryTime: order.deliveryTime || '10:00'
      }
    });
  }
}

/**
 * Día del evento
 */
async function sendDayOfEventReminders() {
  const today = new Date();
  
  const orders = await prisma.order.findMany({
    where: {
      startDate: {
        gte: startOfDay(today),
        lte: endOfDay(today)
      },
      status: { in: ['READY', 'IN_TRANSIT'] }
    },
    include: { user: true }
  });
  
  for (const order of orders) {
    await notificationService.sendNotification({
      type: 'REMINDER_DAY_OF_EVENT',
      userId: order.userId,
      email: order.user.email,
      orderId: order.id,
      data: {
        orderNumber: order.orderNumber,
        message: '¡Que tengas un gran evento!',
        emergencyContact: process.env.BUSINESS_PHONE
      }
    });
  }
}

/**
 * Recordatorio de devolución
 */
async function sendReturnReminders() {
  const tomorrow = addDays(new Date(), 1);
  
  const orders = await prisma.order.findMany({
    where: {
      endDate: {
        gte: startOfDay(tomorrow),
        lte: endOfDay(tomorrow)
      },
      status: 'DELIVERED'
    },
    include: { user: true }
  });
  
  for (const order of orders) {
    await notificationService.sendNotification({
      type: 'REMINDER_RETURN_DUE',
      userId: order.userId,
      email: order.user.email,
      orderId: order.id,
      data: {
        orderNumber: order.orderNumber,
        returnDate: order.endDate,
        returnTime: '10:00',
        instructions: 'Asegúrate de devolver todo el material limpio y en buen estado'
      }
    });
  }
}

/**
 * Solicitud de reseña (3 días después del evento)
 */
async function sendReviewRequests() {
  const threeDaysAgo = subDays(new Date(), 3);
  
  const orders = await prisma.order.findMany({
    where: {
      endDate: {
        gte: startOfDay(threeDaysAgo),
        lte: endOfDay(threeDaysAgo)
      },
      status: 'COMPLETED',
      reviewRequested: false
    },
    include: { user: true, items: { include: { product: true } } }
  });
  
  for (const order of orders) {
    await notificationService.sendNotification({
      type: 'REVIEW_REQUEST',
      userId: order.userId,
      email: order.user.email,
      orderId: order.id,
      data: {
        orderNumber: order.orderNumber,
        products: order.items.map(item => ({
          id: item.productId,
          name: item.product.name
        })),
        reviewUrl: `${process.env.FRONTEND_URL}/orders/${order.id}/review`
      }
    });
    
    // Marcar como solicitada
    await prisma.order.update({
      where: { id: order.id },
      data: { reviewRequested: true }
    });
  }
}
```

## 📧 Templates de Email

### Estructura Base (layout.hbs)

```handlebars
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: #2563eb;
      color: #ffffff;
      padding: 30px 20px;
      text-align: center;
    }
    .content {
      padding: 30px 20px;
    }
    .footer {
      background: #f9fafb;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
    .order-summary {
      background: #f9fafb;
      padding: 20px;
      border-radius: 6px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ReSona</h1>
    </div>
    <div class="content">
      {{{body}}}
    </div>
    <div class="footer">
      <p>ReSona - Alquiler de Equipos para Eventos</p>
      <p>Valencia, España</p>
      <p>
        <a href="{{siteUrl}}">Visitar web</a> |
        <a href="mailto:{{supportEmail}}">Contactar</a>
      </p>
      <p>© {{currentYear}} ReSona. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
```

### Template: Confirmación de Pedido

```handlebars
<!-- email-templates/order-confirmation.hbs -->
<h2>¡Pedido Confirmado! 🎉</h2>

<p>Hola {{customerName}},</p>

<p>Tu pedido <strong>{{orderNumber}}</strong> ha sido confirmado con éxito.</p>

<div class="order-summary">
  <h3>Resumen del Pedido</h3>
  
  <p><strong>Fecha del evento:</strong> {{formatDate eventDate}}</p>
  <p><strong>Ubicación:</strong> {{location}}</p>
  <p><strong>Tipo de entrega:</strong> {{deliveryType}}</p>
  
  <h4>Productos:</h4>
  <ul>
    {{#each items}}
    <li>{{quantity}}× {{name}} - {{price}}€</li>
    {{/each}}
  </ul>
  
  <p><strong>Total:</strong> {{total}}€</p>
  
  {{#if paymentTerm}}
  <h4>Pago:</h4>
  <p>Modalidad: {{paymentTermLabel}}</p>
  {{#if upfrontAmount}}
  <p>✅ Pagado ahora: {{upfrontAmount}}€</p>
  {{/if}}
  {{#if remainingAmount}}
  <p>⏳ Pendiente: {{remainingAmount}}€ (vence {{formatDate paymentDue}})</p>
  {{/if}}
  {{/if}}
</div>

<p>
  <a href="{{orderUrl}}" class="button">Ver Detalles del Pedido</a>
</p>

<p>Si tienes alguna pregunta, no dudes en contactarnos.</p>

<p>¡Gracias por confiar en ReSona!</p>
```

### Template: Recordatorio 3 Días Antes

```handlebars
<!-- email-templates/reminder-3-days.hbs -->
<h2>Tu evento es en 3 días 📅</h2>

<p>Hola {{customerName}},</p>

<p>Este es un recordatorio de que tu evento con ReSona es el <strong>{{formatDate eventDate}}</strong>.</p>

<div class="order-summary">
  <h3>Pedido {{orderNumber}}</h3>
  
  <p><strong>Fecha:</strong> {{formatDate eventDate}}</p>
  <p><strong>Ubicación:</strong> {{location}}</p>
  
  <h4>Equipos reservados:</h4>
  <ul>
    {{#each items}}
    <li>{{quantity}}× {{name}}</li>
    {{/each}}
  </ul>
  
  {{#if deliveryType eq "DELIVERY"}}
  <p><strong>Entrega:</strong> Llevaremos el equipo a tu ubicación</p>
  <p><strong>Hora estimada:</strong> {{deliveryTime}}</p>
  {{else}}
  <p><strong>Recogida:</strong> Debes recoger el equipo en nuestro local</p>
  <p><strong>Dirección:</strong> {{businessAddress}}</p>
  {{/if}}
</div>

<h3>Importante:</h3>
<ul>
  <li>✅ Asegúrate de que alguien estará disponible para recibir el equipo</li>
  <li>✅ Prepara el espacio donde se instalará</li>
  <li>✅ Ten acceso a electricidad cercano</li>
</ul>

<p>
  <a href="{{orderUrl}}" class="button">Ver Pedido Completo</a>
</p>

<p>Cualquier duda, llámanos al {{contactPhone}}</p>
```

### Template: Solicitud de Reseña

```handlebars
<!-- email-templates/review-request.hbs -->
<h2>¿Cómo fue tu experiencia? ⭐</h2>

<p>Hola {{customerName}},</p>

<p>Esperamos que tu evento haya sido un éxito. Nos encantaría conocer tu opinión sobre nuestro servicio.</p>

<div class="order-summary">
  <p>Pedido: <strong>{{orderNumber}}</strong></p>
  <p>Fecha: {{formatDate eventDate}}</p>
</div>

<p>Tu opinión nos ayuda a mejorar y ayuda a otros clientes a tomar decisiones.</p>

<p>
  <a href="{{reviewUrl}}" class="button">Dejar Reseña</a>
</p>

<p>¡Gracias por elegirnos! Esperamos verte pronto.</p>
```

## 🎛️ Panel Admin: Gestión de Notificaciones

```
Notificaciones > Historial
════════════════════════════════════════════════════════

Filtros:
[Tipo ▼] [Estado ▼] [Fecha ▼] [Buscar por email...]

┌────────────────────────────────────────────────────┐
│ ORDER_CONFIRMATION                                 │
│ Para: juan@example.com                             │
│ Pedido: RES-2024-0123                              │
│ Estado: ✅ Entregado (Abierto hace 2 horas)        │
│ Enviado: 12 Nov 2024, 14:32                       │
│                                                    │
│ [Ver Email] [Reenviar]                             │
├────────────────────────────────────────────────────┤
│ REMINDER_PAYMENT_DUE                               │
│ Para: maria@example.com                            │
│ Pedido: RES-2024-0124                              │
│ Estado: ⏳ Enviado (Sin abrir)                     │
│ Enviado: 12 Nov 2024, 09:15                       │
│                                                    │
│ [Ver Email] [Reenviar]                             │
├────────────────────────────────────────────────────┤
│ REMINDER_3_DAYS_BEFORE                             │
│ Para: pedro@example.com                            │
│ Pedido: RES-2024-0122                              │
│ Estado: ❌ Fallido (Rebotado)                      │
│ Error: Email inválido                              │
│ Intentos: 3/3                                      │
│                                                    │
│ [Ver Error] [Reintentar con email corregido]      │
└────────────────────────────────────────────────────┘

Estadísticas del Mes
─────────────────────────────────────────────────────
Enviados:        1,245
Entregados:      1,187 (95.3%)
Abiertos:          856 (68.7%)
Clicks:            234 (18.8%)
Fallidos:           58 (4.7%)
```

## 📊 Métricas y Analytics

```typescript
// Dashboard: Email Performance
const emailMetrics = {
  sent: 1245,
  delivered: 1187,
  opened: 856,
  clicked: 234,
  failed: 58,
  
  deliveryRate: 95.3,  // %
  openRate: 68.7,      // %
  clickRate: 18.8,     // %
  
  byType: {
    ORDER_CONFIRMATION: { sent: 340, openRate: 89 },
    REMINDER_3_DAYS: { sent: 280, openRate: 72 },
    REVIEW_REQUEST: { sent: 180, openRate: 45 },
    // ...
  }
};
```

## 🔧 Configuración Admin

```
Configuración > Notificaciones
════════════════════════════════════════════════════════

Email de Remitente
─────────────────────────────────────────────────────
Email:  [no-reply@resona.com_____________]
Nombre: [ReSona_____________________________]

Email de Respuesta (Reply-To)
[soporte@resona.com___________________]

Recordatorios Automáticos
─────────────────────────────────────────────────────
☑ Pago pendiente (1 día antes vencimiento)
☑ 3 días antes del evento
☑ 1 día antes del evento
☑ Día del evento
☑ Recordatorio de devolución
☑ Solicitar reseña (3 días después)

Marketing (Opcional)
─────────────────────────────────────────────────────
☑ Email de bienvenida
☐ Carritos abandonados
☐ Ofertas especiales

[Guardar Configuración]
```

---

**Sistema completo de notificaciones automáticas** ✅
