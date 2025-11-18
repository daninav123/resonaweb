# 🔍 DIAGNÓSTICO: POR QUÉ LOS TESTS E2E NO FUNCIONAN

## ❌ PROBLEMA ENCONTRADO

**El puerto 3000 está abierto PERO responde 404**

Esto significa:
- ✅ El servidor Vite está corriendo
- ❌ No está sirviendo la aplicación correctamente
- ❌ Playwright se queda esperando porque nunca carga la página

---

## 🎯 POSIBLES CAUSAS

### **1. Vite no compiló correctamente**
```bash
# Error en build/compilación
# Módulos no encontrados
# Dependencias faltantes
```

### **2. Servidor corriendo en modo incorrecto**
```bash
# Puede estar sirviendo en otra ruta
# O en modo producción sin build
```

### **3. Puerto 3000 ocupado por otro proceso**
```bash
# Otro servidor en 3000
# Proceso zombie de sesión anterior
```

---

## ✅ SOLUCIÓN PASO A PASO

### **PASO 1: Mata todos los procesos Node**
```bash
taskkill /F /IM node.exe
```

### **PASO 2: Verifica que 3000 está libre**
```bash
netstat -ano | findstr :3000
```
Si hay algo, mata el proceso:
```bash
taskkill /PID <PID> /F
```

### **PASO 3: Limpia caché de Vite**
```bash
cd packages\frontend
rmdir /s /q node_modules\.vite
rmdir /s /q dist
```

### **PASO 4: Reinstala dependencias (si es necesario)**
```bash
cd packages\frontend
npm install
```

### **PASO 5: Inicia servidor correctamente**
```bash
cd packages\frontend
npm run dev
```

**Verifica en consola:**
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

### **PASO 6: Verifica en navegador**
Abre: http://localhost:3000

**Debe cargar tu aplicación**, NO un error 404.

---

## 🧪 VERIFICACIÓN RÁPIDA

### **Test manual:**
```bash
# Debe mostrar HTML, no 404
curl http://localhost:3000
```

### **Si muestra HTML:**
✅ Servidor OK → Ejecuta tests

### **Si muestra 404:**
❌ Servidor mal configurado → Reinicia con pasos arriba

---

## 🚀 REINICIO COMPLETO (OPCIÓN NUCLEAR)

Si nada funciona:

```bash
# 1. Matar todo
taskkill /F /IM node.exe
taskkill /F /IM chrome.exe

# 2. Limpiar
cd packages\frontend
rmdir /s /q node_modules\.vite
rmdir /s /q dist

# 3. Reiniciar
cd packages\backend
npm run dev:quick

# En otra terminal
cd packages\frontend
npm run dev

# 4. Esperar mensaje "ready in"
# 5. Verificar http://localhost:3000 en navegador
# 6. Si carga OK → Ejecutar tests
```

---

## 📊 CHECKLIST ANTES DE TESTS

```
[ ] taskkill /F /IM node.exe ejecutado
[ ] Puerto 3000 libre (netstat)
[ ] Caché limpio (rmdir node_modules\.vite)
[ ] npm run dev ejecutado
[ ] Consola muestra "Local: http://localhost:3000/"
[ ] Navegador carga http://localhost:3000 (NO 404)
[ ] Backend en 3001 responde
```

---

## 🐛 DEBUGGING

### **Ver qué proceso usa puerto 3000:**
```bash
netstat -ano | findstr :3000
```

### **Ver logs del frontend:**
Mira la terminal donde ejecutaste `npm run dev`

### **Ver errores de Vite:**
Busca líneas rojas o errores de compilación

---

## ✅ UNA VEZ QUE FUNCIONE

Cuando http://localhost:3000 cargue correctamente en navegador:

```bash
cd packages\frontend
npx playwright test tests/e2e/test-simple.spec.ts --config=playwright.minimal.config.ts --headed
```

**Debería:**
1. Abrir Chrome
2. Cargar tu app
3. Ejecutar 3 tests
4. Pasar en ~10 segundos

---

## 🎯 RESUMEN DEL PROBLEMA

```
SÍNTOMA: Tests E2E se cuelgan
CAUSA: Frontend responde 404 en puerto 3000
SOLUCIÓN: Reiniciar servidor correctamente
VERIFICACIÓN: http://localhost:3000 debe cargar en navegador
```

---

**¡Ejecuta los pasos de limpieza y reinicio!** 🔧
