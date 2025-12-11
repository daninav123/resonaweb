/**
 * Script para exportar configuración de calculadora directamente de la BD
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('📤 Exportando configuración de calculadora desde BD LOCAL...\n');
    
    // Obtener configuración de la BD
    const config = await prisma.systemConfig.findUnique({
      where: { key: 'advancedCalculatorConfig' }
    });
    
    if (!config) {
      console.log('❌ No hay configuración guardada en la BD');
      process.exit(1);
    }
    
    // Guardar a archivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `calculator-config-${timestamp}.json`;
    const filepath = path.join(__dirname, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(config.value, null, 2));
    
    console.log('✅ Configuración exportada exitosamente');
    console.log(`📁 Archivo: ${filename}`);
    console.log(`\n📊 Resumen:`);
    
    if (config.value.eventTypes) {
      console.log(`   - Total de eventos: ${config.value.eventTypes.length}`);
      console.log(`\n   Eventos:`);
      config.value.eventTypes.forEach(et => {
        const status = et.isActive !== false ? '✅' : '❌';
        const parts = et.parts?.length || 0;
        console.log(`     ${status} ${et.name} (${parts} partes)`);
      });
    }
    
    console.log(`\n💡 Para sincronizar a producción, necesitarás:`);
    console.log(`   1. Un token de admin`);
    console.log(`   2. Ejecutar: POST https://resona-backend.onrender.com/api/v1/calculator-config`);
    console.log(`   3. Con el contenido del archivo: ${filename}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
