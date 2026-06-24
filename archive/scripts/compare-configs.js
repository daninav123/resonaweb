/**
 * Script para comparar configuración LOCAL vs PRODUCCIÓN
 */

const fs = require('fs');
const path = require('path');

async function main() {
  try {
    console.log('🔍 Comparando configuración LOCAL vs PRODUCCIÓN...\n');
    
    // Leer archivo exportado
    const files = fs.readdirSync(__dirname).filter(f => f.startsWith('calculator-config-') && f.endsWith('.json'));
    
    if (files.length === 0) {
      console.log('❌ No hay archivo de configuración exportado');
      console.log('   Ejecuta primero: node export-calculator-config.js');
      process.exit(1);
    }
    
    const latestFile = files.sort().pop();
    const localConfig = JSON.parse(fs.readFileSync(path.join(__dirname, latestFile), 'utf8'));
    
    console.log('📁 Archivo LOCAL:', latestFile);
    console.log('\n📊 Configuración LOCAL:');
    console.log('   Eventos:');
    localConfig.eventTypes.forEach(et => {
      const status = et.isActive !== false ? '✅' : '❌';
      console.log(`     ${status} ${et.name}`);
    });
    
    // Intentar obtener configuración de producción
    console.log('\n🌐 Intentando obtener configuración de PRODUCCIÓN...');
    
    try {
      const response = await fetch('https://resona-backend.onrender.com/api/v1/diagnostic/calculator-config');
      const diagnostic = await response.json();
      
      if (diagnostic.config && diagnostic.config.events) {
        console.log('\n📊 Configuración PRODUCCIÓN:');
        console.log('   Eventos:');
        diagnostic.config.events.forEach(name => {
          console.log(`     ? ${name}`);
        });
        
        console.log('\n⚠️  NOTA: No se puede ver el estado (✅/❌) desde el endpoint público');
      }
    } catch (error) {
      console.log('   ⚠️  No se pudo obtener configuración de producción');
    }
    
    console.log('\n💡 SOLUCIÓN:');
    console.log('   Para sincronizar LOCAL → PRODUCCIÓN:');
    console.log('   1. Obtén un token de admin');
    console.log('   2. Ejecuta: node sync-calculator-config.js import ' + latestFile);
    console.log('   3. Establece: export ADMIN_TOKEN=tu_token');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
