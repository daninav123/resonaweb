/**
 * Test de Integración Frontend-Backend
 * Verifica que las respuestas del backend sean compatibles con el frontend
 */

const http = require('http');

const API_URL = 'http://localhost:3001';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('\n' + '='.repeat(70));
  console.log(`${colors.cyan}${colors.bold}🔗 TEST DE INTEGRACIÓN FRONTEND-BACKEND${colors.reset}`);
  console.log('='.repeat(70) + '\n');

  let passed = 0;
  let failed = 0;

  const tests = [
    {
      name: 'GET /api/v1/products - Devuelve { data: [...] }',
      url: `${API_URL}/api/v1/products`,
      validate: (res) => {
        if (res.status !== 200) return false;
        if (!res.data.data) {
          console.log(`    ${colors.red}⚠️  Falta propiedad 'data'${colors.reset}`);
          return false;
        }
        if (!Array.isArray(res.data.data)) {
          console.log(`    ${colors.red}⚠️  'data' no es un array${colors.reset}`);
          return false;
        }
        console.log(`    ${colors.green}✓ Estructura correcta: { data: [...] }${colors.reset}`);
        console.log(`    ${colors.green}✓ ${res.data.data.length} productos encontrados${colors.reset}`);
        return true;
      }
    },
    {
      name: 'GET /api/v1/products/featured - Devuelve { data: [...] }',
      url: `${API_URL}/api/v1/products/featured`,
      validate: (res) => {
        if (res.status !== 200) return false;
        if (!res.data.data) {
          console.log(`    ${colors.red}⚠️  Falta propiedad 'data'${colors.reset}`);
          return false;
        }
        if (!Array.isArray(res.data.data)) {
          console.log(`    ${colors.red}⚠️  'data' no es un array${colors.reset}`);
          return false;
        }
        console.log(`    ${colors.green}✓ Estructura correcta: { data: [...] }${colors.reset}`);
        console.log(`    ${colors.green}✓ ${res.data.data.length} productos destacados${colors.reset}`);
        return true;
      }
    },
    {
      name: 'GET /api/v1/products/categories - Devuelve { data: [...] }',
      url: `${API_URL}/api/v1/products/categories`,
      validate: (res) => {
        if (res.status !== 200) return false;
        if (!res.data.data) {
          console.log(`    ${colors.red}⚠️  Falta propiedad 'data'${colors.reset}`);
          return false;
        }
        if (!Array.isArray(res.data.data)) {
          console.log(`    ${colors.red}⚠️  'data' no es un array${colors.reset}`);
          return false;
        }
        console.log(`    ${colors.green}✓ Estructura correcta: { data: [...] }${colors.reset}`);
        console.log(`    ${colors.green}✓ ${res.data.data.length} categorías encontradas${colors.reset}`);
        return true;
      }
    },
    {
      name: 'GET /api/v1/products/search - Devuelve { data: [...] }',
      url: `${API_URL}/api/v1/products/search?sort=newest&page=1&limit=12`,
      validate: (res) => {
        if (res.status !== 200) return false;
        if (!res.data.data) {
          console.log(`    ${colors.red}⚠️  Falta propiedad 'data'${colors.reset}`);
          return false;
        }
        if (!Array.isArray(res.data.data)) {
          console.log(`    ${colors.red}⚠️  'data' no es un array${colors.reset}`);
          return false;
        }
        console.log(`    ${colors.green}✓ Estructura correcta: { data: [...] }${colors.reset}`);
        return true;
      }
    },
  ];

  for (const test of tests) {
    try {
      console.log(`\n${colors.cyan}▶ ${test.name}${colors.reset}`);
      const result = await makeRequest(test.url);
      
      if (test.validate(result)) {
        console.log(`  ${colors.green}✅ PASS${colors.reset}`);
        passed++;
      } else {
        console.log(`  ${colors.red}❌ FAIL${colors.reset}`);
        failed++;
      }
    } catch (error) {
      console.log(`  ${colors.red}❌ ERROR - ${error.message}${colors.reset}`);
      failed++;
    }
  }

  // Resumen
  console.log('\n' + '='.repeat(70));
  console.log(`${colors.cyan}${colors.bold}📊 RESUMEN${colors.reset}`);
  console.log('='.repeat(70));
  console.log(`  ${colors.green}✅ Aprobados: ${passed}${colors.reset}`);
  console.log(`  ${colors.red}❌ Fallidos:  ${failed}${colors.reset}`);
  console.log(`  📈 Total:     ${passed + failed}`);
  console.log(`  📊 Éxito:     ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);

  if (failed === 0) {
    console.log(`${colors.green}${colors.bold}🎉 ¡INTEGRACIÓN FRONTEND-BACKEND CORRECTA!${colors.reset}`);
    console.log(`${colors.green}El frontend puede consumir correctamente los datos del backend.${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}${colors.bold}⚠️  HAY PROBLEMAS DE INTEGRACIÓN${colors.reset}\n`);
    process.exit(1);
  }
}

console.log('\n⏳ Verificando integración...\n');
runTests().catch(error => {
  console.error(`${colors.red}Error:${colors.reset}`, error);
  process.exit(1);
});
