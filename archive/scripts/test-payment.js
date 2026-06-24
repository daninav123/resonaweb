const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzNGIyNzc1OC0zMTcyLTRmODMtODRjYi1mZjEwODM3Njk2NmMiLCJlbWFpbCI6ImFkbWluQHJlc29uYS5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NjQyNTU5OTksImV4cCI6MTc2NDI4NDc5OX0.u0oigqdEUiwbMJ0IfBbvhqUiecDtEVtK4--IfO4xhIo';

// Datos de ejemplo del carrito
const orderData = {
  userId: '34b27758-3172-4f83-84cb-ff108376966c',
  items: [
    {
      productId: 'product-1',
      productName: 'Mesa Imperial 3m x 1m',
      quantity: 1,
      pricePerUnit: 55,
      totalPrice: 55,
      startDate: '2025-11-28',
      endDate: '2025-11-29'
    }
  ],
  deliveryOption: 'delivery',
  shippingCost: 10,
  address: 'Carrer de València, 37, 46950 Xirivella, Valencia, España'
};

const postData = JSON.stringify({ orderData });

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/v1/payments/create-intent',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Authorization': `Bearer ${token}`
  }
};

console.log('🔍 Probando endpoint de payment...');
console.log(`📍 ${options.method} http://${options.hostname}:${options.port}${options.path}`);
console.log('📦 orderData:', JSON.stringify(orderData, null, 2));
console.log('');

const req = http.request(options, (res) => {
  console.log(`📊 Status Code: ${res.statusCode}`);
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
      
      if (res.statusCode === 200) {
        console.log('\n✅ ¡PAYMENT INTENT CREADO!');
      } else {
        console.log('\n❌ ERROR AL CREAR PAYMENT INTENT');
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error en la petición:', error.message);
});

setTimeout(() => {
  req.write(postData);
  req.end();
}, 1000);
