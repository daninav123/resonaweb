const fs = require('fs');
const path = require('path');

console.log('\n🖼️  BUSCANDO IMÁGENES SIN WIDTH/HEIGHT\n');

const frontendDir = path.join(__dirname, 'packages/frontend/src');
const imagesWithoutDimensions = [];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Buscar <img sin width o height
    if (line.includes('<img') || line.includes('<Image')) {
      const hasWidth = line.includes('width=') || line.includes('width:');
      const hasHeight = line.includes('height=') || line.includes('height:');
      
      if (!hasWidth || !hasHeight) {
        imagesWithoutDimensions.push({
          file: filePath.replace(__dirname, ''),
          line: index + 1,
          content: line.trim()
        });
      }
    }
  });
}

function scanDirectory(dir) {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.includes('node_modules')) {
      scanDirectory(fullPath);
    } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.jsx'))) {
      scanFile(fullPath);
    }
  });
}

scanDirectory(frontendDir);

console.log(`📊 RESULTADO:\n`);
console.log(`Total de imágenes sin dimensiones: ${imagesWithoutDimensions.length}\n`);

if (imagesWithoutDimensions.length > 0) {
  console.log('🔴 Archivos con imágenes sin width/height:\n');
  
  imagesWithoutDimensions.forEach((img, index) => {
    console.log(`${index + 1}. ${img.file}:${img.line}`);
    console.log(`   ${img.content.substring(0, 100)}...`);
    console.log('');
  });
  
  console.log('\n💡 SOLUCIÓN:');
  console.log('Añade width y height a cada <img>:');
  console.log('  <img src="..." width={400} height={300} ... />');
  console.log('\nO para imágenes responsive:');
  console.log('  <img src="..." width="auto" height="auto" ... />');
  console.log('\nEsto mejorará +5-10 puntos en PageSpeed\n');
} else {
  console.log('✅ Todas las imágenes tienen width y height correctos!\n');
}
