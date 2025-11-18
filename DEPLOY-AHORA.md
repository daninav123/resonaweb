# 🚀 DESPLIEGUE A INTERNET - RESONA EVENTS

**Fecha:** 18 de Noviembre de 2025  
**Estado:** ✅ Código subido a GitHub

---

## ✅ COMPLETADO

### **GitHub**
```
✅ Repositorio: https://github.com/daninav123/resonaweb
✅ Rama: main
✅ Último commit: Sistema completo con cupones, Stripe, calendario, etc.
✅ Todo el código está en la nube
```

---

## 🎯 DESPLIEGUE PASO A PASO

### **OPCIÓN 1: FRONTEND EN NETLIFY (5-10 min)**

#### **1. Accede a Netlify**
```
https://app.netlify.com
```

#### **2. Importa desde GitHub**
```
1. Click: "Add new site"
2. Click: "Import an existing project"
3. Click: "Deploy with GitHub"
4. Autoriza Netlify si te lo pide
5. Busca y selecciona: daninav123/resonaweb
```

#### **3. Configura el Build**
```
Base directory:     packages/frontend
Build command:      npm run build
Publish directory:  dist
```

#### **4. Variables de Entorno**
```
Click en "Add environment variables":

VITE_API_URL = http://localhost:3001/api/v1

(Lo cambiaremos después cuando despliegues el backend)
```

#### **5. Deploy**
```
Click: "Deploy site"
Espera: 3-5 minutos
```

#### **6. Tu URL**
```
Netlify te dará algo como:
https://random-name-123456.netlify.app

Puedes cambiarla a:
https://resona-events.netlify.app

En: Site settings → Change site name
```

---

### **OPCIÓN 2: BACKEND EN RAILWAY (10-15 min)**

#### **1. Crear Cuenta Railway**
```
https://railway.app
Click: "Start a New Project"
Login con GitHub
```

#### **2. Nuevo Proyecto**
```
1. Click: "New Project"
2. Click: "Deploy from GitHub repo"
3. Selecciona: daninav123/resonaweb
4. Click: "Deploy Now"
```

#### **3. Configurar Servicio**
```
1. Click en tu servicio
2. Settings → Service
3. Root Directory: packages/backend
4. Save
```

#### **4. Añadir PostgreSQL**
```
1. En tu proyecto, click: "+ New"
2. Click: "Database"
3. Click: "Add PostgreSQL"
4. Railway conectará automáticamente DATABASE_URL
```

#### **5. Variables de Entorno**
```
Click en Variables tab y añade:

JWT_SECRET = tu-secret-super-seguro-cambialo-ahora-123
JWT_EXPIRES_IN = 7d
CORS_ORIGIN = https://tu-sitio.netlify.app
PORT = 3001
```

**Opcionales (si las necesitas):**
```
OPENAI_API_KEY = sk-tu-api-key-de-openai
STRIPE_SECRET_KEY = sk_test_tu-key-de-stripe
STRIPE_WEBHOOK_SECRET = whsec_tu-webhook-secret
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = tu-email@gmail.com
SMTP_PASS = tu-password-de-app
```

#### **6. Ejecutar Seed (Importante)**
```
1. Settings → Custom Start Command
2. Cambia a:
   npm run migrate && npm run seed:simple && npm start
3. Deploy (se ejecutará automáticamente)
```

#### **7. Tu URL Backend**
```
Railway te dará algo como:
https://resonaweb-production.up.railway.app
```

---

### **OPCIÓN 3: CONECTAR FRONTEND CON BACKEND**

#### **Actualizar Netlify**
```
1. Ve a: https://app.netlify.com
2. Click en tu sitio
3. Site settings → Environment variables
4. Edita VITE_API_URL
5. Cambia a: https://tu-backend.railway.app/api/v1
6. Save
7. Deploys → Trigger deploy → Deploy site
```

---

## ✅ VERIFICACIÓN

### **Backend (Railway)**
```
Abre en el navegador:
https://tu-backend.railway.app/health

Debe mostrar:
{"status":"ok"}

Categorías:
https://tu-backend.railway.app/api/v1/products/categories

Debe mostrar un JSON con las 15 categorías
```

### **Frontend (Netlify)**
```
Abre tu sitio:
https://tu-sitio.netlify.app

Verifica:
✅ Home page carga
✅ Menú funciona
✅ Categorías aparecen en el dropdown
✅ Productos cargan
✅ Login/Register funciona
```

---

## 📊 ARQUITECTURA FINAL

```
┌────────────────────────────────┐
│         USUARIO                 │
└───────────┬────────────────────┘
            │
┌───────────▼────────────────────┐
│    NETLIFY (Frontend)           │
│  https://resona.netlify.app     │
│  - React + Vite                 │
│  - TailwindCSS                  │
└───────────┬────────────────────┘
            │ HTTPS
            │
┌───────────▼────────────────────┐
│    RAILWAY (Backend)            │
│  https://xxx.railway.app        │
│  - Node.js + Express            │
│  - Prisma ORM                   │
└───────────┬────────────────────┘
            │
┌───────────▼────────────────────┐
│  POSTGRESQL (Railway)           │
│  - Categorías                   │
│  - Productos                    │
│  - Usuarios                     │
│  - Pedidos                      │
└─────────────────────────────────┘
```

