const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n🔧 CREANDO CATEGORÍA "MONTAJE"\n');
  
  // Verificar si ya existe
  const existing = await prisma.category.findFirst({
    where: {
      OR: [
        { name: { equals: 'Montaje', mode: 'insensitive' } },
        { slug: 'montaje' }
      ]
    }
  });
  
  if (existing) {
    console.log('⚠️  La categoría ya existe:', existing.name);
    return;
  }
  
  // Crear categoría
  const category = await prisma.category.create({
    data: {
      name: 'Montaje',
      slug: 'montaje',
      description: 'Servicios de montaje, instalación y transporte',
      isActive: true,
      featured: false,
      isHidden: true, // Oculta del catálogo público
      sortOrder: 100
    }
  });
  
  console.log('✅ Categoría creada exitosamente:');
  console.log(`   ID: ${category.id}`);
  console.log(`   Nombre: ${category.name}`);
  console.log(`   Slug: ${category.slug}`);
  console.log(`   Oculta: ${category.isHidden ? 'Sí' : 'No'}`);
  console.log('\n✅ Proceso completado\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
