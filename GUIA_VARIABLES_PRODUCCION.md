# 🔐 GUÍA: Variables de Entorno para Producción

## ✅ ARCHIVOS CREADOS:

```
✅ packages/backend/.env.production    ← Backend
✅ packages/frontend/.env.production   ← Frontend
```

---

## 📝 QUÉ SON LAS VARIABLES DE ENTORNO

Son **configuraciones secretas** que cambian según el entorno:

- **Desarrollo** (tu PC): Usa base de datos local, emails falsos, etc.
- **Producción** (tu servidor): Usa base de datos real, emails reales, etc.

**¿Por qué son importantes?**
- No se suben a GitHub (seguridad)
- Cada entorno tiene su propia configuración
- Puedes cambiar configuración sin cambiar código

---

## 🚨 LO QUE DEBES HACER AHORA

### 1. **Base de Datos de Producción** (CRÍTICO)

Tienes que crear una base de datos PostgreSQL en un servicio online.

#### Opción A: Render.com (RECOMENDADO - Gratis)

```
1. Ve a: https://render.com/
2. Registrarte con GitHub
3. New → PostgreSQL
4. Nombre: resona-db
5. Region: Frankfurt (más cerca de España)
6. Plan: Free
7. Click "Create Database"
8. Espera 2-3 minutos
9. Copia la "External Database URL"
```

Te dará algo como:
```
postgresql://resona_user:xxxxx@dpg-xxxxx-frankfurt-postgres.render.com/resona_db
```

#### Opción B: Railway (Alternativa)

```
1. Ve a: https://railway.app/
2. Registrate con GitHub
3. New Project → Provision PostgreSQL
4. Copia la DATABASE_URL
```

#### ✏️ Editar el archivo:

Abre: `packages/backend/.env.production`

```env
# Cambiar esta línea:
DATABASE_URL="postgresql://postgres:TU_PASSWORD_AQUI@localhost:5432/resona_db"

# Por tu URL real:
DATABASE_URL="postgresql://resona_user:xxxxx@dpg-xxxxx.render.com/resona_db"
```

---

### 2. **Datos de tu Empresa** (IMPORTANTE)

Edita en: `packages/backend/.env.production`

```env
# Cambiar estos datos:
BUSINESS_NAME=ReSona Events
BUSINESS_PHONE=+34XXXXXXXXX                          ← Tu teléfono
BUSINESS_EMAIL=info@resonaevents.com
BUSINESS_ADDRESS="Tu dirección fiscal completa"     ← Tu dirección
BUSINESS_TAX_ID=BXXXXXXXX                            ← Tu NIF/CIF
```

**¿Por qué?** Aparecen en facturas y emails a clientes.

---

### 3. **Email Real** (IMPORTANTE)

Ahora mismo los emails se muestran en consola. Necesitas un servicio real.

#### Opción A: SendGrid (RECOMENDADO - 100 emails/día gratis)

```
1. Ve a: https://sendgrid.com/
2. Registrarte (gratis)
3. Settings → API Keys → Create API Key
4. Nombre: "ReSona Production"
5. Full Access
6. Copiar la clave (empieza con SG.)
```

Editar `.env.production`:
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Opción B: Gmail (Si tienes cuenta Gmail)

```
1. Ve a: https://myaccount.google.com/apppasswords
2. Nombre: "ReSona Web"
3. Copiar contraseña generada (16 caracteres)
```

Editar `.env.production`:
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx    ← Contraseña de aplicación
```

---

### 4. **Pagos** (OPCIONAL AHORA - Configurar después)

#### Stripe (Internacional)

```
1. Ve a: https://dashboard.stripe.com/register
2. Registrate
3. Más tarde activas modo producción
4. Copias las claves (sk_live_xxx y pk_live_xxx)
```

#### Redsys (TPV Español - Bizum)

```
1. Contacta con tu banco
2. Pide TPV Virtual con Redsys
3. Te darán:
   - Código de comercio
   - Terminal
   - Clave secreta
