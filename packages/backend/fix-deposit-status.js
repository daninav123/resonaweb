/**
 * Script para actualizar depositStatus en pedidos existentes
 * Establece depositStatus = 'PENDING' para todos los pedidos que tienen depositAmount > 0 pero depositStatus null
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDepositStatus() {
  console.log('🔧 Iniciando corrección de depositStatus...\n');

  try {
    // 1. Buscar pedidos con depositAmount > 0
    const ordersToFix = await prisma.order.findMany({
      where: {
        depositAmount: {
          gt: 0
        }
      },
      select: {
        id: true,
        orderNumber: true,
        depositAmount: true,
        depositStatus: true,
      }
    });

    console.log(`📊 Pedidos con fianza encontrados: ${ordersToFix.length}\n`);

    if (ordersToFix.length === 0) {
      console.log('✅ No hay pedidos con fianza.\n');
      return;
    }

    // 2. Mostrar pedidos
    console.log('📋 Estado actual de los pedidos:');
    ordersToFix.forEach(order => {
      console.log(`  - ${order.orderNumber}: €${order.depositAmount} (depositStatus: ${order.depositStatus || 'NULL'})`);
    });
    console.log('');

    // 3. Actualizar solo los que no tienen depositStatus = PENDING
    const toUpdate = ordersToFix.filter(o => o.depositStatus !== 'PENDING');
    console.log(`📝 Pedidos a actualizar: ${toUpdate.length}\n`);

    if (toUpdate.length === 0) {
      console.log('✅ Todos los pedidos ya tienen depositStatus correcto.\n');
      return;
    }

    const result = await prisma.order.updateMany({
      where: {
        id: {
          in: toUpdate.map(o => o.id)
        }
      },
      data: {
        depositStatus: 'PENDING'
      }
    });

    console.log(`✅ Actualizados ${result.count} pedidos correctamente.\n`);

    // 4. Verificar
    const verifyOrders = await prisma.order.findMany({
      where: {
        id: {
          in: ordersToFix.map(o => o.id)
        }
      },
      select: {
        id: true,
        orderNumber: true,
        depositAmount: true,
        depositStatus: true,
      }
    });

    console.log('✅ Verificación:');
    verifyOrders.forEach(order => {
      console.log(`  - ${order.orderNumber}: €${order.depositAmount} (depositStatus: ${order.depositStatus})`);
    });

  } catch (error) {
    console.error('❌ Error al actualizar depositStatus:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
fixDepositStatus()
  .then(() => {
    console.log('\n🎉 Script completado exitosamente.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
