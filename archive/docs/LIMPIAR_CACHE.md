# 🧹 CÓMO LIMPIAR CACHÉ Y VER CAMBIOS

## ⚠️ PROBLEMA
**El navegador está mostrando la versión ANTIGUA del código (cacheada)**

---

## ✅ SOLUCIÓN 1: HARD REFRESH (5 segundos)

### **En el navegador donde ves la web:**

#### **Chrome/Edge:**
```
1. Abre la página (http://localhost:3000)
2. Presiona: Ctrl + Shift + R
   (o Ctrl + F5)
3. Espera a que recargue
✅ LISTO!
```

#### **Firefox:**
```
1. Abre la página
2. Presiona: Ctrl + Shift + R
3. Espera a que recargue
✅ LISTO!
```

---

## ✅ SOLUCIÓN 2: LIMPIAR CACHÉ COMPLETO (30 segundos)

```
1. Presiona: Ctrl + Shift + Delete
2. Selecciona:
   [x] Imágenes y archivos en caché
   [x] Últimas 24 horas
3. Click "Borrar datos"
4. Cierra y abre el navegador
5. Ir a: http://localhost:3000
✅ LISTO!
```

---

## ✅ SOLUCIÓN 3: MODO INCÓGNITO (INMEDIATO)

```
1. Presiona: Ctrl + Shift + N
2. En la ventana incógnita ir a: http://localhost:3000
3. Verificar cambios
✅ Verás la versión actualizada!
```

---

## ✅ SOLUCIÓN 4: REINICIAR DEV SERVER (2 minutos)

### **Paso 1: Parar servidores**
```
1. En las terminales donde corre el frontend/backend
2. Presiona: Ctrl + C
3. Confirma que se detengan
```

### **Paso 2: Limpiar caché de Vite**
```powershell
# En PowerShell en la raíz del proyecto:
Remove-Item -Recurse -Force packages\frontend\node_modules\.vite
```

### **Paso 3: Reiniciar**
```powershell
.\start-quick.bat
```

---

## 🔍 VERIFICAR QUE FUNCIONÓ

### **Antes (Caché):**
```
Producto XYZ
€50/día
[10 disponibles]  ← ❌ Esto NO debe verse
```

### **Después (Correcto):**
```
Producto XYZ
€50/día
[Disponible]  ← ✅ Solo esto debe verse
```

---

## 📱 VERIFICA EN ESTAS PÁGINAS

1. **Página Principal (Home)**
   - http://localhost:3000
   - Productos destacados
   - ✅ Debe decir: "Disponible"
   - ❌ NO debe decir: "X disponibles"

2. **Catálogo de Productos**
   - http://localhost:3000/products
   - Todos los productos
   - ✅ Debe decir: "Disponible"
   - ❌ NO debe decir: "X disponibles"

3. **Detalle de Producto**
   - http://localhost:3000/products/[cualquier-producto]
   - ✅ Debe decir: "Disponible para alquiler"
   - ❌ NO debe decir: "X unidades disponibles"

---

## 👨‍💼 COMO ADMIN (DEBE VER STOCK)

1. **Login**
   - http://localhost:3000/login
   - admin@resona.com / Admin123!

2. **Panel de Admin**
   - http://localhost:3000/admin/products
   - ✅ DEBE ver: "10 uds", "Stock: 10"
   - ✅ Es correcto que el admin vea los números

---

## 🚨 SI AÚN NO FUNCIONA

### **Verifica que el frontend esté corriendo:**
```powershell
# Debería mostrar algo como:
VITE v5.x.x ready in XXX ms
➜ Local:   http://localhost:3000/
```

### **Fuerza recarga sin caché en DevTools:**
```
1. F12 (abrir DevTools)
2. Pestaña "Network"
3. Marcar "Disable cache"
4. Recargar (F5)
```

### **Verifica la versión del archivo:**
```
1. F12 (DevTools)
2. Sources → src/pages/ProductsPage.tsx
3. Busca: "Disponible" 
4. NO debe aparecer: "disponibles" con número
```

---

## ✅ COMANDO RÁPIDO

```powershell
# Ejecuta esto en PowerShell (raíz del proyecto):

# Limpiar
Remove-Item -Recurse -Force packages\frontend\node_modules\.vite -ErrorAction SilentlyContinue

# Reiniciar (si está corriendo, para primero con Ctrl+C)
cd packages\frontend
npm run dev
```

---

## 🎯 RESUMEN

```
PROBLEMA:    Navegador muestra versión antigua
CAUSA:       Caché del navegador + Vite
SOLUCIÓN:    Hard refresh (Ctrl+Shift+R)
ALTERNATIVA: Modo incógnito
TIEMPO:      5 segundos
```

---

## 📞 AYUDA ADICIONAL

**Si después de hacer TODAS estas opciones aún ves el stock:**

1. Toma una captura de pantalla
2. Abre DevTools (F12) → Pestaña Console
3. Busca errores en rojo
4. Comparte la captura

Es probable que:
- El archivo no se guardó correctamente
- Hay otro componente mostrando el stock
- El servidor no se reinició

---

**¡Prueba con Ctrl+Shift+R primero!** 🚀
