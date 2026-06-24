const axios = require('axios');

const API_URL = 'http://localhost:3001/api/v1';

async function findProduct() {
  try {
    console.log('🔍 Buscando todos los productos...\n');
    
    const response = await axios.get(`${API_URL}/products`);
    const products = response.data.data || [];
    
    console.log(`Total productos: ${products.length}\n`);
    
    // Buscar "das Altea 415a"
    const altea = products.find(p => p.name.toLowerCase().includes('altea'));
    
    if (altea) {
      console.log('✅ PRODUCTO ENCONTRADO\n');
      console.log('───────────────────────────────────────────────────');
      console.log(`Nombre: ${altea.name}`);
      console.log(`ID: ${altea.id}`);
      console.log(`SKU: ${altea.sku}`);
      console.log('───────────────────────────────────────────────────\n');
      
      console.log('🖼️  IMÁGENES:');
      console.log(`mainImageUrl: ${altea.mainImageUrl || '❌ NO TIENE'}`);
      console.log(`images[]: ${altea.images ? JSON.stringify(altea.images, null, 2) : '❌ NO TIENE'}`);
      console.log(`images.length: ${altea.images?.length || 0}\n`);
      
      if (!altea.mainImageUrl && (!altea.images || altea.images.length === 0)) {
        console.log('❌ PROBLEMA: Este producto NO tiene imágenes en BD');
        console.log('\n💡 SOLUCIÓN:');
        console.log(`1. Ve a http://localhost:3000/admin/productos`);
        console.log(`2. Busca: ${altea.name}`);
        console.log(`3. Click en botón Imágenes (📷)`);
        console.log(`4. Sube una imagen`);
        console.log(`5. Click "Guardar Cambios"`);
        console.log(`6. Verifica de nuevo con: node find-das-altea.js`);
      } else {
        console.log('✅ Producto tiene imágenes guardadas');
      }
    } else {
      console.log('❌ Producto "das Altea 415a" NO encontrado');
      console.log('\nProductos que contienen "das":');
      products.filter(p => p.name.toLowerCase().includes('das'))
        .forEach(p => console.log(`  - ${p.name}`));
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

findProduct();
