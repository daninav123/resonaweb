/**
 * CORRECCIÓN AUTOMÁTICA DE TODOS LOS ERRORES DEL SISTEMA
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m',
};

class SystemFixer {
  constructor() {
    this.fixes = [];
    this.errors = [];
    this.warnings = [];
  }

  // 1. CORREGIR ERRORES DE REACT ROUTER
  async fixReactRouter() {
    console.log(`\n${colors.cyan}🔧 1. Corrigiendo React Router Warnings${colors.reset}`);
    console.log('-'.repeat(60));

    const appPath = path.join(__dirname, 'packages/frontend/src/App.tsx');
    
    try {
      let content = fs.readFileSync(appPath, 'utf8');
      
      // Buscar y reemplazar BrowserRouter
      if (content.includes('<Router>') && !content.includes('future=')) {
        content = content.replace(
          '<Router>',
          '<Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>'
        );
        fs.writeFileSync(appPath, content);
        console.log(`  ${colors.green}✅ React Router future flags agregados${colors.reset}`);
        this.fixes.push('React Router future flags');
      } else {
        console.log(`  ${colors.yellow}⚠️  React Router ya configurado${colors.reset}`);
      }
    } catch (error) {
      console.log(`  ${colors.red}❌ Error: ${error.message}${colors.reset}`);
      this.errors.push(`React Router: ${error.message}`);
    }
  }

  // 2. CORREGIR SERVICIOS DEL FRONTEND
  async fixFrontendServices() {
    console.log(`\n${colors.cyan}🔧 2. Corrigiendo Servicios del Frontend${colors.reset}`);
    console.log('-'.repeat(60));

    const productServicePath = path.join(__dirname, 'packages/frontend/src/services/product.service.ts');
    
    try {
      let content = fs.readFileSync(productServicePath, 'utf8');
      let modified = false;

      // Lista de métodos a corregir
      const methodsToFix = [
        {
          name: 'getProducts',
          old: 'return api.get(`/products${queryString ? `?${queryString}` : \'\'}`);',
          new: 'const response: any = await api.get(`/products${queryString ? `?${queryString}` : \'\'}`);\n    return response?.data || [];'
        },
        {
          name: 'getFeaturedProducts',
          old: 'return api.get(`/products/featured?limit=${limit}`);',
          new: 'const response: any = await api.get(`/products/featured?limit=${limit}`);\n    return response?.data || [];'
        },
        {
          name: 'getCategories',
          old: 'return api.get(\'/products/categories\');',
          new: 'const response: any = await api.get(\'/products/categories\');\n    return response?.data || [];'
        }
      ];

      for (const method of methodsToFix) {
        if (content.includes(method.old)) {
          content = content.replace(method.old, method.new);
          modified = true;
          console.log(`  ${colors.green}✅ Método ${method.name} corregido${colors.reset}`);
        }
      }

      if (modified) {
        fs.writeFileSync(productServicePath, content);
        this.fixes.push('Frontend services');
      } else {
        console.log(`  ${colors.yellow}⚠️  Servicios ya corregidos${colors.reset}`);
      }
    } catch (error) {
      console.log(`  ${colors.red}❌ Error: ${error.message}${colors.reset}`);
      this.errors.push(`Frontend services: ${error.message}`);
    }
  }

  // 3. VERIFICAR Y CREAR ARCHIVOS .ENV
  async fixEnvironmentFiles() {
    console.log(`\n${colors.cyan}🔧 3. Verificando Variables de Entorno${colors.reset}`);
    console.log('-'.repeat(60));

    // Frontend .env
    const frontendEnvPath = path.join(__dirname, 'packages/frontend/.env');
    const frontendEnvContent = `VITE_API_URL=http://localhost:3001/api/v1
VITE_STRIPE_PUBLIC_KEY=pk_test_51234567890
VITE_GOOGLE_MAPS_KEY=your-google-maps-key
`;

    if (!fs.existsSync(frontendEnvPath)) {
      fs.writeFileSync(frontendEnvPath, frontendEnvContent);
      console.log(`  ${colors.green}✅ Frontend .env creado${colors.reset}`);
      this.fixes.push('Frontend .env');
    } else {
      console.log(`  ${colors.yellow}⚠️  Frontend .env ya existe${colors.reset}`);
    }

    // Backend .env check
    const backendEnvPath = path.join(__dirname, 'packages/backend/.env');
    if (fs.existsSync(backendEnvPath)) {
      console.log(`  ${colors.green}✅ Backend .env existe${colors.reset}`);
    } else {
      console.log(`  ${colors.red}❌ Backend .env no encontrado${colors.reset}`);
      this.errors.push('Backend .env missing');
    }
  }

  // 4. INSTALAR DEPENDENCIAS FALTANTES
  async fixDependencies() {
    console.log(`\n${colors.cyan}🔧 4. Verificando Dependencias${colors.reset}`);
    console.log('-'.repeat(60));

    const packages = [
      { name: 'react-hot-toast', path: 'packages/frontend' },
      { name: '@tanstack/react-query', path: 'packages/frontend' },
      { name: 'axios', path: 'packages/frontend' },
      { name: 'cross-env', path: 'packages/backend' },
    ];

    for (const pkg of packages) {
      const packageJsonPath = path.join(__dirname, pkg.path, 'package.json');
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        if (deps[pkg.name]) {
          console.log(`  ${colors.green}✅ ${pkg.name} instalado${colors.reset}`);
        } else {
          console.log(`  ${colors.yellow}⚠️  ${pkg.name} no encontrado${colors.reset}`);
          this.warnings.push(`Dependency missing: ${pkg.name}`);
        }
      } catch (error) {
        console.log(`  ${colors.red}❌ Error verificando ${pkg.name}${colors.reset}`);
      }
    }
  }

  // 5. CREAR SCRIPTS DE INICIO
  async createStartupScripts() {
    console.log(`\n${colors.cyan}🔧 5. Creando Scripts de Inicio${colors.reset}`);
    console.log('-'.repeat(60));

    // Script completo de inicio
    const startAllScript = `#!/bin/bash
echo "🚀 Iniciando Sistema Completo..."

# Backend
echo "▶️  Iniciando Backend..."
cd packages/backend
npm run dev:quick &
BACKEND_PID=$!

# Esperar que el backend esté listo
sleep 5

# Frontend
echo "▶️  Iniciando Frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "✅ Sistema iniciado"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

wait
`;

    const startScriptPath = path.join(__dirname, 'start-all.sh');
    if (!fs.existsSync(startScriptPath)) {
      fs.writeFileSync(startScriptPath, startAllScript);
      fs.chmodSync(startScriptPath, '755');
      console.log(`  ${colors.green}✅ Script start-all.sh creado${colors.reset}`);
      this.fixes.push('Startup scripts');
    }

    // Verificar scripts .bat existentes
    const batFiles = ['start-admin.bat', 'stop-all.bat', 'run-tests.bat'];
    for (const file of batFiles) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        console.log(`  ${colors.green}✅ ${file} existe${colors.reset}`);
      } else {
        console.log(`  ${colors.yellow}⚠️  ${file} no encontrado${colors.reset}`);
      }
    }
  }

  // 6. VERIFICAR BASE DE DATOS
  async checkDatabase() {
    console.log(`\n${colors.cyan}🔧 6. Verificando Base de Datos${colors.reset}`);
    console.log('-'.repeat(60));

    return new Promise((resolve) => {
      exec('docker ps --filter "name=resona-db" --format "{{.Status}}"', (error, stdout) => {
        if (error || !stdout.includes('Up')) {
          console.log(`  ${colors.red}❌ PostgreSQL no está corriendo${colors.reset}`);
          console.log(`  ${colors.yellow}→ Ejecutar: docker-compose up -d${colors.reset}`);
          this.errors.push('PostgreSQL not running');
        } else {
          console.log(`  ${colors.green}✅ PostgreSQL corriendo${colors.reset}`);
        }
        resolve();
      });
    });
  }

  // 7. LIMPIAR Y REGENERAR
  async cleanAndRegenerate() {
    console.log(`\n${colors.cyan}🔧 7. Limpieza y Regeneración${colors.reset}`);
    console.log('-'.repeat(60));

    // Limpiar node_modules si hay problemas
    const checkModules = [
      'packages/backend/node_modules',
      'packages/frontend/node_modules'
    ];

    for (const dir of checkModules) {
      const fullPath = path.join(__dirname, dir);
      if (fs.existsSync(fullPath)) {
        console.log(`  ${colors.green}✅ ${dir} existe${colors.reset}`);
      } else {
        console.log(`  ${colors.yellow}⚠️  ${dir} no encontrado - requiere npm install${colors.reset}`);
        this.warnings.push(`Missing: ${dir}`);
      }
    }
  }

  // RESUMEN
  printSummary() {
    console.log('\n' + '='.repeat(70));
    console.log(`${colors.cyan}${colors.bold}📊 RESUMEN DE CORRECCIONES${colors.reset}`);
    console.log('='.repeat(70));

    if (this.fixes.length > 0) {
      console.log(`\n${colors.green}${colors.bold}✅ CORRECCIONES APLICADAS:${colors.reset}`);
      this.fixes.forEach(fix => {
        console.log(`  ${colors.green}• ${fix}${colors.reset}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log(`\n${colors.yellow}${colors.bold}⚠️  ADVERTENCIAS:${colors.reset}`);
      this.warnings.forEach(warning => {
        console.log(`  ${colors.yellow}• ${warning}${colors.reset}`);
      });
    }

    if (this.errors.length > 0) {
      console.log(`\n${colors.red}${colors.bold}❌ ERRORES ENCONTRADOS:${colors.reset}`);
      this.errors.forEach(error => {
        console.log(`  ${colors.red}• ${error}${colors.reset}`);
      });
    }

    console.log('\n' + '='.repeat(70));

    if (this.errors.length === 0) {
      console.log(`\n${colors.green}${colors.bold}🎉 ¡SISTEMA CORREGIDO EXITOSAMENTE!${colors.reset}`);
      console.log(`${colors.green}Todas las correcciones han sido aplicadas.${colors.reset}\n`);
      
      console.log(`${colors.cyan}${colors.bold}📋 PRÓXIMOS PASOS:${colors.reset}`);
      console.log(`  1. Reiniciar el backend: ${colors.yellow}cd packages/backend && npm run dev:quick${colors.reset}`);
      console.log(`  2. Reiniciar el frontend: ${colors.yellow}cd packages/frontend && npm run dev${colors.reset}`);
      console.log(`  3. O usar: ${colors.yellow}start-admin.bat${colors.reset} (Windows)`);
      console.log(`  4. Verificar en el navegador: ${colors.yellow}http://localhost:3000${colors.reset}\n`);
    } else {
      console.log(`\n${colors.red}${colors.bold}⚠️  HAY PROBLEMAS QUE REQUIEREN ATENCIÓN MANUAL${colors.reset}`);
      console.log(`${colors.yellow}Revisa los errores anteriores y sigue las instrucciones.${colors.reset}\n`);
    }
  }

  // Ejecutar todas las correcciones
  async runAllFixes() {
    console.log('\n' + '='.repeat(70));
    console.log(`${colors.cyan}${colors.bold}🔧 CORRECCIÓN AUTOMÁTICA DEL SISTEMA${colors.reset}`);
    console.log('='.repeat(70));

    await this.fixReactRouter();
    await this.fixFrontendServices();
    await this.fixEnvironmentFiles();
    await this.fixDependencies();
    await this.createStartupScripts();
    await this.checkDatabase();
    await this.cleanAndRegenerate();
    
    this.printSummary();

    // Guardar reporte
    const report = {
      timestamp: new Date().toISOString(),
      fixes: this.fixes,
      warnings: this.warnings,
      errors: this.errors
    };

    fs.writeFileSync(
      path.join(__dirname, 'fix-report.json'),
      JSON.stringify(report, null, 2)
    );

    return this.errors.length === 0;
  }
}

// Ejecutar
console.log('\n⏳ Iniciando corrección automática...\n');
const fixer = new SystemFixer();
fixer.runAllFixes().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error(`${colors.red}Error:${colors.reset}`, error);
  process.exit(1);
});
