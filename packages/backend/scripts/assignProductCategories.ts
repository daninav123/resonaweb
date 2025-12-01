import { PrismaClient, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function assignProductCategories() {
  console.log('🔄 Asignando categorías a productos...');

  // Obtener todas las categorías
  const categories = await prisma.category.findMany();
  console.log(`✅ Categorías encontradas: ${categories.length}`);

  // Mapeo de patrones SKU a categorías
  const categoryMapping: { [key: string]: string } = {
    'LUZ': 'iluminacion',
    'TRUS': 'estructuras',
    'MOB': 'elementos-escenario',
    'TXT': 'elementos-decorativos',
    'CAB': 'sonido', // Cables van a sonido
    'MIC': 'microfonia',
    'EQUI': 'sonido',
    'ALTAV': 'sonido',
    'MESA': 'sonido',
  };

  // Obtener todos los productos
  const products = await prisma.product.findMany({
    where: {
      status: ProductStatus.AVAILABLE,
    },
    select: {
      id: true,
      name: true,
      sku: true,
      categoryId: true,
    }
  });

  console.log(`📦 Productos encontrados: ${products.length}`);
  console.log(`🔍 Productos sin categoría: ${products.filter(p => !p.categoryId).length}`);

  let updated = 0;
  let errors = 0;

  for (const product of products) {
    if (product.categoryId) {
      console.log(`⏭️  Saltando ${product.sku} - ya tiene categoría`);
      continue;
    }

    // Buscar categoría basándose en el SKU
    let foundCategory = null;
    
    for (const [pattern, categorySlug] of Object.entries(categoryMapping)) {
      if (product.sku?.includes(pattern)) {
        foundCategory = categories.find(c => c.slug === categorySlug);
        break;
      }
    }

    // Si no encontramos por SKU, buscar por nombre del producto
    if (!foundCategory) {
      const nameLower = product.name.toLowerCase();
      
      if (nameLower.includes('luz') || nameLower.includes('led') || nameLower.includes('foco')) {
        foundCategory = categories.find(c => c.slug === 'iluminacion');
      } else if (nameLower.includes('truss') || nameLower.includes('estructura')) {
        foundCategory = categories.find(c => c.slug === 'estructuras');
      } else if (nameLower.includes('cable') || nameLower.includes('xlr') || nameLower.includes('jack')) {
        foundCategory = categories.find(c => c.slug === 'sonido');
      } else if (nameLower.includes('micro') || nameLower.includes('micrófono')) {
        foundCategory = categories.find(c => c.slug === 'microfonia');
      } else if (nameLower.includes('mesa') || nameLower.includes('altavoz') || nameLower.includes('equi')) {
        foundCategory = categories.find(c => c.slug === 'sonido');
      } else if (nameLower.includes('textil') || nameLower.includes('tela')) {
        foundCategory = categories.find(c => c.slug === 'elementos-decorativos');
      } else if (nameLower.includes('escenario') || nameLower.includes('tarima')) {
        foundCategory = categories.find(c => c.slug === 'elementos-escenario');
      } else if (nameLower.includes('fx') || nameLower.includes('efect')) {
        foundCategory = categories.find(c => c.slug === 'fx');
      }
    }

    if (foundCategory) {
      try {
        await prisma.product.update({
          where: { id: product.id },
          data: { categoryId: foundCategory.id }
        });
        console.log(`✅ ${product.sku} → ${foundCategory.name}`);
        updated++;
      } catch (error) {
        console.error(`❌ Error actualizando ${product.sku}:`, error);
        errors++;
      }
    } else {
      console.log(`⚠️  No se encontró categoría para: ${product.sku} - ${product.name}`);
      errors++;
    }
  }

  console.log('\n📊 Resumen:');
  console.log(`✅ Productos actualizados: ${updated}`);
  console.log(`❌ Errores: ${errors}`);
  console.log(`📦 Total procesados: ${products.length}`);

  await prisma.$disconnect();
}

assignProductCategories()
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
