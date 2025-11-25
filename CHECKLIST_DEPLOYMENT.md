# ✅ CHECKLIST DE DEPLOYMENT

_Lista de verificación antes de subir a producción_

---

## 📋 **PRE-DEPLOYMENT**

### **Código**
```
□ Todo commitado en Git
□ No hay console.log innecesarios
□ Variables de entorno en .env.example
□ .gitignore incluye .env, node_modules
□ Tests pasando (npm test)
□ Build funciona sin errores
```

### **Base de Datos**
```
□ Migraciones de Prisma aplicadas
□ Seed de datos iniciales preparado
□ Backup de datos locales hecho
□ DATABASE_URL de producción copiada
```

### **Configuración**
```
□ package.json tiene "engines"
□ package.json tiene "postinstall": "prisma generate"
□ Scripts de build configurados
□ CORS configurado para dominio de producción
```

---

## 🗄️ **BASE DE DATOS**

### **Railway PostgreSQL**
```
□ Cuenta creada en Railway.app
□ PostgreSQL database creado
□ DATABASE_URL copiada
□ Migraciones aplicadas: npx prisma migrate deploy
□ Datos seed cargados
□ Prisma Studio verificado
```

**Comando:**
```bash
cd packages/backend
# Actualizar DATABASE_URL en .env
npx prisma migrate deploy
npx prisma db seed
```

---

## 🚢 **BACKEND (Railway)**

### **Configuración Inicial**
```
□ Repositorio subido a GitHub
□ Cuenta Railway creada
□ New Project → Deploy from GitHub
□ Repositorio conectado
```

### **Settings**
```
Root Directory: packages/backend
Build Command: npm run build
Start Command: npm start
```

### **Variables de Entorno**
```
□ DATABASE_URL=postgresql://...
□ JWT_SECRET=tu_secret_muy_seguro_aqui
□ NODE_ENV=production
□ FRONTEND_URL=https://tudominio.com
□ STRIPE_SECRET_KEY=sk_live_...
□ STRIPE_WEBHOOK_SECRET=whsec_...
□ PORT=3001
```

### **Verificación**
```
□ Build exitoso (ver logs)
□ Generate Domain copiado
□ Health check funciona: curl https://tu-backend.railway.app/api/v1/health
□ API responde correctamente
```

---

## 🎨 **FRONTEND (Vercel)**

### **Configuración Inicial**
```
□ Cuenta Vercel creada
□ New Project → Import GitHub
□ Repositorio seleccionado
```

### **Settings**
```
Framework Preset: Vite
Root Directory: packages/frontend
Build Command: npm run build
Output Directory: dist
```

### **Variables de Entorno**
```
□ VITE_API_URL=https://tu-backend.railway.app/api/v1
□ VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

### **Verificación**
```
□ Build exitoso
□ Deploy completo
□ URL funciona
□ Sin errores en consola del navegador
□ Imágenes cargan
□ API conecta correctamente
```

---

## 🔒 **SEGURIDAD**

### **Backend**
```
□ Helmet instalado y configurado
□ Rate limiting activado
□ CORS configurado solo para dominios permitidos
□ JWT secrets diferentes a los de desarrollo
□ Variables sensibles en .env (no en código)
```

### **Frontend**
```
□ API keys en variables de entorno
□ No hay secrets en el código
□ vercel.json con headers de seguridad
```

---

## 💳 **STRIPE**

### **Configuración**
```
□ Stripe Dashboard → Modo Live activado
□ API Keys de producción copiadas
□ Webhook configurado: https://api.tudominio.com/api/v1/stripe/webhook
□ Eventos seleccionados:
   - checkout.session.completed
   - payment_intent.succeeded
   - payment_intent.payment_failed
□ Webhook Secret copiado
□ Prueba de pago realizada
```

---

## 🌐 **DOMINIO** (Opcional)

### **Compra**
```
□ Dominio comprado en Namecheap/GoDaddy
□ DNS configurado:
   - A @ → IP de Vercel
   - CNAME www → tuproyecto.vercel.app
   - CNAME api → tu-backend.railway.app
```

### **SSL**
```
□ Vercel: SSL automático activado
□ Railway: SSL automático activado
□ Dominios verificados
```

---

## 📧 **EMAIL** (Opcional)

```
□ SendGrid/Resend cuenta creada
□ API Key obtenida
□ Variables configuradas en Railway
□ Plantillas de email preparadas
□ Email de prueba enviado
```

---

## 🧪 **TESTING EN PRODUCCIÓN**

### **Funcionalidad Básica**
```
□ Homepage carga
□ Login funciona
□ Registro funciona
□ Productos se muestran
□ Búsqueda funciona
□ Filtros funcionan
```

### **Carrito y Checkout**
```
□ Añadir al carrito funciona
□ Modificar cantidades funciona
□ Checkout de Stripe abre
□ Pago de prueba completa
□ Confirmación llega
□ Pedido aparece en admin
```

### **Admin**
```
□ Login admin funciona
□ Dashboard carga
□ CRUD productos funciona
□ Ver pedidos funciona
□ Calculadora funciona
□ Gestión de alertas funciona
```

### **Performance**
```
□ Lighthouse score > 80
□ First Contentful Paint < 2s
□ Time to Interactive < 4s
□ No memory leaks
```

---

## 📊 **MONITOREO**

```
□ Railway logs accesibles
□ Sentry configurado (opcional)
□ Google Analytics añadido (opcional)
□ Uptime monitor configurado (opcional)
```

---

## 🚨 **CONTINGENCIAS**

### **Plan de Rollback**
```
□ Backup de BD antes de migrar
□ Git tag creado: git tag -a v1.0.0 -m "Production release"
□ Procedimiento de rollback documentado
```

### **Contactos**
```
□ Soporte Railway: support@railway.app
□ Soporte Vercel: support@vercel.com
□ Soporte Stripe: support@stripe.com
```

---

## ✅ **GO LIVE**

### **Anuncio**
```
□ Dominio apuntando correctamente
□ Todas las pruebas pasando
□ Equipo notificado
□ Documentación actualizada
□ README con instrucciones
```

### **Post-Launch**
```
□ Monitorear logs primeras 24h
□ Verificar transacciones
□ Responder feedback usuarios
□ Revisar métricas de performance
```

---

## 📞 **SOPORTE**

Si algo falla:

1. **Revisar logs en Railway**: Dashboard → tu servicio → Observability
2. **Verificar variables de entorno**: Settings → Variables
3. **Rollback si es necesario**: Deployments → anterior → Redeploy
4. **Contactar soporte**: Incluir logs y descripción del problema

---

## 🎉 **¡LISTO!**

Una vez completados todos los checkboxes:

```
✅ Código en producción
✅ Base de datos migrada
✅ Frontend y Backend desplegados
✅ Stripe configurado
✅ Dominio funcionando
✅ Todo testeado

🚀 ¡Tu aplicación está VIVA!
```

---

**Mantén este checklist para futuros deployments y actualizaciones.**
