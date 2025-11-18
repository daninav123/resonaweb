# 🧪 INSTRUCCIONES PARA EJECUTAR TESTS

## ⚠️ PROBLEMA DETECTADO

El servidor NO está corriendo en puerto 3000.

---

## ✅ SOLUCIÓN EN 2 PASOS

### **PASO 1: Inicia el servidor**

Ejecuta en terminal:
```bash
.\start-admin.bat
```

O manualmente:
```bash
# Terminal 1 - Backend
cd packages\backend
npm run dev:quick

# Terminal 2 - Frontend
cd packages\frontend
npm run dev
```

**Verificar:** Abre http://localhost:3000 en navegador → Debe cargar tu app

---

### **PASO 2: Ejecuta los tests**

```bash
.\test-simple-ahora.bat
```

---

## 🎯 QUÉ VA A PASAR

1. Se abrirá Chrome
2. Navegará a http://localhost:3000
3. Ejecutará 3 tests simples
4. Mostrará resultados en ~10 segundos

---

## 📊 RESULTADO ESPERADO

```
Running 3 tests using 1 worker

  ✓ 1. Conectar a la página principal (2s)
  ✓ 2. Verificar que hay contenido (1s)
  ✓ 3. Buscar texto Resona (1s)

  3 passed (5s)
```

---

## 🐛 SI DA ERROR

### **"Cannot connect to localhost:3000"**
→ El servidor no está corriendo
→ Ejecuta: `.\start-admin.bat`

### **"Timeout"**
→ El servidor está lento o no responde
→ Abre navegador en http://localhost:3000 para verificar

### **"Chrome not found"**
→ Instala navegadores de Playwright:
```bash
cd packages\frontend
npx playwright install chromium
```

---

## 🚀 COMANDO RÁPIDO (Si servidor ya está corriendo)

```bash
cd packages\frontend
npx playwright test tests/e2e/test-simple.spec.ts --config=playwright.minimal.config.ts --headed
```

---

## ✅ CHECKLIST ANTES DE EJECUTAR

```
[ ] Servidor corriendo (.\start-admin.bat)
[ ] http://localhost:3000 carga en navegador
[ ] Backend en http://localhost:3001 responde
[ ] No hay otros procesos de Playwright colgados
```

---

**¡Ejecuta los 2 pasos y reporta el resultado!** 🚀

1. `.\start-admin.bat`
2. `.\test-simple-ahora.bat`
