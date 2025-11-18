import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function activateAllCategories() {
  try {
    console.log('🔄 Activando todas las categorías...');
    
    const result = await prisma.category.updateMany({
      data: {
        isActive: true,
      },
    });

    console.log(`✅ ${result.count} categorías activadas`);
    
    // Mostrar todas las categorías
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
      },
    });
    
    console.log('\n📦 Categorías en la base de datos:');
    categories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.slug}) - ${cat.isActive ? '✅ Activa' : '❌ Inactiva'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

activateAllCategories();
