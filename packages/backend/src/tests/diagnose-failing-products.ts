/**
 * DIAGNÓSTICO: Identificar por qué ciertos productos fallan al eliminar
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Productos que fallaron según los logs del frontend
const FAILING_PRODUCTS = [
  '0983ecfe-d03e-42c3-9f82-aa6245c30c2c',
  '477dfbcb-96f8-4776-bfb4-5201b680797b',
];

// Productos que funcionaron
const WORKING_PRODUCTS = [
  'a2cfbdfe-637e-4962-9696-78608f5f22a2',
  '4bbb8f78-1272-4917-b879-923099d75833',
];

async function diagnoseProduct(id: string, status: 'FAILING' | 'WORKING') {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${status === 'FAILING' ? '❌' : '✅'} Producto: ${id.substring(0, 8)}...`);
  console.log(`${'='.repeat(60)}`);

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
        orderItems: {
          select: {
            id: true,
            orderId: true,
          },
        },
        packItems: {
          select: {
            id: true,
            packId: true,
          },
        },
        reviews: {
          select: {
            id: true,
          },
        },
        favorites: {
          select: {
            id: true,
          },
        },
        interactions: {
          select: {
            id: true,
            type: true,
          },
        },
      },
    });

    if (!product) {
      console.log('⚠️  Producto no encontrado en DB');
      return;
    }

    console.log('\n📦 INFORMACIÓN BÁSICA:');
    console.log(`   Nombre: ${product.name}`);
    console.log(`   SKU: ${product.sku}`);
    console.log(`   Activo: ${product.isActive}`);
    console.log(`   Status: ${product.status}`);

    console.log('\n🔗 RELACIONES (_count):');
    console.log(`   OrderItems: ${product._count.orderItems}`);
    console.log(`   PackItems: ${product._count.packItems}`);
    console.log(`   Reviews: ${product._count.reviews}`);
    console.log(`   Favorites: ${product._count.favorites}`);
    console.log(`   Interactions: ${product._count.interactions}`);
    console.log(`   Analytics: ${product.analytics ? 'SÍ' : 'NO'}`);

    if (product._count.orderItems > 0) {
      console.log('\n⚠️  PROBLEMA POTENCIAL: Tiene OrderItems');
      console.log('   IDs:', product.orderItems.map(oi => oi.id.substring(0, 8)).join(', '));
      
      // Verificar si las órdenes están en estado que no permite borrar
      const orders = await prisma.order.findMany({
        where: {
          id: {
            in: product.orderItems.map(oi => oi.orderId),
          },
        },
        select: {
          id: true,
          status: true,
        },
      });
      console.log('   Estados de órdenes:', orders.map(o => o.status).join(', '));
    }

    if (product._count.packItems > 0) {
      console.log('\n⚠️  PROBLEMA POTENCIAL: Está en Packs');
      console.log('   Pack IDs:', product.packItems.map(pi => pi.packId.substring(0, 8)).join(', '));
    }

    if (product.analytics) {
      console.log('\n📊 Analytics ID:', product.analytics.id.substring(0, 8));
    }

    // Intentar eliminar y capturar error específico
    console.log('\n🧪 INTENTANDO ELIMINAR...');
    try {
      await prisma.$transaction(async (tx) => {
        if (product.analytics) {
          await tx.productDemandAnalytics.delete({
            where: { productId: id },
          });
        }

        await tx.productInteraction.deleteMany({
          where: { productId: id },
        });

        await tx.favorite.deleteMany({
          where: { productId: id },
        });

        await tx.review.deleteMany({
          where: { productId: id },
        });

        await tx.product.delete({
          where: { id },
        });
      });

      console.log('✅ ELIMINACIÓN EXITOSA');
    } catch (error: any) {
      console.error('\n❌ ERROR AL ELIMINAR:');
      console.error(`   Mensaje: ${error.message}`);
      console.error(`   Código: ${error.code}`);
      console.error(`   Meta: ${JSON.stringify(error.meta)}`);
      
      if (error.code === 'P2003') {
        console.error('\n🔴 FOREIGN KEY CONSTRAINT:');
        console.error('   Hay una tabla que referencia este producto y no se está eliminando');
        console.error(`   Target: ${error.meta?.field_name || 'desconocido'}`);
      }
    }

  } catch (error: any) {
    console.error('❌ Error en diagnóstico:', error.message);
  }
}

async function findAllForeignKeys() {
  console.log('\n📋 BUSCANDO TODAS LAS FOREIGN KEYS A Product...\n');
  
  const tables = await prisma.$queryRaw<any[]>`
    SELECT
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND ccu.table_name = 'Product'
  `;

  console.log('Tablas que referencian Product:');
  tables.forEach(t => {
    console.log(`   ${t.table_name}.${t.column_name} -> Product.${t.foreign_column_name}`);
  });
}

async function runDiagnosis() {
  console.log('\n🔍 DIAGNÓSTICO DE PRODUCTOS CON FALLO EN ELIMINACIÓN\n');

  // Buscar foreign keys
  await findAllForeignKeys();

  // Analizar productos que fallan
  console.log('\n\n❌ PRODUCTOS QUE FALLAN:');
  for (const id of FAILING_PRODUCTS) {
    await diagnoseProduct(id, 'FAILING');
  }

  // Analizar productos que funcionan (para comparar)
  console.log('\n\n✅ PRODUCTOS QUE FUNCIONAN (comparación):');
  for (const id of WORKING_PRODUCTS) {
    await diagnoseProduct(id, 'WORKING');
  }

  await prisma.$disconnect();
}

runDiagnosis()
  .then(() => {
    console.log('\n\n✅ Diagnóstico completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en diagnóstico:', error);
    process.exit(1);
  });
