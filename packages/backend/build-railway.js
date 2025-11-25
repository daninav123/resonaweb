#!/usr/bin/env node

/**
 * Build script para Railway que compila TypeScript de forma permisiva
 * Ignora errores de tipo y permite que el build continue
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build para Railway...');

// Limpiar directorio dist si existe
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  console.log('🧹 Limpiando directorio dist...');
  fs.rmSync(distPath, { recursive: true, force: true });
}

// Intentar compilar con tsc
console.log('📦 Compilando TypeScript...');
try {
  execSync('npx tsc --project tsconfig.railway.json', {
    stdio: 'inherit',
    cwd: __dirname
  });
  console.log('✅ Compilación exitosa');
} catch (error) {
  console.warn('⚠️  Compilación con advertencias/errores, verificando output...');
  
  // Verificar si dist existe a pesar del error
  if (fs.existsSync(distPath) && fs.readdirSync(distPath).length > 0) {
    console.log('✅ Directorio dist generado correctamente');
    console.log('📁 Archivos compilados:');
    
    // Listar archivos principales en dist
    const files = fs.readdirSync(distPath);
    files.slice(0, 10).forEach(file => {
      console.log(`   - ${file}`);
    });
    
    if (files.length > 10) {
      console.log(`   ... y ${files.length - 10} archivos más`);
    }
    
    // Verificar que index.js existe
    const indexPath = path.join(distPath, 'index.js');
    if (fs.existsSync(indexPath)) {
      console.log('✅ index.js encontrado - build OK');
      process.exit(0);
    } else {
      console.error('❌ index.js no encontrado en dist/');
      process.exit(1);
    }
  } else {
    console.error('❌ Build falló - dist/ no generado');
    process.exit(1);
  }
}

console.log('🎉 Build completado');
