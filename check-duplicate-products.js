const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDuplicates() {
  try {
    console.log('🔍 Buscando productos duplicados o inactivos...\n');
    
    // Buscar todos los productos con slug "dj"
    const djProducts = await prisma.product.findMany({
      where: {
        slug: {
          contains: 'dj',
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        isActive: true,
        category: {
          select: {
            name: true
          }
        },
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (djProducts.length === 0) {
      console.log('✅ No se encontraron productos con "dj" en el slug\n');
    } else {
      console.log(`📦 Encontrados ${djProducts.length} productos con "dj":\n`);
      djProducts.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name}`);
        console.log(`   ID: ${p.id}`);
        console.log(`   SKU: ${p.sku}`);
        console.log(`   Slug: ${p.slug}`);
        console.log(`   Estado: ${p.isActive ? '🟢 ACTIVO' : '🔴 INACTIVO'}`);
        console.log(`   Categoría: ${p.category?.name || 'Sin categoría'}`);
        console.log(`   Creado: ${p.createdAt.toLocaleString()}`);
        console.log('');
      });

      // Contar activos e inactivos
      const activos = djProducts.filter(p => p.isActive).length;
      const inactivos = djProducts.filter(p => !p.isActive).length;
      
      console.log(`📊 Resumen: ${activos} activos, ${inactivos} inactivos\n`);

      if (inactivos > 0) {
        console.log('💡 Puedes eliminar los productos inactivos para liberar los slugs\n');
        console.log('Comandos:');
        djProducts.filter(p => !p.isActive).forEach(p => {
          console.log(`   DELETE FROM "Product" WHERE id = '${p.id}'; -- ${p.name}`);
        });
      }
    }

    // Buscar productos con el mismo slug (activos)
    console.log('\n🔍 Buscando slugs duplicados en productos ACTIVOS...\n');
    
    const duplicateSlugs = await prisma.product.groupBy({
      by: ['slug'],
      where: {
        isActive: true
      },
      _count: {
        slug: true
      },
      having: {
        slug: {
          _count: {
            gt: 1
          }
        }
      }
    });

    if (duplicateSlugs.length === 0) {
      console.log('✅ No hay slugs duplicados en productos activos\n');
    } else {
      console.log(`⚠️ Encontrados ${duplicateSlugs.length} slugs duplicados:\n`);
      for (const dup of duplicateSlugs) {
        const products = await prisma.product.findMany({
          where: {
            slug: dup.slug,
            isActive: true
          }
        });
        console.log(`Slug: "${dup.slug}" (${dup._count.slug} productos)`);
        products.forEach(p => {
          console.log(`  - ${p.name} (ID: ${p.id}, SKU: ${p.sku})`);
        });
        console.log('');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDuplicates();
