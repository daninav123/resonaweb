const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPackFilter() {
  console.log('🔍 TEST: Filtro de Packs Activos\n');
  
  // Query EXACTA del código
  const packs = await prisma.pack.findMany({
    where: { 
      isActive: true,
      categoryRef: {
        name: {
          not: 'Montaje'
        }
      }
    },
    include: {
      categoryRef: true,
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              mainImageUrl: true,
              realStock: true,
              status: true,
            },
          },
        },
      },
    },
    orderBy: {
      featured: 'desc',
    },
  });
  
  console.log(`✅ Packs devueltos por query: ${packs.length}\n`);
  
  packs.forEach((pack, i) => {
    console.log(`${i+1}. ${pack.name}`);
    console.log(`   CategoryRef: ${pack.categoryRef?.name || 'NULL'}`);
  });
  
  await prisma.$disconnect();
}

testPackFilter();
