const { PrismaClient } = require('@prisma/client');

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
    
    console.log(JSON.stringify(products, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getProducts();
