/**
 * Verificar que los filtros funcionan correctamente
 */

const axios = require('axios');

const API_URL = 'http://localhost:3001/api/v1';

async function verifyFilters() {
  console.log('🔍 VERIFICACIÓN DE FILTROS\n');
  console.log('='.repeat(80));

  try {
    // 1. PRODUCTOS DEL API (con filtros aplicados)
    console.log('\n📦 1. Productos desde API (/products)');
    console.log('-'.repeat(80));
    const productsRes = await axios.get(`${API_URL}/products`);
    const products = productsRes.data.data || [];
    
    console.log(`Total productos devueltos por API: ${products.length}`);
    
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
    
    // Verificar que NO hay productos de categorías que deben estar ocultas
    const forbiddenCategories = ['PACKS', 'Personal', 'Montaje', 'Eventos Personalizados'];
    const foundForbidden = products.filter(p => 
      forbiddenCategories.includes(p.category?.name)
    );
    
    if (foundForbidden.length > 0) {
      console.log(`\n❌ ERROR: Se encontraron ${foundForbidden.length} productos de categorías prohibidas:`);
      foundForbidden.forEach(p => {
        console.log(`   - ${p.name} (${p.category?.name})`);
      });
    } else {
      console.log(`\n✅ Correcto: NO hay productos de categorías prohibidas`);
    }

    // 2. PACKS DEL API
    console.log('\n\n📦 2. Packs desde API (/products/packs)');
    console.log('-'.repeat(80));
    const packsRes = await axios.get(`${API_URL}/products/packs`);
    const packs = packsRes.data.packs || packsRes.data || [];
    
    console.log(`Total packs devueltos por API: ${packs.length}`);
    
    // Clasificar packs
    const montajes = [];
    const packsNormales = [];
    
    packs.forEach(pack => {
      const categoryRefName = pack.categoryRef?.name || '';
      
      if (categoryRefName === 'Montaje') {
        montajes.push(pack);
      } else {
        packsNormales.push(pack);
      }
    });
    
    console.log(`\n✅ Packs normales: ${packsNormales.length}`);
    console.log(`🔧 Montajes: ${montajes.length}`);
    
    if (montajes.length > 0) {
      console.log(`\n❌ ERROR: Se encontraron ${montajes.length} montajes en /products/packs:`);
      montajes.slice(0, 5).forEach(m => {
        console.log(`   - ${m.name} (categoryRef: ${m.categoryRef?.name})`);
      });
    } else {
      console.log(`\n✅ Correcto: NO hay montajes en /products/packs`);
    }

    // 3. RESUMEN FINAL
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 RESUMEN DE VERIFICACIÓN');
    console.log('='.repeat(80));
    
    console.log('\n🎯 LO QUE DEBE APARECER en /productos:');
    console.log(`   - ${products.length} productos (esperado: 72)`);
    console.log(`   - ${packsNormales.length} packs (esperado: 7)`);
    console.log(`   📊 Total: ${products.length + packsNormales.length} items (esperado: 79)`);
    
    console.log('\n❌ LO QUE NO DEBE APARECER:');
    console.log(`   - Montajes en packs: ${montajes.length} (esperado: 0) ${montajes.length === 0 ? '✅' : '❌'}`);
    console.log(`   - Productos prohibidos: ${foundForbidden.length} (esperado: 0) ${foundForbidden.length === 0 ? '✅' : '❌'}`);
    
    // Verificación final
    const allCorrect = montajes.length === 0 && 
                      foundForbidden.length === 0 && 
                      products.length === 72 &&
                      packsNormales.length === 7;
    
    console.log('\n' + '='.repeat(80));
    if (allCorrect) {
      console.log('✅ ¡TODOS LOS FILTROS FUNCIONAN CORRECTAMENTE!');
    } else {
      console.log('❌ HAY PROBLEMAS CON LOS FILTROS');
      
      if (products.length !== 72) {
        console.log(`   - Productos: ${products.length} (esperado 72) - Diferencia: ${products.length - 72}`);
      }
      if (packsNormales.length !== 7) {
        console.log(`   - Packs: ${packsNormales.length} (esperado 7) - Diferencia: ${packsNormales.length - 7}`);
      }
      if (montajes.length !== 0) {
        console.log(`   - Montajes en API: ${montajes.length} (esperado 0)`);
      }
      if (foundForbidden.length !== 0) {
        console.log(`   - Productos prohibidos: ${foundForbidden.length} (esperado 0)`);
      }
    }
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

verifyFilters();
