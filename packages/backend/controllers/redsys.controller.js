const redsysService = require('../services/redsys.service');
const prisma = require('../lib/prisma');
const { invoiceService } = require('../dist/services/invoice.service');
const { notificationService } = require('../dist/services/notification.service');
const { NotificationHelper } = require('../dist/utils/notificationHelper');

/**
 * Crear formulario de pago con Redsys
 */
const createPaymentForm = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Obtener datos del pedido
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    
    // Verificar que el pedido pertenece al usuario (si no es admin)
    if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    // Crear formulario de pago
    const paymentForm = redsysService.createPaymentForm({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.total,
      email: order.user.email,
      description: `Pedido ${order.orderNumber} - ReSona Events`
    });
    
    // Registrar intento de pago
    console.log(`💳 Creando pago Redsys para pedido ${order.orderNumber}`);
    
    res.json(paymentForm);
  } catch (error) {
    console.error('Error creando formulario de pago Redsys:', error);
    res.status(500).json({ error: 'Error al crear el pago' });
  }
};

/**
 * Recibir notificación de Redsys (webhook)
 */
const handleNotification = async (req, res) => {
  try {
    console.log('📨 Notificación recibida de Redsys:', req.body);
    
    // Verificar notificación
    const verification = redsysService.verifyNotification(req.body);
    
    if (!verification.valid) {
      console.error('❌ Notificación de Redsys inválida:', verification.error);
      return res.status(400).send('Notification verification failed');
    }
    
    const params = verification.params;
    console.log('✅ Notificación verificada:', params);
    
    // Obtener pedido
    const orderNumber = params.order;
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: {
          contains: orderNumber.slice(-4) // Buscar por los últimos 4 dígitos
        }
      }
    });
    
    if (!order) {
      console.error('❌ Pedido no encontrado:', orderNumber);
      return res.status(404).send('Order not found');
    }
    
    // Verificar si el pago fue exitoso
    const isSuccessful = redsysService.isPaymentSuccessful(params.response);
    
    if (isSuccessful) {
      // Pago exitoso
      console.log(`✅ Pago exitoso para pedido ${order.orderNumber}`);
      
      // Actualizar pedido
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          paidAt: new Date(),
          stripePaymentIntentId: params.authorisationCode, // Guardar código de autorización
        }
      });
      
      // Generar factura automáticamente
      try {
        console.log(`📄 Generando factura para pedido ${order.orderNumber}...`);
        const invoice = await invoiceService.generateInvoice(order.id);
        console.log(`✅ Factura generada: ${invoice.invoiceNumber}`);
        
        // Obtener el pedido completo con usuario para enviar email
        const orderWithUser = await prisma.order.findUnique({
          where: { id: order.id },
          include: { user: true }
        });
        
        // Enviar email con factura adjunta
        if (orderWithUser && orderWithUser.user && orderWithUser.user.email) {
          console.log(`📧 Enviando factura por email a ${orderWithUser.user.email}...`);
          await notificationService.sendInvoiceEmail(orderWithUser.user.email, invoice);
          console.log(`✅ Email con factura enviado exitosamente`);
        }
        
        // 🔔 Enviar notificación de pago recibido a admins
        try {
          await NotificationHelper.notifyPaymentReceived(order.orderNumber, order.total);
          
          // 🔔 Enviar notificación de factura disponible al cliente
          if (orderWithUser && orderWithUser.user) {
            await NotificationHelper.notifyInvoiceReady(
              orderWithUser.user.id,
              invoice.invoiceNumber,
              order.orderNumber
            );
          }
        } catch (notifError) {
          console.error('⚠️  Error enviando notificaciones:', notifError);
        }
      } catch (invoiceError) {
        // Log error but don't fail the payment confirmation
        console.error(`❌ Error generando/enviando factura:`, invoiceError);
        console.error(`⚠️  El pago fue exitoso pero la factura falló. Generar manualmente.`);
      }
      
    } else {
      // Pago fallido
      console.error(`❌ Pago fallido para pedido ${order.orderNumber}:`, params.response);
      
      const errorMessage = redsysService.getErrorMessage(params.response);
      
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'FAILED',
          notes: `Error de pago: ${errorMessage}`,
        }
      });
    }
    
    // Responder a Redsys (importante: debe ser 200 OK)
    res.status(200).send('OK');
    
  } catch (error) {
    console.error('Error procesando notificación de Redsys:', error);
    res.status(500).send('Internal server error');
  }
};

/**
 * Verificar resultado del pago (llamado desde el frontend)
 */
const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Obtener pedido
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true
      }
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    
    // Verificar que el pedido pertenece al usuario
    if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    res.json({
      success: order.paymentStatus === 'PAID',
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      order
    });
    
  } catch (error) {
    console.error('Error verificando pago:', error);
    res.status(500).json({ error: 'Error al verificar el pago' });
  }
};

module.exports = {
  createPaymentForm,
  handleNotification,
  verifyPayment
};
