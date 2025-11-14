/**
 * Verificar categorías asignadas a productos
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProductCategories() {
  console.log('\n=== VERIFICANDO PRODUCTOS Y CATEGORÍAS ===\n');

  // 1. Obtener todas las categorías
  const categories = await prisma.category.findMany();
  console.log('CATEGORÍAS:');
  categories.forEach(cat => {
    console.log(`  ID: ${cat.id} | Nombre: ${cat.name} | Slug: ${cat.slug}`);
  });

  console.log('\n=== PRODUCTOS Y SUS CATEGORÍAS ===\n');

  // 2. Obtener todos los productos con sus categorías
  const products = await prisma.product.findMany({
    include: {
      category: true
    }
  });

  products.forEach(prod => {
    console.log(`${prod.name}`);
    console.log(`  ID: ${prod.id}`);
    console.log(`  CategoryID: ${prod.categoryId}`);
    if (prod.category) {
      console.log(`  Categoría: ${prod.category.name} (${prod.category.slug})`);
    } else {
      console.log(`  ❌ SIN CATEGORÍA ASIGNADA`);
    }
    console.log('');
  });

  // 3. Contar productos por categoría
  console.log('=== RESUMEN POR CATEGORÍA ===\n');
  for (const cat of categories) {
    const count = await prisma.product.count({
      where: { categoryId: cat.id }
    });
    console.log(`${cat.name}: ${count} productos`);
  }

  await prisma.$disconnect();
}

checkProductCategories().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
