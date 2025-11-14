/**
 * Test rápido para verificar que las APIs devuelven datos correctamente
 */

const http = require('http');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function testAPI(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ 
            status: res.statusCode, 
            data: json,
            hasData: json && json.data && Array.isArray(json.data),
            dataLength: json && json.data ? json.data.length : 0
          });
        } catch (e) {
          resolve({ status: res.statusCode, error: 'Invalid JSON' });
        }
      });
    }).on('error', (err) => {
      resolve({ error: err.message });
    });
  });
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.cyan}🔍 VERIFICANDO APIS DEL FRONTEND${colors.reset}`);
  console.log('='.repeat(60) + '\n');

  const tests = [
    { name: 'Productos', url: 'http://localhost:3001/api/v1/products' },
    { name: 'Productos Destacados', url: 'http://localhost:3001/api/v1/products/featured' },
    { name: 'Categorías', url: 'http://localhost:3001/api/v1/products/categories' },
    { name: 'Búsqueda', url: 'http://localhost:3001/api/v1/products/search?q=&page=1&limit=12' },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await testAPI(test.url);
    
    if (result.error) {
      console.log(`${colors.red}❌ ${test.name}: Error - ${result.error}${colors.reset}`);
      failed++;
    } else if (!result.hasData) {
      console.log(`${colors.red}❌ ${test.name}: No tiene estructura {data: [...]}${colors.reset}`);
      console.log(`   Respuesta: ${JSON.stringify(result.data).substring(0, 100)}`);
      failed++;
    } else {
      console.log(`${colors.green}✅ ${test.name}: OK (${result.dataLength} items)${colors.reset}`);
      passed++;
    }
  }

  console.log('\n' + '-'.repeat(60));
  console.log(`${colors.cyan}RESUMEN:${colors.reset}`);
  console.log(`  ${colors.green}✅ Pasados: ${passed}${colors.reset}`);
  console.log(`  ${colors.red}❌ Fallidos: ${failed}${colors.reset}`);

  if (failed === 0) {
    console.log(`\n${colors.green}🎉 ¡TODAS LAS APIS FUNCIONAN CORRECTAMENTE!${colors.reset}`);
    console.log(`${colors.green}El frontend debería poder mostrar los productos ahora.${colors.reset}\n`);
  } else {
    console.log(`\n${colors.red}⚠️  HAY PROBLEMAS CON LAS APIS${colors.reset}`);
    console.log(`${colors.yellow}Los endpoints no devuelven la estructura esperada {data: [...]}.${colors.reset}\n`);
  }
}

runTests().catch(console.error);
