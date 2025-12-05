/**
 * Script para verificar DIRECTAMENTE en la base de datos (sin filtros del API)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('📊 ANÁLISIS DIRECTO DE LA BASE DE DATOS\n');
  console.log('='.repeat(80));

  try {
    // 1. PRODUCTOS
    console.log('\n🔷 1. PRODUCTOS');
    console.log('-'.repeat(80));
    const products = await prisma.product.findMany({
      include: {
        category: true
      }
    });
    
    console.log(`Total productos en BD: ${products.length}`);
    
    // Agrupar por categoría
    const productsByCategory = {};
    products.forEach(p => {
      const catName = p.category?.name || 'Sin categoría';
      if (!productsByCategory[catName]) {
        productsByCategory[catName] = 0;
      }
      productsByCategory[catName]++;
    });
    
    console.log('\nProductos por categoría:');
    Object.entries(productsByCategory).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
      console.log(`  - ${cat}: ${count}`);
    });

    // 2. PACKS
    console.log('\n\n📦 2. PACKS (Modelo Pack)');
    console.log('-'.repeat(80));
    const packs = await prisma.pack.findMany({
      include: {
        categoryRef: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    console.log(`Total packs en BD: ${packs.length}`);
    
    // Analizar packs por categoryRef
    const packsByCategory = {};
    const packsByEnum = {};
    const montajes = [];
    const packsNormales = [];
    
    packs.forEach(pack => {
      // Por categoryRef (FK a tabla Category)
      const categoryRefName = pack.categoryRef?.name || 'Sin categoryRef';
      if (!packsByCategory[categoryRefName]) {
        packsByCategory[categoryRefName] = 0;
      }
      packsByCategory[categoryRefName]++;
      
      // Por category (enum)
      const categoryEnum = pack.category || 'Sin category enum';
      if (!packsByEnum[categoryEnum]) {
        packsByEnum[categoryEnum] = 0;
      }
      packsByEnum[categoryEnum]++;
      
      // Clasificar
      const isMonjate = categoryRefName.toLowerCase() === 'montaje' || 
                       categoryEnum === 'MONTAJE';
      
      if (isMonjate) {
        montajes.push({
          id: pack.id,
          name: pack.name,
          slug: pack.slug,
          categoryRef: categoryRefName,
          categoryEnum: pack.category,
          isActive: pack.isActive,
          itemsCount: pack.items?.length || 0
        });
      } else {
        packsNormales.push({
          id: pack.id,
          name: pack.name,
          slug: pack.slug,
          categoryRef: categoryRefName,
          categoryEnum: pack.category,
          isActive: pack.isActive,
          itemsCount: pack.items?.length || 0
        });
      }
    });
    
    console.log('\nPacks por categoryRef (FK):');
    Object.entries(packsByCategory).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
      const isMontaje = cat.toLowerCase() === 'montaje';
      const emoji = isMontaje ? '🔧' : '📦';
      console.log(`  ${emoji} ${cat}: ${count}`);
    });
    
    console.log('\nPacks por category (enum):');
    Object.entries(packsByEnum).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
      const isMontaje = cat === 'MONTAJE';
      const emoji = isMontaje ? '🔧' : '📦';
      console.log(`  ${emoji} ${cat}: ${count}`);
    });

    // 3. MONTAJES DETALLADOS
    console.log('\n\n🔧 3. MONTAJES (categoryRef = "Montaje" OR category = "MONTAJE")');
    console.log('-'.repeat(80));
    console.log(`Total montajes: ${montajes.length}`);
    
    if (montajes.length > 0) {
      console.log('\nMontajes encontrados:');
      montajes.slice(0, 15).forEach((m, i) => {
        console.log(`\n${i + 1}. "${m.name}"`);
        console.log(`   - Slug: ${m.slug}`);
        console.log(`   - CategoryRef: ${m.categoryRef}`);
        console.log(`   - Category Enum: ${m.categoryEnum}`);
        console.log(`   - Activo: ${m.isActive ? '✅' : '❌'}`);
        console.log(`   - Items: ${m.itemsCount}`);
      });
      
      if (montajes.length > 15) {
        console.log(`\n... y ${montajes.length - 15} más montajes`);
      }
    }

    // 4. PACKS NORMALES DETALLADOS
    console.log('\n\n📦 4. PACKS NORMALES (NO montajes)');
    console.log('-'.repeat(80));
    console.log(`Total packs normales: ${packsNormales.length}`);
    
    if (packsNormales.length > 0) {
      console.log('\nPacks normales (primeros 10):');
      packsNormales.slice(0, 10).forEach((p, i) => {
        console.log(`\n${i + 1}. "${p.name}"`);
        console.log(`   - Slug: ${p.slug}`);
        console.log(`   - CategoryRef: ${p.categoryRef}`);
        console.log(`   - Category Enum: ${p.categoryEnum}`);
        console.log(`   - Activo: ${p.isActive ? '✅' : '❌'}`);
        console.log(`   - Items: ${p.itemsCount}`);
      });
    }

    // 5. CATEGORÍAS
    console.log('\n\n📂 5. CATEGORÍAS (Tabla Category)');
    console.log('-'.repeat(80));
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true,
            packs: true
          }
        }
      }
    });
    
    console.log(`Total categorías: ${categories.length}`);
    console.log('\nCategorías con productos y packs:');
    categories.forEach(cat => {
      const isHidden = cat.isHidden ? '🔒' : '👁️';
      console.log(`  ${isHidden} ${cat.name}`);
      console.log(`     - Productos: ${cat._count.products}`);
      console.log(`     - Packs: ${cat._count.packs}`);
      console.log(`     - Oculta: ${cat.isHidden ? 'Sí' : 'No'}`);
    });

    // 6. RESUMEN FINAL
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 RESUMEN FINAL (Base de Datos Real)');
    console.log('='.repeat(80));
    console.log(`\n🔷 Productos: ${products.length}`);
    console.log(`📦 Packs normales: ${packsNormales.length}`);
    console.log(`🔧 Montajes: ${montajes.length}`);
    console.log(`📂 Categorías: ${categories.length}`);
    console.log(`📊 Total items: ${products.length + packs.length}`);
    
    // 7. COMPARACIÓN CON LO QUE VE EL ADMIN
    console.log('\n\n🔍 COMPARACIÓN CON ADMIN PANEL');
    console.log('-'.repeat(80));
    console.log('\nAdmin ve:');
    console.log('  - 72 productos');
    console.log('  - 7 packs');
    console.log('  - 23 montajes');
    
    console.log('\nBase de datos tiene:');
    console.log(`  - ${products.length} productos`);
    console.log(`  - ${packsNormales.length} packs normales`);
    console.log(`  - ${montajes.length} montajes`);
    
    console.log('\n❓ DIFERENCIAS:');
    console.log(`  - Productos: ${72 - products.length > 0 ? '+' : ''}${72 - products.length}`);
    console.log(`  - Packs: ${7 - packsNormales.length > 0 ? '+' : ''}${7 - packsNormales.length}`);
    console.log(`  - Montajes: ${23 - montajes.length > 0 ? '+' : ''}${23 - montajes.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
