const axios = require('axios');

const API_URL = 'http://localhost:3001/api/v1';

async function testBackend() {
  console.log('🧪 TEST E2E BACKEND COMPLETO\n');
  console.log('='.repeat(80));
  console.log('');

  try {
    // 1. LOGIN
    console.log('👤 PASO 1: Login');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'danielnavarrocampos@icloud.com',
      password: 'Daniel123!'
    });
    
    const token = loginRes.data.data?.accessToken || loginRes.data.accessToken || loginRes.data.token;
    console.log('✅ Login exitoso');
    console.log('   Token:', token ? token.substring(0, 30) + '...' : 'ERROR - NO ENCONTRADO');
    console.log('');

    // 2. OBTENER PRODUCTOS
    console.log('📦 PASO 2: Obtener productos');
    const productsRes = await axios.get(`${API_URL}/products`);
    const products = productsRes.data?.data || productsRes.data || [];
    const product = products.find(p => p.stock <= 0) || products[0];
    console.log(`✅ Producto: ${product.name}`);
    console.log(`   Stock: ${product.stock}`);
    console.log('');

    // 3. CREAR ORDEN
    console.log('🛍️ PASO 3: Crear orden');
    const orderData = {
      items: [{
        productId: product.id,
        quantity: 1,
        pricePerUnit: product.pricePerDay,
        totalPrice: product.pricePerDay,
        startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 46 * 24 * 60 * 60 * 1000).toISOString(),
      }],
      deliveryType: 'PICKUP',
      notes: 'Test E2E Node.js',
    };

    const orderRes = await axios.post(`${API_URL}/orders`, orderData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Orden creada');
    console.log('   Response:', JSON.stringify(orderRes.data, null, 2));
    console.log('');

    const orderId = orderRes.data?.order?.id || orderRes.data?.id;
    console.log(`   Order ID: ${orderId || 'NO ENCONTRADO'}`);
    console.log('');

    // 4. VERIFICAR EN MIS PEDIDOS
    console.log('📋 PASO 4: Verificar en mis pedidos');
    const myOrdersRes = await axios.get(`${API_URL}/orders/my-orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const myOrders = myOrdersRes.data?.data || myOrdersRes.data || [];
    console.log(`✅ Mis pedidos: ${myOrders.length} encontrados`);
    
    if (orderId) {
      const found = myOrders.find(o => o.id === orderId);
      if (found) {
        console.log('✅ Orden encontrada en mis pedidos');
      } else {
        console.log('❌ Orden NO encontrada en mis pedidos');
      }
    }
    console.log('');

    // 5. LOGIN COMO ADMIN
    console.log('👨‍💼 PASO 5: Login como admin');
    const adminLoginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@resona.com',
      password: 'Admin123!'
    });
    
    const adminToken = adminLoginRes.data.data?.accessToken || adminLoginRes.data.accessToken;
    console.log('✅ Login admin exitoso');
    console.log('   Admin Token:', adminToken ? adminToken.substring(0, 30) + '...' : 'ERROR');
    console.log('');

    // 6. VERIFICAR EN PANEL ADMIN
    console.log('🔐 PASO 6: Verificar en panel admin');
    const adminOrdersRes = await axios.get(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('   Response data:', JSON.stringify(adminOrdersRes.data, null, 2));
    
    const adminOrders = adminOrdersRes.data?.data || adminOrdersRes.data || [];
    console.log(`✅ Órdenes totales: ${adminOrders.length}`);
    
    if (orderId) {
      const found = adminOrders.find(o => o.id === orderId);
      if (found) {
        console.log('🎉 ¡ORDEN ENCONTRADA EN ADMIN!');
        console.log('   Estado:', found.status);
        console.log('   Total:', found.totalAmount || found.total);
      } else {
        console.log('❌ Orden NO encontrada en admin');
      }
    }
    console.log('');

    console.log('='.repeat(80));
    console.log('✅ TEST COMPLETADO EXITOSAMENTE');
    console.log('='.repeat(80));

  } catch (error) {
    console.log('');
    console.log('='.repeat(80));
    console.log('❌ ERROR EN EL TEST');
    console.log('='.repeat(80));
    console.log('');
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

testBackend();
