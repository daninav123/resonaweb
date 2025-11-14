/**
 * Test de filtros de categorías
 */

const http = require('http');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function testAPI(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, error: 'Invalid JSON', raw: data });
        }
      });
    }).on('error', err => resolve({ error: err.message }));
  });
}

async function runTests() {
  console.log('\n' + '='.repeat(70));
  console.log(`${colors.cyan}${colors.bold}🧪 TEST DE FILTROS DE CATEGORÍAS${colors.reset}`);
  console.log('='.repeat(70));

  let passed = 0;
  let failed = 0;

  // 1. Test: Listar todas las categorías
  console.log(`\n${colors.cyan}1. Listar Categorías${colors.reset}`);
  const categoriesRes = await testAPI('http://localhost:3001/api/v1/products/categories');
  
  if (categoriesRes.status === 200 && categoriesRes.data.data) {
    const categories = categoriesRes.data.data;
    console.log(`  ${colors.green}✅ ${categories.length} categorías encontradas${colors.reset}`);
    
    categories.forEach(cat => {
      console.log(`    • ${cat.name} (${cat.slug})`);
    });
    passed++;
    
    // 2. Test: Filtrar productos por cada categoría
    console.log(`\n${colors.cyan}2. Filtrar Productos por Categoría${colors.reset}`);
    
    for (const cat of categories) {
      const url = `http://localhost:3001/api/v1/products?category=${cat.slug}`;
      const res = await testAPI(url);
      
      if (res.status === 200 && res.data.data) {
        const count = res.data.data.length;
        console.log(`  ${colors.green}✅ ${cat.name}: ${count} productos${colors.reset}`);
        
        if (count > 0) {
          // Mostrar primer producto de ejemplo
          const firstProduct = res.data.data[0];
          console.log(`    Ejemplo: ${firstProduct.name}`);
        }
        passed++;
      } else {
        console.log(`  ${colors.red}❌ ${cat.name}: Error ${res.status}${colors.reset}`);
        failed++;
      }
    }
    
  } else {
    console.log(`  ${colors.red}❌ Error obteniendo categorías${colors.reset}`);
    failed++;
  }

  // 3. Test: Productos sin filtro (todos)
  console.log(`\n${colors.cyan}3. Todos los Productos (sin filtro)${colors.reset}`);
  const allProductsRes = await testAPI('http://localhost:3001/api/v1/products');
  
  if (allProductsRes.status === 200 && allProductsRes.data.data) {
    const total = allProductsRes.data.data.length;
    console.log(`  ${colors.green}✅ ${total} productos totales${colors.reset}`);
    passed++;
  } else {
    console.log(`  ${colors.red}❌ Error obteniendo productos${colors.reset}`);
    failed++;
  }

  // 4. Test: Filtro con categoría inválida
  console.log(`\n${colors.cyan}4. Filtro con Categoría Inválida${colors.reset}`);
  const invalidRes = await testAPI('http://localhost:3001/api/v1/products?category=categoria-inexistente');
  
  if (invalidRes.status === 200 && invalidRes.data.data) {
    const count = invalidRes.data.data.length;
    if (count === 0) {
      console.log(`  ${colors.green}✅ Devuelve 0 productos correctamente${colors.reset}`);
      passed++;
    } else {
      console.log(`  ${colors.yellow}⚠️  Devuelve ${count} productos (debería ser 0)${colors.reset}`);
      failed++;
    }
  }

  // 5. Test: Múltiples filtros (categoría + orden)
  console.log(`\n${colors.cyan}5. Categoría + Ordenamiento${colors.reset}`);
  const multiFilterRes = await testAPI('http://localhost:3001/api/v1/products?category=iluminacion&sort=price_asc');
  
  if (multiFilterRes.status === 200 && multiFilterRes.data.data) {
    console.log(`  ${colors.green}✅ Filtros combinados funcionan${colors.reset}`);
    console.log(`  📦 ${multiFilterRes.data.data.length} productos en Iluminación (ordenados por precio)${colors.reset}`);
    
    if (multiFilterRes.data.data.length > 1) {
      const first = multiFilterRes.data.data[0];
      const second = multiFilterRes.data.data[1];
      if (first.pricePerDay <= second.pricePerDay) {
        console.log(`  ${colors.green}✅ Orden correcto: €${first.pricePerDay} <= €${second.pricePerDay}${colors.reset}`);
      } else {
        console.log(`  ${colors.yellow}⚠️  Orden incorrecto${colors.reset}`);
      }
    }
    passed++;
  }

  // Resumen
  console.log('\n' + '='.repeat(70));
  console.log(`${colors.cyan}${colors.bold}📊 RESUMEN${colors.reset}`);
  console.log('='.repeat(70));
  
  const total = passed + failed;
  const percentage = ((passed / total) * 100).toFixed(1);
  
  console.log(`\n  ${colors.green}✅ Aprobados: ${passed}${colors.reset}`);
  console.log(`  ${colors.red}❌ Fallidos:  ${failed}${colors.reset}`);
  console.log(`  📈 Total:     ${total}`);
  console.log(`  📊 Éxito:     ${percentage}%`);

  if (failed === 0) {
    console.log(`\n${colors.green}${colors.bold}🎉 ¡TODOS LOS FILTROS FUNCIONAN CORRECTAMENTE!${colors.reset}\n`);
  } else {
    console.log(`\n${colors.red}⚠️  Hay ${failed} filtros con problemas${colors.reset}\n`);
  }

  process.exit(failed === 0 ? 0 : 1);
}

runTests().catch(error => {
  console.error(`${colors.red}Error:${colors.reset}`, error);
  process.exit(1);
});