---

## 💰 COSTOS

### **Netlify (Frontend)**
```
✅ GRATIS
- 100 GB bandwidth/mes
- 300 build minutes/mes
- HTTPS automático
- Deployments ilimitados
```

### **Railway (Backend)**
```
✅ $5 crédito gratis/mes
- ~500 horas ejecución
- PostgreSQL incluido
- Suficiente para desarrollo

💰 Si necesitas más: $5-10/mes
```

**Total:** $0-10/mes

---

## 🐛 TROUBLESHOOTING

### **Build Failed en Netlify**
```
Verifica:
- Base directory: packages/frontend
- Build command: npm run build
- Publish: dist (no packages/frontend/dist)
```

### **CORS Error**
```
En Railway, verifica:
CORS_ORIGIN = https://tu-sitio.netlify.app
(Sin / al final)
```

### **Database Error**
```
Verifica que PostgreSQL está running en Railway
Ejecuta el seed manualmente si es necesario
```

### **Frontend no carga productos**
```
1. Verifica VITE_API_URL en Netlify
2. Verifica /health del backend responde
3. Abre DevTools → Console para ver errores
```

---

## 🎯 CHECKLIST COMPLETO

### **GitHub**
```
[✅] Código subido
[✅] Repositorio actualizado
```

### **Netlify (Frontend)**
```
[ ] Cuenta creada
[ ] Sitio importado desde GitHub
[ ] Build configurado
[ ] Variables de entorno añadidas
[ ] Deploy completado
[ ] URL funcionando
```

### **Railway (Backend)**
```
[ ] Cuenta creada
[ ] Proyecto creado desde GitHub
[ ] Root directory configurado
[ ] PostgreSQL añadido
[ ] Variables de entorno configuradas
[ ] Seed ejecutado
[ ] Deploy completado
[ ] /health responde OK
```

### **Integración**
```
[ ] VITE_API_URL actualizado en Netlify
[ ] CORS_ORIGIN configurado en Railway
[ ] Frontend conecta a backend
[ ] Login funciona
[ ] Productos cargan
[ ] Carrito funciona
[ ] Admin panel accesible
```

---

## 🚀 FUNCIONALIDADES DISPONIBLES

### **Después del Deploy Completo:**

#### **Público:**
```
✅ Home page
✅ Catálogo con 15 categorías
✅ Búsqueda de productos
✅ Carrito de compras
✅ Login/Register
✅ Calculadora de eventos
✅ Blog
✅ Servicios
✅ About/Contact
```

#### **Admin:**
```
✅ Panel de administración
✅ Gestión de productos
✅ Gestión de pedidos
✅ Gestión de cupones
✅ Gestión de categorías
✅ Configuración de envío
✅ Gestión de stock
✅ Calendario de disponibilidad
✅ Notificaciones
✅ Estadísticas
```

#### **Integraciones:**
```
✅ Stripe (pagos)
✅ Google Maps (direcciones)
✅ Email (notificaciones)
✅ Blog con IA (OpenAI)
```

---

## 📚 DOCUMENTACIÓN ADICIONAL

```
✅ DEPLOY-NETLIFY.md         - Guía detallada frontend
✅ DEPLOY-BACKEND-RAILWAY.md - Guía detallada backend
✅ DEPLOY-STATUS.md          - Estado general
✅ deploy-netlify.bat        - Script automático
```

---

## 🎉 PRÓXIMO PASO

### **AHORA MISMO:**

**1. Despliega el Frontend:**
```
Ve a https://app.netlify.com
Sigue las instrucciones arriba
```

**2. Despliega el Backend:**
```
Ve a https://railway.app
Sigue las instrucciones arriba
```

**3. Conéctalos:**
```
Actualiza VITE_API_URL en Netlify
Trigger nuevo deploy
```

**4. ¡Prueba tu sitio!**
```
Abre tu URL de Netlify
Verifica que todo funciona
```

---

## 🆘 SOPORTE

```
📧 Email: danielnavarrocampos@icloud.com
🐙 GitHub: https://github.com/daninav123/resonaweb
📚 Docs Railway: https://docs.railway.app
📚 Docs Netlify: https://docs.netlify.com
```

---

## ✅ RESUMEN

```
1. ✅ Código en GitHub
2. ⏳ Deploy Frontend en Netlify (5-10 min)
3. ⏳ Deploy Backend en Railway (10-15 min)
4. ⏳ Conectar ambos (5 min)
5. ⏳ Testing completo (10 min)

TOTAL: ~30-40 minutos hasta tener todo online
```

---

**¡Tu aplicación está lista para desplegarse a internet!** 🚀

**¡Éxito con el despliegue!** 🎉
