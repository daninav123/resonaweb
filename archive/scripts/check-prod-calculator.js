/**
 * Script para verificar configuración de calculadora en PRODUCCIÓN
 */

async function main() {
  try {
    console.log('🔍 Verificando configuración de calculadora en PRODUCCIÓN...\n');
    
    const response = await fetch('https://resona-backend.onrender.com/api/v1/calculator-config');
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const config = await response.json();
    
    console.log('✅ Configuración obtenida de PRODUCCIÓN\n');
    console.log('📊 Resumen:');
    
    if (config.eventTypes) {
      console.log(`   - Total de eventos: ${config.eventTypes.length}`);
      console.log(`\n   Eventos:`);
      config.eventTypes.forEach(et => {
        const status = et.isActive !== false ? '✅' : '❌';
        const parts = et.parts?.length || 0;
        console.log(`     ${status} ${et.name} (${parts} partes)`);
      });
    }
    
    console.log('\n📝 Diferencias esperadas:');
    console.log('   LOCAL:       ✅ Boda, ✅ Concierto, ✅ Fiesta Privada (3 visibles)');
    console.log('   PRODUCCIÓN:  (verificar arriba)');
    
    console.log('\n💡 Si hay diferencias, ejecuta:');
    console.log('   node sync-calculator-config.js import <archivo.json>');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
