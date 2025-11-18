/**
 * Test E2E para eliminación de productos
 * Reproduce el bug: primera eliminación OK, segunda falla
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testProductDeletion() {
  console.log('🧪 TEST: Eliminación de productos múltiples\n');
  
  try {
    // 1. Crear productos de prueba
    console.log('📦 Creando productos de prueba...');
    
    // Obtener una categoría existente
    const category = await prisma.category.findFirst();
    if (!category) {
      throw new Error('No hay categorías en la DB');
    }
    
    const product1 = await prisma.product.create({
      data: {
        sku: `TEST-${Date.now()}-1`,
        name: 'Producto Test 1',
        slug: `test-product-${Date.now()}-1`,
        description: 'Producto para test de eliminación',
        categoryId: category.id,
        pricePerDay: 100,
        pricePerWeekend: 150,
        pricePerWeek: 500,
        stock: 10,
        realStock: 10,
        availableStock: 10,
      },
    });
    
    const product2 = await prisma.product.create({
      data: {
        sku: `TEST-${Date.now()}-2`,
        name: 'Producto Test 2',
        slug: `test-product-${Date.now()}-2`,
        description: 'Producto para test de eliminación 2',
        categoryId: category.id,
        pricePerDay: 200,
        pricePerWeekend: 300,
        pricePerWeek: 1000,
        stock: 5,
        realStock: 5,
        availableStock: 5,
      },
    });
    
    console.log(`✅ Producto 1 creado: ${product1.id}`);
    console.log(`✅ Producto 2 creado: ${product2.id}\n`);
    
    // 2. Comprobar relaciones
    console.log('🔍 Comprobando relaciones...');
    const p1WithRelations = await prisma.product.findUnique({
      where: { id: product1.id },
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
    
    console.log('Producto 1 relaciones:', {
      orderItems: p1WithRelations?._count.orderItems,
      packItems: p1WithRelations?._count.packItems,
      reviews: p1WithRelations?._count.reviews,
      favorites: p1WithRelations?._count.favorites,
      interactions: p1WithRelations?._count.interactions,
      hasAnalytics: !!p1WithRelations?.analytics,
    });
    
    // 3. Eliminar primer producto
    console.log('\n🗑️  Eliminando producto 1...');
    await deleteProduct(product1.id);
    console.log('✅ Producto 1 eliminado exitosamente\n');
    
    // 4. Esperar un momento
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 5. Eliminar segundo producto
    console.log('🗑️  Eliminando producto 2...');
    await deleteProduct(product2.id);
    console.log('✅ Producto 2 eliminado exitosamente\n');
    
    console.log('🎉 TEST PASADO: Ambos productos eliminados correctamente');
    
  } catch (error: any) {
    console.error('❌ TEST FALLIDO:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function deleteProduct(id: string) {
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

  // Check if product has orders or is in packs
  const hasRelations = product._count.orderItems > 0 || product._count.packItems > 0;
  
  if (hasRelations) {
    // Soft delete
    await prisma.product.update({
      where: { id },
      data: {
        isActive: false,
        status: 'DISCONTINUED',
      },
    });
    console.log(`  → Soft delete (tiene relaciones)`);
    return { message: 'Producto desactivado correctamente' };
  }

  // Hard delete
  await prisma.$transaction(async (tx) => {
    // Delete related data first
    if (product.analytics) {
      try {
        await tx.productDemandAnalytics.delete({
          where: { productId: id },
        });
        console.log(`  → Analytics eliminados`);
      } catch (e) {
        console.log(`  → No analytics to delete`);
      }
    }

    const interactions = await tx.productInteraction.deleteMany({
      where: { productId: id },
    });
    console.log(`  → ${interactions.count} interactions eliminadas`);

    const favorites = await tx.favorite.deleteMany({
      where: { productId: id },
    });
    console.log(`  → ${favorites.count} favorites eliminados`);

    const reviews = await tx.review.deleteMany({
      where: { productId: id },
    });
    console.log(`  → ${reviews.count} reviews eliminadas`);

    // Delete the product
    await tx.product.delete({
      where: { id },
    });
    console.log(`  → Producto eliminado de DB`);
  }, {
    maxWait: 5000,
    timeout: 10000,
  });

  return { message: 'Producto eliminado correctamente' };
}

// Ejecutar test
testProductDeletion()
  .then(() => {
    console.log('\n✅ Test completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test fallido:', error);
    process.exit(1);
  });
