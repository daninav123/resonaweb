const axios = require('axios');

const API_URL = 'http://localhost:3001/api/v1';
const ADMIN_EMAIL = 'admin@resona.com';
const ADMIN_PASSWORD = 'Admin123!';

let authToken = '';

async function login() {
  console.log('🔐 Iniciando sesión...');
  const response = await axios.post(`${API_URL}/auth/login`, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD
  });
  authToken = response.data.token;
  console.log('✅ Sesión iniciada\n');
}

async function fixProduct() {
  try {
    await login();
    
    console.log('═══════════════════════════════════════════════════');
    console.log('🔧 FIX: Producto "das Altea 415a"');
    console.log('═══════════════════════════════════════════════════\n');
    
    // 1. Buscar el producto
    console.log('📍 Paso 1: Buscar producto...');
    const searchResponse = await axios.get(`${API_URL}/products`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const products = searchResponse.data.data || [];
    const product = products.find(p => p.name.toLowerCase().includes('altea'));
    
    if (!product) {
      console.log('❌ Producto no encontrado');
      console.log('\nProductos disponibles:');
      products.forEach(p => console.log(`  - ${p.name}`));
      return;
    }
    
    console.log(`✅ Producto encontrado: ${product.name}`);
    console.log(`   ID: ${product.id}\n`);
    
    // 2. Verificar estado actual
    console.log('📍 Paso 2: Estado actual de imágenes:');
    console.log(`   mainImageUrl: ${product.mainImageUrl || '❌ NO TIENE'}`);
    console.log(`   images[]: ${product.images ? JSON.stringify(product.images) : '❌ NO TIENE'}`);
    console.log(`   images.length: ${product.images?.length || 0}\n`);
    
    // 3. Si tiene mainImageUrl pero NO tiene images[], arreglarlo
    if (product.mainImageUrl && (!product.images || product.images.length === 0)) {
      console.log('📍 Paso 3: Arreglando array images[]...');
      
      // Crear array con mainImageUrl
      const fixedImages = [product.mainImageUrl];
      
      console.log(`   Creando array: ${JSON.stringify(fixedImages)}\n`);
      
      // Actualizar producto
      await axios.put(
        `${API_URL}/products/${product.id}`,
        {
          images: fixedImages
        },
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
      
      console.log('✅ Producto actualizado\n');
      
      // 4. Verificar
      console.log('📍 Paso 4: Verificar resultado...');
      const verifyResponse = await axios.get(`${API_URL}/products`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      const verifyProduct = verifyResponse.data.data.find(p => p.id === product.id);
      
      console.log(`   mainImageUrl: ${verifyProduct.mainImageUrl}`);
      console.log(`   images[]: ${JSON.stringify(verifyProduct.images)}`);
      console.log(`   images.length: ${verifyProduct.images?.length}\n`);
      
      if (verifyProduct.images && verifyProduct.images.length > 0) {
        console.log('═══════════════════════════════════════════════════');
        console.log('🎉 ¡FIX COMPLETADO CON ÉXITO!');
        console.log('═══════════════════════════════════════════════════\n');
        console.log('📋 Ahora haz lo siguiente:');
        console.log('   1. Ve a http://localhost:3000/productos');
        console.log('   2. Ctrl + F5 (hard refresh)');
        console.log('   3. ✅ La imagen debe aparecer');
      } else {
        console.log('❌ El fix no funcionó correctamente');
      }
      
    } else if (product.images && product.images.length > 0) {
      console.log('✅ El producto YA tiene images[] correctamente\n');
      console.log('💡 Si no ves la imagen:');
      console.log('   1. Recarga la página (Ctrl+F5)');
      console.log('   2. Verifica la consola del navegador');
      
    } else {
      console.log('❌ El producto NO tiene ninguna imagen');
      console.log('\n💡 SOLUCIÓN:');
      console.log('   1. Ve a http://localhost:3000/admin/productos');
      console.log('   2. Busca: das Altea 415a');
      console.log('   3. Click en icono Imágenes (📷)');
      console.log('   4. Sube una imagen');
      console.log('   5. Click "Guardar Cambios"');
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error.response?.data || error.message);
  }
}

fixProduct();
