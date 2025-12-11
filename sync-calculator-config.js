/**
 * Script para sincronizar configuración de calculadora entre local y producción
 * 
 * Uso:
 * 1. Exportar desde local: node sync-calculator-config.js export
 * 2. Importar a producción: node sync-calculator-config.js import <archivo.json>
 */

const fs = require('fs');
const path = require('path');

const LOCAL_API = 'http://localhost:3001/api/v1';
const PROD_API = 'https://resona-backend.onrender.com/api/v1';

async function exportConfig() {
  console.log('📤 Exportando configuración de calculadora desde LOCAL...\n');
  
  try {
    const response = await fetch(`${LOCAL_API}/calculator-config`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const config = await response.json();
    
    // Guardar a archivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `calculator-config-${timestamp}.json`;
    const filepath = path.join(__dirname, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(config, null, 2));
    
    console.log('✅ Configuración exportada exitosamente');
    console.log(`📁 Archivo: ${filename}`);
    console.log(`\n📊 Resumen:`);
    
    if (config.eventTypes) {
      console.log(`   - Eventos: ${config.eventTypes.length}`);
      config.eventTypes.forEach(et => {
        const status = et.isActive !== false ? '✅' : '❌';
        console.log(`     ${status} ${et.name} (${et.parts?.length || 0} partes)`);
      });
    }
    
    console.log(`\n💡 Para sincronizar a producción, ejecuta:`);
    console.log(`   node sync-calculator-config.js import ${filename}`);
    
  } catch (error) {
    console.error('❌ Error exportando:', error.message);
    process.exit(1);
  }
}

async function importConfig(filename) {
  console.log(`📥 Importando configuración desde ${filename}...\n`);
  
  try {
    // Leer archivo
    const filepath = path.join(__dirname, filename);
    
    if (!fs.existsSync(filepath)) {
      throw new Error(`Archivo no encontrado: ${filepath}`);
    }
    
    const config = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    
    console.log('📊 Configuración a importar:');
    if (config.eventTypes) {
      console.log(`   - Eventos: ${config.eventTypes.length}`);
      config.eventTypes.forEach(et => {
        const status = et.isActive !== false ? '✅' : '❌';
        console.log(`     ${status} ${et.name}`);
      });
    }
    
    console.log('\n⚠️  IMPORTANTE: Necesitas un token de admin para importar a producción');
    console.log('   Usa la variable de entorno ADMIN_TOKEN\n');
    
    const token = process.env.ADMIN_TOKEN;
    if (!token) {
      throw new Error('ADMIN_TOKEN no configurado. Establécelo con: export ADMIN_TOKEN=tu_token');
    }
    
    // Enviar a producción
    const response = await fetch(`${PROD_API}/calculator-config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(config)
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error ${response.status}: ${error}`);
    }
    
    const result = await response.json();
    
    console.log('✅ Configuración importada exitosamente a PRODUCCIÓN');
    console.log(`\n🔄 Cambios aplicados:`);
    if (result.eventTypes) {
      console.log(`   - Eventos: ${result.eventTypes.length}`);
    }
    
    console.log('\n💡 Los cambios serán visibles en producción en los próximos minutos');
    
  } catch (error) {
    console.error('❌ Error importando:', error.message);
    process.exit(1);
  }
}

// Main
const command = process.argv[2];
const filename = process.argv[3];

if (command === 'export') {
  exportConfig();
} else if (command === 'import' && filename) {
  importConfig(filename);
} else {
  console.log(`
📋 Sincronizador de Configuración de Calculadora

Uso:
  node sync-calculator-config.js export
    → Exporta configuración actual de LOCAL a archivo JSON

  node sync-calculator-config.js import <archivo.json>
    → Importa configuración a PRODUCCIÓN (requiere ADMIN_TOKEN)

Ejemplos:
  # Exportar
  node sync-calculator-config.js export
  
  # Importar (después de exportar)
  export ADMIN_TOKEN=tu_token_aqui
  node sync-calculator-config.js import calculator-config-2025-12-10T16-20-30-000Z.json

Variables de entorno:
  ADMIN_TOKEN    - Token de autenticación admin (requerido para import)
  `);
}
