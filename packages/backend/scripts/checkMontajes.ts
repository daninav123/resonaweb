import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMontajes() {
  try {
    console.log('🔍 Verificando montajes en la base de datos...\n');

    // Buscar categoría "Montaje"
    const montajeCategory = await prisma.category.findFirst({
      where: {
        name: {
          contains: 'Montaje',
          mode: 'insensitive'
        }
      }
    });

    console.log('📁 Categoría Montaje:', montajeCategory ? '✅ Existe' : '❌ No existe');
    if (montajeCategory) {
      console.log('   ID:', montajeCategory.id);
      console.log('   Nombre:', montajeCategory.name);
    }

    // Contar packs con categoría Montaje
    const montajePacks = await prisma.pack.findMany({
      where: {
        categoryRef: {
          name: {
            contains: 'Montaje',
            mode: 'insensitive'
          }
        }
      },
      include: {
        categoryRef: true
      }
    });

    console.log('\n📦 Packs con categoría Montaje:', montajePacks.length);
    montajePacks.forEach(pack => {
      console.log(`   - ${pack.name} (${pack.categoryRef?.name})`);
    });

    // Contar todos los packs
    const allPacks = await prisma.pack.findMany({
      include: {
        categoryRef: true
      }
    });

    console.log('\n📦 Total de packs en la BD:', allPacks.length);
    console.log('\nDesglose por categoría:');
    const byCategory: Record<string, number> = {};
    allPacks.forEach(pack => {
      const catName = pack.categoryRef?.name || 'Sin categoría';
      byCategory[catName] = (byCategory[catName] || 0) + 1;
    });

    Object.entries(byCategory).forEach(([cat, count]) => {
      console.log(`   - ${cat}: ${count}`);
    });

    // Verificar si hay productos en categoría Personal
    const personalCategory = await prisma.category.findFirst({
      where: {
        name: {
          contains: 'Personal',
          mode: 'insensitive'
        }
      }
    });

    console.log('\n👥 Categoría Personal:', personalCategory ? '✅ Existe' : '❌ No existe');

    if (personalCategory) {
      const personalProducts = await prisma.product.findMany({
        where: {
          categoryId: personalCategory.id
        }
      });
      console.log('   Productos en Personal:', personalProducts.length);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMontajes();
