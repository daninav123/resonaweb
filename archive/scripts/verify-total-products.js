const axios = require('axios');

const API_URL = 'http://localhost:3001/api/v1';

async function verifyTotal() {
  console.log('🔍 VERIFICACIÓN TOTAL DE PRODUCTOS (Sin Paginación)\n');
  
  try {
    // Solicitar con límite alto para obtener todos
    const res = await axios.get(`${API_URL}/products?limit=200`);
    const data = res.data;
    
    console.log(`Total productos devueltos: ${data.data?.length || 0}`);
    console.log(`Total reportado por API: ${data.pagination?.total || 0}`);
    
    // Agrupar por categoría
    const byCategory = {};
    data.data?.forEach(p => {
      const cat = p.category?.name || 'Sin categoría';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    });
    
    console.log('\nProductos por categoría:');
    Object.entries(byCategory).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
      console.log(`  - ${cat}: ${count}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log(`📊 TOTAL PRODUCTOS: ${data.data?.length || 0}`);
    console.log(`🎯 ESPERADO: 72 (93 - 17 proxies - 3 personal - 1 eventos)`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyTotal();
