const fs = require('fs');
const path = require('path');

console.log('\n📦 ANÁLISIS DE BACKUPS JSON\n');

const backupDir = path.join(__dirname, 'backups', 'database');
const backupFiles = fs.readdirSync(backupDir).filter(f => f.endsWith('.json')).sort().reverse();

console.log(`Backups encontrados: ${backupFiles.length}\n`);

if (backupFiles.length > 0) {
  const latestBackup = backupFiles[0];
  const filePath = path.join(backupDir, latestBackup);
  
  console.log(`📌 Analizando: ${latestBackup}\n`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const backup = JSON.parse(content);
    
    console.log(`Timestamp: ${backup.timestamp}`);
    console.log(`Versión: ${backup.version}\n`);
    
    if (backup.data) {
      const tables = Object.keys(backup.data);
      console.log(`📊 Tablas incluidas: ${tables.length}\n`);
      
      tables.forEach(table => {
        const count = Array.isArray(backup.data[table]) ? backup.data[table].length : 0;
        console.log(`   ✅ ${table}: ${count} registros`);
      });
      
      // Verificar contenido específico
      console.log('\n\n🔍 VERIFICACIÓN DE CONTENIDO\n');
      
      // Imágenes
      if (backup.data.Product) {
        const productsWithImages = backup.data.Product.filter(p => p.mainImageUrl);
        console.log(`📷 Productos con imagen: ${productsWithImages.length}/${backup.data.Product.length}`);
      }
      
      if (backup.data.Pack) {
        const packsWithImages = backup.data.Pack.filter(p => p.imageUrl);
        console.log(`📷 Montajes/Packs con imagen: ${packsWithImages.length}/${backup.data.Pack.length}`);
      }
      
      // Configuración
      if (backup.data.SystemConfig) {
        const calcConfig = backup.data.SystemConfig.find(c => c.key === 'advancedCalculatorConfig');
        if (calcConfig) {
          console.log(`✅ Configuración de calculadora: SÍ`);
          try {
            const config = JSON.parse(calcConfig.value);
            console.log(`   - Tipos de eventos: ${config.eventTypes?.length || 0}`);
          } catch (e) {
            console.log(`   - (no se pudo parsear)`);
          }
        } else {
          console.log(`❌ Configuración de calculadora: NO`);
        }
      }
      
      // Blog
      if (backup.data.blogPosts) {
        console.log(`📝 Entradas de blog: ${backup.data.blogPosts.length}`);
      } else {
        console.log(`❌ Entradas de blog: NO (tabla no existe)`);
      }
      
      // Órdenes
      if (backup.data.Order) {
        console.log(`📋 Órdenes: ${backup.data.Order.length}`);
      }
      
    } else {
      console.log('❌ El backup no tiene estructura esperada');
    }
    
  } catch (error) {
    console.error('❌ Error al leer backup:', error.message);
  }
}

console.log('\n');
