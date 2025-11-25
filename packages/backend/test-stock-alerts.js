const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testStockAlerts() {
  console.log('\n🧪 === TEST E2E: ALERTAS DE STOCK ===\n');

  try {
    // PASO 1: Encontrar o crear un producto sin stock
    console.log('📦 PASO 1: Preparando producto sin stock...');
    
    let testProduct = await prisma.product.findFirst({
      where: { sku: 'TEST-NO-STOCK' }
    });

    if (!testProduct) {
      testProduct = await prisma.product.create({
        data: {
          name: 'Producto Test Sin Stock',
          slug: 'producto-test-sin-stock',
          sku: 'TEST-NO-STOCK',
          description: 'Producto de prueba para alertas',
          pricePerDay: 50,
          pricePerWeekend: 125,
          pricePerWeek: 250,
          stock: 0,
          realStock: 0,
          categoryId: (await prisma.category.findFirst()).id,
          isActive: true
        }
      });
      console.log(`   ✅ Producto creado: ${testProduct.name}`);
    } else {
      await prisma.product.update({
        where: { id: testProduct.id },
        data: { stock: 0, realStock: 0 }
      });
      console.log(`   ✅ Producto actualizado: ${testProduct.name}`);
    }
    console.log(`   📊 Stock: ${testProduct.stock} unidades\n`);

    // PASO 2: Crear usuario de prueba
    console.log('👤 PASO 2: Preparando usuario de prueba...');
    
    let testUser = await prisma.user.findFirst({
      where: { email: 'test-alerts@example.com' }
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'test-alerts@example.com',
          firstName: 'Usuario',
          lastName: 'Test Alertas',
          password: 'hashed_password',
          role: 'CLIENT'
        }
      });
      console.log(`   ✅ Usuario creado: ${testUser.email}`);
    } else {
      console.log(`   ✅ Usuario encontrado: ${testUser.email}`);
    }

    // PASO 3: Crear pedido CONFIRMED para dentro de 1 mes
    console.log('\n📅 PASO 3: Creando pedido CONFIRMED para dentro de 1 mes...');
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30); // +30 días
    
    const endDate = new Date(futureDate);
    endDate.setDate(endDate.getDate() + 2); // +2 días de evento

    console.log(`   Fecha inicio: ${futureDate.toLocaleDateString()}`);
    console.log(`   Fecha fin: ${endDate.toLocaleDateString()}`);

    // Verificar si ya existe un pedido de prueba
    let existingOrder = await prisma.order.findFirst({
      where: {
        userId: testUser.id,
        orderNumber: { startsWith: 'TEST-' }
      }
    });

    if (existingOrder) {
      console.log('   🗑️ Eliminando pedido de prueba anterior...');
      await prisma.orderItem.deleteMany({
        where: { orderId: existingOrder.id }
      });
      await prisma.order.delete({
        where: { id: existingOrder.id }
      });
    }

    const testOrder = await prisma.order.create({
      data: {
        orderNumber: `TEST-${Date.now()}`,
        userId: testUser.id,
        startDate: futureDate,
        endDate: endDate,
        status: 'CONFIRMED',
        eventType: 'test',
        eventLocation: { address: 'Test Location' },
        deliveryType: 'PICKUP',
        paymentTerm: 'FULL_UPFRONT',
        contactPerson: 'Test User',
        contactPhone: '600000000',
        subtotal: 500,
        total: 500,
        totalBeforeAdjustment: 500,
        taxAmount: 0,
        shippingCost: 0,
        depositAmount: 0,
        totalAmount: 500,
        deliveryFee: 0,
        tax: 0,
        paymentStatus: 'PENDING',
        items: {
          create: {
            productId: testProduct.id,
            quantity: 5, // Pedir 5 unidades cuando hay 0 stock
            startDate: futureDate,
            endDate: endDate,
            pricePerDay: testProduct.pricePerDay,
            pricePerUnit: testProduct.pricePerDay,
            subtotal: testProduct.pricePerDay * 5 * 2,
            totalPrice: testProduct.pricePerDay * 5 * 2
          }
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    console.log(`   ✅ Pedido creado: ${testOrder.orderNumber}`);
    console.log(`   📦 Producto: ${testProduct.name} x 5 unidades`);
    console.log(`   📊 Stock disponible: 0 unidades`);
    console.log(`   ⚠️ Déficit esperado: 5 unidades\n`);

    // PASO 4: Ejecutar la lógica de alertas
    console.log('🔍 PASO 4: Ejecutando lógica de alertas de stock...\n');

    const orders = await prisma.order.findMany({
      where: {
        status: 'CONFIRMED',
        startDate: { gte: new Date() }
      },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    console.log(`   Pedidos CONFIRMED futuros encontrados: ${orders.length}`);

    const alerts = [];
    
    for (const order of orders) {
      console.log(`\n   📋 Analizando pedido: ${order.orderNumber}`);
      
      for (const item of order.items) {
        const product = item.product;
        
        // Calcular stock reservado
        const overlappingItems = await prisma.orderItem.findMany({
          where: {
            productId: product.id,
            order: {
              status: 'CONFIRMED',
              startDate: { lte: order.endDate },
              endDate: { gte: order.startDate },
              id: { not: order.id }
            }
          },
          select: { quantity: true }
        });

        const reservedStock = overlappingItems.reduce((sum, item) => sum + item.quantity, 0);
        const currentStock = product.realStock ?? product.stock ?? 0;
        const availableStock = currentStock - reservedStock;
        const deficit = item.quantity - availableStock;

        console.log(`      📦 ${product.name}`);
        console.log(`         Stock total: ${currentStock}`);
        console.log(`         Stock reservado: ${reservedStock}`);
        console.log(`         Stock disponible: ${availableStock}`);
        console.log(`         Cantidad pedida: ${item.quantity}`);
        console.log(`         Déficit: ${deficit}`);

        if (deficit > 0) {
          const priority = deficit > 5 ? 'high' : deficit > 2 ? 'medium' : 'low';
          console.log(`         ⚠️ ALERTA DETECTADA - Prioridad: ${priority}`);
          
          alerts.push({
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            orderId: order.id,
            orderNumber: order.orderNumber,
            startDate: order.startDate,
            endDate: order.endDate,
            quantityRequested: item.quantity,
            availableStock: Math.max(0, availableStock),
            deficit,
            priority
          });
        } else {
          console.log(`         ✅ Stock suficiente`);
        }
      }
    }

    // PASO 5: Verificar resultados
    console.log('\n📊 PASO 5: Verificando resultados...\n');
    
    const summary = {
      totalAlerts: alerts.length,
      highPriority: alerts.filter(a => a.priority === 'high').length,
      mediumPriority: alerts.filter(a => a.priority === 'medium').length,
      lowPriority: alerts.filter(a => a.priority === 'low').length,
      totalDeficit: alerts.reduce((sum, a) => sum + a.deficit, 0)
    };

    console.log('   === RESUMEN DE ALERTAS ===');
    console.log(`   Total alertas: ${summary.totalAlerts}`);
    console.log(`   Alta prioridad: ${summary.highPriority}`);
    console.log(`   Media prioridad: ${summary.mediumPriority}`);
    console.log(`   Baja prioridad: ${summary.lowPriority}`);
    console.log(`   Déficit total: ${summary.totalDeficit} unidades`);

    // VERIFICACIÓN FINAL
    console.log('\n✅ === RESULTADO DEL TEST ===\n');
    
    if (alerts.length > 0) {
      console.log('   ✅ TEST PASADO: Se detectaron alertas correctamente');
      console.log(`   ✅ Se detectó déficit de ${alerts[0].deficit} unidades para "${alerts[0].productName}"`);
      console.log('   ✅ El sistema de alertas funciona correctamente\n');
      return true;
    } else {
      console.log('   ❌ TEST FALLIDO: NO se detectaron alertas');
      console.log('   ❌ Debería haber al menos 1 alerta para el producto sin stock');
      console.log('   ❌ El sistema de alertas tiene un problema\n');
      return false;
    }

  } catch (error) {
    console.error('\n❌ ERROR EN EL TEST:', error);
    console.error(error.stack);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar test
testStockAlerts()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
