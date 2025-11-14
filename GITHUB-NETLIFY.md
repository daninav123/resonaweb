# 🚀 DEPLOY: GITHUB + NETLIFY

**Guía rápida para desplegar con GitHub y Netlify (con autodeploy)**

---

## 📋 PASO 1: VERIFICAR GIT

```bash
# Ver estado actual
git status

# Ver remoto configurado
git remote -v

# Debería mostrar:
# origin  https://github.com/Daniel-Navarro-Campos/mywed360.git (fetch)
# origin  https://github.com/Daniel-Navarro-Campos/mywed360.git (push)
```

### **Si NO está configurado:**

```bash
# Inicializar Git
git init

# Configurar usuario
git config --global user.name "Daniel Navarro Campos"
git config --global user.email "tu@email.com"

# Añadir remoto
git remote add origin https://github.com/Daniel-Navarro-Campos/mywed360.git
```

---

## 📦 PASO 2: SUBIR A GITHUB

### **Opción A: Script Automático**

```bash
# Windows
.\deploy-github.bat
```

### **Opción B: Manual**

```bash
# 1. Añadir archivos
git add .

# 2. Commit
git commit -m "feat: App completa con carrito funcional - Lista para produccion"

# 3. Push
git push origin main
```

### **Si es tu primer push:**

```bash
# Puede que necesites:
git push -u origin main

# O si la rama es 'master':
git push -u origin master
```

---

## 🌐 PASO 3: CONECTAR NETLIFY

### **3.1 - Ir a Netlify**

1. Ve a: https://app.netlify.com
2. Login con tu cuenta (o crea una gratis)

### **3.2 - Importar Proyecto**

1. Click: **"Add new site"**
2. Click: **"Import an existing project"**
3. Selecciona: **"Deploy with GitHub"**
4. Autoriza Netlify en GitHub (si es la primera vez)

### **3.3 - Seleccionar Repositorio**

1. Busca: **`mywed360`**
2. Click en el repositorio

### **3.4 - Configurar Build**

```yaml
Base directory: packages/frontend
Build command: npm run build
Publish directory: packages/frontend/dist
```

### **3.5 - Variables de Entorno (IMPORTANTE)**

Antes de desplegar, añade las variables:

1. Click: **"Show advanced"**
2. Click: **"New variable"**
3. Añade:

```env
VITE_API_URL = https://tu-backend.onrender.com/api/v1
```

⚠️ **Cambia la URL cuando tengas el backend desplegado**

### **3.6 - Deploy**

1. Click: **"Deploy site"**
2. Espera 2-3 minutos ⏳
3. ✅ ¡Listo!

---

## 🎯 RESULTADO

### **Tu sitio estará en:**

```
https://random-name-12345.netlify.app
```

### **Puedes cambiarlo:**

1. Site settings > Domain management
2. Click "Options" > "Edit site name"
3. Cambia a: `resona-events`
4. Nueva URL: `https://resona-events.netlify.app`

---

## 🔄 AUTODEPLOY

### **Ahora cada vez que hagas:**

```bash
git push origin main
```

**Netlify automáticamente:**
1. ✅ Detecta el cambio
2. ✅ Hace el build
3. ✅ Despliega la nueva versión
4. ✅ Te notifica por email

### **Ver el deploy:**

- Dashboard de Netlify > Deploys
- Ver logs en tiempo real
- Rollback si algo falla

---

## 🌳 BRANCHES Y PREVIEW

### **Deploy Preview automático:**

Cada Pull Request genera un preview:

```bash
# Crear rama
git checkout -b feature/nueva-feature

# Hacer cambios
git add .
git commit -m "Nueva feature"

# Push
git push origin feature/nueva-feature

# Crear PR en GitHub
# → Netlify crea preview automático
# URL: https://deploy-preview-123--resona-events.netlify.app
```

---

## 🔧 CONFIGURACIÓN AVANZADA

### **Build Hooks (Webhooks)**

1. Site settings > Build & deploy > Build hooks
2. Create build hook
3. Usa la URL para triggear builds remotamente

### **Notificaciones**

1. Site settings > Build & deploy > Deploy notifications
2. Añade Slack, Email, Discord, etc.

### **Dominio Personalizado**

