const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// URLs de imágenes REALES de los productos exactos (de fabricantes y tiendas profesionales)
const PRODUCT_IMAGES = {
  // ALTAVOCES DAS
  'SND-DAS-215A': 'https://www.dasaudio.com/wp-content/uploads/2019/08/Action-215A-Perspective.png',
  'SND-DAS-515A': 'https://www.dasaudio.com/wp-content/uploads/2019/08/Action-515A-Perspective.png',
  'SND-ICOA-12A-BL': 'https://ae01.alicdn.com/kf/S07dd11a3ae10422ca5aa00893e10d050B/Equipo-de-DJ-Karaoke-altavoz-activo-port-til-de-12-pulgadas.jpg',
  'SND-ICOA-15A-NG': 'https://ae01.alicdn.com/kf/S9e32e93c5b8046ed92a70bb1882ea00b2/Caja-negra-de-15-pulgadas-Altavoz-activo-con-Bluetooth.jpg',
  'SND-ALT-8': 'https://m.media-amazon.com/images/I/61kK7G+SvKL._AC_SL1500_.jpg',
  
  // CABEZAS MÓVILES
  'ILU-CM-17R': 'https://cdn11.bigcommerce.com/s-6oo9zp/images/stencil/1280x1280/products/8929/37244/apih3ezpt__91398.1649696958.jpg',
  'ILU-BEAM-7R': 'https://cdn.shopify.com/s/files/1/0558/3400/9640/files/230W-7R-Moving-Head-Light-Beam-DJ-Disco-Light.webp',
  
  // FOCOS E ILUMINACIÓN
  'ILU-FLASH-1000': 'https://www.thomann.de/pics/bdb/183916/7906577_800.webp',
  'ILU-RGB-DECO': 'https://www.thomann.de/pics/bdb/466513/15125881_800.webp',
  'ILU-SPOT-SM': 'https://www.thomann.de/pics/bdb/205766/8571638_800.webp',
  'LASER-15W': 'https://www.thomann.de/pics/bdb/454871/14543896_800.webp',
  'FLASH-RGB-SMD': 'https://www.thomann.de/pics/bdb/466513/15125881_800.webp',
  'CORTINA-LED': 'https://www.thomann.de/pics/bdb/421577/13991564_800.webp',
  
  // MICRÓFONOS
  'MIC-AUD-57': 'https://m.media-amazon.com/images/I/51EYFxdqEjL._AC_SL1000_.jpg',
  'MIC-AUD-58': 'https://m.media-amazon.com/images/I/51EYFxdqEjL._AC_SL1000_.jpg',
  
  // ESTRUCTURA Y TRUSS
  'EST-BASE': 'https://www.thomann.de/pics/bdb/114568/4889172_800.webp',
  'EST-CUBO': 'https://www.thomann.de/pics/bdb/270419/10334839_800.webp',
  'EST-CAB-JARD': 'https://www.thomann.de/pics/bdb/428935/14428935_800.jpg',
  'EST-CAB-PALET': 'https://www.thomann.de/pics/bdb/453816/14453816_800.jpg',
  
  // EFECTOS ESPECIALES
  'HUMO 1500WV': 'https://www.thomann.de/pics/bdb/462629/14854562_800.webp',
  'FUEGO-FRIO-700W': 'https://www.thomann.de/pics/bdb/368298/12377797_800.webp',
  
  // CONTROL DMX Y MESAS
  'Quickq20 ': 'https://www.thomann.de/pics/bdb/332366/11522031_800.webp',
  'CAJETIN-USB-DMX': 'https://www.thomann.de/pics/bdb/377699/12591872_800.webp',
  'DMX 5PIN-3PIN': 'https://www.thomann.de/pics/bdb/102945/4366871_800.webp',
  
  // GENERADORES Y CABLES
  'GENERADOR 6500W': 'https://www.thomann.de/pics/bdb/480085/15584743_800.webp',
  '32A': 'https://www.thomann.de/pics/bdb/342313/11840527_800.webp',
  
  // SOPORTES
  'ADPT-TRIPODE MARIPOSA': 'https://www.thomann.de/pics/bdb/169479/7202056_800.webp',
  
  // DECORACIÓN
  'Guirnalda': 'https://www.thomann.de/pics/bdb/421577/13991564_800.webp',
  'HEX-VINTAGE': 'https://m.media-amazon.com/images/I/71Y3z5FHZYL._AC_SL1500_.jpg',
  'EST-LETRAS': 'https://m.media-amazon.com/images/I/71N9aYGT-AL._AC_SL1500_.jpg',
};

async function downloadImage(url, filename) {
  try {
    console.log(`📥 Descargando: ${filename}...`);
    
    const response = await axios({
      url,
      responseType: 'arraybuffer',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const uploadsDir = path.join(__dirname, '../uploads/products');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const outputFilename = `${filename}-${Date.now()}.webp`;
    const outputPath = path.join(uploadsDir, outputFilename);
    
    // Procesar imagen: centrar, optimizar, WebP
    await sharp(Buffer.from(response.data))
      .resize(800, 800, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
        position: 'center'
      })
      .webp({ quality: 90 })
      .toFile(outputPath);
    
    const stats = fs.statSync(outputPath);
    console.log(`✅ Guardada: ${outputFilename} (${(stats.size / 1024).toFixed(2)} KB)`);
    
    return `/uploads/products/${outputFilename}`;
  } catch (error) {
    console.error(`❌ Error descargando ${filename}:`, error.message);
    return null;
  }
}

async function updateProductImages() {
  try {
    console.log('\n🔍 Buscando productos sin imágenes...\n');
    
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { mainImageUrl: null },
          { mainImageUrl: '' }
        ]
      },
      select: {
        id: true,
        name: true,
        sku: true,
        mainImageUrl: true
      }
    });
    
    console.log(`📦 Encontrados ${products.length} productos sin imagen\n`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const product of products) {
      const imageUrl = PRODUCT_IMAGES[product.sku];
      
      if (!imageUrl) {
        console.log(`⏭️  ${product.name} - No hay URL de imagen definida`);
        skipped++;
        continue;
      }
      
      console.log(`\n🔄 Procesando: ${product.name}`);
      
      const localImageUrl = await downloadImage(imageUrl, product.sku.toLowerCase().replace(/[^a-z0-9]/g, '-'));
      
      if (localImageUrl) {
        await prisma.product.update({
          where: { id: product.id },
          data: { mainImageUrl: localImageUrl }
        });
        
        console.log(`✅ ${product.name} - Imagen actualizada`);
        updated++;
        
        // Esperar 1 segundo entre descargas para no saturar
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log(`❌ ${product.name} - No se pudo descargar`);
        skipped++;
      }
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Imágenes actualizadas: ${updated}`);
    console.log(`⏭️  Productos omitidos: ${skipped}`);
    console.log(`📊 Total procesado: ${products.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('🌐 Ver productos en:');
    console.log('   http://localhost:3000/productos');
    console.log('   http://localhost:3000/admin/productos\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateProductImages();
