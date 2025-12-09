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

function decodeHtmlEntities(text) {
  const entities = {
    '&#x2F;': '/',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'"
  };
  
  let decoded = text;
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.split(entity).join(char);
  }
  return decoded;
}

async function fixProduct() {
  try {
    await login();
    
    console.log('═══════════════════════════════════════════════════');
    console.log('🔧 FIX: Decodificar entidades HTML en imágenes');
    console.log('═══════════════════════════════════════════════════\n');
    
    // Buscar el producto
    const response = await axios.get(`${API_URL}/products?includeHidden=true&limit=100`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const products = response.data.data || [];
    const product = products.find(p => p.name.includes('Altea'));
    
    if (!product) {
      console.log('❌ Producto no encontrado');
      return;
    }
    
    console.log(`✅ Producto: ${product.name}`);
    console.log(`   ID: ${product.id}\n`);
    
    console.log('📍 ANTES:');
    console.log(`   mainImageUrl: ${product.mainImageUrl}`);
    console.log(`   images[]: ${JSON.stringify(product.images)}\n`);
    
    // Decodificar images[]
    if (product.images && product.images.length > 0) {
      const cleanedImages = product.images.map(img => decodeHtmlEntities(img));
      
      console.log('📍 DESPUÉS (limpiado):');
      console.log(`   images[]: ${JSON.stringify(cleanedImages)}\n`);
      
      // Actualizar (renovar token antes por si acaso)
      console.log('📍 Actualizando producto...');
      await login(); // Renovar token
      
      await axios.put(
        `${API_URL}/products/${product.id}`,
        {
          images: cleanedImages
        },
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
      
      console.log('✅ Producto actualizado\n');
      
      // Verificar
      const verifyResponse = await axios.get(`${API_URL}/products?includeHidden=true&limit=100`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const verifyProduct = verifyResponse.data.data.find(p => p.id === product.id);
      
      console.log('📍 VERIFICACIÓN:');
      console.log(`   images[]: ${JSON.stringify(verifyProduct.images)}\n`);
      
      console.log('═══════════════════════════════════════════════════');
      console.log('🎉 ¡FIX COMPLETADO!');
      console.log('═══════════════════════════════════════════════════\n');
      console.log('📋 Ahora haz:');
      console.log('   1. Ve a http://localhost:3000/productos');
      console.log('   2. Ctrl + F5');
      console.log('   3. ✅ La imagen debe aparecer');
      
    } else {
      console.log('⚠️  El producto no tiene images[]');
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error.response?.data || error.message);
  }
}

fixProduct();
