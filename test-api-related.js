const http = require('http');

function testProductAPI() {
  console.log('🧪 Test API de productos relacionados\n');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/products/slug/lc-8-kinson-son-0006',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const req = http.request(options, (res) => {
    console.log(`📡 Status: ${res.statusCode}`);
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        const product = response.data || response;
        
        console.log('\n📦 PRODUCTO:');
        console.log('  - ID:', product.id);
        console.log('  - Nombre:', product.name);
        console.log('  - CategoryID:', product.categoryId);
        
        console.log('\n🔗 PRODUCTOS RELACIONADOS:');
        if (product.relatedProducts) {
          console.log('  - Array existe:', true);
          console.log('  - Cantidad:', product.relatedProducts.length);
          
          if (product.relatedProducts.length > 0) {
            console.log('  - Productos:');
            product.relatedProducts.forEach((rel, i) => {
              console.log(`    ${i + 1}. ${rel.name} (${rel.sku || 'Pack'})`);
            });
            console.log('\n✅ ÉXITO: Productos relacionados encontrados');
          } else {
            console.log('\n❌ PROBLEMA: Array vacío');
            console.log('   Debug info:', {
              hasCategory: !!product.categoryId,
              productId: product.id
            });
          }
        } else {
          console.log('  - Array existe:', false);
          console.log('\n❌ PROBLEMA: Campo relatedProducts no existe en la respuesta');
        }
        
        console.log('\n📊 RESPUESTA COMPLETA (keys):');
        console.log('  ', Object.keys(product).join(', '));
        
      } catch (error) {
        console.error('❌ Error parseando respuesta:', error.message);
        console.log('Raw data:', data.substring(0, 500));
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Error en request:', error.message);
  });
  
  req.end();
}

console.log('⏳ Esperando 2 segundos para asegurar que el servidor esté listo...\n');
setTimeout(testProductAPI, 2000);
