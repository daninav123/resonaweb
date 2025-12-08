// Script para verificar qué hay en la base de datos de configuración de calculadora
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCalculatorConfig() {
  console.log('🔍 Verificando configuración de calculadora en BD...\n');

  try {
    // Buscar configuración en systemConfig con key 'advancedCalculatorConfig'
    const config = await prisma.systemConfig.findUnique({
      where: { key: 'advancedCalculatorConfig' }
    });

    if (!config) {
      console.log('❌ NO HAY configuración en la base de datos');
      console.log('   La aplicación usará DEFAULT_CALCULATOR_CONFIG (6 eventos)');
      console.log('   Esto es NORMAL si nunca has guardado configuración desde el admin');
      return;
    }

    console.log('✅ Configuración encontrada en BD:');
    console.log('   Key:', config.key);
    console.log('   Creado:', config.createdAt);
    console.log('   Actualizado:', config.updatedAt);
    
    // Parsear config (está en el campo 'value')
    const configData = typeof config.value === 'string' 
      ? JSON.parse(config.value) 
      : config.value;

    console.log('\n📊 Tipos de eventos en BD:');
    if (configData.eventTypes) {
      configData.eventTypes.forEach((event, index) => {
        const status = event.isActive !== false ? '✅ Activo' : '❌ Inactivo';
        const partsCount = event.parts ? event.parts.length : 0;
        console.log(`   ${index + 1}. ${event.icon || ''} ${event.name} - ${status} (${partsCount} partes)`);
      });
      console.log(`\n   Total: ${configData.eventTypes.length} eventos`);
    } else {
      console.log('   ⚠️ No hay eventTypes en la configuración');
    }

    // Mostrar config completa si quieres
    console.log('\n📄 Configuración completa:');
    console.log(JSON.stringify(configData, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('systemConfig')) {
      console.log('\n⚠️ La tabla systemConfig no existe en la BD');
      console.log('   Necesitas ejecutar las migraciones de Prisma');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Función adicional para ver TODO el systemConfig
async function listAllSystemConfigs() {
  console.log('\n\n📋 Todas las configuraciones del sistema:\n');
  try {
    const allConfigs = await prisma.systemConfig.findMany();
    
    if (allConfigs.length === 0) {
      console.log('   No hay configuraciones guardadas');
      return;
    }
    
    allConfigs.forEach((config, index) => {
      console.log(`${index + 1}. Key: "${config.key}"`);
      console.log(`   Creado: ${config.createdAt}`);
      console.log(`   Actualizado: ${config.updatedAt}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Ejecutar ambas funciones
(async () => {
  await checkCalculatorConfig();
  await listAllSystemConfigs();
})();
