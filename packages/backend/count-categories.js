const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.category.count();
  const categories = await prisma.category.findMany({
    select: {
      name: true,
      slug: true,
      isActive: true
    },
    orderBy: { name: 'asc' }
  });
  
  console.log('\n===========================================');
  console.log(`   TOTAL CATEGORIAS: ${count}`);
  console.log('===========================================\n');
  
  categories.forEach((cat, i) => {
    console.log(`${i+1}. ${cat.name} (${cat.slug}) - ${cat.isActive ? '✅ ACTIVA' : '❌ INACTIVA'}`);
  });
  
  console.log('\n===========================================\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
