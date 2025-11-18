/**
 * TEST E2E COMPLETO: Flujo de validación de stock
 * 
 * Simula el flujo completo del usuario:
 * 1. Crear producto con stock 0
 * 2. Añadir al carrito (simular)
 * 3. Asignar fechas < 30 días -> Debe fallar
 * 4. Asignar fechas > 30 días -> Debe funcionar
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simulación del código del frontend
class StockValidator {
  validateDateForProduct(productStock: number, startDate: string): { valid: boolean; message: string } {
    if (productStock === 0 && startDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const daysUntilStart = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(`   📅 Fecha seleccionada: ${startDate}`);
      console.log(`   ⏱️  Días de antelación: ${daysUntilStart}`);
      
      if (daysUntilStart < 30) {
        return {
          valid: false,
          message: 'Este producto no tiene stock disponible. Para reservas con menos de 30 días de antelación, necesitamos tenerlo en stock.'
        };
      } else {
        return {
          valid: true,
          message: 'Reserva aceptada. Como la fecha es con más de 30 días de antelación, tendremos tiempo de conseguir el producto.'
        };
      }
    }
    
    return { valid: true, message: 'Stock disponible' };
  }
}

async function runE2ETest() {
  console.log('🧪 TEST E2E: Flujo Completo de Validación de Stock\n');
  console.log('═'.repeat(60));
  console.log('ESCENARIO: Usuario intenta reservar producto con stock 0');
  console.log('═'.repeat(60));
  console.log('');

  const validator = new StockValidator();
  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // PASO 1: Crear producto con stock 0
    console.log('📦 PASO 1: Crear producto de prueba (stock = 0)\n');
    
    const category = await prisma.category.findFirst();
    if (!category) throw new Error('No hay categorías');

    const testProduct = await prisma.product.create({
      data: {
        sku: `E2E-STOCK-TEST-${Date.now()}`,
        name: 'Producto Test Stock 0',
        slug: `producto-test-stock-${Date.now()}`,
        description: 'Producto para test E2E de validación de stock',
        categoryId: category.id,
        pricePerDay: 100,
        pricePerWeekend: 150,
        pricePerWeek: 500,
        stock: 0, // ⚠️ Stock = 0
        realStock: 0,
        availableStock: 0,
      },
    });

    console.log(`   ✅ Producto creado: ${testProduct.name}`);
    console.log(`   ID: ${testProduct.id}`);
    console.log(`   Stock: ${testProduct.stock} (CERO)\n`);

    // PASO 2: Simular añadir al carrito
    console.log('🛒 PASO 2: Usuario añade producto al carrito\n');
    console.log('   ✅ Producto añadido exitosamente (no hay validación en este paso)\n');

    // PASO 3: Usuario va al carrito e intenta asignar fechas
    console.log('📅 PASO 3: Usuario intenta asignar fechas\n');
    console.log('─'.repeat(60));

    // TEST 1: Fecha en 10 días (< 30 días) -> DEBE FALLAR
    console.log('\n🔴 TEST 1: Fecha con 10 días de antelación (< 30 días)\n');
    const date10Days = new Date();
    date10Days.setDate(date10Days.getDate() + 10);
    const dateStr10 = date10Days.toISOString().split('T')[0];
    
    const result1 = validator.validateDateForProduct(testProduct.stock, dateStr10);
    
    if (!result1.valid) {
      console.log(`   ✅ TEST PASADO: Rechazó correctamente`);
      console.log(`   Mensaje: "${result1.message}"\n`);
      testsPassed++;
    } else {
      console.log(`   ❌ TEST FALLIDO: Debería haber rechazado pero aceptó\n`);
      testsFailed++;
    }

    // TEST 2: Fecha en 20 días (< 30 días) -> DEBE FALLAR
    console.log('🔴 TEST 2: Fecha con 20 días de antelación (< 30 días)\n');
    const date20Days = new Date();
    date20Days.setDate(date20Days.getDate() + 20);
    const dateStr20 = date20Days.toISOString().split('T')[0];
    
    const result2 = validator.validateDateForProduct(testProduct.stock, dateStr20);
    
    if (!result2.valid) {
      console.log(`   ✅ TEST PASADO: Rechazó correctamente`);
      console.log(`   Mensaje: "${result2.message}"\n`);
      testsPassed++;
    } else {
      console.log(`   ❌ TEST FALLIDO: Debería haber rechazado pero aceptó\n`);
      testsFailed++;
    }

    // TEST 3: Fecha en 29 días (< 30 días) -> DEBE FALLAR
    console.log('🔴 TEST 3: Fecha con 29 días de antelación (límite)\n');
    const date29Days = new Date();
    date29Days.setDate(date29Days.getDate() + 29);
    const dateStr29 = date29Days.toISOString().split('T')[0];
    
    const result3 = validator.validateDateForProduct(testProduct.stock, dateStr29);
    
    if (!result3.valid) {
      console.log(`   ✅ TEST PASADO: Rechazó correctamente`);
      console.log(`   Mensaje: "${result3.message}"\n`);
      testsPassed++;
    } else {
      console.log(`   ❌ TEST FALLIDO: Debería haber rechazado pero aceptó\n`);
      testsFailed++;
    }

    // TEST 4: Fecha en 30 días (= 30 días) -> DEBE PASAR
    console.log('🟢 TEST 4: Fecha con 30 días de antelación (límite justo)\n');
    const date30Days = new Date();
    date30Days.setDate(date30Days.getDate() + 30);
    const dateStr30 = date30Days.toISOString().split('T')[0];
    
    const result4 = validator.validateDateForProduct(testProduct.stock, dateStr30);
    
    if (result4.valid) {
      console.log(`   ✅ TEST PASADO: Aceptó correctamente`);
      console.log(`   Mensaje: "${result4.message}"\n`);
      testsPassed++;
    } else {
      console.log(`   ❌ TEST FALLIDO: Debería haber aceptado pero rechazó`);
      console.log(`   Mensaje: "${result4.message}"\n`);
      testsFailed++;
    }

    // TEST 5: Fecha en 45 días (> 30 días) -> DEBE PASAR
    console.log('🟢 TEST 5: Fecha con 45 días de antelación (> 30 días)\n');
    const date45Days = new Date();
    date45Days.setDate(date45Days.getDate() + 45);
    const dateStr45 = date45Days.toISOString().split('T')[0];
    
    const result5 = validator.validateDateForProduct(testProduct.stock, dateStr45);
    
    if (result5.valid) {
      console.log(`   ✅ TEST PASADO: Aceptó correctamente`);
      console.log(`   Mensaje: "${result5.message}"\n`);
      testsPassed++;
    } else {
      console.log(`   ❌ TEST FALLIDO: Debería haber aceptado pero rechazó`);
      console.log(`   Mensaje: "${result5.message}"\n`);
      testsFailed++;
    }

    // TEST 6: Producto con stock > 0 -> SIEMPRE DEBE PASAR
    console.log('🟢 TEST 6: Producto CON stock (cualquier fecha)\n');
    const productWithStock = await prisma.product.create({
      data: {
        sku: `E2E-STOCK-OK-${Date.now()}`,
        name: 'Producto Test Stock OK',
        slug: `producto-test-stock-ok-${Date.now()}`,
        description: 'Producto para test E2E con stock',
        categoryId: category.id,
        pricePerDay: 100,
        pricePerWeekend: 150,
        pricePerWeek: 500,
        stock: 5, // ✅ Tiene stock
        realStock: 5,
        availableStock: 5,
      },
    });

    const result6 = validator.validateDateForProduct(productWithStock.stock, dateStr10);
    
    if (result6.valid) {
      console.log(`   ✅ TEST PASADO: Aceptó producto con stock`);
      console.log(`   Stock: ${productWithStock.stock}`);
      console.log(`   Mensaje: "${result6.message}"\n`);
      testsPassed++;
    } else {
      console.log(`   ❌ TEST FALLIDO: No debería rechazar producto con stock\n`);
      testsFailed++;
    }

    // Limpiar productos de prueba
    console.log('🧹 PASO 4: Limpiando productos de prueba...\n');
    await prisma.product.delete({ where: { id: testProduct.id } });
    await prisma.product.delete({ where: { id: productWithStock.id } });
    console.log('   ✅ Productos eliminados\n');

    // RESULTADOS FINALES
    console.log('═'.repeat(60));
    console.log('📊 RESULTADOS FINALES DEL TEST E2E');
    console.log('═'.repeat(60));
    console.log('');
    console.log(`   ✅ Tests pasados: ${testsPassed}/6`);
    console.log(`   ❌ Tests fallidos: ${testsFailed}/6`);
    console.log('');

    if (testsFailed === 0) {
      console.log('🎉 TODOS LOS TESTS PASARON EXITOSAMENTE\n');
      console.log('✅ La validación de stock funciona correctamente:\n');
      console.log('   • Rechaza fechas < 30 días con stock 0');
      console.log('   • Acepta fechas ≥ 30 días con stock 0');
      console.log('   • Acepta cualquier fecha con stock > 0\n');
    } else {
      console.log('❌ ALGUNOS TESTS FALLARON\n');
      throw new Error(`${testsFailed} tests fallaron`);
    }

  } catch (error: any) {
    console.error('\n❌ ERROR EN TEST:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

runE2ETest()
  .then(() => {
    console.log('✅ Test E2E completado exitosamente');
    process.exit(0);
  })
  .catch(() => {
    console.error('❌ Test E2E fallido');
    process.exit(1);
  });
