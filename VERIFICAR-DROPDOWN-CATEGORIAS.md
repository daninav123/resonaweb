# 🔍 VERIFICAR DROPDOWN DE CATEGORÍAS

**Fecha:** 14 de Noviembre de 2025  
**Problema:** Las categorías aparecen en la home pero no en el dropdown del catálogo

---

## ✅ CAMBIOS REALIZADOS

### **1. Eliminada Caché de React Query**
```typescript
// ANTES:
staleTime: 1000 * 60 * 5, // 5 minutos
refetchOnMount: true,

// AHORA:
staleTime: 0, // Sin caché
refetchOnMount: 'always', // Siempre refetch
```

### **2. Añadido Logging de Debug**
```typescript
console.log('📦 Categorías cargadas:', result);
console.log('🏷️ Categoría en dropdown:', cat.name, cat.id);
```

### **3. Añadido Contador Visual**
```
X categorías disponibles
```
Aparece debajo del dropdown

---

## 🔧 PASOS PARA VERIFICAR

### **PASO 1: Abrir Consola del Navegador**
```
1. Presiona F12
2. Ve a la pestaña "Console"
```

### **PASO 2: Ir a Productos**
```
1. Ve a: http://localhost:5173/productos
2. Espera a que cargue
```

### **PASO 3: Revisar Console**
```
Deberías ver:
📦 Categorías cargadas: Array(15) [...]
🏷️ Categoría en dropdown: Fotografía y Video, abc-123
🏷️ Categoría en dropdown: Sonido, def-456
... (15 veces)
```

### **PASO 4: Verificar Dropdown**
```
1. Mira el sidebar izquierdo
2. Bajo "Categoría" deberías ver el dropdown
3. Debajo del dropdown: "15 categorías disponibles"
4. Click en el dropdown
5. Deberían aparecer las 15 categorías
```

---

## 🐛 SI NO FUNCIONA

### **Opción 1: Hard Refresh**
```
Ctrl + Shift + R
```

### **Opción 2: Limpiar Todo**
```javascript
// En consola del navegador (F12)
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### **Opción 3: Reiniciar Frontend**
```bash
# Mata el proceso
taskkill /F /IM node.exe

# Reinicia
cd packages/frontend
npm run dev
```

---

## 📊 QUÉ BUSCAR EN LA CONSOLA

### **✅ CORRECTO:**
```
📦 Categorías cargadas: (15) [{…}, {…}, {…}, ...]
🏷️ Categoría en dropdown: Fotografía y Video
🏷️ Categoría en dropdown: Sonido
🏷️ Categoría en dropdown: Iluminación
... etc (15 total)
```

### **❌ INCORRECTO:**
```
📦 Categorías cargadas: (3) [{…}, {…}, {…}]
// Solo 3 categorías = caché antiguo
```

---

## 🔍 DEBUG AVANZADO

### **Verificar API Directamente:**
```bash
# En terminal
curl http://localhost:3001/api/v1/products/categories
```

Debería devolver 15 categorías

### **Verificar Base de Datos:**
```bash
cd packages/backend
node count-categories.js
```

Debería mostrar 15 categorías

---

## 📋 CHECKLIST

```
[ ] Consola del navegador abierta (F12)
[ ] Ir a /productos
[ ] Ver log "📦 Categorías cargadas: (15)"
[ ] Ver 15 logs "🏷️ Categoría en dropdown"
[ ] Dropdown muestra "15 categorías disponibles"
[ ] Click en dropdown muestra todas las 15
```

---

## ✅ CATEGORÍAS QUE DEBERÍAN APARECER

```
1. Fotografía y Video
2. Iluminación
3. Sonido
4. Microfonía
5. Mesas de Mezcla para Directo
6. Equipamiento DJ
7. Elementos de Escenario
8. Elementos Decorativos
9. Mobiliario
10. Backline
11. Pantallas y Proyección
12. Efectos Especiales
13. Comunicaciones
14. Energía y Distribución
15. Cables y Conectores
```

---

## 🎯 SOLUCIÓN RÁPIDA

**Si ves menos de 15 categorías:**

```bash
# 1. Limpiar caché navegador
Ctrl + Shift + R

# 2. Si no funciona
localStorage.clear();
sessionStorage.clear();
location.reload();

# 3. Si sigue sin funcionar
.\refresh-frontend.bat
```

---

## 📝 NOTAS TÉCNICAS

### **¿Por qué pasó esto?**
- React Query cachea las peticiones API
- Cuando ejecutaste el seed, la BD cambió
- Pero el frontend mantenía la caché antigua (3 categorías)

### **¿Qué hace el fix?**
- `staleTime: 0` → No cachea
- `refetchOnMount: 'always'` → Siempre recarga
- Console logs → Para debug

### **¿Es permanente?**
- Sí, ahora siempre cargará las categorías actualizadas
- Los logs se pueden quitar en producción

---

**¡Prueba ahora!** 🚀

```
1. F12 (abrir consola)
2. Ve a /productos
3. Verifica los logs
4. Click en el dropdown
```
