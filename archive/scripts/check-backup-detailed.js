// Script para verificar DETALLADAMENTE el contenido del backup
const path = require('path');
const fs = require('fs');
const extract = require('extract-zip');

const backupPath = path.join('C:', 'Users', 'Administrator', 'Downloads', 'backup_2025-12-08_21-42-18.zip');
const tempDir = path.join(__dirname, 'temp_backup_detailed');

async function checkBackupDetailed() {
    console.log('📦 Análisis DETALLADO del backup\n');
    console.log('═'.repeat(80));

    try {
        // Crear directorio temporal
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
        fs.mkdirSync(tempDir, { recursive: true });

        // Extraer ZIP
        console.log('📂 Extrayendo backup...');
        await extract(backupPath, { dir: tempDir });

        // Leer database.json
        const dbJsonPath = path.join(tempDir, 'database.json');
        const dbContent = fs.readFileSync(dbJsonPath, 'utf8');
        const backup = JSON.parse(dbContent);

        // Buscar configuración de calculadora
        const calculatorConfig = backup.data.systemConfig.find(
            config => config.key === 'advancedCalculatorConfig'
        );

        if (!calculatorConfig) {
            console.log('❌ NO se encontró la configuración');
            return;
        }

        const config = calculatorConfig.value;

        console.log('\n📊 CONFIGURACIÓN COMPLETA DE LA CALCULADORA');
        console.log('═'.repeat(80));
        console.log(`\nTotal de eventos: ${config.eventTypes?.length || 0}\n`);

        // Analizar CADA evento en detalle
        if (config.eventTypes && config.eventTypes.length > 0) {
            config.eventTypes.forEach((event, index) => {
                console.log('\n' + '─'.repeat(80));
                console.log(`\n${index + 1}. ${event.icon || '📅'} ${event.name}`);
                console.log('─'.repeat(80));
                
                console.log(`\n   📋 Información Básica:`);
                console.log(`      ID: ${event.id}`);
                console.log(`      Color: ${event.color || 'N/A'}`);
                console.log(`      Multiplicador: ${event.multiplier || 1.0}`);
                console.log(`      Activo: ${event.isActive !== false ? 'Sí' : 'No'}`);

                // PARTES del evento
                console.log(`\n   🔧 PARTES (${event.parts?.length || 0}):`);
                if (event.parts && event.parts.length > 0) {
                    event.parts.forEach((part, i) => {
                        console.log(`      ${i + 1}. ${part.name}`);
                        console.log(`         - ID: ${part.id}`);
                        console.log(`         - Descripción: ${part.description || 'N/A'}`);
                        console.log(`         - Requerida: ${part.isRequired ? 'Sí' : 'No'}`);
                        if (part.price) console.log(`         - Precio: €${part.price}`);
                    });
                } else {
                    console.log('      ⚠️ SIN PARTES CONFIGURADAS');
                }

                // EXTRAS disponibles
                console.log(`\n   ✨ EXTRAS DISPONIBLES (${event.availableExtras?.length || 0}):`);
                if (event.availableExtras && event.availableExtras.length > 0) {
                    event.availableExtras.forEach((extra, i) => {
                        console.log(`      ${i + 1}. ${extra.name || extra.id}`);
                        console.log(`         - ID: ${extra.id}`);
                        console.log(`         - Descripción: ${extra.description || 'N/A'}`);
                        if (extra.price) console.log(`         - Precio: €${extra.price}`);
                        if (extra.categoryId) console.log(`         - Categoría: ${extra.categoryId}`);
                    });
                } else {
                    console.log('      ⚠️ SIN EXTRAS CONFIGURADOS');
                }

                // CATEGORÍAS de extras
                console.log(`\n   📁 CATEGORÍAS DE EXTRAS (${event.extraCategories?.length || 0}):`);
                if (event.extraCategories && event.extraCategories.length > 0) {
                    event.extraCategories.forEach((cat, i) => {
                        console.log(`      ${i + 1}. ${cat.name || cat.id}`);
                        console.log(`         - ID: ${cat.id}`);
                        if (cat.description) console.log(`         - Descripción: ${cat.description}`);
                    });
                } else {
                    console.log('      ⚠️ SIN CATEGORÍAS DE EXTRAS');
                }

                // PRECIOS DE SERVICIOS
                console.log(`\n   💰 PRECIOS DE SERVICIOS:`);
                if (event.servicePrices && Object.keys(event.servicePrices).length > 0) {
                    Object.entries(event.servicePrices).forEach(([key, value]) => {
                        console.log(`      - ${key}: €${value}`);
                    });
                } else {
                    console.log('      ℹ️ Sin precios de servicios específicos');
                }
            });

            console.log('\n' + '═'.repeat(80));
            console.log('\n✅ RESUMEN FINAL:');
            console.log('═'.repeat(80));
            
            let totalPartes = 0;
            let totalExtras = 0;
            let eventosConPartes = 0;
            let eventosConExtras = 0;

            config.eventTypes.forEach(event => {
                const partes = event.parts?.length || 0;
                const extras = event.availableExtras?.length || 0;
                totalPartes += partes;
                totalExtras += extras;
                if (partes > 0) eventosConPartes++;
                if (extras > 0) eventosConExtras++;
            });

            console.log(`\n   📊 Estadísticas:`);
            console.log(`      • Total eventos: ${config.eventTypes.length}`);
            console.log(`      • Total partes: ${totalPartes}`);
            console.log(`      • Total extras: ${totalExtras}`);
            console.log(`      • Eventos con partes: ${eventosConPartes}/${config.eventTypes.length}`);
            console.log(`      • Eventos con extras: ${eventosConExtras}/${config.eventTypes.length}`);

            console.log(`\n   ✅ Estado del Backup:`);
            if (totalPartes === 0 && totalExtras === 0) {
                console.log(`      ⚠️ WARNING: El backup tiene eventos pero SIN montajes ni extras`);
                console.log(`      ⚠️ Esto significa que solo tiene la ESTRUCTURA pero no el CONTENIDO`);
                console.log(`\n   💡 Solución:`);
                console.log(`      1. NO restaures este backup`);
                console.log(`      2. Ve a: http://localhost:3000/admin/calculator`);
                console.log(`      3. Configura TODOS los montajes y extras`);
                console.log(`      4. Haz clic en "Guardar Configuración"`);
                console.log(`      5. Crea un NUEVO backup`);
                console.log(`      6. Sube ese nuevo backup a producción`);
            } else if (totalPartes > 0 || totalExtras > 0) {
                console.log(`      ✅ El backup contiene configuración COMPLETA`);
                console.log(`      ✅ Tiene montajes y/o extras configurados`);
                console.log(`      ✅ Es SEGURO restaurarlo en producción`);
            }

        } else {
            console.log('❌ NO hay eventos configurados');
        }

        // Limpiar
        fs.rmSync(tempDir, { recursive: true, force: true });

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    }

    console.log('\n' + '═'.repeat(80));
}

checkBackupDetailed();
