import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function migrateCalculatorConfig() {
  try {
    console.log('🔄 Migrando configuración de calculadora a BD...\n');

    // Buscar archivo de configuración local (si existe)
    const configPath = path.join(__dirname, '../../uploads/calculator-config.json');
    let configToMigrate: any = null;

    if (fs.existsSync(configPath)) {
      console.log('📁 Encontrado archivo local de configuración');
      const fileContent = fs.readFileSync(configPath, 'utf8');
      configToMigrate = JSON.parse(fileContent);
    } else {
      console.log('⚠️ No hay archivo local de configuración');
      console.log('📝 Usando configuración por defecto...');
      
      // Usar configuración por defecto
      configToMigrate = {
        eventTypes: [
          {
            id: 'bodas',
            name: 'Bodas',
            icon: '💒',
            color: 'pink',
            parts: [],
            extraCategories: [],
            servicePrices: {}
          },
          {
            id: 'eventos-privados',
            name: 'Eventos Privados',
            icon: '🎉',
            color: 'purple',
            parts: [],
            extraCategories: [],
            servicePrices: {}
          }
        ]
      };
    }

    // Guardar en BD
    const result = await prisma.systemConfig.upsert({
      where: { key: 'advancedCalculatorConfig' },
      update: { value: configToMigrate },
      create: {
        key: 'advancedCalculatorConfig',
        value: configToMigrate
      }
    });

    console.log('✅ Configuración migrada a BD correctamente');
    console.log(`📊 Eventos guardados: ${configToMigrate.eventTypes?.length || 0}`);

    // Mostrar resumen
    if (configToMigrate.eventTypes) {
      console.log('\n📋 Eventos migrados:');
      configToMigrate.eventTypes.forEach((event: any) => {
        console.log(`   - ${event.icon} ${event.name}`);
      });
    }

  } catch (error) {
    console.error('❌ Error en migración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateCalculatorConfig();
