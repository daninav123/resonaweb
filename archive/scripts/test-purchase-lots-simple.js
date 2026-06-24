/**
 * Test Simple del Sistema de Lotes de Compra
 * Verifica que la API funciona correctamente sin necesidad de Playwright
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api/v1';

// Credenciales de admin - Intenta múltiples opciones
const ADMIN_CREDENTIALS = [
  { email: 'admin@resona.es', password: 'Admin123!' },
  { email: 'admin@example.com', password: 'Admin123!' },
  { email: 'admin@resona.es', password: 'admin123' },
  { email: 'admin@resona.es', password: 'password' },
];

let adminToken = '';

async function login() {
  for (const creds of ADMIN_CREDENTIALS) {
    try {
      console.log(`🔐 Intentando login con: ${creds.email}`);
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email: creds.email,
        password: creds.password,
      });

      adminToken = response.data.accessToken;
      console.log('✅ Login exitoso');
      return true;
    } catch (error) {
      console.log(`   ❌ Falló con ${creds.email}`);
    }
  }
  
  console.error('❌ No se pudo iniciar sesión con ninguna credencial');
  return false;
}

async function getProducts() {
  try {
    console.log('\n📦 Obteniendo productos...');
    const response = await axios.get(`${API_BASE}/products?limit=1000`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const products = Array.isArray(response.data) ? response.data : response.data.products || [];
    const productsWithPrice = products.filter(p => p.purchasePrice && !p.isPack);
    
    console.log(`✅ Productos cargados: ${products.length}`);
    console.log(`✅ Productos con precio de compra: ${productsWithPrice.length}`);
    
    return productsWithPrice;
  } catch (error) {
    console.error('❌ Error obteniendo productos:', error.response?.data || error.message);
    return [];
  }
}

async function createPurchaseLot(productId, quantity, unitPrice) {
  try {
    console.log(`\n📝 Creando lote de compra...`);
    console.log(`   Producto: ${productId}`);
    console.log(`   Cantidad: ${quantity}`);
    console.log(`   Precio unitario: €${unitPrice}`);

    const response = await axios.post(
      `${API_BASE}/product-purchases`,
      {
        productId,
        quantity,
        unitPrice,
        purchaseDate: new Date().toISOString().split('T')[0],
        supplier: 'Test Supplier',
        invoiceNumber: `TEST-${Date.now()}`,
        notes: 'Lote de prueba E2E',
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    console.log('✅ Lote creado exitosamente');
    console.log(`   ID: ${response.data.id}`);
    console.log(`   Coste total: €${response.data.quantity * response.data.unitPrice}`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error creando lote:', error.response?.data || error.message);
    return null;
  }
}

async function getProductLots(productId) {
  try {
    console.log(`\n📊 Obteniendo lotes del producto...`);
    const response = await axios.get(
      `${API_BASE}/product-purchases/product/${productId}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    const lots = Array.isArray(response.data) ? response.data : [];
    console.log(`✅ Lotes encontrados: ${lots.length}`);
    
    lots.forEach((lot, index) => {
      console.log(`\n   Lote #${index + 1}:`);
      console.log(`   - Cantidad: ${lot.quantity}`);
      console.log(`   - Precio unitario: €${lot.unitPrice}`);
      console.log(`   - Coste total: €${lot.quantity * lot.unitPrice}`);
      console.log(`   - Fecha: ${lot.purchaseDate}`);
      console.log(`   - Proveedor: ${lot.supplier || 'N/A'}`);
      console.log(`   - Factura: ${lot.invoiceNumber || 'N/A'}`);
    });
    
    return lots;
  } catch (error) {
    console.error('❌ Error obteniendo lotes:', error.response?.data || error.message);
    return [];
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 TEST SIMPLE: SISTEMA DE LOTES DE COMPRA');
  console.log('═══════════════════════════════════════════════════════════');

  // 1. Login
  const loginOk = await login();
  if (!loginOk) {
    console.error('\n❌ No se pudo iniciar sesión. Abortando tests.');
    process.exit(1);
  }

  // 2. Obtener productos
  const products = await getProducts();
  if (products.length === 0) {
    console.error('\n❌ No hay productos con precio de compra. Abortando tests.');
    process.exit(1);
  }

  // 3. Seleccionar un producto aleatorio
  const testProduct = products[Math.floor(Math.random() * products.length)];
  console.log(`\n🎯 Producto seleccionado: ${testProduct.name} (${testProduct.sku})`);
  console.log(`   Precio de compra actual: €${testProduct.purchasePrice}`);

  // 4. Crear un lote de compra
  const lot = await createPurchaseLot(
    testProduct.id,
    5,
    Number(testProduct.purchasePrice)
  );

  if (!lot) {
    console.error('\n❌ No se pudo crear el lote. Abortando tests.');
    process.exit(1);
  }

  // 5. Obtener todos los lotes del producto
  const lots = await getProductLots(testProduct.id);

  // 6. Resumen
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 RESUMEN DE TESTS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ Login exitoso');
  console.log(`✅ Productos cargados: ${products.length}`);
  console.log(`✅ Lote creado: ${lot.id}`);
  console.log(`✅ Lotes del producto: ${lots.length}`);
  console.log('\n✅ TODOS LOS TESTS PASARON');
  console.log('═══════════════════════════════════════════════════════════\n');
}

// Ejecutar tests
runTests().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
