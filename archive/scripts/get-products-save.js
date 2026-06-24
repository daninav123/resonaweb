const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        description: true,
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    fs.writeFileSync('products-list.json', JSON.stringify(products, null, 2));
    console.log(`✅ ${products.length} productos guardados en products-list.json`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getProducts();
