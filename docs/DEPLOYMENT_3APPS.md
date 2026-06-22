# Deployment de las 3 apps (Rent / Events / Admin)

Guía operativa para Dani. Estado al cierre de la sesión de migración (2026-04-22).

## Arquitectura

```
                       ┌─────────────────────────────┐
                       │  Backend (Render/Railway)   │
                       │  resona-backend.onrender… │
                       │  Puerto 3001                │
                       └─────────────────────────────┘
                         ▲         ▲           ▲
                         │ CORS    │ CORS      │ CORS
        ┌────────────────┘         │           └────────────────┐
        │                          │                            │
┌───────────────┐         ┌────────────────┐         ┌─────────────────┐
│ resonarent.com│         │resonaevents.com│         │gestion.resona.com│
│  apps/rent    │         │  apps/events   │         │  apps/admin      │
│  Vercel/Netlify│         │  Vercel/Netlify│         │  Vercel/Netlify  │
└───────────────┘         └────────────────┘         └─────────────────┘
```

**Un único backend y base de datos**. Las 3 apps hablan al mismo `resona-backend.onrender.com/api/v1`.

## Apps y puertos

| App | Dominio objetivo | Puerto dev | Comando build |
|---|---|---|---|
| admin | `gestion.resona.com` | 3002 | `npm run build --workspace=admin` |
| rent | `resonarent.com` | 3003 | `npm run build --workspace=rent` |
| events | `resonaevents.com` | 3004 | `npm run build --workspace=events` |

Backend en puerto 3001 (igual que antes).

## Variables de entorno

### Cada app frontend

```env
VITE_API_URL=https://resona-backend.onrender.com/api/v1
```

(En dev, cada app tiene proxy `/api` → `http://localhost:3001` vía Vite, por lo que `VITE_API_URL` puede quedar vacío y se usará `/api/v1` relativo.)

### Backend

```env
CORS_ORIGIN=https://resonarent.com,https://resonaevents.com,https://gestion.resona.com,https://www.resonarent.com,https://www.resonaevents.com
```

Los dominios públicos son **`resonarent.com` y `resonaevents.com`** (no existe resonaweb.com). El admin va en `gestion.resona.com`.

