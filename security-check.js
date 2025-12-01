/**
 * Script de Verificación de Seguridad
 * Ejecutar con: node security-check.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 VERIFICACIÓN DE SEGURIDAD - RESONA PROJECT\n');

const issues = [];
const warnings = [];
const passed = [];

// 1. Verificar que .env no está en Git
console.log('1️⃣ Verificando archivos sensibles...');
const gitignore = fs.readFileSync('.gitignore', 'utf8');
if (gitignore.includes('.env')) {
  passed.push('✅ .env está en .gitignore');
} else {
  issues.push('❌ CRÍTICO: .env NO está en .gitignore');
}

if (fs.existsSync('.env')) {
  warnings.push('⚠️  Archivo .env existe (normal en desarrollo)');
}

// 2. Verificar variables de entorno necesarias
console.log('2️⃣ Verificando variables de entorno...');
const envExample = fs.readFileSync('.env.example', 'utf8');
const requiredVars = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'DATABASE_URL',
  'STRIPE_SECRET_KEY'
];

requiredVars.forEach(varName => {
  if (envExample.includes(varName)) {
    passed.push(`✅ Variable ${varName} documentada en .env.example`);
  } else {
    warnings.push(`⚠️  Variable ${varName} no está en .env.example`);
  }
});

// 3. Verificar middleware de seguridad
console.log('3️⃣ Verificando middleware de seguridad...');
const indexFile = fs.readFileSync('packages/backend/src/index.ts', 'utf8');

if (indexFile.includes('helmet')) {
  passed.push('✅ Helmet middleware implementado');
} else {
  issues.push('❌ Helmet middleware NO encontrado');
}

if (indexFile.includes('cors')) {
  passed.push('✅ CORS configurado');
} else {
  issues.push('❌ CORS NO configurado');
}

if (indexFile.includes('rateLimiter')) {
  passed.push('✅ Rate limiting implementado');
} else {
  warnings.push('⚠️  Rate limiting no encontrado');
}

if (indexFile.includes('sanitizeInputs')) {
  passed.push('✅ Sanitización de inputs implementada');
} else {
  warnings.push('⚠️  Sanitización de inputs no encontrada');
}

// 4. Verificar CSP
if (indexFile.includes('contentSecurityPolicy: false')) {
  warnings.push('⚠️  CSP está DESHABILITADA (recomendado habilitar)');
} else if (indexFile.includes('contentSecurityPolicy:')) {
  passed.push('✅ CSP configurada');
} else {
  warnings.push('⚠️  CSP no configurada');
}

// 5. Verificar bcrypt
console.log('4️⃣ Verificando hash de contraseñas...');
const authService = fs.readFileSync('packages/backend/src/services/auth.service.ts', 'utf8');

if (authService.includes('bcrypt.hash')) {
  if (authService.includes('bcrypt.hash(') && authService.match(/bcrypt\.hash\([^,]+,\s*1[0-2]\)/)) {
    passed.push('✅ bcrypt implementado con rounds seguros (10-12)');
  } else {
    warnings.push('⚠️  bcrypt implementado pero verificar rounds de salt');
  }
} else {
  issues.push('❌ bcrypt NO encontrado - contraseñas pueden no estar hasheadas');
}

// 6. Verificar JWT
console.log('5️⃣ Verificando JWT...');
const jwtUtils = fs.readFileSync('packages/backend/src/utils/jwt.utils.ts', 'utf8');

if (jwtUtils.includes('JWT_ACCESS_SECRET')) {
  passed.push('✅ JWT_ACCESS_SECRET usado');
} else {
  issues.push('❌ JWT_ACCESS_SECRET NO encontrado');
}

if (jwtUtils.includes('JWT_REFRESH_SECRET')) {
  passed.push('✅ JWT_REFRESH_SECRET separado para refresh tokens');
} else {
  warnings.push('⚠️  Mismo secreto para access y refresh tokens');
}

// 7. Verificar validación de archivos
console.log('6️⃣ Verificando validación de uploads...');
const uploadMiddleware = fs.readFileSync('packages/backend/src/middleware/upload.middleware.ts', 'utf8');

if (uploadMiddleware.includes('fileFilter')) {
  passed.push('✅ Filtro de tipos de archivo implementado');
} else {
  issues.push('❌ NO hay filtro de tipos de archivo');
}

if (uploadMiddleware.includes('fileSize')) {
  passed.push('✅ Límite de tamaño de archivo configurado');
} else {
  warnings.push('⚠️  Sin límite de tamaño de archivo');
}

// 8. Verificar sanitización
console.log('7️⃣ Verificando sanitización...');
try {
  const sanitizeFile = fs.readFileSync('packages/backend/src/middleware/sanitize.middleware.ts', 'utf8');
  
  if (sanitizeFile.includes('XSS_PATTERNS')) {
    passed.push('✅ Patrones de detección XSS implementados');
  }
  
  if (sanitizeFile.includes('sanitizeString')) {
    passed.push('✅ Función de sanitización de strings');
  }
} catch (e) {
  warnings.push('⚠️  Archivo sanitize.middleware.ts no encontrado');
}

// 9. Verificar blacklist de tokens
console.log('8️⃣ Verificando blacklist de tokens...');
const authMiddleware = fs.readFileSync('packages/backend/src/middleware/auth.middleware.ts', 'utf8');

if (authMiddleware.includes('isBlacklisted')) {
  passed.push('✅ Blacklist de tokens implementada');
} else {
  warnings.push('⚠️  Blacklist de tokens no encontrada');
}

// RESUMEN
console.log('\n' + '='.repeat(60));
console.log('📊 RESUMEN DE VERIFICACIÓN');
console.log('='.repeat(60) + '\n');

if (issues.length > 0) {
  console.log('❌ PROBLEMAS CRÍTICOS:\n');
  issues.forEach(issue => console.log('   ' + issue));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  ADVERTENCIAS:\n');
  warnings.forEach(warning => console.log('   ' + warning));
  console.log('');
}

console.log('✅ VERIFICACIONES PASADAS:\n');
passed.forEach(pass => console.log('   ' + pass));

console.log('\n' + '='.repeat(60));
console.log(`\n📈 RESULTADO:`);
console.log(`   Pasadas: ${passed.length}`);
console.log(`   Advertencias: ${warnings.length}`);
console.log(`   Críticas: ${issues.length}`);

const totalScore = ((passed.length / (passed.length + warnings.length + issues.length)) * 10).toFixed(1);
console.log(`\n🎯 PUNTUACIÓN: ${totalScore}/10`);

if (issues.length === 0 && warnings.length < 3) {
  console.log('\n✅ ESTADO: BUENO - Seguridad aceptable para producción');
} else if (issues.length === 0) {
  console.log('\n⚠️  ESTADO: MEJORABLE - Revisar advertencias antes de producción');
} else {
  console.log('\n❌ ESTADO: REQUIERE ATENCIÓN - Solucionar problemas críticos');
}

console.log('\n📄 Ver informe completo en: INFORME_SEGURIDAD.md\n');

// Exit code
process.exit(issues.length > 0 ? 1 : 0);
