const axios = require('axios');

async function listAll() {
  try {
    const response = await axios.get('http://localhost:3001/api/v1/products');
    const products = response.data.data || [];
    
    console.log(`\n📦 TOTAL PRODUCTOS: ${products.length}\n`);
    console.log('═══════════════════════════════════════════════════');
    
    products.forEach((p, i) => {
      const hasImages = p.images && p.images.length > 0;
      const hasMain = !!p.mainImageUrl;
      const status = hasImages ? '✅' : (hasMain ? '⚠️ ' : '❌');
      
      console.log(`${i + 1}. ${status} ${p.name}`);
      if (hasMain || hasImages) {
        if (hasMain) console.log(`   mainImageUrl: ${p.mainImageUrl.substring(0, 50)}...`);
        if (hasImages) console.log(`   images: ${p.images.length} imagen(es)`);
      }
    });
    
    console.log('\n═══════════════════════════════════════════════════');
    console.log(`✅ Con imágenes: ${products.filter(p => p.images?.length > 0 || p.mainImageUrl).length}`);
    console.log(`❌ Sin imágenes: ${products.filter(p => !p.images?.length && !p.mainImageUrl).length}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listAll();