Si tu backend local dev corre en :3001, las 3 apps apuntarán a él automáticamente (ya está en el fallback por defecto de [index.ts:153](../packages/backend/src/index.ts#L153)).

## Deploy en Vercel (recomendado por monorepo)

Cada app tiene su `vercel.json` en la raíz de la app ([apps/admin/vercel.json](../apps/admin/vercel.json), [apps/rent/vercel.json](../apps/rent/vercel.json), [apps/events/vercel.json](../apps/events/vercel.json)) con el `buildCommand` apuntando al root del monorepo.

### Para cada app (repetir 3 veces)

1. **Crear proyecto Vercel** nuevo apuntando al repo.
2. **Root Directory**: `apps/admin` (o `apps/rent` / `apps/events`).
3. **Framework Preset**: Other (el `framework` en `vercel.json` está puesto a `null`).
4. **Build Command**: dejar el default — Vercel leerá `vercel.json`.
5. **Output Directory**: `dist`.
6. **Install Command**: `npm install` (Vercel detecta el monorepo automáticamente).
7. **Variables de entorno**:
   - `VITE_API_URL=https://resona-backend.onrender.com/api/v1`
8. **Dominio**: asignar `resonarent.com` / `resonaevents.com` / `gestion.resona.com`.

### Puntos de atención

- En Vercel monorepo, la detección automática puede fallar. Si ocurre, usa **"Include source files outside of the Root Directory"** en Settings → General.
- El cache de Vercel entre builds del monorepo puede quedarse obsoleto. Si ves errores extraños de deps, hacer "Redeploy without cache".
- Para `apps/admin`: añade `X-Robots-Tag: noindex, nofollow` (ya está en el vercel.json) — no queremos que Google indexe el panel.

## Alternativa: Netlify

Mismo principio. Añadir `netlify.toml` en cada app con:

```toml
[build]
  base = "apps/admin"   # o rent / events
  command = "cd ../.. && npm install && npm run build --workspace=admin"
  publish = "apps/admin/dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Orden de deploy recomendado

1. **Backend primero**: confirmar que `CORS_ORIGIN` incluye los 3 dominios nuevos. Redeploy backend.
2. **apps/admin** a `gestion.resona.com`. Es interno, sin riesgo SEO. Validar login con una cuenta con rol interno.
3. **apps/rent** a `resonarent.com`. Monitorear conversión.
4. **apps/events** a `resonaevents.com`. Idem.
5. Después de 2 semanas sin incidencias, apagar admin del monolito.

> ⚠️ **OBSOLETO** (2026-06-23): la sección siguiente asumía un dominio legacy `resonaweb.com` que **no existe**. Los únicos dominios públicos son `resonarent.com` y `resonaevents.com`. El mapa de 301s y el "Cambio de dirección" en Search Console desde resonaweb.com no aplican. Conservar solo como referencia de patrones de redirect.

## Migración SEO de resonaweb.com (OBSOLETO)

Cuando rent + events estén estables en producción:

### Opción A — resonaweb.com se convierte en 301 catch-all

Editar el `packages/frontend/vercel.json` del monolito para hacer 301s por patrón:

```json
{
  "redirects": [
    { "source": "/productos/:path*", "destination": "https://resonarent.com/productos/:path*", "permanent": true },
    { "source": "/carrito", "destination": "https://resonarent.com/carrito", "permanent": true },
    { "source": "/checkout/:path*", "destination": "https://resonarent.com/checkout/:path*", "permanent": true },
    { "source": "/cuenta/:path*", "destination": "https://resonarent.com/cuenta/:path*", "permanent": true },
    { "source": "/login", "destination": "https://resonarent.com/login", "permanent": true },
    { "source": "/registro", "destination": "https://resonarent.com/registro", "permanent": true },
    { "source": "/alquiler-:path*", "destination": "https://resonarent.com/alquiler-:path*", "permanent": true },
    { "source": "/servicios/alquiler-:path*", "destination": "https://resonarent.com/servicios/alquiler-:path*", "permanent": true },

    { "source": "/calculadora-evento", "destination": "https://resonaevents.com/calculadora-evento", "permanent": true },
    { "source": "/packs/:path*", "destination": "https://resonaevents.com/packs/:path*", "permanent": true },
    { "source": "/blog/:path*", "destination": "https://resonaevents.com/blog/:path*", "permanent": true },
    { "source": "/servicios/bodas-:path*", "destination": "https://resonaevents.com/servicios/bodas-:path*", "permanent": true },
    { "source": "/servicios/sonido-bodas-:path*", "destination": "https://resonaevents.com/servicios/sonido-bodas-:path*", "permanent": true },
    { "source": "/servicios/produccion-:path*", "destination": "https://resonaevents.com/servicios/produccion-:path*", "permanent": true },
    { "source": "/servicios/iluminacion-:path*", "destination": "https://resonaevents.com/servicios/iluminacion-:path*", "permanent": true },
    { "source": "/sonido-bodas-valencia", "destination": "https://resonaevents.com/sonido-bodas-valencia", "permanent": true },
    { "source": "/contacto", "destination": "https://resonaevents.com/contacto", "permanent": true },
    { "source": "/sobre-nosotros", "destination": "https://resonaevents.com/sobre-nosotros", "permanent": true },
    { "source": "/faqs", "destination": "https://resonaevents.com/faqs", "permanent": true },

    { "source": "/admin/:path*", "destination": "https://gestion.resona.com/admin/:path*", "permanent": true },

    { "source": "/", "destination": "https://resonaevents.com/", "permanent": true }
  ]
}
```

### Google Search Console

1. Añadir `resonarent.com` y `resonaevents.com` como propiedades nuevas.
2. Enviar los nuevos sitemaps:
   - `https://resonarent.com/sitemap.xml` (apuntará al backend vía rewrite).
   - `https://resonaevents.com/sitemap.xml` idem.
3. Usar **"Cambio de dirección"** de `resonaweb.com` → `resonaevents.com` (la intención mayoritaria histórica). Nota: Google solo permite 1 cambio de dirección; Rent se recupera por los 301 + nueva presencia SEO.
4. Mantener resonaweb.com vivo **mínimo 6 meses** para 301s estables.

## Sitemaps

✅ **Hecho.** El backend sirve tres sitemaps dinámicos desde [sitemap.controller.ts](../packages/backend/src/controllers/sitemap.controller.ts) ([rutas](../packages/backend/src/routes/sitemap.routes.ts)):

| Ruta backend | Dominio (env) | Contenido |
|---|---|---|
| `/sitemap.xml` | `FRONTEND_URL` (genérico/monolito) | todo |
| `/sitemap-rent.xml` | `RENT_URL` → `resonarent.com` | productos + categorías + SEO pages de alquiler + compartidas |
| `/sitemap-events.xml` | `EVENTS_URL` → `resonaevents.com` | packs + blog + SEO pages de eventos + compartidas |

Cada app reescribe su `/sitemap.xml` público al sitemap del backend que le corresponde ([apps/rent/vercel.json](../apps/rent/vercel.json), [apps/events/vercel.json](../apps/events/vercel.json)).

**Criterio de split de SEO pages** (en el controller): una página es de Rent si su slug contiene `alquiler` o es `productos`; el resto es de Events. `contacto`, `faqs`, `sobre-nosotros` y la home se incluyen en ambos.

Env vars opcionales backend (con fallback al dominio correcto): `RENT_URL`, `EVENTS_URL`.

## Dev local con las 3 apps

Para levantar todo en paralelo:

```bash
# Terminal 1: backend
npm run dev:backend

# Terminal 2: monolito (opcional, aún vivo)
npm run dev:frontend

# Terminal 3: admin
npm run dev --workspace=admin        # → http://localhost:3002

# Terminal 4: rent
npm run dev --workspace=rent         # → http://localhost:3003

# Terminal 5: events
npm run dev --workspace=events       # → http://localhost:3004
```

Alternativa: un `concurrently` global. Añadir a [package.json](../package.json) raíz:

```json
"dev:all": "concurrently \"npm run dev:backend\" \"npm run dev --workspace=admin\" \"npm run dev --workspace=rent\" \"npm run dev --workspace=events\""
```

## Autenticación cross-app

El mismo `User` en BDD sirve a las 3 apps. Cada app tiene su propio `localStorage['auth-storage']` (origen distinto), así que el usuario tendrá que hacer login por separado en cada una.

**Si quieres SSO entre rent ↔ events** (cuenta compartida sin re-login), hay que mover las cookies JWT al dominio raíz `.resona.com` — pero eso requiere que ambas vivan en subdominios de resona.com, no en dominios separados. Decisión pendiente (ver [MIGRATION_SPLIT_RENT_EVENTS.md](MIGRATION_SPLIT_RENT_EVENTS.md#7-decisiones-pendientes-antes-de-fase-2)).

Por ahora: login separado. Aceptable como primera versión.

## Problemas conocidos / TODOs

- [ ] **Rediseños UX** (pendientes de decisión de diseño):
  - Rent: guest checkout, selector fecha en hero, WhatsApp flotante, badges de urgencia, Stripe Express, email de carrito abandonado.
  - Events: quiz 3 pasos (reemplazar calculator 6 pasos), galería portfolio, home visual, teléfono obligatorio en quote request.
  - Social proof: unificar "+500" vs "+2.000" eventos. Integrar reviews reales.
- [ ] **Migración SEO completa** (ver sección correspondiente — se hace una vez los dominios estén estables).
- [ ] **Sitemaps separados** por app (backend script a parametrizar).
- [ ] **Borrar admin pages del monolito** tras 2 semanas de 301s estables.
- [ ] **Componentes/utils duplicados** entre rent y events: Rent y Events tienen copias de `components/`, `services/`, `utils/`. Si algo se mantiene igual en ambas, extraerlo a `packages/ui` o `packages/utils`. No urgente.

## Ficheros de deploy en el repo

- [apps/admin/vercel.json](../apps/admin/vercel.json)
- [apps/rent/vercel.json](../apps/rent/vercel.json)
- [apps/events/vercel.json](../apps/events/vercel.json)
- [render.yaml](../render.yaml) — backend (sin cambios).
- Backend CORS configurable vía `CORS_ORIGIN` — ver [packages/backend/src/index.ts:152](../packages/backend/src/index.ts#L152).
