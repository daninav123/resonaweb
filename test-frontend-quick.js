const http = require('http');

console.log('🧪 Testing Frontend...\n');

http.get('http://localhost:3000/', (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Frontend: ACTIVO');
    console.log('   Status:', res.statusCode);
    console.log('   Content-Type:', res.headers['content-type']);
  } else {
    console.log('❌ Frontend: ERROR');
    console.log('   Status:', res.statusCode);
  }
}).on('error', (err) => {
  console.log('❌ Frontend: NO RESPONDE');
  console.log('   Error:', err.message);
});
