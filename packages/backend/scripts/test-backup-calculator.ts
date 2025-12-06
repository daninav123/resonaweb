import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import extract from 'extract-zip';

const prisma = new PrismaClient();

// Configuración de prueba
const TEST_CONFIG = {
  eventTypes: [
    {
      id: 'bodas-test',
      name: 'Bodas Test',
      icon: '💒',
      color: 'pink',
      parts: [
        {
          id: 'ceremonia',
          name: 'Ceremonia',
          description: 'Parte de ceremonia',
          products: []
        },
        {
          id: 'banquete',
          name: 'Banquete',
          description: 'Parte de banquete',
          products: []
        }
      ],
      extraCategories: ['decoracion', 'iluminacion'],
      servicePrices: {
        dj: 500,
        montaje: 200
      }
    },
    {
      id: 'eventos-privados-test',
      name: 'Eventos Privados Test',
      icon: '🎉',
      color: 'purple',
      parts: [
        {
          id: 'setup',
          name: 'Montaje',
          description: 'Montaje del evento',
          products: []
        }
      ],
      extraCategories: ['mobiliario'],
      servicePrices: {
        tecnico: 300
      }
    }
  ]
};

async function testBackupCalculatorConfig() {
  let testPassed = true;
  const errors: string[] = [];

  try {
    console.log('🧪 TEST E2E: BACKUP DE CONFIGURACIÓN DE CALCULADORA\n');
    console.log('═'.repeat(60));
    
    // ========== PASO 1: LIMPIAR CONFIGURACIÓN EXISTENTE ==========
    console.log('\n📌 PASO 1: Limpiando configuración existente...');
    await prisma.systemConfig.deleteMany({
      where: { key: 'advancedCalculatorConfig' }
    });
    console.log('   ✅ Configuración limpiada');

    // ========== PASO 2: GUARDAR CONFIGURACIÓN DE PRUEBA ==========
    console.log('\n📌 PASO 2: Guardando configuración de prueba en BD...');
    const savedConfig = await prisma.systemConfig.create({
      data: {
        key: 'advancedCalculatorConfig',
        value: TEST_CONFIG
      }
    });
    console.log(`   ✅ Configuración guardada con ID: ${savedConfig.id}`);
    console.log(`   📊 Eventos guardados: ${TEST_CONFIG.eventTypes.length}`);
    
    // Verificar que se guardó correctamente
    const verifyConfig = await prisma.systemConfig.findUnique({
      where: { key: 'advancedCalculatorConfig' }
    });
    
    if (!verifyConfig) {
      errors.push('❌ ERROR: Configuración no se guardó en BD');
      testPassed = false;
    } else {
      console.log('   ✅ Verificado: Configuración en BD');
    }

    // ========== PASO 3: CREAR BACKUP ==========
    console.log('\n📌 PASO 3: Creando backup...');
    const timestamp = `test_${Date.now()}`;
    const backupDir = path.join(__dirname, '../../../../backups/database');
    const backupFile = path.join(backupDir, `backup_${timestamp}.zip`);
    const tempDbFile = path.join(backupDir, `temp_${timestamp}.json`);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Extraer datos
    const backup = {
      timestamp: new Date().toISOString(),
      version: '3.0',
      data: {
        systemConfig: await prisma.systemConfig.findMany(),
        companySettings: await prisma.companySettings.findMany(),
        shippingConfig: await prisma.shippingConfig.findMany(),
        users: await prisma.user.findMany(),
        categories: await prisma.category.findMany(),
        extraCategories: await prisma.extraCategory.findMany(),
        products: await prisma.product.findMany(),
        packs: await prisma.pack.findMany(),
        packItems: await prisma.packItem.findMany(),
      }
    };

    console.log(`   📊 systemConfig en backup: ${backup.data.systemConfig.length} registros`);

    // Guardar JSON
    fs.writeFileSync(tempDbFile, JSON.stringify(backup, null, 2));

    // Crear ZIP
    const output = fs.createWriteStream(backupFile);
    const archive = archiver('zip', { zlib: { level: 9 } });

    await new Promise<void>((resolve, reject) => {
      output.on('close', () => {
        fs.unlinkSync(tempDbFile);
        resolve();
      });
      archive.on('error', reject);
      archive.pipe(output);
      archive.file(tempDbFile, { name: 'database.json' });
      archive.finalize();
    });

    console.log(`   ✅ Backup creado: ${backupFile}`);

    // Verificar que el backup contiene systemConfig
    const backupContent = fs.readFileSync(backupFile);
    console.log(`   📦 Tamaño del backup: ${(backupContent.length / 1024).toFixed(2)} KB`);

    // ========== PASO 4: LIMPIAR BD ==========
    console.log('\n📌 PASO 4: Limpiando BD...');
    await prisma.systemConfig.deleteMany({});
    const afterDelete = await prisma.systemConfig.findMany();
    
    if (afterDelete.length !== 0) {
      errors.push('❌ ERROR: BD no se limpió correctamente');
      testPassed = false;
    } else {
      console.log('   ✅ BD limpiada correctamente');
    }

    // ========== PASO 5: RESTAURAR BACKUP ==========
    console.log('\n📌 PASO 5: Restaurando backup...');
    
    // Extraer ZIP
    const tempExtractDir = path.join(backupDir, `temp_extract_${timestamp}`);
    await extract(backupFile, { dir: tempExtractDir });
    
    // Leer database.json
    const dbJsonPath = path.join(tempExtractDir, 'database.json');
    const backupData = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));
    
    console.log(`   📊 systemConfig en archivo: ${backupData.data.systemConfig?.length || 0} registros`);

    // Restaurar systemConfig
    if (backupData.data.systemConfig && backupData.data.systemConfig.length > 0) {
      for (const config of backupData.data.systemConfig) {
        await prisma.systemConfig.create({ data: config });
      }
      console.log(`   ✅ Restaurados ${backupData.data.systemConfig.length} registros de systemConfig`);
    } else {
      errors.push('❌ ERROR: No hay systemConfig en el backup');
      testPassed = false;
    }

    // Limpiar temporal
    fs.rmSync(tempExtractDir, { recursive: true, force: true });

    // ========== PASO 6: VERIFICAR RESTAURACIÓN ==========
    console.log('\n📌 PASO 6: Verificando restauración...');
    
    const restoredConfig = await prisma.systemConfig.findUnique({
      where: { key: 'advancedCalculatorConfig' }
    });

    if (!restoredConfig) {
      errors.push('❌ ERROR: Configuración NO se restauró');
      testPassed = false;
    } else {
      console.log('   ✅ Configuración restaurada correctamente');
      
      // Verificar contenido
      const restoredData: any = restoredConfig.value;
      
      if (!restoredData.eventTypes) {
        errors.push('❌ ERROR: eventTypes no está en la configuración restaurada');
        testPassed = false;
      } else if (restoredData.eventTypes.length !== TEST_CONFIG.eventTypes.length) {
        errors.push(`❌ ERROR: Número de eventos incorrecto. Esperado: ${TEST_CONFIG.eventTypes.length}, Obtenido: ${restoredData.eventTypes.length}`);
        testPassed = false;
      } else {
        console.log(`   ✅ Eventos restaurados: ${restoredData.eventTypes.length}`);
        
        // Verificar cada evento
        for (let i = 0; i < TEST_CONFIG.eventTypes.length; i++) {
          const original = TEST_CONFIG.eventTypes[i];
          const restored = restoredData.eventTypes[i];
          
          if (restored.id !== original.id) {
            errors.push(`❌ ERROR: ID del evento ${i} no coincide`);
            testPassed = false;
          }
          if (restored.name !== original.name) {
            errors.push(`❌ ERROR: Nombre del evento ${i} no coincide`);
            testPassed = false;
          }
          if (restored.parts?.length !== original.parts?.length) {
            errors.push(`❌ ERROR: Partes del evento ${i} no coinciden`);
            testPassed = false;
          } else {
            console.log(`   ✅ Evento "${restored.name}": ${restored.parts.length} partes`);
          }
        }
      }
    }

    // ========== PASO 7: LIMPIAR ARCHIVOS DE TEST ==========
    console.log('\n📌 PASO 7: Limpiando archivos de test...');
    if (fs.existsSync(backupFile)) {
      fs.unlinkSync(backupFile);
      console.log('   ✅ Backup de test eliminado');
    }

    // ========== RESULTADO ==========
    console.log('\n' + '═'.repeat(60));
    if (testPassed && errors.length === 0) {
      console.log('✅ TEST PASADO: El backup incluye correctamente la configuración de calculadora');
      console.log('\n📊 Resumen:');
      console.log('   ✅ Configuración guardada en BD');
      console.log('   ✅ Backup creado con systemConfig');
      console.log('   ✅ Configuración restaurada correctamente');
      console.log('   ✅ Todos los eventos y partes se restauraron');
    } else {
      console.log('❌ TEST FALLIDO');
      console.log('\n🔴 Errores encontrados:');
      errors.forEach(err => console.log(`   ${err}`));
    }
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('\n❌ ERROR EN EL TEST:', error);
    testPassed = false;
  } finally {
    await prisma.$disconnect();
  }

  // Exit code
  process.exit(testPassed ? 0 : 1);
}

testBackupCalculatorConfig();
