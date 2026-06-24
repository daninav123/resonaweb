const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/v1/products/categories',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const categories = json.data || [];
      
      console.log(`\n===== TOTAL CATEGORÍAS: ${categories.length} =====\n`);
      
      // Mostrar todas las categorías
      categories.forEach((cat, index) => {
        console.log(`${index + 1}. ${cat.name}`);
        console.log(`   - slug: ${cat.slug}`);
        console.log(`   - isHidden: ${cat.isHidden}`);
        console.log(`   - isActive: ${cat.isActive}`);
        console.log('');
      });
      
      // Aplicar filtros del Header.tsx
      const filtered = categories.filter((cat) => 
        !cat.name?.toLowerCase().includes('eventos personalizados') &&
        !cat.name?.toLowerCase().includes('personal') &&
        !cat.isHidden
      );
      
      console.log(`\n===== DESPUÉS DE FILTROS: ${filtered.length} =====\n`);
      
      if (filtered.length > 0) {
        filtered.forEach((cat, index) => {
          console.log(`${index + 1}. ${cat.name} (${cat.slug})`);
        });
      } else {
        console.log('¡NO HAY CATEGORÍAS VISIBLES DESPUÉS DE LOS FILTROS!');
        console.log('\nRazones por las que se filtran:');
        categories.forEach((cat) => {
          const reasons = [];
          if (cat.name?.toLowerCase().includes('eventos personalizados')) {
            reasons.push('nombre contiene "eventos personalizados"');
          }
          if (cat.name?.toLowerCase().includes('personal')) {
            reasons.push('nombre contiene "personal"');
          }
          if (cat.isHidden) {
            reasons.push('isHidden = true');
          }
          if (reasons.length > 0) {
            console.log(`\n  - ${cat.name}:`);
            reasons.forEach(r => console.log(`      * ${r}`));
          }
        });
      }
    } catch (error) {
      console.error('Error parseando JSON:', error.message);
      console.log('Respuesta cruda:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error en la petición:', error.message);
});

req.end();
