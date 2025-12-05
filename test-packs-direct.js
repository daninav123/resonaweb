/**
 * Test directo del endpoint /packs
 */

const http = require('http');

function testPacks() {
  console.log('🧪 Test directo de /api/v1/packs\n');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/packs',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
      // NO enviar Authorization header
    }
  };
  
  console.log('📤 Haciendo petición GET http://localhost:3001/api/v1/packs');
  console.log('   Sin header Authorization\n');
  
  const req = http.request(options, (res) => {
    console.log(`📥 Respuesta recibida:`);
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   Headers:`, res.headers);
    console.log('');
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📄 Body de la respuesta:');
      try {
        const json = JSON.parse(data);
        console.log(JSON.stringify(json, null, 2));
        
        if (res.statusCode === 200) {
          console.log('\n✅ SUCCESS: El endpoint funciona sin autenticación');
          process.exit(0);
        } else if (res.statusCode === 401) {
          console.log('\n❌ FAILED: El endpoint requiere autenticación');
          console.log('   Mensaje:', json.error?.message);
          process.exit(1);
        }
      } catch (e) {
        console.log(data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('💥 Error:', error.message);
    process.exit(1);
  });
  
  req.end();
}

testPacks();
