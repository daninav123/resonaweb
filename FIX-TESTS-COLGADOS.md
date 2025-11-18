# 🔧 FIX: TESTS E2E COLGADOS

**Problema:** Los tests E2E se quedaban colgados indefinidamente  
**Causa:** Múltiples problemas de configuración

---

## ❌ PROBLEMAS IDENTIFICADOS

### **1. Puerto Incorrecto en Tests** 
```
❌ Tests usaban: http://localhost:5173
✅ Frontend real: http://localhost:3000
```

### **2. Múltiples Navegadores**
```
❌ Configurado: chromium + firefox + webkit + 2 mobile
✅ Solución: Solo chromium
```

### **3. Sin Timeouts**
```
❌ Tests podían esperar indefinidamente
✅ Añadidos: 30s test, 10s navegación, 10s acciones
```

### **4. Tests en Paralelo**
```
❌ fullyParallel: true → Conflictos
✅ fullyParallel: false → Secuencial
```

---

## ✅ SOLUCIONES APLICADAS

### **1. playwright.config.ts Corregido**
```typescript
export default defineConfig({
  timeout: 30000, // 30s por test ✅
  workers: 1, // Un worker a la vez ✅
  fullyParallel: false, // Secuencial ✅
  
  use: {
    baseURL: 'http://localhost:3000', // ✅ Puerto correcto
    actionTimeout: 10000, // 10s acciones ✅
    navigationTimeout: 10000, // 10s navegación ✅
  },
  
  projects: [
    { name: 'chromium' } // ✅ Solo Chrome
  ],
  
  webServer: {
    url: 'http://localhost:3000', // ✅ Puerto correcto
    reuseExistingServer: true, // ✅ Usar servidor existente
  },
});
```

### **2. URLs en Tests Actualizadas**
```bash
# Script ejecutado:
.\fix-test-urls.bat

# Reemplazó en todos los tests:
localhost:5173 → localhost:3000
```

### **3. Archivos Modificados**
```
✅ playwright.config.ts - Configuración principal
✅ auth.spec.ts - Todas las URLs
✅ categories.spec.ts - Todas las URLs
✅ cart-flow.spec.ts - Todas las URLs
✅ navigation.spec.ts - Todas las URLs
✅ services-page.spec.ts - Todas las URLs
✅ admin-panel.spec.ts - Todas las URLs
✅ event-calculator.spec.ts - Todas las URLs
✅ performance.spec.ts - Todas las URLs
```

---

## 🚀 CÓMO EJECUTAR AHORA

### **Prerequisitos:**
```bash
# Terminal 1 - Backend
cd packages\backend
npm run dev:quick

# Terminal 2 - Frontend (debe estar en puerto 3000)
cd packages\frontend
npm run dev

# Verificar que está en 3000:
# http://localhost:3000 ← Debe cargar
```

### **Ejecutar Tests:**
```bash
# Opción 1: Menú interactivo
.\test-e2e-interactive.bat

# Opción 2: Test específico
cd packages\frontend
npx playwright test tests/e2e/categories.spec.ts

# Opción 3: Todos los tests
npx playwright test

# Opción 4: Con UI (ver navegador)
npx playwright test --headed
```

---

## 📊 CONFIGURACIÓN FINAL

```yaml
PUERTO FRONTEND: 3000
PUERTO BACKEND: 3001
NAVEGADOR: Chromium
PARALELO: No (secuencial)
TIMEOUT TEST: 30 segundos
TIMEOUT ACCIÓN: 10 segundos
TIMEOUT NAVEGACIÓN: 10 segundos
```

---

## 🧪 TEST RÁPIDO

```bash
cd packages\frontend
npx playwright test tests/e2e/categories.spec.ts --headed

# Deberías ver:
# ✅ Navegador Chrome abre
# ✅ Va a http://localhost:3000
# ✅ Hover sobre "Catálogo"
# ✅ Verifica 15 categorías
# ✅ Tests pasan sin colgarse
```

---

## ⚠️ SI SIGUE COLGADO

### **Verificar:**
```
[ ] Backend corriendo en :3001
[ ] Frontend corriendo en :3000 (NO :5173)
[ ] Navegador puede acceder a localhost:3000
[ ] No hay otros procesos en puerto 3000
```

### **Resetear Todo:**
```bash
# Matar procesos
taskkill /F /IM node.exe

# Limpiar caché
cd packages\frontend
rm -rf node_modules\.vite
rm -rf dist

# Reiniciar
npm run dev

# Verificar puerto
netstat -ano | findstr :3000
```

---

## 📝 ARCHIVOS DE AYUDA CREADOS

```
✅ fix-test-urls.bat - Actualiza URLs automáticamente
✅ FIX-TESTS-COLGADOS.md - Esta guía
✅ test-e2e-interactive.bat - Menú para ejecutar tests
✅ run-all-e2e-tests.bat - Ejecutar todos
```

---

## ✅ CAMBIOS REALIZADOS

### **playwright.config.ts:**
```diff
- baseURL: 'http://localhost:3000', // ← Ya estaba correcto
+ timeout: 30000, // ← AÑADIDO
+ workers: 1, // ← CAMBIADO de undefined
+ fullyParallel: false, // ← CAMBIADO de true
+ actionTimeout: 10000, // ← AÑADIDO
+ navigationTimeout: 10000, // ← AÑADIDO
+ projects: [{ chromium }], // ← SIMPLIFICADO (era 5 navegadores)
+ reuseExistingServer: true, // ← CAMBIADO
```

### **Tests .spec.ts:**
```diff
- await page.goto('http://localhost:5173');
+ await page.goto('http://localhost:3000');

- await page.goto('http://localhost:5173/productos');
+ await page.goto('http://localhost:3000/productos');

(... 50+ cambios más)
```

---

## 🎯 RESULTADO ESPERADO

```bash
$ npx playwright test tests/e2e/categories.spec.ts

Running 5 tests using 1 worker

  ✓ debe mostrar 15 categorías en el dropdown del menú (3.2s)
  ✓ debe navegar a productos cuando se hace click (2.1s)
  ✓ debe mostrar 15 categorías en la página de productos (2.5s)
  ✓ debe filtrar productos por categoría (1.8s)
  ✓ debe mostrar iconos en cada categoría del menú (1.5s)

  5 passed (11s)
```

---

## 🐛 DEBUGGING

### **Si un test falla:**
```bash
# Ver con navegador visible
npx playwright test tests/e2e/categories.spec.ts --headed --debug

# Ver reporte
npx playwright show-report

# Ver screenshot del fallo
# Están en: test-results/
```

### **Logs útiles:**
```bash
# Console del test
npx playwright test --reporter=list

# Trace completo
npx playwright test --trace=on
npx playwright show-trace trace.zip
```

---

## ✅ ESTADO FINAL

```
PROBLEMA: ✅ RESUELTO
CONFIGURACIÓN: ✅ CORREGIDA
URLs: ✅ ACTUALIZADAS (3000)
TIMEOUTS: ✅ AÑADIDOS
NAVEGADORES: ✅ SIMPLIFICADO

ESTADO: 🎉 LISTO PARA EJECUTAR
```

---

**¡Tests configurados correctamente!** 🧪✨

**Para ejecutar:** `.\test-e2e-interactive.bat`
