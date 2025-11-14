/**
 * Test rápido de categorías (sin dependencias)
 */

const http = require('http');

console.log('\n=== TEST RÁPIDO DE CATEGORÍAS ===\n');

// Test 1: Backend health
http.get('http://localhost:3001/health', (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Backend corriendo en puerto 3001\n');
    
    // Test 2: Categorías
    testCategory('iluminacion', 1);
    testCategory('fotografia-video', 2);
    testCategory('sonido', 2);
  } else {
    console.log('❌ Backend no responde correctamente\n');
  }
}).on('error', () => {
  console.log('❌ Backend NO está corriendo');
  console.log('   Ejecuta: start-quick.bat\n');
});

function testCategory(slug, expectedCount) {
  setTimeout(() => {
    http.get(`http://localhost:3001/api/v1/products?category=${slug}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const count = json.data ? json.data.length : 0;
          
          if (count === expectedCount) {
            console.log(`✅ ${slug}: ${count} productos (correcto)`);
          } else {
            console.log(`❌ ${slug}: ${count} productos (esperado: ${expectedCount})`);
          }
          
          if (json.data && json.data.length > 0) {
            json.data.forEach(p => console.log(`   • ${p.name}`));
          }
          console.log('');
        } catch (e) {
          console.log(`❌ Error parseando respuesta de ${slug}`);
        }
      });
    }).on('error', () => {
      console.log(`❌ Error consultando ${slug}`);
    });
  }, 200 * (slug === 'iluminacion' ? 1 : slug === 'fotografia-video' ? 2 : 3));
}
