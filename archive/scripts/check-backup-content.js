// Script para verificar el contenido del backup
const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');

// Ruta del backup más reciente
const backupPath = path.join('C:', 'Users', 'Administrator', 'Downloads', 'backup_2025-12-08_21-42-18.zip');

console.log('📦 Analizando backup:', backupPath);
console.log('');

try {
    // Verificar que existe
    if (!fs.existsSync(backupPath)) {
        console.log('❌ El archivo no existe:', backupPath);
        process.exit(1);
    }

    // Leer el ZIP
    const zip = new AdmZip(backupPath);
    const zipEntries = zip.getEntries();

    console.log('📋 Archivos en el ZIP:');
    zipEntries.forEach(entry => {
        console.log(`   - ${entry.entryName} (${entry.header.size} bytes)`);
    });
    console.log('');

    // Buscar database.json
    const dbEntry = zipEntries.find(e => e.entryName === 'database.json');
    
    if (!dbEntry) {
        console.log('❌ NO se encontró database.json en el ZIP');
        process.exit(1);
    }

    console.log('✅ database.json encontrado');
    console.log('');

    // Leer y parsear database.json
    const dbContent = zip.readAsText(dbEntry);
    const backup = JSON.parse(dbContent);

    console.log('📊 Información del backup:');
    console.log(`   Versión: ${backup.version}`);
    console.log(`   Timestamp: ${backup.timestamp}`);
    console.log('');

    // Verificar systemConfig
    console.log('🔍 Verificando systemConfig...');
    
    if (!backup.data.systemConfig) {
        console.log('❌ NO hay systemConfig en el backup');
        process.exit(1);
    }

    console.log(`✅ systemConfig encontrado (${backup.data.systemConfig.length} registros)`);
    console.log('');

    // Buscar configuración de calculadora
    const calculatorConfig = backup.data.systemConfig.find(
        config => config.key === 'advancedCalculatorConfig'
    );

    if (!calculatorConfig) {
        console.log('❌ NO se encontró "advancedCalculatorConfig" en systemConfig');
        console.log('');
        console.log('📋 Claves disponibles en systemConfig:');
        backup.data.systemConfig.forEach(config => {
            console.log(`   - ${config.key}`);
        });
        console.log('');
        console.log('⚠️ PROBLEMA ENCONTRADO:');
        console.log('   El backup NO tiene la configuración de la calculadora.');
        console.log('   Debes guardar la configuración desde el panel admin ANTES de hacer el backup.');
        process.exit(1);
    }

    console.log('✅ ¡CONFIGURACIÓN DE CALCULADORA ENCONTRADA!');
    console.log('');

    // Analizar el contenido
    const configValue = calculatorConfig.value;
    
    console.log('📋 Resumen de la configuración:');
    console.log(`   Eventos: ${configValue.eventTypes?.length || 0}`);
    console.log('');

    if (configValue.eventTypes && configValue.eventTypes.length > 0) {
        console.log('🎯 Eventos configurados:');
        configValue.eventTypes.forEach(event => {
            const partsCount = event.parts?.length || 0;
            const extrasCount = event.availableExtras?.length || 0;
            console.log(`   ${event.icon || '📅'} ${event.name}`);
            console.log(`      Partes: ${partsCount}`);
            console.log(`      Extras: ${extrasCount}`);
        });
        console.log('');
        console.log('✅ EL BACKUP ESTÁ CORRECTO');
        console.log('✅ Contiene la configuración de la calculadora');
        console.log('');
        console.log('💡 Solución:');
        console.log('   1. Sube este backup a producción');
        console.log('   2. Haz clic en "Restaurar" desde el panel admin');
        console.log('   3. La configuración se restaurará automáticamente');
    } else {
        console.log('⚠️ La configuración está vacía');
        console.log('   No hay eventos configurados');
    }

} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
