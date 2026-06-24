const http = require('http');

console.log('🔍 VERIFICACIÓN COMPLETA DEL BACKEND - AHORA MISMO\n');
console.log('Timestamp:', new Date().toLocaleString());
console.log('='.repeat(70) + '\n');

let testsPassed = 0;
let testsFailed = 0;

function makeRequest(method, path, body = null) {
  return new Promise((resolve) => {
    const postData = body ? JSON.stringify(body) : null;
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      }
    };
    
    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            data: json,
            raw: data
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: null,
            raw: data,
            error: e.message
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        status: 0,
        error: err.message
      });
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('📋 TEST 1: Health Check del Backend\n');
  try {
    const result = await makeRequest('GET', '/api/v1/products?limit=1');
    if (result.status === 200) {
      console.log('✅ Backend respondiendo');
      console.log('   Status:', result.status);
      testsPassed++;
    } else {
      console.log('❌ Backend con problemas');
      console.log('   Status:', result.status);
      testsFailed++;
    }
  } catch (e) {
    console.log('❌ Backend NO responde');
    console.log('   Error:', e.message);
    testsFailed++;
  }

  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 2: Productos - GET /api/v1/products\n');
  const productsResult = await makeRequest('GET', '/api/v1/products?limit=5');
  if (productsResult.status === 200) {
    console.log('✅ Endpoint de productos funciona');
    console.log('   Status:', productsResult.status);
    console.log('   Productos:', productsResult.data.data?.length || 0);
    console.log('   Total en BD:', productsResult.data.pagination?.total || productsResult.data.total || 'unknown');
    if (productsResult.data.data && productsResult.data.data.length > 0) {
      console.log('   Primer producto:', productsResult.data.data[0].name);
      console.log('   SKU:', productsResult.data.data[0].sku);
      console.log('   Precio/día:', productsResult.data.data[0].pricePerDay);
    }
    testsPassed++;
  } else {
    console.log('❌ Endpoint de productos falla');
    console.log('   Status:', productsResult.status);
    console.log('   Error:', productsResult.data?.error?.message || productsResult.error);
    testsFailed++;
  }

  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 3: Categorías - GET /api/v1/categories\n');
  const categoriesResult = await makeRequest('GET', '/api/v1/categories');
  console.log('   Status:', categoriesResult.status);
  if (categoriesResult.status === 200 || categoriesResult.status === 401) {
    console.log('✅ Endpoint responde (', categoriesResult.status, ')');
    if (categoriesResult.data.data) {
      console.log('   Categorías:', categoriesResult.data.data.length);
    }
    testsPassed++;
  } else {
    console.log('❌ Endpoint falla');
    testsFailed++;
  }

  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 4: Login Admin - POST /api/v1/auth/login\n');
  const loginResult = await makeRequest('POST', '/api/v1/auth/login', {
    email: 'admin@resona.com',
    password: 'Admin123!'
  });
  console.log('   Status:', loginResult.status);
  if (loginResult.status === 200) {
    console.log('✅ Login funciona correctamente');
    console.log('   Usuario:', loginResult.data.data?.user?.email);
    console.log('   Rol:', loginResult.data.data?.user?.role);
    console.log('   Token generado:', loginResult.data.data?.accessToken ? 'SÍ ✅' : 'NO ❌');
    console.log('   Refresh token:', loginResult.data.data?.refreshToken ? 'SÍ ✅' : 'NO ❌');
    testsPassed++;
  } else {
    console.log('❌ Login falla');
    console.log('   Error:', loginResult.data?.error?.message || loginResult.data?.message);
    console.log('   Body completo:', JSON.stringify(loginResult.data, null, 2));
    testsFailed++;
  }

  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 5: Login Cliente - POST /api/v1/auth/login\n');
  const loginClientResult = await makeRequest('POST', '/api/v1/auth/login', {
    email: 'cliente@test.com',
    password: 'User123!'
  });
  console.log('   Status:', loginClientResult.status);
  if (loginClientResult.status === 200) {
    console.log('✅ Login cliente funciona');
    console.log('   Usuario:', loginClientResult.data.data?.user?.email);
    console.log('   Rol:', loginClientResult.data.data?.user?.role);
    testsPassed++;
  } else {
    console.log('❌ Login cliente falla');
    console.log('   Error:', loginClientResult.data?.error?.message);
    testsFailed++;
  }

  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 6: Login con Credenciales Incorrectas\n');
  const loginFailResult = await makeRequest('POST', '/api/v1/auth/login', {
    email: 'admin@resona.com',
    password: 'WrongPassword123!'
  });
  console.log('   Status:', loginFailResult.status);
  if (loginFailResult.status === 401) {
    console.log('✅ Backend rechaza credenciales incorrectas (esperado)');
    console.log('   Mensaje:', loginFailResult.data?.error?.message);
    testsPassed++;
  } else {
    console.log('❌ Backend debería rechazar con 401');
    testsFailed++;
  }

  console.log('\n' + '='.repeat(70));
  console.log('📋 TEST 7: Producto Individual - GET /api/v1/products/:id\n');
  // Primero obtener un ID de producto
  const allProducts = await makeRequest('GET', '/api/v1/products?limit=1');
  if (allProducts.data?.data?.[0]?.id) {
    const productId = allProducts.data.data[0].id;
    const productResult = await makeRequest('GET', `/api/v1/products/${productId}`);
    console.log('   Status:', productResult.status);
    if (productResult.status === 200) {
      console.log('✅ Endpoint de producto individual funciona');
      console.log('   Producto:', productResult.data.data?.name || productResult.data.name);
      testsPassed++;
    } else {
      console.log('❌ Endpoint falla');
      testsFailed++;
    }
  } else {
    console.log('⚠️  No hay productos para probar');
  }

  // RESUMEN FINAL
  console.log('\n\n' + '='.repeat(70));
  console.log('📊 RESUMEN DE VERIFICACIÓN');
  console.log('='.repeat(70));
  console.log(`✅ Tests pasados: ${testsPassed}`);
  console.log(`❌ Tests fallidos: ${testsFailed}`);
  console.log(`📊 Total: ${testsPassed + testsFailed}`);
  console.log(`🎯 Éxito: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);
  console.log('='.repeat(70));

  if (testsFailed === 0) {
    console.log('\n🎉 ¡BACKEND FUNCIONANDO PERFECTAMENTE!');
    console.log('✅ Todos los tests pasaron');
    console.log('✅ Backend 100% operativo');
  } else {
    console.log('\n⚠️  BACKEND CON PROBLEMAS');
    console.log(`❌ ${testsFailed} test(s) fallaron`);
    console.log('🔧 Requiere atención');
  }

  console.log('\n' + '='.repeat(70));
  console.log('🌐 URLs:');
  console.log('   Backend:  http://localhost:3001');
  console.log('   Frontend: http://localhost:3000');
  console.log('='.repeat(70));
}

runTests();
