/**
 * Verificación rápida de servicios
 */

const http = require('http');

function check(port, name) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      console.log(`✅ ${name} (puerto ${port}): FUNCIONANDO`);
      resolve(true);
    });

    req.on('error', () => {
      console.log(`⏳ ${name} (puerto ${port}): Aún arrancando...`);
      resolve(false);
    });

    req.setTimeout(1000, () => {
      req.destroy();
      console.log(`⏳ ${name} (puerto ${port}): Aún arrancando...`);
      resolve(false);
    });
  });
}

async function checkServices() {
  console.log('\n🔍 Verificando servicios...\n');
  
  const backend = await check(3001, 'Backend');
  const frontend = await check(3000, 'Frontend');
  
  console.log('\n' + '='.repeat(50));
  if (backend && frontend) {
    console.log('🎉 ¡SISTEMA LISTO!');
    console.log('\n📱 Abre tu navegador en:');
    console.log('   http://localhost:3000\n');
    console.log('✨ Verás el nuevo diseño con:');
    console.log('   • Logo Resona Events');
    console.log('   • Color corporativo #5ebbff');
    console.log('   • Diseño modernizado\n');
  } else {
    console.log('⏳ Los servicios están iniciando...');
    console.log('   Espera 10 segundos más y vuelve a ejecutar:');
    console.log('   node check-now.js\n');
  }
  console.log('='.repeat(50) + '\n');
}

checkServices();
