/**
 * Test directo en DB: Simular lo que hace el servicio
 * Sin pasar por HTTP
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function deleteProductDirect(id: string, name: string) {
  console.log(`\n🗑️  Eliminando: ${name} (${id})`);
  
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orderItems: true,
            packItems: true,
            reviews: true,
            favorites: true,
            interactions: true,
          },
        },
        analytics: true,
      },
    });

    if (!product) {
      throw new Error('Producto no encontrado');
    }

    const hasRelations = product._count.orderItems > 0 || product._count.packItems > 0;
    
    if (hasRelations) {
      console.log('  → Soft delete (tiene relaciones)');
      await prisma.product.update({
        where: { id },
        data: {
          isActive: false,
          status: 'DISCONTINUED',
        },
      });
      console.log('  ✅ Desactivado');
      return;
    }

    // Hard delete con transacción
    console.log('  → Hard delete iniciando transacción...');
    await prisma.$transaction(async (tx) => {
      if (product.analytics) {
        try {
          await tx.productDemandAnalytics.delete({
            where: { productId: id },
          });
          console.log('    ✓ Analytics eliminados');
        } catch (e) {
          console.log('    ✓ No analytics');
        }
      }

      const interactions = await tx.productInteraction.deleteMany({
        where: { productId: id },
      });
      console.log(`    ✓ ${interactions.count} interactions`);

      const favorites = await tx.favorite.deleteMany({
        where: { productId: id },
      });
      console.log(`    ✓ ${favorites.count} favorites`);

      const reviews = await tx.review.deleteMany({
        where: { productId: id },
      });
      console.log(`    ✓ ${reviews.count} reviews`);

      await tx.product.delete({
        where: { id },
      });
      console.log('    ✓ Producto eliminado');
    }, {
      maxWait: 5000,
      timeout: 10000,
    });

    console.log('  ✅ Eliminado completamente');
  } catch (error: any) {
    console.error(`  ❌ Error: ${error.message}`);
    console.error(`     Code: ${error.code}`);
    throw error;
  }
}

async function testDirectDeletion() {
  console.log('🧪 TEST DIRECTO DB: Eliminación múltiple\n');
  
  try {
    // Obtener algunos productos
    console.log('📦 Obteniendo productos...');
    const products = await prisma.product.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
    });
    
    console.log(`✅ ${products.length} productos encontrados`);
    
    if (products.length < 2) {
      console.log('⚠️  Necesitamos al menos 2 productos. Creando productos de test...');
      
      const category = await prisma.category.findFirst();
      if (!category) throw new Error('No hay categorías');
      
      for (let i = 0; i < 3; i++) {
        await prisma.product.create({
          data: {
            sku: `DB-TEST-${Date.now()}-${i}`,
            name: `DB Test Product ${i + 1}`,
            slug: `db-test-${Date.now()}-${i}`,
            description: 'Test product',
            categoryId: category.id,
            pricePerDay: 100,
            pricePerWeekend: 150,
            pricePerWeek: 500,
            stock: 10,
            realStock: 10,
            availableStock: 10,
          },
        });
      }
      
      // Recargar productos
      const newProducts = await prisma.product.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
      });
      
      console.log(`✅ ${newProducts.length} productos de test creados\n`);
      
      // Eliminarlos
      for (const product of newProducts) {
        await deleteProductDirect(product.id, product.name);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      console.log('\n🎉 TEST PASADO: Todos los productos eliminados correctamente');
    } else {
      // Eliminar productos existentes
      for (const product of products) {
        await deleteProductDirect(product.id, product.name);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      console.log('\n🎉 TEST PASADO: Todos los productos eliminados correctamente');
    }
    
  } catch (error: any) {
    console.error('\n❌ TEST FALLIDO:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
testDirectDeletion()
  .then(() => {
    console.log('\n✅ Test directo completado');
    process.exit(0);
  })
  .catch(() => {
    console.error('\n❌ Test directo fallido');
    process.exit(1);
  });