4. Los pones en .env.production
```

**IMPORTANTE:** Por ahora déjalos en test, cámbialos cuando estés listo.

---

## 🎯 PRIORIDADES:

### ✅ HACER AHORA (Obligatorio para funcionar):

```
1. ✅ Base de datos de producción (Render/Railway)
2. ✅ Datos de empresa (NIF, dirección, teléfono)
3. ✅ Email real (SendGrid o Gmail)
```

### ⏳ HACER DESPUÉS (Cuando estés listo):

```
4. Stripe/Redsys en modo producción
5. Google Maps API
6. Cloudinary para imágenes
7. Analytics
```

---

## 🔍 EXPLICACIÓN DETALLADA DE CADA VARIABLE:

### Backend (.env.production)

| Variable | Qué es | Ejemplo |
|----------|--------|---------|
| `NODE_ENV` | Entorno de ejecución | `production` |
| `DATABASE_URL` | Conexión a PostgreSQL | `postgresql://user:pass@host/db` |
| `JWT_SECRET` | Clave secreta para tokens | (Ya generado - no tocar) |
| `BACKEND_URL` | URL del backend | `https://api.resonaevents.com` |
| `FRONTEND_URL` | URL del frontend | `https://www.resonaevents.com` |
| `EMAIL_PROVIDER` | Servicio de email | `sendgrid` o `smtp` |
| `BUSINESS_TAX_ID` | Tu NIF/CIF | `B12345678` |

### Frontend (.env.production)

| Variable | Qué es | Ejemplo |
|----------|--------|---------|
| `VITE_API_URL` | Dónde está tu backend | `https://api.resonaevents.com` |
| `VITE_APP_URL` | URL de tu web | `https://www.resonaevents.com` |
| `VITE_STRIPE_PUBLIC_KEY` | Clave pública de Stripe | `pk_live_xxxxx` |

---

## 🚀 SIGUIENTE PASO:

Una vez hayas editado los archivos:

```bash
# Verificar que funcionan
1. Editar .env.production (backend)
2. Editar .env.production (frontend)
3. Migrar la base de datos:
   cd packages/backend
   npx prisma migrate deploy
```

---

## ❓ PREGUNTAS FRECUENTES:

**P: ¿Qué pasa si no configuro email real?**
R: Los emails se mostrarán en consola del servidor, los clientes no recibirán nada.

**P: ¿Puedo usar la misma base de datos de desarrollo?**
R: NO. Debes crear una específica para producción (Render/Railway).

**P: ¿Los secrets JWT son buenos?**
R: Sí, los he generado aleatoriamente. NUNCA los cambies sin motivo.

**P: ¿Qué URL uso para el backend?**
R: Depende de dónde despliegues. Ejemplos:
- Render: `https://resona-api.onrender.com`
- Railway: `https://resona-production.up.railway.app`
- Vercel: `https://api.resonaevents.com` (con dominio propio)

---

## 🔒 SEGURIDAD:

**NUNCA:**
- ❌ Subir archivos .env a GitHub
- ❌ Compartir tus secrets
- ❌ Usar secrets de desarrollo en producción

**SIEMPRE:**
- ✅ Verificar que .env.production está en .gitignore
- ✅ Hacer backup de .env.production en lugar seguro
- ✅ Usar secrets fuertes y aleatorios

---

## ✅ CHECKLIST:

Antes de desplegar, verifica:

```
☐ Base de datos creada en Render/Railway
☐ DATABASE_URL actualizada en .env.production
☐ Datos de empresa completados (NIF, dirección, teléfono)
☐ Email configurado (SendGrid o SMTP)
☐ BACKEND_URL y FRONTEND_URL correctas
☐ CORS_ORIGIN incluye tu dominio
☐ Archivos .env.production NO están en GitHub
```

---

**¿Necesitas ayuda con algún paso específico?** 🚀

**Siguiente:** Cuando completes esto, te ayudaré a desplegar en Vercel/Render.
