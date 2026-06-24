/**
 * Verificar que los servicios estén corriendo
 */

const http = require('http');

function checkService(port, name) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/health`, (res) => {
      if (res.statusCode === 200) {
        console.log(`✅ ${name} (puerto ${port}): CORRIENDO`);
        resolve(true);
      } else {
        console.log(`⚠️  ${name} (puerto ${port}): Respondió con ${res.statusCode}`);
        resolve(false);
      }
    });

    req.on('error', () => {
      console.log(`❌ ${name} (puerto ${port}): NO DISPONIBLE`);
      resolve(false);
    });

    req.setTimeout(2000, () => {
      req.destroy();
      console.log(`⏱️  ${name} (puerto ${port}): TIMEOUT`);
      resolve(false);
    });
  });
}

async function checkAll() {
  console.log('\n=== VERIFICANDO SERVICIOS ===\n');
  
  const backend = await checkService(3001, 'Backend');
  const frontend = await checkService(3000, 'Frontend');
  
  console.log('\n=== RESUMEN ===\n');
  
  if (backend && frontend) {
    console.log('🎉 ¡TODOS LOS SERVICIOS ESTÁN CORRIENDO!\n');
    console.log('Accede a: http://localhost:3000\n');
  } else {
    console.log('⚠️  Algunos servicios no están disponibles.');
    console.log('Espera unos segundos y vuelve a ejecutar este script.\n');
  }
}

checkAll();
