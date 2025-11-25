const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Imágenes genéricas LIBRES de repositorios públicos (Pixabay, Unsplash)
const GENERIC_IMAGES = {
  // ALTAVOCES
  'SND-DAS-215A': 'https://images.unsplash.com/photo-1545150665-c72a8f0cf311?w=800',
  'SND-DAS-515A': 'https://images.unsplash.com/photo-1545150665-c72a8f0cf311?w=800',
  'SND-ICOA-12A-BL': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800',
  'SND-ICOA-15A-NG': 'https://images.unsplash.com/photo-1545150665-c72a8f0cf311?w=800',
  'SND-ALT-8': 'https://images.unsplash.com/photo-1545150665-c72a8f0cf311?w=800',
  
  // CABEZAS MÓVILES
  'ILU-CM-17R': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
  'ILU-BEAM-7R': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
  
  // FOCOS
  'ILU-FLASH-1000': 'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?w=800',
  'ILU-RGB-DECO': 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800',
  'ILU-SPOT-SM': 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800',
  'LASER-15W': 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=800',
  'FLASH-RGB-SMD': 'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?w=800',
  'CORTINA-LED': 'https://images.unsplash.com/photo-1501959181532-7d2a3c064642?w=800',
  
  // MICRÓFONOS
  'MIC-AUD-57': 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800',
  'MIC-AUD-58': 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800',
  
  // ESTRUCTURA
  'EST-BASE': 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800',
  'EST-CUBO': 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800',
  'EST-CAB-JARD': 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
  'EST-CAB-PALET': 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
  
  // EFECTOS
  'HUMO 1500WV': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800',
  'FUEGO-FRIO-700W': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800',
  
  // CONTROL
  'Quickq20 ': 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800',
  'CAJETIN-USB-DMX': 'https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?w=800',
  'DMX 5PIN-3PIN': 'https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?w=800',
  
  // GENERADORES
  'GENERADOR 6500W': 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=800',
  '32A': 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800',
  
  // SOPORTES
  'ADPT-TRIPODE MARIPOSA': 'https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?w=800',
  
  // DECORACIÓN
  'Guirnalda': 'https://images.unsplash.com/photo-1482575832494-771f74bf6857?w=800',
  'HEX-VINTAGE': 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800',
  'EST-LETRAS': 'https://images.unsplash.com/photo-1532798442725-41036acc7489?w=800',
};

async function downloadImage(url, filename) {
  try {
    console.log(`📥 Descargando imagen genérica: ${filename}...`);
    
    const response = await axios({
      url,
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    const uploadsDir = path.join(__dirname, '../uploads/products');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const outputFilename = `${filename}-${Date.now()}.webp`;
    const outputPath = path.join(uploadsDir, outputFilename);
    
    // Procesar imagen
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
    console.error(`❌ Error: ${error.message}`);
    return null;
  }
}

async function addPlaceholderImages() {
  try {
    console.log('\n🎨 Añadiendo imágenes genéricas a productos...\n');
    
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
        sku: true
      },
      take: 20 // Procesar solo 20 productos por vez
    });
    
    console.log(`📦 Procesando ${products.length} productos\n`);
    
    let updated = 0;
    
    for (const product of products) {
      const imageUrl = GENERIC_IMAGES[product.sku];
      
      if (!imageUrl) {
        console.log(`⏭️  ${product.name} - Sin imagen definida`);
        continue;
      }
      
      console.log(`🔄 ${product.name}`);
      
      const localImageUrl = await downloadImage(
        imageUrl,
        product.sku.toLowerCase().replace(/[^a-z0-9]/g, '-')
      );
      
      if (localImageUrl) {
        await prisma.product.update({
          where: { id: product.id },
          data: { mainImageUrl: localImageUrl }
        });
        
        console.log(`✅ Actualizado\n`);
        updated++;
        
        // Esperar 2 segundos entre descargas
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Imágenes añadidas: ${updated}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('⚠️  IMPORTANTE:');
    console.log('   Estas son imágenes GENÉRICAS temporales');
    console.log('   Reemplázalas con fotos REALES de tus productos\n');
    
    console.log('🌐 Ver en: http://localhost:3000/productos\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addPlaceholderImages();
