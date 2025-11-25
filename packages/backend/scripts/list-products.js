const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listProducts() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      mainImageUrl: true
    },
    take: 30,
    orderBy: { name: 'asc' }
  });
  
  console.log('\n📦 PRODUCTOS EN LA BASE DE DATOS:\n');
  products.forEach((p, i) => {
    const hasImage = p.mainImageUrl ? '✅' : '❌';
    console.log(`${i + 1}. ${hasImage} ${p.name} (SKU: ${p.sku || 'N/A'})`);
  });
  
  console.log(`\n📊 Total: ${products.length} productos`);
  console.log(`🖼️  Con imagen: ${products.filter(p => p.mainImageUrl).length}`);
  console.log(`📷 Sin imagen: ${products.filter(p => !p.mainImageUrl).length}`);
  
  await prisma.$disconnect();
}

listProducts();
