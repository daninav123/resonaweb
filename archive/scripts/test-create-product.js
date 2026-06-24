const axios = require('axios');

async function testCreateProduct() {
  try {
    // 1. Login
    console.log('🔐 Haciendo login...');
    const loginRes = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'admin@resona.com',
      password: 'Admin123!@#'
    });
    
    const token = loginRes.data.accessToken;
    console.log('✅ Token obtenido');
    
    // 2. Obtener categorías
    console.log('\n📂 Obteniendo categorías...');
    const categoriesRes = await axios.get('http://localhost:3001/api/v1/products/categories', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const firstCategory = categoriesRes.data[0];
    console.log('✅ Primera categoría:', firstCategory?.id, firstCategory?.name);
    
    // 3. Crear producto normal
    console.log('\n📦 Creando producto normal...');
    const productData = {
      name: 'Test Product ' + Date.now(),
      sku: 'TEST-' + Date.now(),
      description: 'Test description',
      categoryId: firstCategory.id,
      pricePerDay: 50,
      pricePerWeekend: 50,
      pricePerWeek: 250,
      stock: 10,
      realStock: 10,
      isPack: false
    };
    
    console.log('Datos a enviar:', JSON.stringify(productData, null, 2));
    
    const productRes = await axios.post('http://localhost:3001/api/v1/products', productData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Producto creado:', productRes.data);
    
    // 4. Crear pack (sin categoría)
    console.log('\n🎁 Creando pack...');
    const packData = {
      name: 'Test Pack ' + Date.now(),
      sku: 'PACK-' + Date.now(),
      description: 'Test pack description',
      pricePerDay: 100,
      pricePerWeekend: 100,
      pricePerWeek: 500,
      stock: 5,
      realStock: 5,
      isPack: true
    };
    
    console.log('Datos a enviar:', JSON.stringify(packData, null, 2));
    
    const packRes = await axios.post('http://localhost:3001/api/v1/products', packData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Pack creado:', packRes.data);
    
  } catch (error) {
    console.error('\n❌ ERROR:');
    console.error('Message:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
    console.error('Stack:', error.stack);
  }
}

testCreateProduct();
