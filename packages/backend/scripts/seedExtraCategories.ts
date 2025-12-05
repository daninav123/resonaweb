import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Sembrando categorías de extras...');
    
    const categories = await prisma.extraCategory.createMany({
      data: [
        {
          id: 'cat-disco',
          name: 'Disco',
          slug: 'disco',
          icon: '🎵',
          color: 'purple',
          order: 1,
          description: 'Equipamiento para ambientar la fiesta'
        },
        {
          id: 'cat-fx',
          name: 'FX',
          slug: 'fx',
          icon: '✨',
          color: 'blue',
          order: 2,
          description: 'Efectos especiales visuales'
        },
        {
          id: 'cat-decoracion',
          name: 'Decoración',
          slug: 'decoracion',
          icon: '🎨',
          color: 'pink',
          order: 3,
          description: 'Elementos decorativos'
        },
        {
          id: 'cat-iluminacion',
          name: 'Iluminación',
          slug: 'iluminacion',
          icon: '💡',
          color: 'yellow',
          order: 4,
          description: 'Iluminación adicional'
        },
        {
          id: 'cat-estructuras',
          name: 'Estructuras',
          slug: 'estructuras',
          icon: '🏗️',
          color: 'gray',
          order: 5,
          description: 'Escenarios y estructuras'
        },
        {
          id: 'cat-audiovisual',
          name: 'Audiovisual',
          slug: 'audiovisual',
          icon: '📺',
          color: 'indigo',
          order: 6,
          description: 'Pantallas y proyección'
        },
        {
          id: 'cat-otros',
          name: 'Otros',
          slug: 'otros',
          icon: '📦',
          color: 'slate',
          order: 99,
          description: 'Otros extras'
        }
      ],
      skipDuplicates: true
    });
    
    console.log(`✅ ${categories.count} categorías creadas correctamente`);
    
    // Listar las categorías creadas
    const allCategories = await prisma.extraCategory.findMany({
      orderBy: { order: 'asc' }
    });
    
    console.log('\n📋 Categorías disponibles:');
    allCategories.forEach(cat => {
      console.log(`   ${cat.icon} ${cat.name} (${cat.slug})`);
    });
    
  } catch (error) {
    console.error('❌ Error al sembrar categorías:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();
