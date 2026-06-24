const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDeposits() {
  try {
    console.log('🔍 Verificando estado de fianzas en los pedidos...\n');

    const orders = await prisma.order.findMany({
      select: {
        id: true,
        orderNumber: true,
        depositAmount: true,
        depositStatus: true,
        status: true,
        total: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    console.log(`📊 Total de pedidos encontrados: ${orders.length}\n`);

    if (orders.length === 0) {
      console.log('⚠️  No hay pedidos en la base de datos');
      return;
    }

    orders.forEach((order, index) => {
      console.log(`\n${index + 1}. Pedido #${order.orderNumber}`);
      console.log(`   ID: ${order.id}`);
      console.log(`   Estado: ${order.status}`);
      console.log(`   Total: €${Number(order.total).toFixed(2)}`);
      console.log(`   💰 Fianza: €${Number(order.depositAmount).toFixed(2)}`);
      console.log(`   📌 Estado Fianza: ${order.depositStatus}`);
      console.log(`   Fecha: ${new Date(order.createdAt).toLocaleDateString()}`);
      
      // Evaluar si debe mostrar botones
      const shouldShowCobrar = Number(order.depositAmount) > 0 && 
        (order.depositStatus === 'PENDING' || order.depositStatus === 'AUTHORIZED');
      const shouldShowDevolver = Number(order.depositAmount) > 0 && 
        (order.depositStatus === 'CAPTURED' || order.depositStatus === 'AUTHORIZED');
      
      console.log(`   🔘 Botón "Cobrar": ${shouldShowCobrar ? '✅ SÍ' : '❌ NO'}`);
      console.log(`   🔘 Botón "Devolver": ${shouldShowDevolver ? '✅ SÍ' : '❌ NO'}`);
    });

    console.log('\n\n📈 Resumen de estados de fianza:');
    const statusCount = {};
    orders.forEach(order => {
      const status = order.depositStatus;
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} pedido(s)`);
    });

    console.log('\n💡 Pedidos con fianza > 0:');
    const withDeposit = orders.filter(o => Number(o.depositAmount) > 0);
    console.log(`   ${withDeposit.length} de ${orders.length} pedidos`);

    if (withDeposit.length === 0) {
      console.log('\n⚠️  PROBLEMA ENCONTRADO: No hay pedidos con fianza > 0');
      console.log('   Esto explica por qué no se ven los botones.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDeposits();
