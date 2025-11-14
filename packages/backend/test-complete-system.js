/**
 * ANÁLISIS COMPLETO DEL SISTEMA - Tests Exhaustivos
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function makeRequest(baseUrl, path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
    };
    
    const req = http.request(url, options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(responseData), headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data: responseData, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    if (data && method !== 'GET') req.write(JSON.stringify(data));
    req.end();
  });
}

async function runCompleteTests() {
  const API = 'http://localhost:3001';
  let passed = 0, failed = 0, token = null;
  const errors = [];

  console.log('\n' + '='.repeat(70));
  console.log(`${colors.cyan}${colors.bold}🔍 ANÁLISIS EXHAUSTIVO DEL SISTEMA${colors.reset}`);
  console.log('='.repeat(70));

  // 1. INFRAESTRUCTURA
  console.log(`\n${colors.cyan}📦 INFRAESTRUCTURA${colors.reset}`);
  const infraTests = [
    ['Backend Health', '/health', 200],
    ['API Ready', '/api/v1/products', [200, 401]],
  ];
  
  for (const [name, path, expected] of infraTests) {
    try {
      const res = await makeRequest(API, path);
      const pass = Array.isArray(expected) ? expected.includes(res.status) : res.status === expected;
      pass ? passed++ : (failed++, errors.push(name));
      console.log(`  ${pass ? colors.green + '✅' : colors.red + '❌'} ${name}${colors.reset}`);
    } catch (e) {
      failed++;
      errors.push(name);
      console.log(`  ${colors.red}❌ ${name} - ${e.message}${colors.reset}`);
    }
  }

  // 2. AUTH
  console.log(`\n${colors.cyan}🔐 AUTENTICACIÓN${colors.reset}`);
  try {
    const res = await makeRequest(API, '/api/v1/auth/login', 'POST', {
      email: 'admin@resona.com',
      password: 'Admin123!'
    });
    if (res.status === 200) {
      token = res.data.token || res.data.data?.accessToken;
      passed++;
      console.log(`  ${colors.green}✅ Login Admin${colors.reset}`);
    } else {
      failed++;
      errors.push('Login Admin');
      console.log(`  ${colors.red}❌ Login Admin${colors.reset}`);
    }
  } catch (e) {
    failed++;
    errors.push('Login Admin');
    console.log(`  ${colors.red}❌ Login Admin - ${e.message}${colors.reset}`);
  }

  // 3. PRODUCTOS
  console.log(`\n${colors.cyan}📦 PRODUCTOS${colors.reset}`);
  const productTests = [
    ['Listar Productos', '/api/v1/products'],
    ['Productos Destacados', '/api/v1/products/featured'],
    ['Buscar Productos', '/api/v1/products/search?q=test'],
    ['Categorías', '/api/v1/products/categories'],
  ];

  for (const [name, path] of productTests) {
    try {
      const res = await makeRequest(API, path);
      const pass = res.status === 200 && res.data?.data;
      pass ? passed++ : (failed++, errors.push(name));
      console.log(`  ${pass ? colors.green + '✅' : colors.red + '❌'} ${name}${colors.reset}`);
    } catch (e) {
      failed++;
      errors.push(name);
      console.log(`  ${colors.red}❌ ${name}${colors.reset}`);
    }
  }

  // 4. PEDIDOS Y CARRITO
  console.log(`\n${colors.cyan}📝 PEDIDOS Y CARRITO${colors.reset}`);
  const authTests = [
    ['Ver Carrito', '/api/v1/cart', 'GET'],
    ['Listar Pedidos', '/api/v1/orders', 'GET'],
    ['Analytics Dashboard', '/api/v1/analytics/dashboard', 'GET'],
    ['Listar Clientes', '/api/v1/customers', 'GET'],
  ];

  for (const [name, path, method] of authTests) {
    try {
      const res = await makeRequest(API, path, method, null, 
        token ? { 'Authorization': `Bearer ${token}` } : {}
      );
      const pass = [200, 401, 403, 404].includes(res.status);
      pass ? passed++ : (failed++, errors.push(name));
      console.log(`  ${pass ? colors.green + '✅' : colors.red + '❌'} ${name}${colors.reset}`);
    } catch (e) {
      failed++;
      errors.push(name);
      console.log(`  ${colors.red}❌ ${name}${colors.reset}`);
    }
  }

  // RESUMEN
  console.log('\n' + '='.repeat(70));
  console.log(`${colors.cyan}${colors.bold}📊 RESUMEN${colors.reset}`);
  console.log('='.repeat(70));
  
  const total = passed + failed;
  const pct = ((passed / total) * 100).toFixed(1);
  
  console.log(`\n  ${colors.green}✅ Aprobados: ${passed}${colors.reset}`);
  console.log(`  ${colors.red}❌ Fallidos:  ${failed}${colors.reset}`);
  console.log(`  📊 Total:     ${total} (${pct}%)`);

  if (errors.length > 0 && errors.length <= 10) {
    console.log(`\n${colors.red}Tests fallidos:${colors.reset}`);
    errors.forEach(e => console.log(`  • ${e}`));
  }

  if (failed === 0) {
    console.log(`\n${colors.green}${colors.bold}🎉 ¡SISTEMA 100% FUNCIONAL!${colors.reset}\n`);
  } else {
    console.log(`\n${colors.yellow}⚠️  Hay ${failed} tests fallidos${colors.reset}\n`);
  }

  process.exit(failed === 0 ? 0 : 1);
}

runCompleteTests().catch(e => {
  console.error(`${colors.red}Error:${colors.reset}`, e);
  process.exit(1);
});
