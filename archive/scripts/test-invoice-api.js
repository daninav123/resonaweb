const http = require('http');

const orderId = 'c6b3999a-1029-4004-ae65-4d50613d6a3f';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzNGIyNzc1OC0zMTcyLTRmODMtODRjYi1mZjEwODM3Njk2NmMiLCJlbWFpbCI6ImFkbWluQHJlc29uYS5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NjQyNTU5OTksImV4cCI6MTc2NDI4NDc5OX0.u0oigqdEUiwbMJ0IfBbvhqUiecDtEVtK4--IfO4xhIo';

const options = {
  hostname: 'localhost',
  port: 3001,
  path: `/api/v1/invoices/generate/${orderId}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
};

console.log('🔍 Probando endpoint de factura...');
console.log(`📍 ${options.method} http://${options.hostname}:${options.port}${options.path}`);
console.log('');

const req = http.request(options, (res) => {
  console.log(`📊 Status Code: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  console.log('');

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📄 Response:');
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
      
      if (res.statusCode === 201) {
        console.log('\n✅ ¡FACTURA GENERADA EXITOSAMENTE!');
      } else {
        console.log('\n❌ ERROR AL GENERAR FACTURA');
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error en la petición:', error.message);
});

// Esperar a que el servidor esté listo
setTimeout(() => {
  req.end();
}, 2000);
