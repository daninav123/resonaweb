// Script para generar secrets seguros de producción
const crypto = require('crypto');

console.log('🔐 GENERANDO SECRETS PARA PRODUCCIÓN\n');
console.log('═'.repeat(60));

// JWT Secret (64 bytes)
const jwtSecret = crypto.randomBytes(48).toString('base64');
console.log('\n📌 JWT_SECRET:');
console.log(jwtSecret);

// JWT Refresh Secret (64 bytes)
const jwtRefreshSecret = crypto.randomBytes(48).toString('base64');
console.log('\n📌 JWT_REFRESH_SECRET:');
console.log(jwtRefreshSecret);

// Grafana Password (32 bytes)
const grafanaPassword = crypto.randomBytes(24).toString('base64');
console.log('\n📌 GRAFANA_ADMIN_PASSWORD:');
console.log(grafanaPassword);

// Session Secret (32 bytes)
const sessionSecret = crypto.randomBytes(24).toString('base64');
console.log('\n📌 SESSION_SECRET (si lo necesitas):');
console.log(sessionSecret);

console.log('\n' + '═'.repeat(60));
console.log('\n✅ Secrets generados correctamente');
console.log('\n⚠️  IMPORTANTE:');
console.log('   1. Copia estos valores a .env.production');
console.log('   2. NUNCA los commitees a Git');
console.log('   3. Guárdalos en un lugar seguro\n');
