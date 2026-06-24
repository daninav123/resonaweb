const axios = require('axios');

const API_URL = 'http://localhost:3001/api/v1';

async function checkProduct() {
  console.log('═══════════════════════════════════════════════════');
  console.log('🔍 DIAGNÓSTICO: Producto "das Altea 415a"');
  console.log('═══════════════════════════════════════════════════\n');
  
  try {
    // 1. Buscar producto por nombre
    console.log('📍 Paso 1: Buscar producto en BD...\n');
    const response = await axios.get(`${API_URL}/products?search=das Altea 415a`);
    
    const products = response.data.data || [];
    console.log(`✅ ${products.length} producto(s) encontrado(s)\n`);
    
    if (products.length === 0) {
      console.log('❌ ERROR: Producto no encontrado');
      return;
    }
    
    const product = products[0];
    
    console.log('───────────────────────────────────────────────────');
    console.log('📦 INFORMACIÓN DEL PRODUCTO');
    console.log('───────────────────────────────────────────────────\n');
    console.log(`Nombre: ${product.name}`);
    console.log(`ID: ${product.id}`);
    console.log(`SKU: ${product.sku}\n`);
    
    console.log('───────────────────────────────────────────────────');
    console.log('🖼️  ESTADO DE LAS IMÁGENES');
    console.log('───────────────────────────────────────────────────\n');
    
    // Verificar mainImageUrl
    if (product.mainImageUrl) {
      console.log(`✅ mainImageUrl: ${product.mainImageUrl}`);
    } else {
      console.log(`❌ mainImageUrl: NO TIENE`);
    }
    
    // Verificar images array
    if (product.images && Array.isArray(product.images)) {
      console.log(`✅ images (array): ${product.images.length} imagen(es)`);
      if (product.images.length > 0) {
        product.images.forEach((img, i) => {
          console.log(`   ${i + 1}. ${img}`);
        });
      }
    } else {
      console.log(`❌ images: NO ES ARRAY o NO EXISTE`);
      console.log(`   Tipo: ${typeof product.images}`);
      console.log(`   Valor: ${JSON.stringify(product.images)}`);
    }
    
    console.log('\n───────────────────────────────────────────────────');
    console.log('📊 DIAGNÓSTICO');
    console.log('───────────────────────────────────────────────────\n');
    
    const hasMainImage = !!product.mainImageUrl;
    const hasImagesArray = product.images && Array.isArray(product.images) && product.images.length > 0;
    
    if (hasMainImage && hasImagesArray) {
      console.log('🎉 TODO CORRECTO:');
      console.log('   ✅ Tiene mainImageUrl');
      console.log('   ✅ Tiene images[] con contenido');
      console.log('\n💡 Si no ves la imagen en el catálogo:');
      console.log('   1. Recarga la página (Ctrl+F5)');
      console.log('   2. Verifica la consola del navegador');
      console.log('   3. Verifica que el backend esté en localhost:3001');
      
    } else if (hasMainImage && !hasImagesArray) {
      console.log('⚠️  PROBLEMA ENCONTRADO:');
      console.log('   ✅ Tiene mainImageUrl');
      console.log('   ❌ NO tiene images[] con contenido');
      console.log('\n💡 SOLUCIÓN:');
      console.log('   1. Ve a /admin/productos');
      console.log('   2. Click en icono Imágenes del producto');
      console.log('   3. La imagen debería estar visible');
      console.log('   4. Click "Guardar Cambios" para re-guardar');
      console.log('   5. Ahora SÍ aparecerá en el catálogo');
      
    } else if (!hasMainImage && !hasImagesArray) {
      console.log('❌ PROBLEMA GRAVE:');
      console.log('   ❌ NO tiene mainImageUrl');
      console.log('   ❌ NO tiene images[]');
      console.log('\n💡 SOLUCIÓN:');
      console.log('   1. La imagen NO se subió correctamente');
      console.log('   2. Sube la imagen nuevamente');
      console.log('   3. Asegúrate de hacer click "Guardar Cambios"');
    }
    
    console.log('\n═══════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  El backend NO está corriendo en localhost:3001');
      console.error('   Ejecuta: cd packages/backend && npx ts-node src/index.ts');
    }
  }
}

checkProduct();
