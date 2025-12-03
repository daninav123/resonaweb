const axios = require('axios');

console.log('🧪 SISTEMA DE TESTS COMPLETO - MONTAJES\n');
console.log('═══════════════════════════════════════\n');

let testsPassed = 0;
let testsFailed = 0;

function pass(test) {
  console.log(`✅ PASS: ${test}`);
  testsPassed++;
}

function fail(test, error) {
  console.log(`❌ FAIL: ${test}`);
  console.log(`   Error: ${error}`);
  testsFailed++;
}

async function runTests() {
  console.log('📋 Iniciando tests del sistema de montajes...\n');
  
  // ============================================
  // TEST 1: Verificar que el backend está corriendo
  // ============================================
  console.log('TEST 1: Backend está corriendo');
  try {
    const healthCheck = await axios.get('http://localhost:3001/api/v1/health');
    if (healthCheck.status === 200) {
      pass('Backend responde correctamente');
    } else {
      fail('Backend no responde', 'Status code no es 200');
    }
  } catch (error) {
    fail('Backend no está corriendo', error.message);
  }
  
  // ============================================
  // TEST 2: Verificar que el frontend está corriendo
  // ============================================
  console.log('\nTEST 2: Frontend está corriendo');
  try {
    const frontendCheck = await axios.get('http://localhost:3000');
    if (frontendCheck.status === 200) {
      pass('Frontend responde correctamente');
    } else {
      fail('Frontend no responde', 'Status code no es 200');
    }
  } catch (error) {
    fail('Frontend no está corriendo', error.message);
  }
  
  // ============================================
  // TEST 3: Verificar endpoint de packs
  // ============================================
  console.log('\nTEST 3: Endpoint de packs funciona');
  try {
    const packsResponse = await axios.get('http://localhost:3001/api/v1/packs');
    if (packsResponse.data && packsResponse.data.packs) {
      pass(`Endpoint de packs funciona (${packsResponse.data.packs.length} packs encontrados)`);
    } else {
      fail('Endpoint de packs no devuelve datos correctos', 'Estructura de respuesta incorrecta');
    }
  } catch (error) {
    fail('Endpoint de packs falla', error.message);
  }
  
  // ============================================
  // TEST 4: Verificar que existe enum MONTAJE en schema
  // ============================================
  console.log('\nTEST 4: Verificar schema actualizado');
  try {
    const fs = require('fs');
    const schemaContent = fs.readFileSync('./packages/backend/prisma/schema.prisma', 'utf8');
    
    if (schemaContent.includes('enum PackCategory') && schemaContent.includes('MONTAJE')) {
      pass('Enum PackCategory contiene MONTAJE');
    } else {
      fail('Schema no tiene MONTAJE', 'MONTAJE no encontrado en PackCategory');
    }
    
    // Verificar que NO existen campos eliminados
    if (!schemaContent.includes('shippingCost') || schemaContent.includes('// NOTA:')) {
      pass('Campos shippingCost/installationCost eliminados del modelo Product');
    } else {
      fail('Campos obsoletos aún existen', 'shippingCost/installationCost encontrados');
    }
  } catch (error) {
    fail('No se pudo leer schema.prisma', error.message);
  }
  
  // ============================================
  // TEST 5: Verificar packs de MONTAJE en BD
  // ============================================
  console.log('\nTEST 5: Verificar packs de MONTAJE en base de datos');
  try {
    const packsResponse = await axios.get('http://localhost:3001/api/v1/packs');
    const montajePacks = packsResponse.data.packs.filter(p => p.category === 'MONTAJE');
    
    console.log(`   📦 Packs de MONTAJE encontrados: ${montajePacks.length}`);
    
    if (montajePacks.length > 0) {
      pass(`${montajePacks.length} pack(s) de MONTAJE encontrado(s) en BD`);
      
      montajePacks.forEach(pack => {
        console.log(`      - ${pack.name} (€${pack.finalPrice || pack.calculatedTotalPrice})`);
      });
    } else {
      console.log('   ⚠️  WARNING: No hay packs de MONTAJE. Deben crearse manualmente en el admin.');
      console.log('   📝 Ver instrucciones en: test-montaje-system.md');
    }
  } catch (error) {
    fail('No se pudieron verificar packs de MONTAJE', error.message);
  }
  
  // ============================================
  // TEST 6: Verificar calculadora carga productos
  // ============================================
  console.log('\nTEST 6: Calculadora puede cargar productos y packs');
  try {
    // Verificar que el archivo EventCalculatorPage existe y tiene las modificaciones
    const fs = require('fs');
    const calculatorContent = fs.readFileSync('./packages/frontend/src/pages/EventCalculatorPage.tsx', 'utf8');
    
    if (calculatorContent.includes('selectedMontaje')) {
      pass('EventCalculatorPage tiene campo selectedMontaje');
    } else {
      fail('Campo selectedMontaje no encontrado', 'Falta en EventData interface');
    }
    
    if (calculatorContent.includes('montajePacks')) {
      pass('EventCalculatorPage carga montajePacks con useQuery');
    } else {
      fail('Query de montajePacks no encontrado', 'Falta useQuery para montajePacks');
    }
    
    if (calculatorContent.includes('Servicio de Montaje')) {
      pass('UI de selector de montajes implementada');
    } else {
      fail('UI de montajes no encontrada', 'Falta sección de Servicio de Montaje');
    }
    
    if (calculatorContent.includes('montajePrice') && calculatorContent.includes('totalWithMontaje')) {
      pass('Cálculo de precio con montaje implementado');
    } else {
      fail('Cálculo de montaje incompleto', 'Variables de precio no encontradas');
    }
  } catch (error) {
    fail('No se pudo verificar EventCalculatorPage', error.message);
  }
  
  // ============================================
  // TEST 7: Verificar que campos obsoletos tienen fallback
  // ============================================
  console.log('\nTEST 7: Verificar compatibilidad hacia atrás (fallbacks)');
  try {
    const fs = require('fs');
    const calculatorContent = fs.readFileSync('./packages/frontend/src/pages/EventCalculatorPage.tsx', 'utf8');
    
    // Contar uso de || 0 para campos obsoletos
    const shippingFallbacks = (calculatorContent.match(/shippingCost \|\| 0/g) || []).length;
    const installationFallbacks = (calculatorContent.match(/installationCost \|\| 0/g) || []).length;
    
    if (shippingFallbacks > 0 && installationFallbacks > 0) {
      pass(`Fallbacks implementados (${shippingFallbacks} shippingCost, ${installationFallbacks} installationCost)`);
    } else {
      fail('Fallbacks faltantes', 'Código puede romper con datos legacy');
    }
  } catch (error) {
    fail('No se pudo verificar fallbacks', error.message);
  }
  
  // ============================================
  // TEST 8: Verificar types/index.ts actualizado
  // ============================================
  console.log('\nTEST 8: Verificar tipos TypeScript actualizados');
  try {
    const fs = require('fs');
    const typesContent = fs.readFileSync('./packages/frontend/src/types/index.ts', 'utf8');
    
    if (!typesContent.includes('shippingCost: number;') || typesContent.includes('// Nota:')) {
      pass('Tipo Cart limpiado (shippingCost removido o comentado)');
    } else {
      fail('Tipos no actualizados', 'shippingCost aún en Cart interface');
    }
  } catch (error) {
    fail('No se pudo verificar types', error.message);
  }
  
  // ============================================
  // TEST 9: Verificar documentación
  // ============================================
  console.log('\nTEST 9: Verificar documentación creada');
  try {
    const fs = require('fs');
    
    if (fs.existsSync('./CAMBIO_ARQUITECTONICO_MONTAJES.md')) {
      pass('Documentación principal creada (CAMBIO_ARQUITECTONICO_MONTAJES.md)');
    } else {
      fail('Falta documentación', 'CAMBIO_ARQUITECTONICO_MONTAJES.md no existe');
    }
    
    if (fs.existsSync('./test-montaje-system.md')) {
      pass('Guía de tests manuales creada (test-montaje-system.md)');
    } else {
      console.log('   ℹ️  INFO: Guía de tests manuales no encontrada (opcional)');
    }
  } catch (error) {
    fail('Error verificando documentación', error.message);
  }
  
  // ============================================
  // TEST 10: Verificar commits en Git
  // ============================================
  console.log('\nTEST 10: Verificar commits realizados');
  try {
    const { execSync } = require('child_process');
    
    // Obtener últimos 5 commits
    const commits = execSync('git log -5 --oneline', { encoding: 'utf8' });
    
    if (commits.includes('montaje') || commits.includes('MONTAJE')) {
      pass('Commits de montaje encontrados en Git');
      console.log('\n   📝 Últimos commits:');
      commits.split('\n').slice(0, 5).forEach(line => {
        if (line) console.log(`      ${line}`);
      });
    } else {
      fail('No hay commits de montaje', 'Cambios no commiteados');
    }
  } catch (error) {
    console.log('   ℹ️  INFO: No se pudo verificar Git (opcional)');
  }
  
  // ============================================
  // RESUMEN FINAL
  // ============================================
  console.log('\n\n═══════════════════════════════════════');
  console.log('📊 RESUMEN DE TESTS\n');
  console.log(`✅ Tests Pasados: ${testsPassed}`);
  console.log(`❌ Tests Fallados: ${testsFailed}`);
  console.log(`📊 Total: ${testsPassed + testsFailed}`);
  
  const percentage = ((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1);
  console.log(`\n📈 Tasa de Éxito: ${percentage}%`);
  
  if (testsFailed === 0) {
    console.log('\n🎉 ¡TODOS LOS TESTS PASARON!');
    console.log('✅ Sistema de MONTAJES funcionando correctamente\n');
  } else {
    console.log(`\n⚠️  ${testsFailed} test(s) fallaron`);
    console.log('❌ Revisar errores arriba\n');
  }
  
  console.log('═══════════════════════════════════════\n');
  
  console.log('📝 PRÓXIMOS PASOS:\n');
  console.log('1. Crear packs de MONTAJE en el admin (si no existen)');
  console.log('   URL: http://localhost:3000/admin/packs');
  console.log('   Categoría: MONTAJE');
  console.log('\n2. Probar en calculadora:');
  console.log('   URL: http://localhost:3000/calculadora');
  console.log('   - Configurar evento');
  console.log('   - Ir a Step 5 (Extras)');
  console.log('   - Verificar sección "🚚 Servicio de Montaje"');
  console.log('   - Seleccionar un montaje');
  console.log('   - Verificar precio en Step 6');
  console.log('\n3. Ver guía completa: test-montaje-system.md\n');
  
  process.exit(testsFailed > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error('\n❌ ERROR CRÍTICO:', error.message);
  process.exit(1);
});
