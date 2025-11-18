/**
 * Diagnosticar el producto específico que falla
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FAILING_PRODUCT = '10351b31-6eb8-4378-a664-5e172489bb3f';

async function diagnoseSpecificProduct() {
  console.log('🔍 DIAGNÓSTICO DEL PRODUCTO QUE FALLA\n');
  console.log(`ID: ${FAILING_PRODUCT}\n`);

  try {
    const product = await prisma.product.findUnique({
      where: { id: FAILING_PRODUCT },
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
        orderItems: {
          include: {
            order: {
              select: {
                id: true,
                status: true,
                userId: true,
              },
            },
          },
        },
        packItems: {
          include: {
            pack: {
              select: {
                id: true,
                name: true,
                isActive: true,
              },
            },
          },
        },
        reviews: true,
        favorites: true,
        interactions: true,
      },
    });

    if (!product) {
      console.log('❌ Producto NO EXISTE en la base de datos\n');
      console.log('Posiblemente ya fue eliminado pero el frontend lo sigue mostrando.\n');
      return;
    }

    console.log('📦 PRODUCTO ENCONTRADO:');
    console.log(`   Nombre: ${product.name}`);
    console.log(`   SKU: ${product.sku}`);
    console.log(`   Activo: ${product.isActive}`);
    console.log(`   Status: ${product.status}\n`);

    console.log('🔗 RELACIONES:');
    console.log(`   OrderItems: ${product._count.orderItems}`);
    console.log(`   PackItems: ${product._count.packItems}`);
    console.log(`   Reviews: ${product._count.reviews}`);
    console.log(`   Favorites: ${product._count.favorites}`);
    console.log(`   Interactions: ${product._count.interactions}`);
    console.log(`   Analytics: ${product.analytics ? 'SÍ' : 'NO'}\n`);

    // Detalles de relaciones problemáticas
    if (product.orderItems.length > 0) {
      console.log('⚠️  TIENE ORDERITEMS:');
      product.orderItems.forEach((oi, i) => {
        console.log(`   ${i + 1}. Order: ${oi.order.id.substring(0, 8)}... Status: ${oi.order.status}`);
      });
      console.log('');
    }

    if (product.packItems.length > 0) {
      console.log('⚠️  ESTÁ EN PACKS:');
      product.packItems.forEach((pi, i) => {
        console.log(`   ${i + 1}. Pack: ${pi.pack.name} (Activo: ${pi.pack.isActive})`);
      });
      console.log('');
    }

    // Intentar eliminar y ver el error específico
    console.log('🧪 INTENTANDO ELIMINAR...\n');
    
    try {
      await prisma.$transaction(async (tx) => {
        if (product.analytics) {
          await tx.productDemandAnalytics.delete({
            where: { productId: FAILING_PRODUCT },
          });
          console.log('   ✓ Analytics eliminados');
        }

        const interactions = await tx.productInteraction.deleteMany({
          where: { productId: FAILING_PRODUCT },
        });
        console.log(`   ✓ ${interactions.count} interactions eliminadas`);

        const favorites = await tx.favorite.deleteMany({
          where: { productId: FAILING_PRODUCT },
        });
        console.log(`   ✓ ${favorites.count} favorites eliminados`);

        const reviews = await tx.review.deleteMany({
          where: { productId: FAILING_PRODUCT },
        });
        console.log(`   ✓ ${reviews.count} reviews eliminadas`);

        await tx.product.delete({
          where: { id: FAILING_PRODUCT },
        });
        console.log('   ✓ Producto eliminado');
      }, {
        maxWait: 5000,
        timeout: 10000,
      });

      console.log('\n✅ ELIMINACIÓN EXITOSA\n');
      console.log('El producto se puede eliminar sin problemas.\n');
      console.log('El error 500 debe ser por otra razón (race condition, timeout, etc.)\n');

    } catch (error: any) {
      console.error('\n❌ ERROR AL ELIMINAR:\n');
      console.error(`   Mensaje: ${error.message}`);
      console.error(`   Código: ${error.code}`);
      
      if (error.meta) {
        console.error(`   Meta: ${JSON.stringify(error.meta, null, 2)}`);
      }
      
      if (error.code === 'P2003') {
        console.error('\n🔴 FOREIGN KEY CONSTRAINT VIOLATION:');
        console.error('   Hay una tabla que referencia este producto que NO estamos eliminando.\n');
      }

      if (error.code === 'P2025') {
        console.error('\n🟡 RECORD NOT FOUND:');
        console.error('   El registro ya no existe (posiblemente eliminado en otra transacción).\n');
      }
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseSpecificProduct()
  .then(() => {
    console.log('✅ Diagnóstico completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error en diagnóstico:', error.message);
    process.exit(1);
  });
