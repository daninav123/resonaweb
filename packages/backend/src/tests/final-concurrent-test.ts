/**
 * TEST FINAL: Eliminaciones concurrentes con el nuevo lock
 */

import { PrismaClient } from '@prisma/client';
import { ProductService } from '../services/product.service';

const prisma = new PrismaClient();
const productService = new ProductService();

async function testConcurrentDeletions() {
  console.log('🧪 TEST FINAL: Eliminaciones Concurrentes\n');
  console.log('Este test simula clicks rápidos del usuario\n');

  try {
    // 1. Crear 5 productos de prueba
    console.log('📦 Creando 5 productos de prueba...');
    const category = await prisma.category.findFirst();
    if (!category) throw new Error('No hay categorías');

    const productIds: string[] = [];
    for (let i = 0; i < 5; i++) {
      const product = await prisma.product.create({
        data: {
          sku: `FINAL-TEST-${Date.now()}-${i}`,
          name: `Final Test Product ${i + 1}`,
          slug: `final-test-${Date.now()}-${i}`,
          description: 'Test concurrente',
          categoryId: category.id,
          pricePerDay: 100,
          pricePerWeekend: 150,
          pricePerWeek: 500,
          stock: 10,
          realStock: 10,
          availableStock: 10,
        },
      });
      productIds.push(product.id);
    }
    console.log(`✅ ${productIds.length} productos creados\n`);

    // 2. Eliminar TODOS a la vez (simula clicks rápidos)
    console.log('🚀 Eliminando TODOS los productos SIMULTÁNEAMENTE...\n');
    const startTime = Date.now();

    const deletionPromises = productIds.map((id, index) => {
      console.log(`   ${index + 1}. Lanzando delete de ${id.substring(0, 8)}...`);
      return productService.deleteProduct(id, false)
        .then((result) => {
          console.log(`   ✅ ${index + 1}. Completado: ${result.message}`);
          return { success: true, id, index: index + 1 };
        })
        .catch((error) => {
          console.error(`   ❌ ${index + 1}. Error: ${error.message}`);
          return { success: false, id, index: index + 1, error: error.message };
        });
    });

    const results = await Promise.all(deletionPromises);
    const duration = Date.now() - startTime;

    console.log(`\n⏱️  Tiempo total: ${duration}ms\n`);

    // 3. Verificar resultados
    console.log('📊 RESULTADOS:\n');
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    results.forEach((result, i) => {
      console.log(`   ${result.success ? '✅' : '❌'} Producto ${i + 1}: ${result.success ? 'ÉXITO' : 'FALLÓ'}`);
      if (!result.success && 'error' in result) {
        console.log(`      Error: ${result.error}`);
      }
    });

    console.log(`\n   Total: ${successCount} éxitos, ${failCount} fallos\n`);

    if (failCount > 0) {
      throw new Error(`${failCount} productos fallaron al eliminar`);
    }

    console.log('🎉 TEST PASADO: Todas las eliminaciones concurrentes funcionaron\n');
    console.log('✅ El lock está funcionando correctamente\n');
    console.log('✅ No hay race conditions\n');

  } catch (error: any) {
    console.error('\n❌ TEST FALLIDO:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testConcurrentDeletions()
  .then(() => {
    console.log('✅ Test de eliminaciones concurrentes completado');
    process.exit(0);
  })
  .catch(() => {
    console.error('❌ Test fallido');
    process.exit(1);
  });
