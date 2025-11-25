/**
 * Test manual para verificar alertas de stock
 * Ejecutar: npx ts-node src/test-stock-alerts.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testStockAlerts() {
  console.log('\n🧪 === TEST DE ALERTAS DE STOCK ===\n');

  try {
    // 1. Ver todos los pedidos activos
    console.log('📋 PASO 1: Pedidos activos en la BD');
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'IN_TRANSIT', 'DELIVERED'] },
        endDate: { gte: new Date() },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    console.log(`   Total pedidos activos: ${orders.length}\n`);

    if (orders.length === 0) {
      console.log('   ⚠️ NO HAY PEDIDOS ACTIVOS');
      console.log('   Para probar alertas, necesitas crear un pedido con:');
      console.log('   - Cantidad > stock disponible del producto\n');
      return;
    }

    // 2. Ver detalles de cada pedido
    for (const order of orders) {
      console.log(`\n   📦 Pedido: ${order.orderNumber}`);
      console.log(`      Estado: ${order.status}`);
      console.log(`      Fecha: ${order.startDate.toLocaleDateString()} - ${order.endDate.toLocaleDateString()}`);
      console.log(`      Items: ${order.items.length}`);

      for (const item of order.items) {
        const product = item.product;
        console.log(`\n      → ${product.name}`);
        console.log(`         Cantidad pedida: ${item.quantity}`);
        console.log(`         Stock producto: ${product.realStock || product.stock}`);
        console.log(`         Es pack: ${product.isPack ? 'Sí' : 'No'}`);

        // Si es pack, ver componentes
        if (product.isPack) {
          const components = await prisma.productComponent.findMany({
            where: { packId: product.id },
            include: { component: true },
          });

          if (components.length > 0) {
            console.log(`         Componentes del pack:`);
            for (const comp of components) {
              console.log(`           - ${comp.quantity}x ${comp.component.name} (Stock: ${comp.component.realStock || comp.component.stock})`);
            }
          }
        }
      }
    }

    // 3. Calcular alertas manualmente
    console.log('\n\n📊 PASO 2: Calculando alertas...\n');

    const productDemand = new Map<string, { product: any; totalDemand: number; orders: any[] }>();

    for (const order of orders) {
      for (const item of order.items) {
        const product = item.product;

        if (product.isPack) {
          // Descomponer pack en componentes
          const components = await prisma.productComponent.findMany({
            where: { packId: product.id },
            include: { component: true },
          });

          for (const comp of components) {
            const componentId = comp.component.id;
            const quantityNeeded = comp.quantity * item.quantity;

            if (!productDemand.has(componentId)) {
              productDemand.set(componentId, {
                product: comp.component,
                totalDemand: 0,
                orders: [],
              });
            }

            const demand = productDemand.get(componentId)!;
            demand.totalDemand += quantityNeeded;
            demand.orders.push(order.orderNumber);
          }
        } else {
          // Producto individual
          const productId = product.id;

          if (!productDemand.has(productId)) {
            productDemand.set(productId, {
              product: product,
              totalDemand: 0,
              orders: [],
            });
          }

          const demand = productDemand.get(productId)!;
          demand.totalDemand += item.quantity;
          demand.orders.push(order.orderNumber);
        }
      }
    }

    console.log(`   Productos con demanda: ${productDemand.size}\n`);

    // 4. Ver alertas
    let alertCount = 0;
    for (const [productId, demand] of productDemand.entries()) {
      const product = demand.product;
      const currentStock = product.realStock ?? product.stock ?? 0;
      const deficit = demand.totalDemand - currentStock;

      console.log(`   📦 ${product.name} (${product.sku})`);
      console.log(`      Stock actual: ${currentStock}`);
      console.log(`      Demanda total: ${demand.totalDemand}`);
      console.log(`      Pedidos: ${[...new Set(demand.orders)].join(', ')}`);

      if (deficit > 0) {
        alertCount++;
        const priority = deficit > 5 ? 'ALTA' : deficit > 2 ? 'MEDIA' : 'BAJA';
        console.log(`      ⚠️ ALERTA: Falta ${deficit} unidades (Prioridad: ${priority})`);
      } else {
        console.log(`      ✅ Stock suficiente (sobran ${Math.abs(deficit)} unidades)`);
      }
      console.log('');
    }

    // 5. Resumen
    console.log('\n✅ === RESUMEN ===');
    console.log(`   Total alertas: ${alertCount}`);
    console.log(`   Productos revisados: ${productDemand.size}`);
    console.log(`   Pedidos activos: ${orders.length}\n`);

    if (alertCount === 0) {
      console.log('   ℹ️ No hay alertas porque el stock actual cubre toda la demanda.');
      console.log('   Para generar alertas:');
      console.log('   1. Reduce el stock de algún producto (realStock o stock)');
      console.log('   2. O crea un pedido con cantidad mayor al stock\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testStockAlerts();
