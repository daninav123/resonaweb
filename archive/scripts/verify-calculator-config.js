// Script para verificar si la configuración de calculadora existe en BD
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkConfig() {
  try {
    console.log('🔍 Buscando configuración de calculadora en BD...\n');

    const config = await prisma.systemConfig.findUnique({
      where: { key: 'advancedCalculatorConfig' }
    });

    if (!config) {
      console.log('❌ NO hay configuración guardada en BD');
      console.log('');
      console.log('📝 SOLUCIÓN:');
      console.log('1. Ve al panel de admin: http://localhost:3000/admin/calculator');
      console.log('2. Configura los montajes y extras');
      console.log('3. Haz clic en "Guardar Configuración"');
      console.log('');
      return;
    }

    console.log('✅ Configuración encontrada en BD');
    console.log('');
    
    const data = config.value;
    console.log('📊 Resumen:');
    console.log(`   - Eventos configurados: ${data.eventTypes?.length || 0}`);
    
    if (data.eventTypes) {
      console.log('\n📋 Eventos:');
      data.eventTypes.forEach((event) => {
        const partsCount = event.parts?.length || 0;
        const extrasCount = event.availableExtras?.length || 0;
        console.log(`   ${event.icon} ${event.name}`);
        console.log(`      Partes: ${partsCount}`);
        console.log(`      Extras: ${extrasCount}`);
      });
    }

    console.log('\n✅ Todo OK - Los usuarios verán esta configuración');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkConfig();
