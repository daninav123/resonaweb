const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n🖼️  OPTIMIZADOR DE IMÁGENES - CONVERSIÓN A WEBP\n');

// Directorios a procesar
const directories = [
  'packages/frontend/public',
  'packages/backend/uploads/products',
  'public'
];

// Extensiones a convertir
const imageExtensions = ['.jpg', '.jpeg', '.png'];

// Función para encontrar todas las imágenes
function findImages(dir) {
  const images = [];
  
  if (!fs.existsSync(dir)) {
    console.log(`⚠️  Directorio no existe: ${dir}`);
    return images;
  }

  function scanDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.includes('node_modules')) {
        scanDir(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase();
        if (imageExtensions.includes(ext)) {
          images.push(fullPath);
        }
      }
    });
  }
  
  scanDir(dir);
  return images;
}

// Verificar si Sharp está instalado
try {
  require.resolve('sharp');
} catch (e) {
  console.log('📦 Instalando Sharp (optimizador de imágenes)...\n');
  execSync('npm install --save-dev sharp', { stdio: 'inherit' });
}

const sharp = require('sharp');

// Función para optimizar una imagen
async function optimizeImage(imagePath) {
  try {
    const ext = path.extname(imagePath);
    const dir = path.dirname(imagePath);
    const name = path.basename(imagePath, ext);
    const webpPath = path.join(dir, `${name}.webp`);
    
    // Leer imagen original
    const originalSize = fs.statSync(imagePath).size;
    
    // Optimizar y convertir a WebP
    await sharp(imagePath)
      .resize(800, 600, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 85 })
      .toFile(webpPath);
    
    const newSize = fs.statSync(webpPath).size;
    const reduction = ((1 - newSize / originalSize) * 100).toFixed(1);
    
    console.log(`✅ ${name}${ext} → ${name}.webp (${formatBytes(originalSize)} → ${formatBytes(newSize)}, -${reduction}%)`);
    
    return {
      original: imagePath,
      webp: webpPath,
      originalSize,
      newSize,
      reduction: parseFloat(reduction)
    };
  } catch (error) {
    console.error(`❌ Error optimizando ${imagePath}:`, error.message);
    return null;
  }
}

// Formatear bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Proceso principal
async function main() {
  const allImages = [];
  
  // Encontrar todas las imágenes
  directories.forEach(dir => {
    const images = findImages(dir);
    allImages.push(...images);
  });
  
  console.log(`📸 Encontradas ${allImages.length} imágenes para optimizar\n`);
  
  if (allImages.length === 0) {
    console.log('⚠️  No se encontraron imágenes para optimizar');
    return;
  }
  
  const results = [];
  
  // Optimizar cada imagen
  for (const imagePath of allImages) {
    const result = await optimizeImage(imagePath);
    if (result) {
      results.push(result);
    }
  }
  
  // Resumen
  console.log('\n📊 RESUMEN DE OPTIMIZACIÓN:\n');
  
  const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
  const totalNew = results.reduce((sum, r) => sum + r.newSize, 0);
  const totalReduction = ((1 - totalNew / totalOriginal) * 100).toFixed(1);
  
  console.log(`✅ Imágenes optimizadas: ${results.length}`);
  console.log(`📦 Tamaño original total: ${formatBytes(totalOriginal)}`);
  console.log(`📦 Tamaño nuevo total: ${formatBytes(totalNew)}`);
  console.log(`💾 Reducción total: -${totalReduction}%`);
  console.log(`\n⚡ Mejora esperada PageSpeed: +3-5 puntos`);
  
  // Guardar log
  const logPath = path.join(__dirname, 'image-optimization-log.json');
  fs.writeFileSync(logPath, JSON.stringify(results, null, 2));
  console.log(`\n📝 Log guardado en: ${logPath}\n`);
}

main().catch(console.error);
