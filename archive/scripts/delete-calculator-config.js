// Script para BORRAR la configuración de calculadora de la BD
// Esto hará que use el DEFAULT_CALCULATOR_CONFIG (6 eventos)

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteCalculatorConfig() {
  console.log('🗑️  BORRAR Configuración de Calculadora de BD\n');
  console.log('⚠️  Esto eliminará la configuración guardada');
  console.log('   La aplicación usará DEFAULT_CALCULATOR_CONFIG (6 eventos)\n');

  try {
    // Verificar si existe
    const exists = await prisma.systemConfig.findUnique({
      where: { key: 'advancedCalculatorConfig' }
    });

    if (!exists) {
      console.log('ℹ️  No hay configuración para borrar');
      console.log('   Ya está usando DEFAULT_CALCULATOR_CONFIG');
      return;
    }

    // Mostrar qué se va a borrar
    const configData = typeof exists.value === 'string' 
      ? JSON.parse(exists.value) 
      : exists.value;
    
    console.log('📊 Configuración actual en BD:');
    if (configData.eventTypes) {
      configData.eventTypes.forEach((event, index) => {
        console.log(`   ${index + 1}. ${event.icon || ''} ${event.name}`);
      });
      console.log(`   Total: ${configData.eventTypes.length} eventos\n`);
    }

    // Esperar 3 segundos para que el usuario pueda cancelar
    console.log('⏰ Borrando en 3 segundos... (Ctrl+C para cancelar)');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Borrar
    await prisma.systemConfig.delete({
      where: { key: 'advancedCalculatorConfig' }
    });

    console.log('\n✅ Configuración borrada exitosamente');
    console.log('   Ahora usará DEFAULT_CALCULATOR_CONFIG con 6 eventos:');
    console.log('   1. 💒 Boda');
    console.log('   2. 🎤 Conferencia');
    console.log('   3. 🎵 Concierto');
    console.log('   4. 💼 Evento Corporativo');
    console.log('   5. 🎉 Fiesta Privada');
    console.log('   6. 📅 Otro');
    console.log('\n🔄 Recarga el panel de admin para ver los cambios');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

deleteCalculatorConfig();
