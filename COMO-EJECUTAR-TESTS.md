# 🧪 CÓMO EJECUTAR LOS TESTS E2E

## ✅ CONFIGURACIÓN CONFIRMADA

```
✅ Frontend: http://localhost:3000
✅ Backend:  http://localhost:3001
```

---

## 📋 PASOS PARA EJECUTAR TESTS

### **PASO 1: Iniciar Backend** (Terminal 1)

```bash
cd packages\backend
npm run dev:quick
```

**Verificar:** Debe mostrar "Server running on port 3001"

---

### **PASO 2: Iniciar Frontend** (Terminal 2)

```bash
cd packages\frontend
npm run dev
```

**Verificar:** 
- Debe mostrar "Local: http://localhost:3000"
- Abre http://localhost:3000 en navegador y verifica que carga

---

### **PASO 3: Ejecutar Tests** (Terminal 3)

#### **Opción A: Script rápido** (Recomendado)
```bash
.\TEST-QUICK.bat
```

#### **Opción B: Comando directo**
```bash
cd packages\frontend
npx playwright test tests/e2e/categories.spec.ts --config=playwright.config.simple.ts --headed
```

#### **Opción C: Sin navegador visible**
```bash
cd packages\frontend
npx playwright test tests/e2e/categories.spec.ts --config=playwright.config.simple.ts
```

---

## 🎯 TESTS DISPONIBLES

### **Test de Categorías (5 tests)**
```bash
npx playwright test tests/e2e/categories.spec.ts --config=playwright.config.simple.ts
```
Verifica que las 15 categorías funcionan correctamente.

### **Test de Autenticación (11 tests)**
```bash
npx playwright test tests/e2e/auth.spec.ts --config=playwright.config.simple.ts
```

### **Test de Carrito (7 tests)**
```bash
npx playwright test tests/e2e/cart-flow.spec.ts --config=playwright.config.simple.ts
```

### **Test de Navegación (9 tests)**
```bash
npx playwright test tests/e2e/navigation.spec.ts --config=playwright.config.simple.ts
```

### **Test de Admin (12 tests)**
```bash
npx playwright test tests/e2e/admin-panel.spec.ts --config=playwright.config.simple.ts
```

### **TODOS los tests**
```bash
npx playwright test --config=playwright.config.simple.ts
```

---

## ⚡ FORMA MÁS RÁPIDA

### **Usa start-admin.bat para iniciar todo**
```bash
.\start-admin.bat
```

Esto inicia:
1. Backend en 3001
2. Frontend en 3000
3. Abre navegador en http://localhost:3000/login

Luego en otra terminal:
```bash
.\TEST-QUICK.bat
```

---

## 🐛 SI LOS TESTS SE CUELGAN

### **Verificación rápida:**

1. **¿Frontend está corriendo en 3000?**
```bash
# Abre en navegador:
http://localhost:3000
```

2. **¿Backend está corriendo en 3001?**
```bash
# Abre en navegador:
http://localhost:3001/api/v1/health
```

3. **¿Puertos están ocupados?**
```bash
netstat -ano | findstr :3000
netstat -ano | findstr :3001
```

4. **Si algo está mal, reinicia:**
```bash
# Mata procesos node
taskkill /F /IM node.exe

# Reinicia con:
.\start-admin.bat
```

---

## 📊 VER REPORTES

Después de ejecutar tests:

```bash
cd packages\frontend
npx playwright show-report
```

---

## 🎯 CONFIGURACIÓN DE PLAYWRIGHT

Los tests usan `playwright.config.simple.ts`:
- Solo Chromium
- Asume servidor ya está corriendo
- Timeouts: 60s test, 15s navegación
- No intenta levantar servidor automáticamente

---

## ✅ RESULTADO ESPERADO

```bash
$ npx playwright test tests/e2e/categories.spec.ts --config=playwright.config.simple.ts

Running 5 tests using 1 worker

  ✓ debe mostrar 15 categorías en el dropdown (2.5s)
  ✓ debe navegar a productos al click (1.8s)
  ✓ debe mostrar 15 categorías en productos (2.2s)
  ✓ debe filtrar por categoría (1.5s)
  ✓ debe mostrar iconos en categorías (1.3s)

  5 passed (10s)
```

---

## 🚨 ERRORES COMUNES

### **Error: "Target page, context or browser has been closed"**
```
SOLUCIÓN: El servidor no está corriendo. Inicia con .\start-admin.bat
```

### **Error: "Timeout waiting for"**
```
SOLUCIÓN: 
1. Verifica que http://localhost:3000 carga en navegador
2. Aumenta timeout en playwright.config.simple.ts
```

### **Error: "net::ERR_CONNECTION_REFUSED"**
```
SOLUCIÓN: Frontend o backend no están corriendo
1. cd packages\backend && npm run dev:quick
2. cd packages\frontend && npm run dev
```

---

## 📝 NOTAS

- **Puerto Frontend:** 3000 (configurado en vite.config.ts)
- **Puerto Backend:** 3001 (configurado en .env y index.ts)
- **Solo 2 puertos en este proyecto**
- Los tests usan configuración simple (playwright.config.simple.ts)
- No confundir con otros proyectos que usan 5173

---

**¡Tests listos para ejecutar!** 🧪✨

**Comando rápido:** `.\TEST-QUICK.bat`
