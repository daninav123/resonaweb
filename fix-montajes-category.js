/**
 * Script para corregir la categoría de los montajes
 * Los montajes deben tener category='MONTAJE' para aparecer en la calculadora
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixMontajesCategory() {
  try {
    console.log('🔧 Iniciando corrección de categorías de montajes...\n');

    // 1. Buscar la categoría "Montaje" en la tabla Category
    const montajeCategory = await prisma.category.findFirst({
      where: {
        name: {
          contains: 'Montaje',
          mode: 'insensitive'
        }
      }
    });

    if (!montajeCategory) {
      console.error('❌ No se encontró la categoría "Montaje"');
      return;
    }

    console.log('✅ Categoría Montaje encontrada:', montajeCategory.name, `(ID: ${montajeCategory.id})`);

    // 2. Buscar todos los packs que tienen categoryId de Montaje pero category diferente a 'MONTAJE'
    const packsToFix = await prisma.pack.findMany({
      where: {
        categoryId: montajeCategory.id,
        category: {
          not: 'MONTAJE'
        }
      }
    });

    console.log(`\n📦 Packs encontrados que necesitan corrección: ${packsToFix.length}\n`);

    if (packsToFix.length === 0) {
      console.log('✅ Todos los montajes ya tienen la categoría correcta!');
      return;
    }

    // Mostrar los packs que se van a actualizar
    packsToFix.forEach((pack, index) => {
      console.log(`${index + 1}. ${pack.name}`);
      console.log(`   Categoría actual: ${pack.category}`);
      console.log(`   Se cambiará a: MONTAJE\n`);
    });

    // 3. Actualizar todos los packs
    const updateResult = await prisma.pack.updateMany({
      where: {
        categoryId: montajeCategory.id,
        category: {
          not: 'MONTAJE'
        }
      },
      data: {
        category: 'MONTAJE'
      }
    });

    console.log(`\n✅ ${updateResult.count} montajes actualizados correctamente!`);
    console.log('🎉 Los montajes ahora aparecerán en la calculadora de eventos\n');

  } catch (error) {
    console.error('❌ Error al corregir montajes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
fixMontajesCategory();
