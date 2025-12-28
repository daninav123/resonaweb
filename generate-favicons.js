/**
 * Script para generar favicons PNG desde SVG
 * Usa sharp para la conversión
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputSvg = path.join(__dirname, 'packages/frontend/public/favicon.svg');
const outputDir = path.join(__dirname, 'packages/frontend/public');

const sizes = [
  { size: 512, name: 'favicon.png' },
  { size: 192, name: 'favicon-192.png' },
  { size: 32, name: 'favicon-32.png' },
  { size: 180, name: 'apple-touch-icon.png' },
];

async function generateFavicons() {
  console.log('🎨 Generando favicons PNG desde SVG...\n');

  if (!fs.existsSync(inputSvg)) {
    console.error('❌ Error: No se encontró favicon.svg');
    process.exit(1);
  }

  for (const { size, name } of sizes) {
    try {
      const outputPath = path.join(outputDir, name);
      
      await sharp(inputSvg)
        .resize(size, size)
        .png({ quality: 100, compressionLevel: 9 })
        .toFile(outputPath);
      
      console.log(`✅ ${name} (${size}x${size}) generado correctamente`);
    } catch (error) {
      console.error(`❌ Error generando ${name}:`, error.message);
    }
  }

  console.log('\n🎉 ¡Favicons generados correctamente!');
  console.log('\n📁 Archivos creados en: packages/frontend/public/');
  console.log('   - favicon.png (512x512)');
  console.log('   - favicon-192.png (192x192)');
  console.log('   - favicon-32.png (32x32)');
  console.log('   - apple-touch-icon.png (180x180)');
}

generateFavicons().catch(console.error);
