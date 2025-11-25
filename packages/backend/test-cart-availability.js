const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

async function testCartAvailability() {
  console.log('\n🧪 === TEST E2E: VALIDACIÓN EN CARRITO ===\n');

  try {
    // PASO 1: Crear/actualizar producto con stock limitado
    console.log('📦 PASO 1: Preparando producto con stock limitado...');
    
    let testProduct = await prisma.product.findFirst({
      where: { sku: 'TEST-STOCK-LIMITED' }
    });

    if (!testProduct) {
      const category = await prisma.category.findFirst();
      testProduct = await prisma.product.create({
        data: {
          name: 'Producto Test Stock Limitado',
          slug: 'producto-test-stock-limitado',
          sku: 'TEST-STOCK-LIMITED',
          description: 'Producto para test de disponibilidad',
          pricePerDay: 100,
          pricePerWeekend: 250,
          pricePerWeek: 500,
          stock: 1,
          realStock: 1,
          categoryId: category.id,
          isActive: true
        }
      });
      console.log('   ✅ Producto creado');
    } else {
      await prisma.product.update({
        where: { id: testProduct.id },
        data: { stock: 1, realStock: 1 }
      });
      console.log('   ✅ Producto actualizado');
    }

    console.log(`   📊 Producto: ${testProduct.name}`);
    console.log(`   📊 Stock: 1 unidad`);
    console.log(`   📊 ID: ${testProduct.id}\n`);

    // PASO 2: Simular llamada al endpoint check-availability
    console.log('🔍 PASO 2: Probando endpoint check-availability...\n');

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 5); // +5 días (menos de 30)
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const startDate = tomorrow.toISOString().split('T')[0];
    const endDate = dayAfter.toISOString().split('T')[0];

    console.log(`   📅 Fecha inicio: ${startDate}`);
    console.log(`   📅 Fecha fin: ${endDate}`);
    console.log(`   📦 Cantidad solicitada: 4 unidades`);
    console.log(`   📊 Stock disponible: 1 unidad\n`);

    try {
      const response = await axios.post('http://localhost:3001/api/v1/products/check-availability', {
        productId: testProduct.id,
        startDate,
        endDate,
        quantity: 4
      });

      console.log('📊 Respuesta del servidor:');
      console.log(JSON.stringify(response.data, null, 2));
      console.log('');

      if (response.data.available === false) {
        console.log('✅ TEST PASADO: El endpoint detecta correctamente la falta de stock');
        console.log(`✅ Mensaje: ${response.data.message}\n`);
      } else {
        console.log('❌ TEST FALLIDO: El endpoint dice que hay disponibilidad cuando no la hay');
        console.log(`❌ Response: ${JSON.stringify(response.data)}\n`);
        return false;
      }
    } catch (error) {
      if (error.response) {
        console.log('📊 Respuesta del servidor (error):');
        console.log(JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('❌ Error de conexión:', error.message);
        console.log('\n⚠️ Asegúrate de que el backend está corriendo en http://localhost:3001\n');
        return false;
      }
    }

    // PASO 3: Probar con fechas > 30 días (debería estar disponible)
    console.log('🔍 PASO 3: Probando con fechas > 30 días...\n');

    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + 35); // +35 días
    const futureDateEnd = new Date(futureDate);
    futureDateEnd.setDate(futureDateEnd.getDate() + 1);

    const startDateFuture = futureDate.toISOString().split('T')[0];
    const endDateFuture = futureDateEnd.toISOString().split('T')[0];

    console.log(`   📅 Fecha inicio: ${startDateFuture} (+35 días)`);
    console.log(`   📅 Fecha fin: ${endDateFuture}`);
    console.log(`   📦 Cantidad solicitada: 4 unidades`);
    console.log(`   📊 Stock disponible: 1 unidad\n`);

    try {
      const response = await axios.post('http://localhost:3001/api/v1/products/check-availability', {
        productId: testProduct.id,
        startDate: startDateFuture,
        endDate: endDateFuture,
        quantity: 4
      });

      console.log('📊 Respuesta del servidor:');
      console.log(JSON.stringify(response.data, null, 2));
      console.log('');

      if (response.data.available === true) {
        console.log('✅ TEST PASADO: Fechas > 30 días permiten reserva sin stock actual');
        console.log(`✅ Mensaje: ${response.data.message}\n`);
      } else {
        console.log('❌ TEST FALLIDO: Fechas > 30 días deberían permitir reserva');
        console.log(`❌ Response: ${JSON.stringify(response.data)}\n`);
        return false;
      }
    } catch (error) {
      if (error.response) {
        console.log('📊 Respuesta del servidor (error):');
        console.log(JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('❌ Error de conexión:', error.message);
      }
      return false;
    }

    console.log('✅ === TODOS LOS TESTS PASARON ===\n');
    console.log('🔍 El endpoint funciona correctamente.');
    console.log('⚠️ Si el error persiste en el frontend, el problema está en CartPage.tsx\n');
    
    return true;

  } catch (error) {
    console.error('\n❌ ERROR EN EL TEST:', error);
    console.error(error.stack);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar test
testCartAvailability()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
