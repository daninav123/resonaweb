import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestNotifications() {
  try {
    console.log('🔔 Creando notificaciones de prueba...\n');
    
    // Obtener usuario admin
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!admin) {
      console.log('❌ No se encontró usuario admin');
      return;
    }
    
    console.log(`✅ Usuario admin encontrado: ${admin.email}\n`);
    
    // Crear notificaciones de prueba
    const notifications = [
      {
        type: 'ORDER_CREATED',
        title: '🛒 Nuevo Pedido Recibido',
        message: 'Pedido ORD-2025-TEST01 de Test Cliente por 450.00€',
      },
      {
        type: 'PAYMENT_RECEIVED',
        title: '💳 Pago Recibido',
        message: 'Se ha recibido el pago del pedido ORD-2025-TEST02 por 320.50€',
      },
      {
        type: 'LOW_STOCK',
        title: '⚠️ Stock Bajo',
        message: 'Sony A7 III (CAM-001): Solo quedan 2 unidades. Se necesitan 5 para próximos pedidos.',
      },
      {
        type: 'QUOTE_REQUEST',
        title: '💬 Nueva Solicitud de Presupuesto',
        message: 'test@cliente.com solicita presupuesto para Boda con 150 asistentes.',
      },
      {
        type: 'INVOICE_READY',
        title: '📄 Factura Disponible',
        message: 'Tu factura INV-2025-00001 para el pedido ORD-2025-TEST03 está lista para descargar.',
      },
    ];
    
    for (const notif of notifications) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: notif.type,
          title: notif.title,
          message: notif.message,
        },
      });
      console.log(`✅ Creada: ${notif.title}`);
    }
    
    console.log(`\n🎉 Se crearon ${notifications.length} notificaciones de prueba`);
    console.log(`\n📱 Ahora ve a http://localhost:3000 y haz login como admin`);
    console.log(`   Verás la campana 🔔 con ${notifications.length} notificaciones sin leer\n`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestNotifications();
