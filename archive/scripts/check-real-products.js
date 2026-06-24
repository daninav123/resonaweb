const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://resona_user:resona_password@localhost:5432/resona_db?schema=public'
    }
  }
});

async function checkProducts() {
  console.log('🔍 Verificando productos en resona_db...\n');

  try {
    const totalProducts = await prisma.product.count();
    console.log(`📊 Total de productos: ${totalProducts}\n`);

    if (totalProducts > 0) {
      const products = await prisma.product.findMany({
        take: 20,
        select: {
          id: true,
          sku: true,
          name: true,
          pricePerDay: true,
          stock: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      console.log('📦 Productos encontrados:\n');
      products.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name} (${p.sku})`);
        console.log(`   Creado: ${p.createdAt.toLocaleString()}`);
        console.log(`   Precio: €${p.pricePerDay}/día`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();
