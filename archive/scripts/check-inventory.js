/**
 * Script para verificar inventario completo del sistema
 */

const axios = require('axios');

const API_URL = 'http://localhost:3001/api/v1';

async function checkInventory() {
  console.log('📊 ANÁLISIS COMPLETO DEL INVENTARIO\n');
  console.log('='.repeat(80));

  try {
    // 1. PRODUCTOS
    console.log('\n🔷 1. PRODUCTOS (Individuales)');
    console.log('-'.repeat(80));
    const productsRes = await axios.get(`${API_URL}/products`);
    const products = productsRes.data.data || [];
    
    console.log(`Total productos: ${products.length}`);
    
    // Filtrar por categoría
    const productsByCategory = {};
    products.forEach(p => {
      const catName = p.category?.name || 'Sin categoría';
      if (!productsByCategory[catName]) {
        productsByCategory[catName] = 0;
      }
      productsByCategory[catName]++;
    });
    
    console.log('\nProductos por categoría:');
    Object.entries(productsByCategory).forEach(([cat, count]) => {
      console.log(`  - ${cat}: ${count}`);
    });

    // 2. PACKS
    console.log('\n\n📦 2. PACKS (Agrupaciones de productos)');
    console.log('-'.repeat(80));
    const packsRes = await axios.get(`${API_URL}/products/packs`);
    const packs = packsRes.data.packs || packsRes.data || [];
    
    console.log(`Total packs: ${packs.length}`);
    
    // Analizar packs por categoryRef
    const packsByCategory = {};
    const montajesPacks = [];
    const normalPacks = [];
    
    packs.forEach(pack => {
      const categoryRef = pack.categoryRef || pack.category || 'Sin categoría';
      const catName = typeof categoryRef === 'string' ? categoryRef : categoryRef.name || 'Sin categoría';
      
      if (!packsByCategory[catName]) {
        packsByCategory[catName] = 0;
      }
      packsByCategory[catName]++;
      
      // Clasificar como montaje o normal
      if (catName.toLowerCase().includes('montaje') || catName.toLowerCase() === 'montaje') {
        montajesPacks.push({
          id: pack.id,
          name: pack.name,
          slug: pack.slug,
          categoryRef: catName,
          isActive: pack.isActive
        });
      } else {
        normalPacks.push({
          id: pack.id,
          name: pack.name,
          slug: pack.slug,
          categoryRef: catName,
          isActive: pack.isActive
        });
      }
    });
    
    console.log('\nPacks por categoría:');
    Object.entries(packsByCategory).forEach(([cat, count]) => {
      const isMontaje = cat.toLowerCase().includes('montaje') || cat.toLowerCase() === 'montaje';
      const emoji = isMontaje ? '🔧' : '📦';
      console.log(`  ${emoji} ${cat}: ${count}`);
    });

    // 3. MONTAJES (Packs con categoryRef = Montaje)
    console.log('\n\n🔧 3. MONTAJES (Packs con categoryRef = Montaje)');
    console.log('-'.repeat(80));
    console.log(`Total montajes: ${montajesPacks.length}`);
    
    if (montajesPacks.length > 0) {
      console.log('\nLista de montajes:');
      montajesPacks.forEach((m, i) => {
        console.log(`  ${i + 1}. ${m.name}`);
        console.log(`     - Slug: ${m.slug}`);
        console.log(`     - CategoryRef: ${m.categoryRef}`);
        console.log(`     - Activo: ${m.isActive ? '✅' : '❌'}`);
      });
    }

    // 4. PACKS NORMALES (NO montajes)
    console.log('\n\n📦 4. PACKS NORMALES (NO montajes)');
    console.log('-'.repeat(80));
    console.log(`Total packs normales: ${normalPacks.length}`);
    
    if (normalPacks.length > 0) {
      console.log('\nPrimeros 10 packs normales:');
      normalPacks.slice(0, 10).forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.name}`);
        console.log(`     - Slug: ${p.slug}`);
        console.log(`     - CategoryRef: ${p.categoryRef}`);
        console.log(`     - Activo: ${p.isActive ? '✅' : '❌'}`);
      });
      
      if (normalPacks.length > 10) {
        console.log(`  ... y ${normalPacks.length - 10} más`);
      }
    }

    // 5. RESUMEN FINAL
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 RESUMEN FINAL');
    console.log('='.repeat(80));
    console.log(`\n🔷 Productos individuales: ${products.length}`);
    console.log(`📦 Packs normales (deben verse en /productos): ${normalPacks.length}`);
    console.log(`🔧 Montajes (NO deben verse en /productos): ${montajesPacks.length}`);
    console.log(`📊 Total general: ${products.length + packs.length}`);

    // 6. VERIFICACIÓN DE FILTRO
    console.log('\n\n🔍 VERIFICACIÓN DE FILTRO');
    console.log('-'.repeat(80));
    console.log('\n✅ LO QUE DEBE APARECER en /productos:');
    console.log(`   - ${products.length} productos individuales`);
    console.log(`   - ${normalPacks.length} packs normales`);
    console.log(`   📊 TOTAL: ${products.length + normalPacks.length} items`);
    
    console.log('\n❌ LO QUE NO DEBE APARECER en /productos:');
    console.log(`   - ${montajesPacks.length} montajes`);
    
    // Mostrar todos los montajes para verificar
    if (montajesPacks.length > 0) {
      console.log('\n🔧 MONTAJES COMPLETOS (para verificar filtro):');
      montajesPacks.forEach((m, i) => {
        console.log(`\n${i + 1}. "${m.name}"`);
        console.log(`   categoryRef: "${m.categoryRef}"`);
        console.log(`   slug: "${m.slug}"`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

checkInventory();
