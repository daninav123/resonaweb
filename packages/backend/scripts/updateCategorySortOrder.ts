import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCategorySortOrder() {
  try {
    console.log('🔄 Actualizando sortOrder de categorías...');

    // Definir el orden personalizado
    const customOrder: { [key: string]: number } = {
      'packs': 1,
      'sonido': 2,
      'iluminacion': 3,
      // El resto tendrá sortOrder por defecto (0 o 999)
    };

    // Obtener todas las categorías
    const categories = await prisma.category.findMany();
    console.log(`📦 Encontradas ${categories.length} categorías`);

    // Actualizar cada categoría
    for (const category of categories) {
      const newSortOrder = customOrder[category.slug?.toLowerCase()] || 999;
      
      await prisma.category.update({
        where: { id: category.id },
        data: { sortOrder: newSortOrder }
      });

      console.log(`✅ ${category.name} (${category.slug}) → sortOrder: ${newSortOrder}`);
    }

    console.log('✨ ¡Actualización completada!');
    console.log('\n📋 Orden final:');
    console.log('  1. PACKS');
    console.log('  2. SONIDO');
    console.log('  3. ILUMINACION');
    console.log('  999. Resto (orden alfabético)');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCategorySortOrder();
