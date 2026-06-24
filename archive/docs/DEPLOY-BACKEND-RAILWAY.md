# 🚂 DEPLOY BACKEND A RAILWAY

**Proyecto:** Resona Events Backend  
**Repositorio:** https://github.com/daninav123/resonaweb

---

## 🎯 ¿POR QUÉ RAILWAY?

```
✅ Gratis para empezar ($5 de crédito gratis/mes)
✅ Deploy desde GitHub automático
✅ PostgreSQL incluido
✅ Fácil de configurar
✅ Variables de entorno simples
✅ Logs en tiempo real
```

---

## 📋 PASOS PARA RAILWAY

### **PASO 1: Crear Cuenta en Railway**
```
1. Ve a: https://railway.app
2. Click: "Start a New Project"
3. Login con GitHub
```

### **PASO 2: Crear Nuevo Proyecto**
```
1. Click: "New Project"
2. Click: "Deploy from GitHub repo"
3. Selecciona: daninav123/resonaweb
4. Click: "Deploy Now"
```

### **PASO 3: Configurar Root Directory**
```
1. Click en tu servicio
2. Settings → Service
3. Root Directory: packages/backend
4. Save
```

### **PASO 4: Añadir PostgreSQL**
```
1. En tu proyecto, click: "+ New"
2. Click: "Database"
3. Click: "Add PostgreSQL"
4. Railway creará la base de datos automáticamente
```

### **PASO 5: Conectar Backend a PostgreSQL**
```
Railway conectará automáticamente la DATABASE_URL
✅ No necesitas hacer nada más
```

### **PASO 6: Variables de Entorno**

```
JWT_SECRET=tu-secret-super-seguro-cambialo-123456789
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://tu-sitio.netlify.app
OPENAI_API_KEY=sk-tu-api-key-de-openai
STRIPE_SECRET_KEY=sk_test_tu-key-de-stripe
STRIPE_WEBHOOK_SECRET=whsec_tu-webhook-secret
```

**Cómo añadirlas:**
```
1. Click en tu servicio backend
2. Variables tab
3. Click: "Add Variable"
4. Añade cada una
5. Click: "Save"
```

### **PASO 7: Ejecutar Migraciones**
```
Railway ejecutará automáticamente:
npm run build
npm start

Para ejecutar el seed:
1. Settings → Custom Start Command
2. Añade: npm run migrate && npm run seed:simple && npm start
3. O ejecuta manualmente en la terminal de Railway
```

---

## 🌐 TU URL DE BACKEND

Railway te dará una URL como:
```
https://resonaweb-production.up.railway.app
```

Esta será tu **VITE_API_URL** para Netlify:
```
https://resonaweb-production.up.railway.app/api/v1
```

---

## ⚙️ ACTUALIZAR FRONTEND EN NETLIFY

Una vez que tengas la URL del backend:

```
1. Ve a: https://app.netlify.com
2. Click en tu sitio
3. Site settings → Environment variables
4. Edita VITE_API_URL
5. Cambia a: https://tu-backend.railway.app/api/v1
6. Save
7. Triggera un nuevo deploy: Deploys → Trigger deploy
```

---

## 📊 VERIFICACIÓN

### **Backend funcionando:**
```
https://tu-backend.railway.app/health
→ Debe devolver: {"status":"ok"}
```

### **Categorías:**
```
https://tu-backend.railway.app/api/v1/products/categories
→ Debe devolver: {"data":[...15 categorías...]}
```

### **Frontend conectado:**
```
1. Abre tu sitio Netlify
2. Ve a /productos
3. Deberían cargar los productos
```

---

## 🐛 TROUBLESHOOTING

### **Error: "Build failed"**
```
Verifica:
- Root Directory: packages/backend
- Build Command está en package.json
```

### **Error: "Database connection failed"**
```
Verifica:
- PostgreSQL service está running
- DATABASE_URL está automáticamente conectada
```

### **Error: "CORS Error"**
```
Verifica:
- CORS_ORIGIN tiene tu URL de Netlify
- Sin / al final
```

### **Error: "JWT Error"**
```
Añade JWT_SECRET en variables de entorno
```

---

## 📦 VARIABLES DE ENTORNO COMPLETAS

```env
# Base de datos (automático)
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=cambia-este-secreto-por-algo-seguro-123456789
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://tu-sitio.netlify.app

# OpenAI (opcional, para blog AI)
OPENAI_API_KEY=sk-tu-key

# Stripe (opcional, para pagos)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Puerto (Railway lo asigna automático)
PORT=3001
```

---

## 🚀 DESPLIEGUE AUTOMÁTICO

✅ Ya configurado

Cada vez que hagas `git push`:
```
1. GitHub recibe el push
2. Railway detecta el cambio
3. Reconstruye el backend
4. Redespliega automáticamente
```

---

## 💰 COSTOS

### **Free Tier:**
```
$5 de crédito gratis/mes
~500 horas de ejecución
Suficiente para desarrollo y testing
```

### **Si necesitas más:**
```
$5/mes por servicio
$10/mes PostgreSQL
```

---

## 🎯 CHECKLIST RAILWAY

```
[ ] Cuenta creada en Railway
[ ] Proyecto creado desde GitHub
[ ] Root directory: packages/backend
[ ] PostgreSQL añadido
[ ] Variables de entorno configuradas
[ ] Deploy completado
[ ] /health responde OK
[ ] /api/v1/products/categories devuelve datos
[ ] VITE_API_URL actualizado en Netlify
[ ] Frontend conecta con backend
[ ] Todo funciona end-to-end
```

---

## 🎉 DESPUÉS DEL DEPLOY

### **Frontend + Backend funcionando:**
```
✅ Login/Register
✅ Productos cargan desde BD
✅ Carrito funciona
✅ Checkout funcional
✅ Admin panel accesible
✅ Blog con datos reales
✅ 15 categorías dinámicas
```

---

## 🔐 SEGURIDAD

### **Antes de Producción:**
```
[ ] Cambiar JWT_SECRET a algo seguro
[ ] Usar HTTPS everywhere
[ ] Configurar rate limiting
[ ] Habilitar CORS solo para tu dominio
[ ] Configurar Stripe en modo producción
[ ] Configurar variables de prod separadas
```

---

## 📊 MONITOREO

Railway incluye:
```
✅ Logs en tiempo real
✅ Métricas de uso
✅ Health checks
✅ Alertas
```

---

## 🆘 SOPORTE

- Railway Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- GitHub Issues: Tu repo

---

**¿Listo para desplegar el backend?**
