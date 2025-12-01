const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixDepositAmounts() {
  try {
    console.log('🔧 Actualizando fianzas de pedidos existentes...\n');

    // Obtener todos los pedidos con depositAmount = 0
    const orders = await prisma.order.findMany({
      where: {
        depositAmount: 0,
        status: {
          not: 'CANCELLED'
        }
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                customDeposit: true,
                pricePerDay: true,
              }
            }
          }
        },
        user: {
          select: {
            userLevel: true
          }
        }
      }
    });

    console.log(`📊 Pedidos encontrados sin fianza: ${orders.length}\n`);

    let updated = 0;
    let skipped = 0;

    for (const order of orders) {
      // VIP no paga fianza
      if (order.user.userLevel === 'VIP' || order.user.userLevel === 'VIP_PLUS') {
        console.log(`⏭️  Pedido #${order.orderNumber} - Usuario ${order.user.userLevel}, fianza = €0.00`);
        skipped++;
        continue;
      }

      // Calcular fianza
      let totalDeposit = 0;

      for (const item of order.items) {
        if (!item.product) continue;

        // Si tiene fianza personalizada, usarla
        if (item.product.customDeposit && Number(item.product.customDeposit) > 0) {
          totalDeposit += Number(item.product.customDeposit) * item.quantity;
        } else {
          // Si no, calcular 20% del total del item
          const itemTotal = Number(item.totalPrice || item.subtotal || 0);
          totalDeposit += itemTotal * 0.2;
        }
      }

      if (totalDeposit > 0) {
        // Actualizar pedido
        await prisma.order.update({
          where: { id: order.id },
          data: {
            depositAmount: totalDeposit,
            depositStatus: 'PENDING' // Mantener estado PENDING
          }
        });

        console.log(`✅ Pedido #${order.orderNumber} - Fianza actualizada a €${totalDeposit.toFixed(2)}`);
        updated++;
      } else {
        console.log(`⚠️  Pedido #${order.orderNumber} - No se pudo calcular fianza`);
        skipped++;
      }
    }

    console.log(`\n📈 Resumen:`);
    console.log(`   ✅ Actualizados: ${updated}`);
    console.log(`   ⏭️  Omitidos (VIP o sin cambios): ${skipped}`);
    console.log(`   📦 Total procesados: ${orders.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDepositAmounts();
