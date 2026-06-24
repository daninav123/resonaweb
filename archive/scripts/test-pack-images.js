const axios = require('axios');

async function testPackImages() {
  try {
    const response = await axios.get('http://localhost:3001/api/v1/packs');
    const packs = response.data.packs || response.data || [];
    
    console.log('\n=== PACKS CON IMÁGENES ===\n');
    
    const packsConImagen = packs.filter(p => p.imageUrl);
    
    packsConImagen.forEach(pack => {
      console.log(`Pack: ${pack.name}`);
      console.log(`  imageUrl: "${pack.imageUrl}"`);
      console.log(`  Tipo: ${typeof pack.imageUrl}`);
      console.log(`  Caracteres especiales: ${pack.imageUrl.includes('&#x') ? 'SÍ (HTML ENTITIES)' : 'NO'}`);
      console.log(`  Primera parte: ${pack.imageUrl.substring(0, 20)}`);
      console.log('');
    });
    
    console.log(`\nTotal packs con imagen: ${packsConImagen.length} de ${packs.length}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testPackImages();
