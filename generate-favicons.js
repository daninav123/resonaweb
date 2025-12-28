/**
 * Script para generar favicons PNG desde SVG
 * Usa sharp para la conversión
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, 'packages/frontend/public/favicon.svg');
const outputDir = path.join(__dirname, 'packages/frontend/public');

const sizes = [
  { name: 'favicon.png', size: 512 },
  { name: 'favicon-192.png', size: 192 },
  { name: 'favicon-32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 }
];

console.log('🎨 Generando favicons PNG desde SVG...\n');

Promise.all(
  sizes.map(async ({ name, size }) => {
    const outputPath = path.join(outputDir, name);
    await sharp(sourceFile)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`✅ ${name} (${size}x${size}) generado correctamente`);
  })
).then(() => {
  console.log('\n🎉 ¡Favicons generados correctamente!\n');
  console.log('📁 Archivos creados en: packages/frontend/public/');
  sizes.forEach(({ name, size }) => {
    console.log(`   - ${name} (${size}x${size})`);
  });
}).catch(err => {
  console.error('❌ Error generando favicons:', err);
  process.exit(1);
});