1. Site settings > Domain management
2. Add custom domain
3. Configura DNS:
   ```
   A record: 75.2.60.5
   CNAME: tu-site.netlify.app
   ```

---

## 📊 MONITOREO

### **Analytics de Netlify (Opcional - Pago)**

- Visitas en tiempo real
- Bandwidth usado
- Páginas más vistas

### **Google Analytics (Gratis)**

Añade en `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

---

## 🐛 TROUBLESHOOTING

### **Error: "Repository not found"**

```bash
# Verifica que el repo existe
# Ve a: https://github.com/Daniel-Navarro-Campos/mywed360

# Si no existe, créalo en GitHub primero
```

### **Error: "Build failed"**

Verifica en los logs de Netlify:
1. Deploy log
2. Busca el error
3. Arregla localmente
4. Push de nuevo

### **Error: "Page not found on refresh"**

✅ Ya está configurado en `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### **Error: "Cannot connect to API"**

1. Verifica que el backend está desplegado
2. Verifica `VITE_API_URL` en Netlify
3. Verifica CORS en el backend

---

## ✅ CHECKLIST COMPLETO

### **GitHub:**
- [ ] Código subido a GitHub
- [ ] Remoto configurado correctamente
- [ ] `.gitignore` funciona (no sube node_modules, etc)

### **Netlify:**
- [ ] Cuenta creada
- [ ] Repositorio conectado
- [ ] Build settings correctos
- [ ] Variables de entorno configuradas
- [ ] Primer deploy exitoso

### **Verificación:**
- [ ] Sitio carga en la URL de Netlify
- [ ] Home se ve correctamente
- [ ] Productos cargan
- [ ] Carrito funciona
- [ ] Responsive mobile funciona

### **Post-Deploy:**
- [ ] Cambiar nombre del sitio
- [ ] Configurar dominio (opcional)
- [ ] Añadir SSL (auto con Netlify)
- [ ] Configurar analytics (opcional)

---

## 🎯 WORKFLOW DIARIO

```bash
# 1. Hacer cambios localmente
npm run dev
# Prueba que funciona

# 2. Commit
git add .
git commit -m "fix: Corrección en el carrito"

# 3. Push
git push origin main

# 4. Espera 2-3 minutos
# Netlify despliega automáticamente

# 5. Verifica en producción
# https://resona-events.netlify.app
```

---

## 📱 NOTIFICACIONES DE DEPLOY

### **Email:**
Recibirás emails cuando:
- ✅ Deploy exitoso
- ❌ Deploy fallido
- ⚠️ Build warnings

### **Slack:**
1. Site settings > Build notifications
2. Add notification > Slack
3. Configura webhook

---

## 🚀 PRÓXIMOS PASOS

1. **Desplegar Backend:**
   - Render o Railway
   - Obtener URL del backend

2. **Actualizar Variables:**
   - En Netlify: `VITE_API_URL`
   - Trigger rebuild

3. **Testing:**
   - Verificar todo funciona
   - Probar carrito completo
   - Probar checkout

4. **Dominio:**
   - Comprar dominio (opcional)
   - Configurar DNS
   - SSL automático

---

## 💡 TIPS

### **Build más rápido:**
```toml
# netlify.toml
[build]
  command = "npm ci && npm run build"
```

### **Cache de node_modules:**
```toml
[build.environment]
  NPM_FLAGS = "--prefer-offline --no-audit"
```

### **Variables por environment:**
```bash
# Production
VITE_API_URL=https://api.resona.com

# Preview
VITE_API_URL=https://staging-api.resona.com
```

---

## 📞 RECURSOS

- **Netlify Docs:** https://docs.netlify.com
- **GitHub Docs:** https://docs.github.com
- **Vite Docs:** https://vitejs.dev
- **React Docs:** https://react.dev

---

## ✨ RESUMEN

```
VENTAJAS:
✅ Autodeploy en cada push
✅ Preview de PRs automático
✅ Rollback fácil
✅ SSL/HTTPS gratis
✅ CDN global
✅ 100GB bandwidth gratis/mes

DESVENTAJAS:
⚠️ Límite de 300 build minutes/mes (gratis)
⚠️ Analytics es de pago
```

---

**¡Todo listo para push to production!** 🚀

**Siguiente comando:**
```bash
.\deploy-github.bat
```

o

```bash
git push origin main
```
