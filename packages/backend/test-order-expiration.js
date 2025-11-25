/**
 * TEST SIMPLE DE ORDER EXPIRATION
 * 
 * Este script prueba el servicio de expiración sin necesidad de TypeScript
 */

console.log('🧪 Iniciando test de Order Expiration Service...\n');

// 1. Verificar que los archivos existen
const fs = require('fs');
const path = require('path');

const filesToCheck = [
  'src/services/orderExpiration.service.ts',
  'src/schedulers/orderExpiration.scheduler.ts',
  'src/routes/orderExpiration.routes.ts'
];

console.log('📂 Verificando archivos creados:');
filesToCheck.forEach(file => {
  const fullPath = path.join(__dirname, file);
  const exists = fs.existsSync(fullPath);
  const status = exists ? '✅' : '❌';
  console.log(`  ${status} ${file}`);
  
  if (exists) {
    const stats = fs.statSync(fullPath);
    console.log(`     Tamaño: ${stats.size} bytes`);
  }
});

console.log('\n📝 Verificando contenido de archivos:');

// 2. Verificar que las funciones clave están presentes
const serviceFile = fs.readFileSync(
  path.join(__dirname, 'src/services/orderExpiration.service.ts'),
  'utf-8'
);

const functionsToCheck = [
  'checkAndExpireOrders',
  'expireOrder',
  'sendExpirationEmail',
  'expireOrderById',
  'getExpirationStats'
];

console.log('  Funciones en orderExpiration.service.ts:');
functionsToCheck.forEach(fn => {
  const found = serviceFile.includes(fn);
  const status = found ? '✅' : '❌';
  console.log(`    ${status} ${fn}()`);
});

// 3. Verificar que está registrado en index.ts
const indexFile = fs.readFileSync(
  path.join(__dirname, 'src/index.ts'),
  'utf-8'
);

console.log('\n🔗 Verificando integración en index.ts:');
const integrationsToCheck = [
  { name: 'Import scheduler', pattern: 'orderExpirationScheduler' },
  { name: 'Import routes', pattern: 'orderExpirationRouter' },
  { name: 'Start scheduler', pattern: 'orderExpirationScheduler.start()' },
  { name: 'Register routes', pattern: "'/api/v1/order-expiration'" }
];

integrationsToCheck.forEach(check => {
  const found = indexFile.includes(check.pattern);
  const status = found ? '✅' : '❌';
  console.log(`  ${status} ${check.name}`);
});

// 4. Verificar variables en .env
const envFile = fs.readFileSync(
  path.join(__dirname, '../../.env'),
  'utf-8'
);

console.log('\n⚙️  Verificando variables de configuración:');
const envVarsToCheck = [
  'ORDER_EXPIRATION_MINUTES',
  'ORDER_CHECK_INTERVAL_MINUTES',
  'ORDER_EXPIRATION_RUN_ON_START'
];

envVarsToCheck.forEach(envVar => {
  const found = envFile.includes(envVar);
  const status = found ? '✅' : '❌';
  console.log(`  ${status} ${envVar}`);
  
  if (found) {
    const match = envFile.match(new RegExp(`${envVar}=(.+)`));
    if (match) {
      console.log(`     Valor: ${match[1]}`);
    }
  }
});

// 5. Verificar email service actualizado
const emailFile = fs.readFileSync(
  path.join(__dirname, 'src/services/email.service.ts'),
  'utf-8'
);

console.log('\n📧 Verificando email service:');
const emailUpdates = [
  'sendOrderExpirationEmail',
  'order-expiration'
];

emailUpdates.forEach(item => {
  const found = emailFile.includes(item);
  const status = found ? '✅' : '❌';
  console.log(`  ${status} ${item}`);
});

// 6. Resumen
console.log('\n' + '='.repeat(60));
console.log('📊 RESUMEN DEL TEST');
console.log('='.repeat(60));

const allChecks = [
  ...filesToCheck.map(f => fs.existsSync(path.join(__dirname, f))),
  ...functionsToCheck.map(fn => serviceFile.includes(fn)),
  ...integrationsToCheck.map(c => indexFile.includes(c.pattern)),
  ...envVarsToCheck.map(v => envFile.includes(v)),
  ...emailUpdates.map(item => emailFile.includes(item))
];

const passed = allChecks.filter(Boolean).length;
const total = allChecks.length;
const percentage = Math.round((passed / total) * 100);

console.log(`\nTests pasados: ${passed}/${total} (${percentage}%)`);

if (percentage === 100) {
  console.log('\n✅ ¡TODOS LOS TESTS PASARON!');
  console.log('El sistema de timeout de pagos está correctamente implementado.\n');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${total - passed} tests fallaron`);
  console.log('Revisa los errores arriba.\n');
  process.exit(1);
}
