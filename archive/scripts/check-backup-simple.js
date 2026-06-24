// Script simple para verificar backup usando módulos del backend
const path = require('path');
const fs = require('fs');
const extract = require('extract-zip');

const backupPath = path.join('C:', 'Users', 'Administrator', 'Downloads', 'backup_2025-12-08_21-42-18.zip');
const tempDir = path.join(__dirname, 'temp_backup_check');

async function checkBackup() {
    console.log('📦 Analizando backup:', backupPath);
    console.log('');

    try {
        // Verificar que existe
        if (!fs.existsSync(backupPath)) {
            console.log('❌ El archivo no existe');
            process.exit(1);
        }

        // Crear directorio temporal
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
        fs.mkdirSync(tempDir, { recursive: true });

        // Extraer ZIP
        console.log('📂 Extrayendo backup...');
        await extract(backupPath, { dir: tempDir });
        console.log('✅ Backup extraído');
        console.log('');

        // Leer database.json
        const dbJsonPath = path.join(tempDir, 'database.json');
        
        if (!fs.existsSync(dbJsonPath)) {
            console.log('❌ NO se encontró database.json');
            process.exit(1);
        }

        const dbContent = fs.readFileSync(dbJsonPath, 'utf8');
        const backup = JSON.parse(dbContent);

        console.log('📊 Información del backup:');
        console.log(`   Versión: ${backup.version}`);
        console.log(`   Timestamp: ${backup.timestamp}`);
        console.log('');

        // Verificar systemConfig
        console.log('🔍 Verificando systemConfig...');
        
        if (!backup.data.systemConfig || backup.data.systemConfig.length === 0) {
            console.log('❌ NO hay systemConfig en el backup');
            console.log('');
            console.log('📋 Contenido del backup:');
            Object.keys(backup.data).forEach(key => {
                const count = Array.isArray(backup.data[key]) ? backup.data[key].length : 'N/A';
                console.log(`   - ${key}: ${count}`);
            });
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
            console.log('📋 Claves en systemConfig:');
            backup.data.systemConfig.forEach(config => {
                console.log(`   - ${config.key}`);
            });
            console.log('');
            console.log('⚠️ PROBLEMA ENCONTRADO:');
            console.log('   El backup NO tiene la configuración de la calculadora.');
            console.log('');
            console.log('💡 Solución:');
            console.log('   1. Ve al panel admin local: http://localhost:3000/admin/calculator');
            console.log('   2. Configura los montajes y extras');
            console.log('   3. Haz clic en "Guardar Configuración"');
            console.log('   4. Crea un NUEVO backup');
            console.log('   5. Sube ese nuevo backup a producción');
        } else {
            console.log('✅ ¡CONFIGURACIÓN DE CALCULADORA ENCONTRADA!');
            console.log('');

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
                console.log('✅ EL BACKUP CONTIENE LA CONFIGURACIÓN CORRECTAMENTE');
                console.log('');
                console.log('💡 Esto significa que:');
                console.log('   1. El backup es correcto');
                console.log('   2. Si ya lo subiste a producción, necesitas RESTAURARLO');
                console.log('   3. Ve al panel admin de producción');
                console.log('   4. En la sección Backups, haz clic en "Restaurar"');
                console.log('   5. La configuración se aplicará automáticamente');
            } else {
                console.log('⚠️ La configuración está vacía (0 eventos)');
            }
        }

        // Limpiar
        console.log('');
        console.log('🧹 Limpiando archivos temporales...');
        fs.rmSync(tempDir, { recursive: true, force: true });

    } catch (error) {
        console.error('❌ Error:', error.message);
        
        // Limpiar en caso de error
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
        process.exit(1);
    }
}

checkBackup();
