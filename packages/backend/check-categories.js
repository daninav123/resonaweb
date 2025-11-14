const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n🔍 VERIFICANDO CATEGORÍAS EN LA BASE DE DATOS\n');
  
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });
  
  console.log(`📊 Total de categorías: ${categories.length}\n`);
  
  categories.forEach((cat, index) => {
    console.log(`${index + 1}. ${cat.name} (${cat.slug}) - ${cat.isActive ? '✅' : '❌'}`);
  });
  
  console.log('\n✅ Verificación completa\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
