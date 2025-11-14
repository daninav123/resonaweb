# 🚀 CÓMO INICIAR EL SISTEMA RESONA

## MÉTODO SIMPLE (RECOMENDADO)

### Paso 1: Iniciar Sistema
```
Doble clic en: start-quick.bat
```

Esto abrirá 2 ventanas:
- **Ventana 1:** Backend (puerto 3001)
- **Ventana 2:** Frontend (puerto 3000)

### Paso 2: Esperar 15 segundos

El sistema tarda unos segundos en arrancar completamente.

### Paso 3: Verificar que funciona

#### Opción A - Navegador:
```
Abrir: http://localhost:3000
```

#### Opción B - Script de verificación:
```
Doble clic en: wait-and-check.bat
```

---

## TEST DE CATEGORÍAS

Una vez el sistema esté corriendo, verifica las categorías:

```bash
cd packages\backend
node quick-test-categories.js
```

**Resultado esperado:**
```
✅ Backend corriendo en puerto 3001

✅ iluminacion: 1 productos (correcto)
   • Panel LED 1000W Profesional

✅ fotografia-video: 2 productos (correcto)
   • Objetivo Canon 50mm f/1.2
   • Cámara Sony A7 III

✅ sonido: 2 productos (correcto)
   • Micrófono Shure SM58
   • Altavoz JBL PRX815W
```

---

## SOLUCIÓN DE PROBLEMAS

### Si el backend no arranca:
```bash
# Liberar puerto 3001
Doble clic en: kill-backend.bat

# Volver a intentar
Doble clic en: start-quick.bat
```

### Si necesitas reiniciar:
```bash
1. Cerrar las ventanas de Backend y Frontend
2. Doble clic en: start-quick.bat
```

---

## URLs IMPORTANTES

```
Frontend:  http://localhost:3000
Backend:   http://localhost:3001
Admin:     http://localhost:3000/login
Productos: http://localhost:3000/productos
```

---

## CREDENCIALES

```
Email:    admin@resona.com
Password: Admin123!
```

---

## VERIFICACIÓN RÁPIDA

### Backend funcionando:
```
http://localhost:3001/health
```

### Productos por categoría:
```
http://localhost:3001/api/v1/products?category=iluminacion
http://localhost:3001/api/v1/products?category=fotografia-video
http://localhost:3001/api/v1/products?category=sonido
```

---

## SCRIPTS DISPONIBLES

- `start-quick.bat` - Iniciar sistema (SIN ESPERAS)
- `wait-and-check.bat` - Esperar 15s y verificar
- `kill-backend.bat` - Liberar puerto 3001
- `restart-backend.bat` - Reiniciar solo backend
- `check-services.js` - Verificar servicios
- `quick-test-categories.js` - Test de categorías

---

**¡Listo! Con estos pasos el sistema debería funcionar sin colgarse.** ✅
