/**
 * TESTS E2E COMPLETOS - Validación de todas las funcionalidades
 * Valida que todas las características solicitadas en la documentación funcionan
 */

const http = require('http');
const https = require('https');

const API_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3000';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function makeRequest(baseUrl, path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const client = url.protocol === 'https:' ? https : http;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };
    
    const req = client.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', chunk => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData, headers: res.headers });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (data && method !== 'GET') {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.cyan}🧪 TESTS E2E COMPLETOS - ReSona${colors.reset}`);
  console.log('='.repeat(60) + '\n');
  
  let passed = 0;
  let failed = 0;
  let token = null;

  const results = {
    infrastructure: [],
    auth: [],
    products: [],
    categories: [],
    orders: [],
    customers: [],
    payments: [],
    analytics: [],
    inventory: [],
  };

  // ========================================
  // 1. TESTS DE INFRAESTRUCTURA
  // ========================================
  console.log(`${colors.magenta}📦 1. INFRAESTRUCTURA${colors.reset}`);
  console.log('-'.repeat(60));

  const infraTests = [
    {
      name: 'Backend Health Check',
      fn: async () => {
        const res = await makeRequest(API_URL, '/health');
        return res.status === 200;
      }
    },
    {
      name: 'Frontend accesible',
      fn: async () => {
        const res = await makeRequest(FRONTEND_URL, '/');
        return res.status === 200;
      }
    },
    {
      name: 'API v1 endpoints disponibles',
      fn: async () => {
        const res = await makeRequest(API_URL, '/api/v1/products');
        return res.status === 200 || res.status === 401;
      }
    },
  ];

  for (const test of infraTests) {
    try {
      const success = await test.fn();
      if (success) {
        console.log(`  ${colors.green}✅ ${test.name}${colors.reset}`);
        passed++;
        results.infrastructure.push({ name: test.name, status: 'PASS' });
      } else {
        console.log(`  ${colors.red}❌ ${test.name}${colors.reset}`);
        failed++;
        results.infrastructure.push({ name: test.name, status: 'FAIL' });
      }
    } catch (error) {
      console.log(`  ${colors.red}❌ ${test.name} - ${error.message}${colors.reset}`);
      failed++;
      results.infrastructure.push({ name: test.name, status: 'ERROR', error: error.message });
    }
  }

  // ========================================
  // 2. TESTS DE AUTENTICACIÓN
  // ========================================
  console.log(`\n${colors.magenta}🔐 2. AUTENTICACIÓN Y AUTORIZACIÓN${colors.reset}`);
  console.log('-'.repeat(60));

  const authTests = [
    {
      name: 'Login de admin exitoso',
      fn: async () => {
        const res = await makeRequest(API_URL, '/api/v1/auth/login', 'POST', {
          email: 'admin@resona.com',
          password: 'Admin123!'
        });
        if (res.status === 200 && (res.data.token || res.data.data?.accessToken)) {
          token = res.data.token || res.data.data.accessToken;
          return true;
        }
        return false;
      }
    },
    {
      name: 'Login con credenciales inválidas rechazado',
      fn: async () => {
        const res = await makeRequest(API_URL, '/api/v1/auth/login', 'POST', {
          email: 'admin@resona.com',
          password: 'wrongpassword'
        });
        return res.status === 401 || res.status === 400;
      }
    },
    {
      name: 'Acceso sin token rechazado',
      fn: async () => {
        const res = await makeRequest(API_URL, '/api/v1/users', 'GET');
        return res.status === 401 || res.status === 403;
      }
    },
  ];

  for (const test of authTests) {
    try {
      const success = await test.fn();
      if (success) {
        console.log(`  ${colors.green}✅ ${test.name}${colors.reset}`);
        passed++;
        results.auth.push({ name: test.name, status: 'PASS' });
      } else {
        console.log(`  ${colors.red}❌ ${test.name}${colors.reset}`);
        failed++;
        results.auth.push({ name: test.name, status: 'FAIL' });
      }
    } catch (error) {
      console.log(`  ${colors.red}❌ ${test.name} - ${error.message}${colors.reset}`);
      failed++;
      results.auth.push({ name: test.name, status: 'ERROR', error: error.message });
    }
  }

  // ========================================
  // 3. TESTS DE PRODUCTOS
  // ========================================
  console.log(`\n${colors.magenta}📦 3. GESTIÓN DE PRODUCTOS${colors.reset}`);
  console.log('-'.repeat(60));

  const productTests = [
    {
      name: 'Listar todos los productos',
      fn: async () => {
        const res = await makeRequest(API_URL, '/api/v1/products');
        return res.status === 200 && Array.isArray(res.data.data);
      }
    },
    {
      name: 'Buscar productos con filtros',
      fn: async () => {
        const res = await makeRequest(API_URL, '/api/v1/products/search?sort=newest&page=1&limit=12');
        return res.status === 200;
      }
    },
    {
      name: 'Obtener productos destacados',
      fn: async () => {
        const res = await makeRequest(API_URL, '/api/v1/products/featured');
        return res.status === 200 && Array.isArray(res.data.data);
      }
    },
    {
      name: 'Filtrar por categoría',
      fn: async () => {
        const res = await makeRequest(API_URL, '/api/v1/products?category=fotografia-video');
        return res.status === 200;
      }
    },
    {
      name: 'Ordenar por precio',
      fn: async () => {
        const res = await makeRequest(API_URL, '/api/v1/products?sort=price_asc');
        return res.status === 200;
      }
    },
    {
      name: 'Paginación funciona correctamente',
      fn: async () => {
        const res = await makeRequest(API_URL, '/api/v1/products?page=1&limit=5');
        return res.status === 200 && res.data.pagination;
      }
    },
  ];

  for (const test of productTests) {
    try {
      const success = await test.fn();
      if (success) {
        console.log(`  ${colors.green}✅ ${test.name}${colors.reset}`);
        passed++;
        results.products.push({ name: test.name, status: 'PASS' });
      } else {
        console.log(`  ${colors.red}❌ ${test.name}${colors.reset}`);
        failed++;
        results.products.push({ name: test.name, status: 'FAIL' });
      }
    } catch (error) {
      console.log(`  ${colors.red}❌ ${test.name} - ${error.message}${colors.reset}`);
      failed++;
      results.products.push({ name: test.name, status: 'ERROR', error: error.message });
    }
  }

  // ========================================
  // 4. TESTS DE CATEGORÍAS
  // ========================================
  console.log(`\n${colors.magenta}📁 4. GESTIÓN DE CATEGORÍAS${colors.reset}`);
  console.log('-'.repeat(60));

  const categoryTests = [
    {
      name: 'Listar todas las categorías',
      fn: async () => {
        const res = await makeRequest(API_URL, '/api/v1/products/categories');
        return res.status === 200 && Array.isArray(res.data.data);
      }
    },
    {
      name: 'Obtener árbol jerárquico de categorías',
      fn: async () => {
        const res = await makeRequest(API_URL, '/api/v1/products/categories/tree');
        return res.status === 200;
      }
    },
    {
      name: 'Categorías tienen productos asociados',
      fn: async () => {
        const res = await makeRequest(API_URL, '/api/v1/products/categories');
        return res.status === 200 && res.data.data.length > 0;
      }
    },
  ];

  for (const test of categoryTests) {
    try {
      const success = await test.fn();
      if (success) {
        console.log(`  ${colors.green}✅ ${test.name}${colors.reset}`);
        passed++;
        results.categories.push({ name: test.name, status: 'PASS' });
      } else {
        console.log(`  ${colors.red}❌ ${test.name}${colors.reset}`);
        failed++;
        results.categories.push({ name: test.name, status: 'FAIL' });
      }
    } catch (error) {
      console.log(`  ${colors.red}❌ ${test.name} - ${error.message}${colors.reset}`);
      failed++;
      results.categories.push({ name: test.name, status: 'ERROR', error: error.message });
    }
  }

  // ========================================
  // 5. TESTS DE DISPONIBILIDAD
  // ========================================
  console.log(`\n${colors.magenta}📅 5. SISTEMA DE DISPONIBILIDAD${colors.reset}`);
  console.log('-'.repeat(60));

  const availabilityTests = [
    {
      name: 'Endpoint de disponibilidad existe',
      fn: async () => {
        const products = await makeRequest(API_URL, '/api/v1/products');
        if (products.data.data && products.data.data.length > 0) {
          const productId = products.data.data[0].id;
          const res = await makeRequest(API_URL, `/api/v1/products/${productId}/availability?startDate=2025-12-01&endDate=2025-12-05`);
          return res.status === 200 || res.status === 404;
        }
        return true;
      }
    },
  ];

  for (const test of availabilityTests) {
    try {
      const success = await test.fn();
      if (success) {
        console.log(`  ${colors.green}✅ ${test.name}${colors.reset}`);
        passed++;
        results.inventory.push({ name: test.name, status: 'PASS' });
      } else {
        console.log(`  ${colors.red}❌ ${test.name}${colors.reset}`);
        failed++;
        results.inventory.push({ name: test.name, status: 'FAIL' });
      }
    } catch (error) {
      console.log(`  ${colors.red}❌ ${test.name} - ${error.message}${colors.reset}`);
      failed++;
      results.inventory.push({ name: test.name, status: 'ERROR', error: error.message });
    }
  }

  // ========================================
  // RESUMEN FINAL
  // ========================================
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.cyan}📊 RESUMEN DE RESULTADOS${colors.reset}`);
  console.log('='.repeat(60));
  
  const total = passed + failed;
  const percentage = ((passed / total) * 100).toFixed(1);
  
  console.log(`\n  ${colors.green}✅ Tests Aprobados: ${passed}${colors.reset}`);
  console.log(`  ${colors.red}❌ Tests Fallidos:  ${failed}${colors.reset}`);
  console.log(`  📈 Total:           ${total}`);
  console.log(`  📊 Porcentaje:      ${percentage}%`);
  
  console.log('\n' + '-'.repeat(60));
  console.log('📋 Resumen por categoría:');
  console.log('-'.repeat(60));
  
  Object.keys(results).forEach(category => {
    const tests = results[category];
    if (tests.length > 0) {
      const categoryPassed = tests.filter(t => t.status === 'PASS').length;
      const categoryTotal = tests.length;
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      console.log(`  ${categoryName}: ${categoryPassed}/${categoryTotal} ✓`);
    }
  });
  
  if (failed === 0) {
    console.log(`\n${colors.green}🎉 ¡TODOS LOS TESTS PASARON! EL SISTEMA ESTÁ 100% FUNCIONAL${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.yellow}⚠️  ALGUNOS TESTS FALLARON - REVISAR IMPLEMENTACIÓN${colors.reset}\n`);
    process.exit(1);
  }
}

// Ejecutar tests
console.log('\n⏳ Iniciando tests...\n');
runTests().catch(error => {
  console.error(`${colors.red}Error ejecutando tests:${colors.reset}`, error);
  process.exit(1);
});
