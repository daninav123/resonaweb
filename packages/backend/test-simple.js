const http = require('http');

function testAPI(url, label) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`\n${label}:`);
          console.log(`  Status: ${res.statusCode}`);
          console.log(`  Productos: ${json.data ? json.data.length : 'N/A'}`);
          if (json.data && json.data.length > 0) {
            json.data.forEach(p => console.log(`    - ${p.name}`));
          }
          resolve();
        } catch (e) {
          console.log(`  Error: ${e.message}`);
          resolve();
        }
      });
    }).on('error', err => {
      console.log(`  Error: ${err.message}`);
      resolve();
    });
  });
}

async function run() {
  console.log('=== VERIFICANDO FILTROS DE CATEGORÍAS ===');
  
  await testAPI('http://localhost:3001/api/v1/products?category=iluminacion', '1. Iluminación');
  await testAPI('http://localhost:3001/api/v1/products?category=fotografia-video', '2. Fotografía y Video');
  await testAPI('http://localhost:3001/api/v1/products?category=sonido', '3. Sonido');
  await testAPI('http://localhost:3001/api/v1/products', '4. Todos los productos');
  
  console.log('\n=== FIN ===\n');
}

run();
