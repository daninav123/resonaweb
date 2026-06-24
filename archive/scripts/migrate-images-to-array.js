const axios = require('axios');

// Configuración
const API_URL = 'https://resona-backend.onrender.com/api/v1';
const ADMIN_EMAIL = 'admin@resona.com';
const ADMIN_PASSWORD = 'Admin123!';

let authToken = '';

async function login() {
  console.log('\n🔐 Iniciando sesión como admin...');
  
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    authToken = response.data.token;
    console.log('✅ Sesión iniciada correctamente\n');
    return true;
  } catch (error) {
    console.error('❌ Error al iniciar sesión:', error.response?.data || error.message);
    return false;
  }
}

async function getProducts() {
  console.log('📦 Obteniendo lista de productos...\n');
  
  try {
    const response = await axios.get(`${API_URL}/products?includeHidden=true`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    return response.data.data || [];
  } catch (error) {
    console.error('❌ Error al obtener productos:', error.response?.data || error.message);
    return [];
  }
}

async function migrateProduct(product) {
  // Si ya tiene images con contenido, no hacer nada
  if (product.images && product.images.length > 0) {
    console.log(`⏭️  ${product.name}: Ya tiene images array (${product.images.length} imágenes)`);
    return { status: 'skip', product: product.name };
  }
  
  // Si NO tiene mainImageUrl, no hay nada que migrar
  if (!product.mainImageUrl) {
    console.log(`⚠️  ${product.name}: No tiene imágenes`);
    return { status: 'skip', product: product.name };
  }
  
  // Migrar: Crear array con mainImageUrl
  console.log(`🔄 ${product.name}: Migrando mainImageUrl → images[]...`);
  
  try {
    await axios.put(
      `${API_URL}/products/${product.id}`,
      {
        images: [product.mainImageUrl]
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log(`✅ ${product.name}: Migrado correctamente\n`);
    return { status: 'success', product: product.name };
  } catch (error) {
    console.error(`❌ ${product.name}: Error -`, error.response?.data || error.message);
    return { status: 'error', product: product.name, error: error.message };
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('🔧 MIGRACIÓN DE IMÁGENES: mainImageUrl → images[]');
  console.log('═══════════════════════════════════════════════════\n');
  
  // 1. Login
  const loggedIn = await login();
  if (!loggedIn) {
    console.log('\n❌ No se pudo iniciar sesión. Abortando.\n');
    return;
  }
  
  // 2. Obtener productos
  const products = await getProducts();
  console.log(`📊 Total de productos: ${products.length}\n`);
  console.log('───────────────────────────────────────────────────\n');
  
  // 3. Migrar cada producto
  const results = [];
  for (const product of products) {
    const result = await migrateProduct(product);
    results.push(result);
    
    // Esperar 100ms entre requests para no saturar
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // 4. Resumen
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📊 RESUMEN DE MIGRACIÓN');
  console.log('═══════════════════════════════════════════════════\n');
  
  const migrated = results.filter(r => r.status === 'success');
  const skipped = results.filter(r => r.status === 'skip');
  const errors = results.filter(r => r.status === 'error');
  
  console.log(`✅ Migrados correctamente: ${migrated.length}`);
  console.log(`⏭️  Omitidos (ya tenían images): ${skipped.length}`);
  console.log(`❌ Errores: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n❌ Productos con errores:');
    errors.forEach(e => console.log(`   - ${e.product}: ${e.error}`));
  }
  
  console.log('\n═══════════════════════════════════════════════════\n');
}

main().catch(console.error);
