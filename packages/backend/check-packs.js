// Script para ver productos por categoría
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCategories() {
  console.log('🔍 Categorías y sus productos...\n');
  
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        products: {
          take: 3,
          select: { name: true },
        },
        _count: {
          select: { products: true },
        },
      },
    });
    
    categories.forEach(cat => {
      console.log(`\n📂 ${cat.name.toUpperCase()} (${cat.slug})`);
      console.log(`   Total productos: ${cat._count.products}`);
      if (cat.products.length > 0) {
        console.log('   Ejemplos:');
        cat.products.forEach(p => console.log(`     - ${p.name}`));
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();
