/**
 * Test simple de login para debug
 */

const http = require('http');

function testLogin() {
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
    console.log(`Status: ${res.statusCode}`);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('\nResponse Body:');
      try {
        const json = JSON.parse(data);
        console.log(JSON.stringify(json, null, 2));
        
        if (res.statusCode === 200 && json.token) {
          console.log('\n✅ LOGIN EXITOSO!');
          console.log('Token:', json.token.substring(0, 20) + '...');
        } else {
          console.log('\n❌ LOGIN FALLÓ');
        }
      } catch (e) {
        console.log(data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Error: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

console.log('🔐 Probando login...\n');
testLogin();
