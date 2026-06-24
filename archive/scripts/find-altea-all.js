const axios = require('axios');

async function findAll() {
  try {
    console.log('🔍 Buscando en TODOS los productos (incluidos ocultos)...\n');
    
    // Buscar con includeHidden
    const response = await axios.get('http://localhost:3001/api/v1/products?includeHidden=true&limit=100');
    const products = response.data.data || [];
    
    console.log(`Total productos: ${products.length}\n`);
    
    // Buscar "altea" o "415"
    const matches = products.filter(p => 
      p.name.toLowerCase().includes('altea') || 
      p.name.toLowerCase().includes('415') ||
      p.sku?.toLowerCase().includes('altea') ||
      p.sku?.toLowerCase().includes('415')
    );
    
    if (matches.length > 0) {
      console.log(`✅ ${matches.length} producto(s) encontrado(s):\n`);
      matches.forEach(p => {
        console.log('═══════════════════════════════════════════════════');
        console.log(`Nombre: ${p.name}`);
        console.log(`ID: ${p.id}`);
        console.log(`SKU: ${p.sku}`);
        console.log(`Categoría: ${p.category?.name || 'N/A'}`);
        console.log(`mainImageUrl: ${p.mainImageUrl || '❌ NO'}`);
        console.log(`images[]: ${p.images ? `[${p.images.length}] ${JSON.stringify(p.images).substring(0, 100)}...` : '❌ NO'}`);
      });
    } else {
      console.log('❌ NO se encontró ningún producto con "altea" o "415"\n');
      console.log('Mostrando TODOS los productos:');
      products.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name} (${p.category?.name || 'Sin cat.'})`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

findAll();
