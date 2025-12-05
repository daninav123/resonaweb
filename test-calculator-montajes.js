const axios = require('axios');

const API_URL = 'http://localhost:3001/api/v1';

async function testCalculator() {
  console.log('🧮 TEST: Endpoint de Calculadora\n');
  console.log('='.repeat(80));
  
  try {
    // 1. PACKS SIN MONTAJES (para catálogo público)
    console.log('\n📦 1. Catálogo Público (/packs sin parámetros)');
    console.log('-'.repeat(80));
    const publicRes = await axios.get(`${API_URL}/packs`);
    const publicPacks = publicRes.data.packs || [];
    
    console.log(`Total packs: ${publicPacks.length}`);
    
    const publicMontajes = publicPacks.filter(p => 
      p.categoryRef?.name === 'Montaje'
    );
    
    console.log(`Packs normales: ${publicPacks.length - publicMontajes.length}`);
    console.log(`Montajes: ${publicMontajes.length}`);
    
    if (publicMontajes.length > 0) {
      console.log('❌ ERROR: Se encontraron montajes en catálogo público');
    } else {
      console.log('✅ CORRECTO: No hay montajes en catálogo público');
    }
    
    // 2. PACKS CON MONTAJES (para calculadora)
    console.log('\n\n🧮 2. Calculadora (/packs?includeMontajes=true)');
    console.log('-'.repeat(80));
    const calcRes = await axios.get(`${API_URL}/packs?includeMontajes=true`);
    const calcPacks = calcRes.data.packs || [];
    
    console.log(`Total packs: ${calcPacks.length}`);
    
    const calcMontajes = calcPacks.filter(p => 
      p.categoryRef?.name === 'Montaje'
    );
    
    const calcPacksNormales = calcPacks.filter(p => 
      p.categoryRef?.name !== 'Montaje'
    );
    
    console.log(`Packs normales: ${calcPacksNormales.length}`);
    console.log(`Montajes: ${calcMontajes.length}`);
    
    if (calcMontajes.length > 0) {
      console.log('✅ CORRECTO: Calculadora tiene montajes');
      console.log('\nMontajes disponibles:');
      calcMontajes.slice(0, 10).forEach((m, i) => {
        console.log(`  ${i+1}. ${m.name} (${m.category})`);
      });
      if (calcMontajes.length > 10) {
        console.log(`  ... y ${calcMontajes.length - 10} más`);
      }
    } else {
      console.log('❌ ERROR: Calculadora NO tiene montajes');
    }
    
    // RESUMEN FINAL
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 RESUMEN FINAL');
    console.log('='.repeat(80));
    
    console.log('\n👤 Usuario Público (catálogo):');
    console.log(`   - ${publicPacks.length} packs (sin montajes)`);
    
    console.log('\n🧮 Calculadora:');
    console.log(`   - ${calcPacksNormales.length} packs normales`);
    console.log(`   - ${calcMontajes.length} montajes`);
    console.log(`   - ${calcPacks.length} total`);
    
    const allCorrect = publicMontajes.length === 0 && calcMontajes.length === 23;
    
    console.log('\n' + '='.repeat(80));
    if (allCorrect) {
      console.log('✅ ¡TODO FUNCIONA CORRECTAMENTE!');
    } else {
      console.log('❌ HAY PROBLEMAS:');
      if (publicMontajes.length > 0) {
        console.log(`   - Montajes en público: ${publicMontajes.length} (esperado 0)`);
      }
      if (calcMontajes.length !== 23) {
        console.log(`   - Montajes en calculadora: ${calcMontajes.length} (esperado 23)`);
      }
    }
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testCalculator();
