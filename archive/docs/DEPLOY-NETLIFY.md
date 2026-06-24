# 🚀 DEPLOY A NETLIFY - RESONA EVENTS

**Repositorio:** https://github.com/daninav123/resonaweb  
**Estado:** ✅ Código en GitHub

---

## 📋 PASOS PARA NETLIFY

### **PASO 1: Ir a Netlify**
```
https://app.netlify.com
```

### **PASO 2: Crear Nuevo Sitio**
```
1. Click: "Add new site"
2. Click: "Import an existing project"
```

### **PASO 3: Conectar GitHub**
```
1. Click: "Deploy with GitHub"
2. Autoriza Netlify si te lo pide
3. Busca: daninav123/resonaweb
4. Click en el repositorio
```

### **PASO 4: Configurar Build Settings**

#### **Base directory:**
```
packages/frontend
```

#### **Build command:**
```
npm run build
```

#### **Publish directory:**
```
packages/frontend/dist
```

### **PASO 5: Environment Variables**

Click en "Add environment variables" y añade:

```
Variable name: VITE_API_URL
Value: https://tu-backend-aqui.com/api/v1

(Por ahora déjalo así, lo cambiaremos cuando despliegues el backend)
```

### **PASO 6: Deploy Site**
```
Click: "Deploy daninav123/resonaweb"
```

¡Netlify construirá y desplegará tu sitio automáticamente!

---

## ⏱️ TIEMPO DE ESPERA

El primer deploy suele tardar **2-5 minutos**.

Verás:
1. ⏳ Building... (construyendo)
2. 🚀 Deploying... (desplegando)
3. ✅ Published! (¡listo!)

---

## 🔗 TU URL DE NETLIFY

Netlify te dará una URL como:
```
https://random-name-123456.netlify.app
```

Puedes cambiarla a:
```
https://resona-events.netlify.app
```

**Para cambiar el nombre:**
```
1. Site settings
2. Change site name
3. Escribe: resona-events
4. Save
```

---

## ⚙️ CONFIGURACIÓN AVANZADA (OPCIONAL)

### **Custom Domain:**
Si tienes un dominio propio:
```
1. Domain settings
2. Add custom domain
3. Sigue las instrucciones de DNS
```

### **Auto Deploy:**
✅ Ya está activado por defecto

Cada vez que hagas `git push` a GitHub:
→ Netlify reconstruirá y redesplegaráautomáticamente

---

## 🐛 TROUBLESHOOTING

### **Error: "Build failed"**
```
Verifica:
- Base directory: packages/frontend
- Build command: npm run build
- Publish: packages/frontend/dist
```

### **Error: "Page not found"**
```
Netlify necesita redirecciones para React Router.
✅ Ya lo tienes en netlify.toml
```

### **Frontend funciona pero no conecta con backend:**
```
Necesitas desplegar el backend primero.
Opciones:
1. Railway
2. Render
3. Heroku
4. AWS/Azure
```

---

## 📊 RESUMEN

```
FRONTEND:
✅ Código en GitHub
✅ Listo para Netlify
✅ netlify.toml configurado
✅ Environment variables definidas

PENDIENTE:
⏳ Deploy backend
⏳ Actualizar VITE_API_URL
⏳ Conectar dominio personalizado (opcional)
```

---

## 🎯 CHECKLIST NETLIFY

```
[ ] Ir a https://app.netlify.com
[ ] "Import from GitHub"
[ ] Seleccionar: daninav123/resonaweb
[ ] Base directory: packages/frontend
[ ] Build command: npm run build
[ ] Publish directory: packages/frontend/dist
[ ] Variables: VITE_API_URL
[ ] Click "Deploy"
[ ] Esperar 2-5 minutos
[ ] Abrir URL de Netlify
[ ] Verificar que funciona
```

---

## 📱 DESPUÉS DEL DEPLOY

### **Frontend funcionará:**
```
✅ Home page
✅ Navegación
✅ Páginas estáticas
✅ Blog (si tienes contenido)
✅ Servicios
```

### **No funcionará (hasta desplegar backend):**
```
❌ Login/Register
❌ Productos (carga desde API)
❌ Carrito (guarda en API)
❌ Checkout
❌ Admin panel
```

**Solución:** Desplegar backend next →

---

## 🚀 PRÓXIMO PASO: BACKEND

### **Opción 1: Railway (Recomendado)**
```
- Gratis para empezar
- Fácil deploy desde GitHub
- Base de datos PostgreSQL incluida
```

### **Opción 2: Render**
```
- Free tier generoso
- Deploy automático
- Postgres disponible
```

### **Opción 3: Fly.io**
```
- Performante
- Edge locations
- Postgres incluido
```

---

**¿Quieres que te ayude a desplegar el backend?**
