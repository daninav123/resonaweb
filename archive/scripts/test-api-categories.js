const axios = require('axios');

async function testAPI() {
  try {
    console.log('🔍 Probando API de categorías...\n');
    
    // Primero, obtener un token de admin
    console.log('1️⃣ Obteniendo token de admin...');
    const loginRes = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'admin@resona.com',
      password: 'Admin123!@#'
    });
    
    const token = loginRes.data.data.accessToken;
    console.log('✅ Token obtenido\n');
    
    // Ahora llamar al endpoint de categorías con includeHidden=true
    console.log('2️⃣ Llamando a /products/categories?includeInactive=true&includeHidden=true');
    const catRes = await axios.get('http://localhost:3001/api/v1/products/categories?includeInactive=true&includeHidden=true', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const categories = catRes.data.data;
    console.log(`✅ Recibidas ${categories.length} categorías\n`);
    
    // Buscar "Personal"
    const personal = categories.find(c => c.name.toLowerCase() === 'personal');
    if (personal) {
      console.log('✅ ENCONTRADA EN LA RESPUESTA DEL API:');
      console.log(JSON.stringify(personal, null, 2));
    } else {
      console.log('❌ NO ENCONTRADA EN LA RESPUESTA DEL API');
      console.log('\nCategorías recibidas:');
      categories.forEach(c => console.log(`  - ${c.name} (oculta: ${c.isHidden})`));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAPI();
