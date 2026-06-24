const http = require('http');

console.log('🧪 Testing Login Endpoint Directamente...\n');

function testLogin(email, password) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ email, password });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Origin': 'http://localhost:3000'
      }
    };

    console.log(`📤 Request:`, {
      method: 'POST',
      url: `http://localhost:3001${options.path}`,
      body: { email, password: '***' },
      headers: options.headers
    });

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`\n📥 Response:`);
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Headers:`, res.headers);
        
        try {
          const json = JSON.parse(data);
          console.log(`   Body:`, JSON.stringify(json, null, 2));
          
          if (res.statusCode === 200) {
            console.log('\n✅ LOGIN EXITOSO');
            console.log('   User:', json.data?.user?.email);
            console.log('   Token:', json.data?.accessToken ? 'Presente' : 'Ausente');
          } else {
            console.log('\n❌ LOGIN FALLIDO');
            console.log('   Error:', json.message || 'Unknown');
            console.log('   Code:', json.code || 'Unknown');
          }
        } catch (e) {
          console.log('   Raw data:', data);
        }
        
        resolve(res.statusCode === 200);
      });
    });

    req.on('error', (err) => {
      console.log('\n❌ REQUEST ERROR:', err.message);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('=' .repeat(60));
  console.log('TEST 1: Admin Login');
  console.log('='.repeat(60));
  await testLogin('admin@resona.com', 'Admin123!');
  
  console.log('\n\n' + '='.repeat(60));
  console.log('TEST 2: Cliente Login');
  console.log('='.repeat(60));
  await testLogin('cliente@test.com', 'User123!');
  
  console.log('\n\n' + '='.repeat(60));
  console.log('TEST 3: Password Incorrecta');
  console.log('='.repeat(60));
  await testLogin('admin@resona.com', 'WrongPass123!');
}

runTests();
