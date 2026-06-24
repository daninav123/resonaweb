const sharp = require('sharp');
const path = require('path');

const sourceFile = path.join(__dirname, 'packages/frontend/public/favicon-32.png');
const outputFile = path.join(__dirname, 'packages/frontend/public/favicon.ico');

console.log('🎨 Generando favicon.ico...\n');

sharp(sourceFile)
  .resize(32, 32)
  .toFile(outputFile)
  .then(() => {
    console.log('✅ favicon.ico generado correctamente\n');
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
