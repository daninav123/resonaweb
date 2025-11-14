const http = require('http');

// Test productos
http.get('http://localhost:3001/api/v1/products', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('\n=== PRODUCTOS ===');
      console.log('Status:', res.statusCode);
      console.log('Tiene .data?', json && json.data ? 'SI' : 'NO');
      console.log('Es array?', Array.isArray(json?.data) ? 'SI' : 'NO');
      console.log('Cantidad:', json?.data?.length || 0);
      if (json?.data?.length > 0) {
        console.log('Primer producto:', json.data[0].name);
      }
    } catch (e) {
      console.log('Error parseando JSON:', e.message);
    }
  });
}).on('error', console.error);

// Test categorías
setTimeout(() => {
  http.get('http://localhost:3001/api/v1/products/categories', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log('\n=== CATEGORIAS ===');
        console.log('Status:', res.statusCode);
        console.log('Tiene .data?', json && json.data ? 'SI' : 'NO');
        console.log('Es array?', Array.isArray(json?.data) ? 'SI' : 'NO');
        console.log('Cantidad:', json?.data?.length || 0);
        if (json?.data?.length > 0) {
          console.log('Primera categoría:', json.data[0].name);
        }
      } catch (e) {
        console.log('Error parseando JSON:', e.message);
      }
    });
  }).on('error', console.error);
}, 100);

// Test featured
setTimeout(() => {
  http.get('http://localhost:3001/api/v1/products/featured', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log('\n=== PRODUCTOS DESTACADOS ===');
        console.log('Status:', res.statusCode);
        console.log('Tiene .data?', json && json.data ? 'SI' : 'NO');
        console.log('Es array?', Array.isArray(json?.data) ? 'SI' : 'NO');
        console.log('Cantidad:', json?.data?.length || 0);
        console.log('\n');
      } catch (e) {
        console.log('Error parseando JSON:', e.message);
      }
    });
  }).on('error', console.error);
}, 200);
