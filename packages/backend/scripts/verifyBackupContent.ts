import fs from 'fs';
import path from 'path';
import extract from 'extract-zip';

async function verifyBackupContent() {
  try {
    console.log('🔍 VERIFICANDO CONTENIDO DEL ÚLTIMO BACKUP...\n');

    const backupDir = path.join(__dirname, '../../../../backups/database');
    
    // Buscar el backup más reciente
    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('backup_') && f.endsWith('.zip'))
      .sort()
      .reverse();

    if (files.length === 0) {
      console.log('❌ No hay backups disponibles');
      return;
    }

    const latestBackup = files[0];
    const backupPath = path.join(backupDir, latestBackup);

    console.log(`📦 Verificando: ${latestBackup}`);
    console.log(`📍 Ruta: ${backupPath}\n`);

    // Extraer a temporal
    const tempDir = path.join(backupDir, `temp_verify_${Date.now()}`);
    console.log('📂 Extrayendo backup...');
    await extract(backupPath, { dir: tempDir });

    // Leer database.json
    const dbJsonPath = path.join(tempDir, 'database.json');
    if (!fs.existsSync(dbJsonPath)) {
      console.log('❌ No se encontró database.json en el backup');
      return;
    }

    const backupData = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));

    console.log('✅ Backup leído correctamente\n');
    console.log('═'.repeat(60));
    console.log('📊 RESUMEN DEL BACKUP:');
    console.log('═'.repeat(60));

    // Mostrar resumen
    Object.entries(backupData.data).forEach(([key, value]: [string, any]) => {
      const count = Array.isArray(value) ? value.length : 0;
      if (count > 0) {
        console.log(`   ${count > 0 ? '✅' : '⚠️'} ${key}: ${count} registros`);
      }
    });

    // VERIFICAR SYSTEMCONFIG
    console.log('\n' + '═'.repeat(60));
    console.log('🔍 VERIFICANDO SYSTEMCONFIG (CONFIGURACIÓN CALCULADORA):');
    console.log('═'.repeat(60));

    const systemConfigs = backupData.data.systemConfig || [];
    console.log(`\n📊 Total systemConfig: ${systemConfigs.length}`);

    if (systemConfigs.length === 0) {
      console.log('❌ NO HAY systemConfig en el backup');
      console.log('⚠️  La configuración de calculadora NO está incluida');
    } else {
      systemConfigs.forEach((config: any) => {
        console.log(`\n🔑 Key: ${config.key}`);
        
        if (config.key === 'advancedCalculatorConfig') {
          console.log('   ✅ ENCONTRADA: Configuración de calculadora');
          
          const configValue: any = config.value;
          if (configValue.eventTypes) {
            console.log(`   📋 Eventos: ${configValue.eventTypes.length}`);
            configValue.eventTypes.forEach((event: any, i: number) => {
              console.log(`      ${i + 1}. ${event.icon} ${event.name}`);
              console.log(`         - Partes: ${event.parts?.length || 0}`);
              console.log(`         - Montajes: ${event.availablePacks?.length || 0}`);
              console.log(`         - Extras: ${event.availableExtras?.length || 0}`);
              console.log(`         - Categorías Extra: ${event.extraCategories?.length || 0}`);
            });
          } else {
            console.log('   ⚠️  NO tiene eventTypes');
          }
        } else {
          console.log(`   ℹ️  Otro config: ${JSON.stringify(config.value).substring(0, 100)}...`);
        }
      });
    }

    // Limpiar
    fs.rmSync(tempDir, { recursive: true, force: true });

    console.log('\n' + '═'.repeat(60));
    console.log('✅ VERIFICACIÓN COMPLETADA');
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

verifyBackupContent();
