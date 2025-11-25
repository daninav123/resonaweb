import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createPacksCategory() {
  console.log('📦 Creando categoría de Packs...\n');

  try {
    // Verificar si ya existe
    const existing = await prisma.category.findUnique({
      where: { slug: 'packs' }
    });

    if (existing) {
      console.log('✅ La categoría "Packs" ya existe');
      console.log(`   ID: ${existing.id}`);
      console.log(`   Nombre: ${existing.name}\n`);
      return;
    }

    // Crear la categoría
    const packsCategory = await prisma.category.create({
      data: {
        name: 'Packs',
        slug: 'packs',
        description: 'Packs completos de equipamiento para diferentes tipos de eventos',
        imageUrl: '/images/categories/packs.jpg',
        featured: true
      }
    });

    console.log('✅ Categoría "Packs" creada exitosamente!');
    console.log(`   ID: ${packsCategory.id}`);
    console.log(`   Slug: ${packsCategory.slug}`);
    console.log(`   Nombre: ${packsCategory.name}\n`);

  } catch (error) {
    console.error('❌ Error al crear categoría:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createPacksCategory();
