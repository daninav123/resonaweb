import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createPacksCategory() {
  try {
    console.log('🎁 Creando categoría Packs...');

    // Verificar si ya existe
    const existing = await prisma.category.findFirst({
      where: { slug: 'packs' }
    });

    if (existing) {
      console.log('✅ La categoría Packs ya existe:', existing.id);
      return;
    }

    // Crear la categoría
    const packsCategory = await prisma.category.create({
      data: {
        name: 'Packs',
        slug: 'packs',
        description: 'Packs de productos con descuento especial',
        isActive: true,
        featured: true,
        sortOrder: 0, // Primera categoría
      }
    });

    console.log('✅ Categoría Packs creada exitosamente:', packsCategory.id);
    console.log('   Nombre:', packsCategory.name);
    console.log('   Slug:', packsCategory.slug);

  } catch (error) {
    console.error('❌ Error creando categoría Packs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createPacksCategory();
