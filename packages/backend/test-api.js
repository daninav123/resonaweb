/**
 * Test API E2E Simple
 * Script rápido para verificar que todos los endpoints funcionan
 */

const http = require('http');

const API_URL = 'http://localhost:3001';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function runTests() {
  console.log('\n🧪 EJECUTANDO TESTS E2E - API ReSona\n');
  console.log('='.repeat(50));
  
  const tests = [
    {
      name: 'Health Check',
      path: '/health',
      expect: (res) => res.status === 200 && (res.data.status === 'healthy' || typeof res.data === 'string'),
    },
    {
      name: 'Get Products',
      path: '/api/v1/products',
      expect: (res) => res.status === 200 && Array.isArray(res.data.data),
    },
    {
      name: 'Search Products',
      path: '/api/v1/products/search?sort=newest&page=1&limit=12',
      expect: (res) => res.status === 200,
    },
    {
      name: 'Get Featured Products',
      path: '/api/v1/products/featured',
      expect: (res) => res.status === 200 && Array.isArray(res.data.data),
    },
    {
      name: 'Get Categories',
      path: '/api/v1/products/categories',
      expect: (res) => res.status === 200 && Array.isArray(res.data.data),
    },
    {
      name: 'Get Category Tree',
      path: '/api/v1/products/categories/tree',
      expect: (res) => res.status === 200,
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await makeRequest(test.path);
      const success = test.expect(result);
      
      if (success) {
        console.log(`${colors.green}✅ PASS${colors.reset} - ${test.name}`);
        passed++;
      } else {
        console.log(`${colors.red}❌ FAIL${colors.reset} - ${test.name}`);
        console.log(`   Status: ${result.status}`);
        console.log(`   Data:`, JSON.stringify(result.data).substring(0, 100));
        failed++;
      }
    } catch (error) {
      console.log(`${colors.red}❌ ERROR${colors.reset} - ${test.name}`);
      console.log(`   ${error.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 RESULTADOS:`);
  console.log(`   ${colors.green}✅ Aprobados: ${passed}${colors.reset}`);
  console.log(`   ${colors.red}❌ Fallidos: ${failed}${colors.reset}`);
  console.log(`   📈 Total: ${passed + failed}`);
  
  if (failed === 0) {
    console.log(`\n${colors.green}🎉 ¡TODOS LOS TESTS PASARON!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}⚠️  ALGUNOS TESTS FALLARON${colors.reset}\n`);
    process.exit(1);
  }
}

// Ejecutar tests
runTests().catch(error => {
  console.error(`${colors.red}Error ejecutando tests:${colors.reset}`, error);
  process.exit(1);
});
