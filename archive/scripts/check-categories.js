const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCategories() {
  try {
    console.log('🔍 Buscando categorías...\n');
    
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        isHidden: true,
        _count: {
          select: { products: true }
        }
      }
    });

    console.log(`Total de categorías: ${categories.length}\n`);
    
    categories.forEach(cat => {
      console.log(`📁 ${cat.name}`);
      console.log(`   - Slug: ${cat.slug}`);
      console.log(`   - Oculta: ${cat.isHidden ? '✅ SÍ' : '❌ NO'}`);
      console.log(`   - Activa: ${cat.isActive ? '✅ SÍ' : '❌ NO'}`);
      console.log(`   - Productos: ${cat._count.products}`);
      console.log('');
    });

    // Buscar específicamente "Personal"
    const personal = categories.find(c => c.name.toLowerCase() === 'personal');
    if (personal) {
      console.log('✅ ENCONTRADA CATEGORÍA "Personal"');
      console.log(JSON.stringify(personal, null, 2));
    } else {
      console.log('❌ NO SE ENCONTRÓ CATEGORÍA "Personal"');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();
