# 🚨 FORCE REBUILD en Render Dashboard

## Problema
El backend NO está rebuildeando automáticamente después del push, sigue usando código antiguo.

## ✅ Solución: Force Rebuild Manual

### Paso 1: Ve a Render Dashboard
```
https://dashboard.render.com/
```

### Paso 2: Selecciona tu servicio backend
- Busca el servicio (ej: `resonaweb-backend`)
- Click en el nombre del servicio

### Paso 3: Force Rebuild con Clear Cache
1. Click en **"Manual Deploy"** (arriba a la derecha)
2. Selecciona **"Clear build cache & deploy"**
3. Click en **"Deploy"**

## 🔍 Qué Ver en los Logs

Después de iniciar el rebuild, ve a **"Logs"** y busca:

### Durante el Build:
```bash
==> Building...
📦 Compilando TypeScript...
✅ Compilación exitosa
✅ index.js encontrado - build OK
🎉 Build completado
==> Build successful 🎉
```

### Durante el Start:
```bash
==> Deploying...
==> Running 'npm start'
🚀 Backend API iniciado en puerto 3001
Trust proxy habilitado para Render
✅ Base de datos conectada
```

### Al Acceder al Endpoint:
```bash
🌐 GET /calculator-config - Endpoint PÚBLICO accedido
✅ Filtrados X eventos ocultos. Devolviendo Y eventos activos.
2025-12-12 XX:XX:XX info: GET /api/v1/calculator-config HTTP/1.1" 200
```

**❌ NO deberías ver:**
```bash
Error en auth middleware Token de autenticación no proporcionado
GET /api/v1/calculator-config HTTP/1.1" 401
```

## 🧪 Verificar que Funcionó

### 1. Test directo del endpoint:
```bash
curl https://resonaevents.com/api/v1/calculator-config
```

**Respuesta esperada (200 OK):**
```json
{
  "eventTypes": [
    { "name": "Boda", "isActive": true },
    { "name": "Cumpleaños", "isActive": true }
  ],
  "servicePrices": { ... }
}
```

**NO debería devolver (401):**
```json
{
  "error": {
    "code": "NO_TOKEN",
    "message": "Token de autenticación no proporcionado"
  }
}
```

### 2. Test desde la calculadora:
```
https://resonaevents.com/calculadora-evento
```

Abre consola (F12) y verifica:
```javascript
🔥 LIMPIEZA FORZADA de caché de calculadora...
📡 Cargando configuración desde API...
✅ Configuración cargada desde API  // ← ¡ESTO ES LO IMPORTANTE!
📊 Total eventos recibidos: 8       // ← Solo los activos
```

## ⏱️ Tiempo Estimado
- **Rebuild:** 3-5 minutos
- **Deploy:** 1-2 minutos
- **Total:** ~7 minutos

## 📝 Checklist Post-Rebuild

- [ ] Build completado sin errores
- [ ] Backend iniciado correctamente (puerto 3001)
- [ ] Warning de trust proxy DESAPARECIDO
- [ ] Endpoint `/calculator-config` responde 200 (no 401)
- [ ] Consola backend muestra: `🌐 GET /calculator-config - Endpoint PÚBLICO accedido`
- [ ] Calculadora carga eventos desde API sin error 401
- [ ] Solo aparecen eventos con `isActive: true`

## 🆘 Si Sigue Fallando

### Opción A: Rebuild desde Git
1. Render Dashboard → Settings
2. Build & Deploy → **"Redeploy from latest commit"**

### Opción B: Verificar Root Directory
1. Render Dashboard → Settings → Build & Deploy
2. **Root Directory:** debe ser `packages/backend`
3. **Build Command:** `npm install && npm run build`
4. **Start Command:** `npm start`

### Opción C: Verificar Variables de Entorno
1. Settings → Environment
2. Asegúrate de que todas las variables estén configuradas
3. Especialmente `DATABASE_URL`, `JWT_SECRET`, etc.

## ✅ Cambios en Este Commit

1. **✅ `app.set('trust proxy', true)`** - Resuelve warning de rate limiter
2. **✅ GET /calculator-config es PÚBLICO** - Sin autenticación
3. **✅ Log confirmación:** `🌐 GET /calculator-config - Endpoint PÚBLICO accedido`
4. **✅ Backend filtra eventos con `isActive: false`** antes de devolver

---

**Una vez hecho el rebuild manual, espera 7 minutos y luego prueba la calculadora!** 🎯
