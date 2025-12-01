import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testRelatedProducts() {
  console.log('🧪 Testing related products functionality...\n');

  // 1. Obtener un producto de ejemplo
  const product = await prisma.product.findFirst({
    where: {
      slug: 'lc-8-kinson-son-0006'
    },
    select: {
      id: true,
      name: true,
      slug: true,
      categoryId: true,
    }
  });

  if (!product) {
    console.log('❌ Producto no encontrado');
    return;
  }

  console.log('✅ Producto encontrado:', {
    id: product.id,
    name: product.name,
    categoryId: product.categoryId
  });

  // 2. Buscar packs que incluyan este producto
  const packsWithProduct = await prisma.pack.findMany({
    where: {
      isActive: true,
      items: {
        some: {
          productId: product.id
        }
      }
    },
    select: {
      id: true,
      name: true,
      slug: true,
    }
  });

  console.log(`\n📦 Packs encontrados: ${packsWithProduct.length}`);
  if (packsWithProduct.length > 0) {
    packsWithProduct.forEach(pack => {
      console.log(`  - ${pack.name} (${pack.slug})`);
    });
  }

  // 3. Buscar productos de la misma categoría
  if (product.categoryId) {
    const sameCategory = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        status: 'AVAILABLE' as any,
      },
      take: 6,
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
      }
    });

    console.log(`\n🏷️  Productos de la misma categoría: ${sameCategory.length}`);
    if (sameCategory.length > 0) {
      sameCategory.forEach(p => {
        console.log(`  - ${p.name} (${p.sku})`);
      });
    } else {
      console.log('  ⚠️  No se encontraron productos de la misma categoría');
      
      // Ver todos los productos de esa categoría
      const allInCategory = await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
        },
        select: {
          id: true,
          name: true,
          status: true,
        }
      });
      console.log(`\n  📊 Total productos en la categoría (incluyendo actual): ${allInCategory.length}`);
      allInCategory.forEach(p => {
        console.log(`    - ${p.name} (${p.status})`);
      });
    }
  } else {
    console.log('\n⚠️  El producto no tiene categoryId asignado');
  }

  await prisma.$disconnect();
}

testRelatedProducts()
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
