// Test Cancel Route
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/v1/orders/test-order-id/cancel',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('🧪 Testing POST /api/v1/orders/test-order-id/cancel');
console.log('Expected: 401 (Unauthorized) if route exists');
console.log('Expected: 404 (Not Found) if route does NOT exist\n');

const req = http.request(options, (res) => {
  console.log(`✅ Status Code: ${res.statusCode}`);
  
  if (res.statusCode === 404) {
    console.log('❌ ERROR: Route NOT FOUND (404)');
    console.log('   The route is NOT registered in Express');
  } else if (res.statusCode === 401) {
    console.log('✅ SUCCESS: Route EXISTS but requires authentication');
    console.log('   The route IS registered correctly');
  }
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\nResponse:', data);
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

req.write('{}');
req.end();
