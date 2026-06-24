const http = require('http');

console.log('🧪 Testing Backend APIs...\n');

// Test 1: Get Products
function testProducts() {
  return new Promise((resolve) => {
    http.get('http://localhost:3001/api/v1/products?limit=5', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log('✅ GET /api/v1/products');
          console.log('   Status:', res.statusCode);
          console.log('   Products:', json.data?.length || 0);
          console.log('   Total:', json.pagination?.total || json.total || 0);
          if (json.data?.[0]) {
            console.log('   First product:', json.data[0].name);
          }
          resolve(true);
        } catch (e) {
          console.log('❌ Error parsing products:', e.message);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log('❌ GET /api/v1/products - ERROR');
      console.log('   ', err.message);
      resolve(false);
    });
  });
}

// Test 2: Login
function testLogin() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      email: 'admin@resona.com',
      password: 'Admin123!'
    });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log('\n✅ POST /api/v1/auth/login');
          console.log('   Status:', res.statusCode);
          if (res.statusCode === 200) {
            console.log('   Success:', json.success);
            console.log('   User:', json.data?.user?.email);
            console.log('   Token:', json.data?.accessToken ? 'Presente' : 'Ausente');
          } else {
            console.log('   Error:', json.message || 'Unknown error');
          }
          resolve(res.statusCode === 200);
        } catch (e) {
          console.log('❌ Error parsing login:', e.message);
          console.log('   Raw data:', data.substring(0, 200));
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log('\n❌ POST /api/v1/auth/login - ERROR');
      console.log('   ', err.message);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// Test 3: Get Categories
function testCategories() {
  return new Promise((resolve) => {
    http.get('http://localhost:3001/api/v1/categories', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log('\n✅ GET /api/v1/categories');
          console.log('   Status:', res.statusCode);
          console.log('   Categories:', json.data?.length || json.categories?.length || 0);
          if (json.data?.[0]) {
            console.log('   First category:', json.data[0].name);
          }
          resolve(true);
        } catch (e) {
          console.log('❌ Error parsing categories:', e.message);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log('\n❌ GET /api/v1/categories - ERROR');
      console.log('   ', err.message);
      resolve(false);
    });
  });
}

// Run all tests
async function runTests() {
  await testProducts();
  await testLogin();
  await testCategories();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ TESTS COMPLETADOS');
  console.log('='.repeat(50));
  console.log('\n📝 CREDENCIALES:');
  console.log('   Admin: admin@resona.com / Admin123!');
  console.log('   Cliente: cliente@test.com / User123!');
  console.log('\n🌐 URLs:');
  console.log('   Frontend: http://localhost:3000');
  console.log('   Backend:  http://localhost:3001');
  console.log('='.repeat(50));
}

runTests();
