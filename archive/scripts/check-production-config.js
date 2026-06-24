// Script para verificar y crear configuración en BD de producción
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Configuración por defecto completa
const DEFAULT_CALCULATOR_CONFIG = {
  eventTypes: [
    {
      id: 'boda',
      name: 'Boda',
      icon: '💒',
      color: 'pink',
      multiplier: 1.5,
      isActive: true,
      parts: [
        { id: 'ceremonia', name: 'Ceremonia', description: 'Sonido para ceremonia', isRequired: true },
        { id: 'cocktail', name: 'Cocktail', description: 'Música y sonido para cocktail', isRequired: false },
        { id: 'banquete', name: 'Banquete', description: 'Sonido ambiente para comida', isRequired: true },
        { id: 'fiesta', name: 'Fiesta', description: 'Equipo DJ completo', isRequired: true }
      ],
      availableExtras: [],
      servicePrices: {}
    },
    {
      id: 'conferencia',
      name: 'Conferencia',
      icon: '🎤',
      color: 'blue',
      multiplier: 1.2,
      isActive: true,
      parts: [
        { id: 'microfonia', name: 'Microfonía', description: 'Micrófonos para ponentes', isRequired: true },
        { id: 'pantallas', name: 'Pantallas', description: 'Proyección de presentaciones', isRequired: false },
        { id: 'grabacion', name: 'Grabación', description: 'Grabación del evento', isRequired: false }
      ],
      availableExtras: [],
      servicePrices: {}
    },
    {
      id: 'concierto',
      name: 'Concierto',
      icon: '🎵',
      color: 'purple',
      multiplier: 1.8,
      isActive: true,
      parts: [
        { id: 'escenario', name: 'Escenario', description: 'Estructura y montaje', isRequired: true },
        { id: 'sonido', name: 'Sonido', description: 'Sistema de sonido profesional', isRequired: true }
      ],
      availableExtras: [],
      servicePrices: {}
    },
    {
      id: 'evento-corporativo',
      name: 'Evento Corporativo',
      icon: '💼',
      color: 'gray',
      multiplier: 1.3,
      isActive: true,
      parts: [
        { id: 'presentacion', name: 'Presentación', description: 'Equipo para presentaciones', isRequired: true },
        { id: 'networking', name: 'Networking', description: 'Música ambiente', isRequired: false },
        { id: 'streaming', name: 'Streaming', description: 'Transmisión online', isRequired: false }
      ],
      availableExtras: [],
      servicePrices: {}
    },
    {
      id: 'fiesta-privada',
      name: 'Fiesta Privada',
      icon: '🎉',
      color: 'orange',
      multiplier: 1.0,
      isActive: true,
      parts: [
        { id: 'dj', name: 'DJ', description: 'Equipo DJ completo', isRequired: true },
        { id: 'iluminacion', name: 'Iluminación', description: 'Luces y efectos', isRequired: false }
      ],
      availableExtras: [],
      servicePrices: {}
    },
    {
      id: 'otro',
      name: 'Otro',
      icon: '📅',
      color: 'green',
      multiplier: 1.0,
      isActive: true,
      parts: [
        { id: 'basico', name: 'Equipo Básico', description: 'Configuración estándar', isRequired: true }
      ],
      availableExtras: [],
      servicePrices: {}
    }
  ],
  eventParts: [],
  servicePrices: {},
  extraCategories: [],
  availableExtras: []
};

async function checkAndCreateConfig() {
  try {
    console.log('🔍 Verificando configuración en base de datos de producción...\n');

    // 1. Verificar si existe
    const existing = await prisma.systemConfig.findUnique({
      where: { key: 'advancedCalculatorConfig' }
    });

    if (existing) {
      console.log('✅ Configuración encontrada en BD de producción');
      console.log('\n📊 Resumen actual:');
      const config = existing.value;
      console.log(`   - Eventos configurados: ${config.eventTypes?.length || 0}`);
      
      if (config.eventTypes) {
        console.log('\n📋 Eventos:');
        config.eventTypes.forEach((event) => {
          const partsCount = event.parts?.length || 0;
          const extrasCount = event.availableExtras?.length || 0;
          console.log(`   ${event.icon} ${event.name}`);
          console.log(`      Partes: ${partsCount}, Extras: ${extrasCount}`);
        });
      }

      console.log('\n✅ La configuración ya existe en producción.');
      console.log('   Si los usuarios no la ven, el problema es en el frontend.');
      
    } else {
      console.log('❌ NO hay configuración en BD de producción');
      console.log('\n📝 Creando configuración por defecto...');
      
      // Crear configuración
      await prisma.systemConfig.create({
        data: {
          key: 'advancedCalculatorConfig',
          value: DEFAULT_CALCULATOR_CONFIG
        }
      });

      console.log('\n✅ Configuración creada exitosamente!');
      console.log(`   - Eventos creados: ${DEFAULT_CALCULATOR_CONFIG.eventTypes.length}`);
      
      console.log('\n📋 Eventos creados:');
      DEFAULT_CALCULATOR_CONFIG.eventTypes.forEach((event) => {
        console.log(`   ${event.icon} ${event.name} (${event.parts.length} partes)`);
      });

      console.log('\n🎯 Acción siguiente:');
      console.log('   1. Vuelve a desplegar el frontend en Vercel');
      console.log('   2. Los usuarios ahora verán la configuración');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.message.includes('connect')) {
      console.log('\n💡 Solución:');
      console.log('   - Verifica que DATABASE_URL esté configurado correctamente');
      console.log('   - Asegúrate de estar conectado a la BD de producción');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
checkAndCreateConfig();
