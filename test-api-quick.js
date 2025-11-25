const http = require('http');

console.log('🧪 Testing Backend API...\n');

// Test 1: Health Check
http.get('http://localhost:3001/api/v1/products?limit=1', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      const json = JSON.parse(data);
      console.log('✅ Backend API: OK');
      console.log('   Status:', res.statusCode);
      console.log('   Products found:', json.data?.length || json.products?.length || 'unknown');
      console.log('   Total:', json.pagination?.total || json.total || 'unknown');
    } else {
      console.log('❌ Backend API: ERROR');
      console.log('   Status:', res.statusCode);
    }
    
    // Test 2: Frontend
    console.log('\n🧪 Testing Frontend...\n');
    http.get('http://localhost:3000/', (res2) => {
      if (res2.statusCode === 200) {
        console.log('✅ Frontend: OK');
        console.log('   Status:', res2.statusCode);
        console.log('   Content-Type:', res2.headers['content-type']);
      } else {
        console.log('❌ Frontend: ERROR');
        console.log('   Status:', res2.statusCode);
      }
      
      console.log('\n' + '='.repeat(50));
      console.log('📊 RESUMEN:');
      console.log('='.repeat(50));
      console.log('Backend:  http://localhost:3001 ✅');
      console.log('Frontend: http://localhost:3000 ✅');
      console.log('='.repeat(50));
      
    }).on('error', (err) => {
      console.log('❌ Frontend: NO RESPONDE');
      console.log('   Error:', err.message);
    });
    
  });
  
}).on('error', (err) => {
  console.log('❌ Backend API: NO RESPONDE');
  console.log('   Error:', err.message);
});
