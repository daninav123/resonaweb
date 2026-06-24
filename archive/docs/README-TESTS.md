# 🧪 CÓMO EJECUTAR LOS TESTS E2E - GUÍA RÁPIDA

## ⚡ OPCIÓN AUTOMÁTICA (MÁS FÁCIL)

### **UN SOLO COMANDO:**

```bash
.\INICIAR-Y-TESTEAR.bat
```

Este script hace TODO automáticamente:
1. ✅ Mata procesos anteriores
2. ✅ Limpia caché de Vite
3. ✅ Inicia Backend (puerto 3001)
4. ✅ Inicia Frontend (puerto 3000)
5. ✅ Abre navegador para verificar
6. ✅ Ejecuta tests E2E
7. ✅ Muestra resultados

**Tiempo total:** ~30-40 segundos

---

## 📋 QUÉ VA A PASAR

Cuando ejecutes `.\INICIAR-Y-TESTEAR.bat`:

### **1. Se abrirán 2 ventanas nuevas:**
   - `RESONA Backend :3001` (servidor API)
   - `RESONA Frontend :3000` (aplicación web)

### **2. Se abrirá tu navegador:**
   - Irá a http://localhost:3000
   - Verifica que carga tu aplicación

### **3. Te preguntará:**
   ```
   ¿Se ve tu aplicación correctamente?
   Si ves tu aplicación → Presiona CUALQUIER tecla
   Si ves error 404 → Presiona CTRL+C
   ```

### **4. Ejecutará los tests:**
   - Se abrirá Chrome automáticamente
   - Verás los tests ejecutándose
   - Mostrará resultados

---

## ✅ RESULTADO ESPERADO

```
Running 3 tests using 1 worker

  ✓ 1. Conectar a la página principal (2s)
  ✓ 2. Verificar que hay contenido (1s)
  ✓ 3. Buscar texto Resona (1s)

  3 passed (5s)

================================================
  ✓ TESTS PASARON EXITOSAMENTE
================================================
```

---

## 🐛 SI ALGO FALLA

### **Error: "Cannot connect to localhost:3000"**

**Causa:** Frontend no está corriendo

**Solución:**
1. Mira la ventana "RESONA Frontend :3000"
2. Busca errores en rojo
3. Espera a ver: `Local: http://localhost:3000/`
4. Presiona una tecla para continuar

---

### **Error: "404 Not Found"**

**Causa:** Vite no compiló correctamente

**Solución:**
```bash
# Cierra todo
taskkill /F /IM node.exe

# Reinstala dependencias
cd packages\frontend
npm install

# Ejecuta de nuevo
.\INICIAR-Y-TESTEAR.bat
```

---

### **Error: "Timeout waiting for..."**

**Causa:** Tests se quedan colgados

**Solución:**
```bash
# Instala navegadores de Playwright
cd packages\frontend
npx playwright install chromium

# Ejecuta de nuevo
.\INICIAR-Y-TESTEAR.bat
```

---

## 📊 TESTS DISPONIBLES

Una vez que el test simple pase, puedes ejecutar:

### **Test de Categorías (15 categorías):**
```bash
cd packages\frontend
npx playwright test tests/e2e/categories.spec.ts --config=playwright.minimal.config.ts --headed
```

### **Test de Autenticación:**
```bash
npx playwright test tests/e2e/auth.spec.ts --config=playwright.minimal.config.ts --headed
```

### **Test de Carrito:**
```bash
npx playwright test tests/e2e/cart-flow.spec.ts --config=playwright.minimal.config.ts --headed
```

### **TODOS los tests:**
```bash
npx playwright test --config=playwright.minimal.config.ts --headed
```

---

## 🎯 ARCHIVOS CLAVE

```
INICIAR-Y-TESTEAR.bat         → Script todo-en-uno
playwright.minimal.config.ts  → Configuración simple
test-simple.spec.ts           → Test básico de conexión
```

---

## ⚙️ CONFIGURACIÓN ACTUAL

```
Frontend:  http://localhost:3000 (Vite + React)
Backend:   http://localhost:3001 (Express API)
Database:  PostgreSQL (puerto 5432)
Redis:     Cache (puerto 6379)
```

---

## 🚀 INICIO RÁPIDO

```bash
# TODO EN UNO:
.\INICIAR-Y-TESTEAR.bat

# O MANUAL:
# 1. Backend
cd packages\backend
npm run dev:quick

# 2. Frontend (otra terminal)
cd packages\frontend
npm run dev

# 3. Tests (otra terminal)
cd packages\frontend
npx playwright test tests/e2e/test-simple.spec.ts --config=playwright.minimal.config.ts --headed
```

---

## 📝 NOTAS IMPORTANTES

- **Navegador visible:** Los tests usan `headless: false` para que veas qué pasa
- **Timeouts cortos:** 30s por test, 5s por acción
- **Un worker:** Tests se ejecutan secuencialmente, no en paralelo
- **Sin videos:** Desactivados para ir más rápido

---

## ✅ CHECKLIST PRE-TESTS

```
[ ] Puerto 3000 libre
[ ] Puerto 3001 libre
[ ] Docker corriendo (PostgreSQL)
[ ] Node.js instalado
[ ] Navegadores de Playwright instalados
```

Para instalar navegadores:
```bash
cd packages\frontend
npx playwright install
```

---

**¡EJECUTA AHORA!**

```bash
.\INICIAR-Y-TESTEAR.bat
```

**Duración:** ~30-40 segundos total
