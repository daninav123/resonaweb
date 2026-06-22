# Migración: Split de resonaweb en 3 apps (Rent / Events / Admin)

> **Estado**: Fase 0 ✅, Fase 1 ✅, Fase 2 ✅ (código), Fase 3 ✅ (código). Falta deploy real (tarea de Dani) + rediseños UX + Fase 4 (SEO).
> **Última actualización**: 2026-04-22
> **Responsable**: Dani
> **Guía de deploy**: [DEPLOYMENT_3APPS.md](DEPLOYMENT_3APPS.md)

---

## 1. Contexto y decisión estratégica

Hoy `resonaweb` es un frontend monolítico (React + Vite) que sirve **dos modelos de negocio muy distintos** mezclados en la misma UX:

- **Alquiler de equipos** (particulares y profesionales): e-commerce transaccional, usuario *decidido/técnico* que sabe qué quiere, busca specs, precio y disponibilidad, compra rápido.
- **Eventos completos con montaje**: servicio consultivo, usuario *explorador/emocional* que quiere inspirarse, ver portfolio, recibir asesoramiento; el cierre es por lead/WhatsApp, no por carrito.

Mantener ambos flujos en una sola web obliga a comprometer la UX de los dos. La decisión es **separarlos en dos dominios públicos + un panel de gestión común**:

| Dominio | Público | Patrón UX | CTA principal |
|---|---|---|---|
| `resonarent.com` | Particulares y pros que saben qué quieren alquilar | E-commerce denso, técnico | "Reservar ahora" (compra directa) |
| `resonaevents.com` | Clientes que buscan evento completo (bodas, empresa, cumpleaños) | Visual, portfolio, storytelling | "Cuéntanos tu evento" (lead) |
| `gestion.resonaevents.com` | Equipo interno | Panel admin existente | — |

**Razones por las que se valida el split** (discusión con Dani):

- Los dos públicos tienen **intenciones opuestas** → UX opuesta.
- Backoffice, stock, clientes y facturación son **uno solo** → no hay duplicación real de negocio, solo de capa presentación.
- El tráfico actual de resonaweb es modesto → la "pérdida" de autoridad SEO al dividir dominios es asumible frente al beneficio de posicionar cada intención de forma limpia.
- Cross-link con banner entre ambas webs cubre el caso "llegué al dominio equivocado".

**Alternativas descartadas**:

- *Opción B: subdominios `alquiler.resona.com` + `eventos.resona.com`*. Descartada porque la marca "Resona" actual no tiene suficiente brand search como para que los subdominios añadan valor; los dominios dedicados comunican mejor la propuesta de valor.
- *Opción C: un solo dominio con dos hubs*. Descartada porque los funnels comparten header/footer → difícil que cada uno "respire" su propuesta.

---

## 2. Análisis del funnel actual (baseline CRO)

Este análisis motivó las decisiones de producto de cada nueva app. Resumen de **fricciones principales** detectadas en el estado actual:

### Friction points críticos

1. **Login obligatorio en checkout** ([packages/frontend/src/App.tsx:297](../packages/frontend/src/App.tsx#L297) — `PrivateRoute` protege `/checkout`). Killer de conversión para un negocio de compra puntual como bodas/eventos.
2. **Carrito ultra-complejo**: [CartPage.tsx](../packages/frontend/src/pages/CartPage.tsx) tiene 1479 líneas gestionando fechas globales, fechas custom por item, disponibilidad, cupones, transporte, montaje, depósito. Sobrecarga cognitiva.
3. **Calculadora de 6 pasos** ([EventCalculatorPage.tsx](../packages/frontend/src/pages/EventCalculatorPage.tsx)) sin autosave ni preview de precio hasta el final. Alto drop-off.
4. **Sin WhatsApp/chat** visible. Solo teléfono en footer.
5. **Disponibilidad no inline**: "la disponibilidad se verificará al seleccionar fechas en el carrito" → el usuario añade cosas que pueden no estar disponibles.
6. **Social proof inconsistente**: "+500 eventos" en TrustBar vs "+2.000 eventos" en HomePage. Reviews comentadas porque no hay datos reales.
7. **Sin precio claro por duración** en cards del catálogo.
8. **Sin guest checkout + Stripe Express/Apple Pay**.
9. **Quote request permite lead sin teléfono** ([quoteRequest.controller.ts:31](../packages/backend/src/controllers/quoteRequest.controller.ts#L31) solo exige email O teléfono).
10. **Sin recuperación de carrito abandonado** por email.

### Fixes CRO que se aplicarán durante la migración

- Rent: **guest checkout**, Stripe Express/Apple Pay/Google Pay, selector de fecha en hero que se propaga a catálogo/ficha, disponibilidad inline, badges ("más reservado", "últimas unidades"), WhatsApp flotante, email de carrito abandonado.
- Events: **quiz 3 pasos** (no 6) con preview de presupuesto en vivo, portfolio visual, galería de montajes, CTA WhatsApp + "Cuéntanos tu evento", teléfono OBLIGATORIO en quote request.
- Ambas: social proof unificado y real, reviews integradas, FAQ específica por producto/servicio.

---

## 3. Arquitectura objetivo

```
resona/ (monorepo npm workspaces — ya existe)
├─ apps/
│   ├─ rent/          → resonarent.com      (Vite)
│   ├─ events/        → resonaevents.com    (Vite)
│   └─ admin/         → gestion.resonaevents.com  (Vite)
├─ packages/
│   ├─ shared-types/  → enums Prisma-alineados, tipos User/Order/Product/Pack/QuoteRequest
│   ├─ api-client/    → Axios + interceptor JWT + refresh (hoy en frontend/src/services/api.ts)
│   ├─ ui/            → Layout base, botones, modales, forms, TrustBar base
│   └─ utils/         → priceWithVAT, cartCalculations, invoiceHelper, schemas Zod
└─ backend/           → el mismo de ahora, sin cambios estructurales (solo CORS)
```

### Decisiones de arquitectura

1. **Un solo backend**, el actual. Solo ajustes de CORS para aceptar los 3 dominios.
2. **Auth cross-app para clientes**: cookie JWT con `domain=.resona.com` compartida entre `rent` y `events` (requiere que ambos sean subdominios de resona.com, o usar un dominio de auth central tipo `auth.resona.com` con OAuth-style flow). **Decisión pendiente** — ver sección 7.
3. **Admin aislado**: login propio en `gestion.resonaevents.com`. Solo roles internos (`ADMIN`, `SUPERADMIN`, `COMMERCIAL`, `WAREHOUSE`, `TECHNICIAN`, `ACCOUNTANT`). El middleware backend ya lo soporta.
4. **Stock y catálogo únicos** en BDD (ya lo son). Un `Product` puede alquilarse desde Rent y formar parte de un `Pack` en Events, sin duplicación.
5. **Cliente unificado en BDD**: aunque un mismo usuario compre alquiler y contrate evento, es un único `User` en el CRM → permite cross-sell desde el admin.

---

## 4. Orden de fases y justificación

**Admin primero → Rent → Events.**

- **Admin primero** porque es interno (cero riesgo SEO, cero riesgo conversión), valida la separación y los shared packages sin presión, y extraer el admin adelgaza el frontend público un 60% (102 de ~170 páginas son admin).
- **Rent antes que Events** porque es el flujo transaccional donde cada cambio se mide directamente en €. Tenerlo estable y rápido cuanto antes es prioridad.
- **Events al final** porque requiere mucho diseño/UX nuevo (no es solo mover código) y puede convivir con el monolito unos días sin problema.

---

## 5. Plan por fases

### Fase 0 — Setup del monorepo — ✅ COMPLETA (2026-04-22)

- [x] Añadir `apps/*` al `workspaces` de `package.json` raíz.
- [x] Crear `packages/shared-types`, `packages/api-client`, `packages/ui`, `packages/utils` con `package.json` + `tsconfig.json` + `src/index.ts` placeholder. Exportan `.ts` directo sin build.
- [x] Crear `tsconfig.base.json` en raíz.
- [x] `npm install` → symlinks creados en `node_modules/@resona/*`.
- [x] Typecheck aislado pasa en los 4 paquetes.
- [ ] *(Pendiente)* CI: actualizar workflow para construir las 3 apps en paralelo. Se hará al final de Fase 1.

**Resultado**: monorepo preparado. Los paquetes compartidos están vacíos; se pueblan conforme se extrae código del monolito.

### Fase 1 — Extraer Admin (1.5-2 semanas)

**1.A — Scaffold inicial — ✅ COMPLETO (2026-04-22)**

- [x] Crear `apps/admin/` con Vite + React 18 + Tailwind + React Router + React Query + Zustand (deps mínimas; se añaden más al mover páginas).
- [x] `package.json` con nombre `admin`, workspace deps a `@resona/*`, puerto dev 3002 y proxy `/api` → 3001.
- [x] `tsconfig.json` extiende `tsconfig.base.json` (con `strict: false` temporalmente para aceptar código legacy).
- [x] `tailwind.config.js` con la paleta `resona`/`primary` del monolito + `content` que incluye `packages/ui/`.
- [x] `main.tsx` con `BrowserRouter` + `QueryClientProvider` + `Toaster`.
- [x] `App.tsx` con router placeholder (`/login`, `/dashboard`, catch-all).
- [x] Páginas placeholder (`LoginPage`, `DashboardPage`) que demuestran el wiring.
- [x] **Build pasa** (1.24s, 66KB gzipped).
- [x] **Dev server arranca** en `http://localhost:3002/` respondiendo 200.
- [x] **Typecheck pasa**.

**1.B — Extracción de infraestructura compartida — ✅ COMPLETA (2026-04-22)**

- [x] Extraer a `packages/api-client/src/`:
  - `api.ts` (Axios con interceptor JWT, refresh, toast de errores)
  - `authStore.ts` (Zustand store con login/logout/checkAuth/refresh)
  - `tokenRefresh.ts` (renovación periódica y por proximidad de expiración)
  - `rolePermissions.ts` (roles dinámicos + fallback hardcoded, `filterMenuItems`, `canAccessPath`, etc.)
- [x] Extraer a `packages/shared-types/src/user.ts` los tipos `User`, `UserLevel`, `UserRole`, `RegisterData`, `AuthTokens`, `LoginResponse`.
- [x] Dejar los archivos originales en `packages/frontend/src/` como **re-exports** desde `@resona/api-client` — no se rompe ningún import existente del monolito.
- [x] Conectar el `LoginPage` del admin al backend real. Login rechaza cuentas sin rol interno (`ADMIN`, `SUPERADMIN`, `COMMERCIAL`, `WAREHOUSE`, `TECHNICIAN`, `ACCOUNTANT`).
- [x] Crear `RequireInternalAuth` wrapper en `apps/admin/src/components/` para proteger rutas con `checkAuth` + validación de rol.
- [x] Copiar `AdminLayout.tsx` a `apps/admin/src/components/` con imports ajustados a `@resona/api-client`. Sidebar completo funcional (10 secciones, ~60 ítems).
- [x] Safelist dinámico en Tailwind para las clases `bg-{color}-500/20` y `text-{color}-300` que usa el role badge.
- [x] **Build pasa** en admin (2.3s, 95KB gzipped).
- [x] **Build del monolito sigue pasando** (26s) — la extracción no rompió nada.

**1.C — Mover páginas admin**

- [x] Mover primera página de ejemplo: [BackupManager](../apps/admin/src/pages/admin/BackupManager.tsx) como PoC del flujo (copiar + ajustar imports `@resona/api-client` + añadir ruta).
- [ ] Mover el resto de páginas de [packages/frontend/src/pages/admin/](../packages/frontend/src/pages/admin/) (101 pendientes) en grupos temáticos:
  - Dashboard / RoleDashboard / SmartDashboard
  - Products / Packs / Categories / ExtraCategories / Inventory / Calculator
  - Orders / Refunds / OrderDetail / OrderModification
  - Invoices / ManualInvoice / Contabilidad / Fiscal / Reports
  - CRM / CRMDetail / QuoteRequests / CreateQuote / Commissions
  - Staff / Vehicles / Warehouse / Maintenance / Suppliers
  - Calendar / CalendarManager / Events / EventTemplates / ResourceCalendar
  - Stock / StockAlerts / PickingList / LoadingSheet / MaterialCheck
  - Settings / CompanySettings / RolePermissions / Users / ShippingConfig
  - Coupons / Notifications / Backups / Contracts / POS / EmailMarketing / Blog / Portfolio / TechMobileView
- [ ] Mover [packages/frontend/src/pages/commercial/](../packages/frontend/src/pages/commercial/) → `apps/admin/src/pages/commercial/` (4 páginas).
- [ ] Mover [packages/frontend/src/components/admin/](../packages/frontend/src/components/admin/) → `apps/admin/src/components/`.
- [ ] Actualizar imports cruzados con `components/` generales (extraer a `packages/ui` si se usan también en Rent/Events).
- [ ] Añadir cada ruta migrada al router de `apps/admin` (el catch-all `/admin/*` por ahora pinta el Dashboard como placeholder para rutas no migradas).

**Patrón de migración por página** (validado con BackupManager):
1. `cp packages/frontend/src/pages/admin/X.tsx apps/admin/src/pages/admin/X.tsx`
2. Ajustar imports:
   - `'../../services/api'` → `'@resona/api-client'`
   - `'../../stores/authStore'` → `'@resona/api-client'`
   - `'../../config/rolePermissions'` → `'@resona/api-client'`
   - `'../../components/admin/X'` → `'../../components/X'` (o extraer a `packages/ui`)
3. Añadir ruta en `apps/admin/src/App.tsx` apuntando a la nueva página.
4. `npm run build --workspace=admin` para verificar.
5. Cuando todas las páginas de un grupo estén migradas, borrar las originales del monolito en un commit aparte.

**1.D — Deploy y corte (pendiente)**

- [ ] Backend: añadir `gestion.resonaevents.com` a CORS. Verificar que `/api/v1/admin/*` esté protegido por `authorize()`.
- [ ] Deploy `gestion.resonaevents.com` (nuevo project Vercel/Railway apuntando a `apps/admin`).
- [ ] **Temporal**: el frontend monolítico sigue sirviendo `/admin/*` con **301 → gestion.resonaevents.com** durante 2 semanas.
- [ ] Tras 2 semanas: borrar `packages/frontend/src/pages/admin/` del monolito.

**Riesgo**: medio. El admin es grande pero bien delimitado. Gotcha principal: imports cruzados entre `components/admin/` y `components/` generales → extraer a `packages/ui` sobre la marcha.

### Fase 1.C — Migración masiva de páginas admin — ✅ COMPLETA (2026-04-22)

- [x] Copiado sustrato completo del monolito a `apps/admin/src/`: 11 `components/admin/`, `components/orders/`, 21 services, 14 utils, 3 hooks, 3 types (incluye `calculator.types` + `imageUrl`).
- [x] Copiadas 69 páginas `admin/` + 4 páginas `commercial/`.
- [x] Transformación masiva de imports con `sed`: todos los `services/api`, `stores/authStore`, `config/rolePermissions`, `utils/tokenRefresh` → `@resona/api-client`.
- [x] Copiado + adaptado `CommercialLayout.tsx`.
- [x] Router `apps/admin/src/App.tsx` reescrito con lazy imports de las 61 páginas + 57 rutas `/admin/*` + 4 rutas `/comercial/*` + `RequireInternalAuth` + `Suspense`.
- [x] Tailwind safelist para clases dinámicas de color por rol (`bg-{color}-500/20`, `text-{color}-300`).
- [x] `vite-env.d.ts` añadido para tipar `import.meta.env`.
- [x] **Build admin pasa** (7-8s, 99KB gzipped, 1480+ módulos transformados).
- [x] **Typecheck admin pasa**.
- [x] **Frontend monolítico sigue compilando** (via re-exports transparentes).

### Fase 1.D — Deploy y corte (pendiente — tarea de Dani)

- [ ] Configurar CORS en backend de producción con los 3 dominios nuevos. Var `CORS_ORIGIN`. Fallback local ya incluye 3002/3003/3004.
- [ ] Crear proyecto Vercel/Netlify para `gestion.resonaevents.com` apuntando a `apps/admin/` con [vercel.json](../apps/admin/vercel.json) ya preparado.
- [ ] Asignar dominio `gestion.resonaevents.com`.
- [ ] **Temporal**: el monolito sigue sirviendo `/admin/*` durante 2 semanas.
- [ ] Tras 2 semanas: borrar `packages/frontend/src/pages/admin/` del monolito.

### Fase 2 — Lanzar Rent — ✅ COMPLETA (código, 2026-04-22)

- [x] Scaffold `apps/rent/` con Vite + React + Tailwind + Router + React Query, puerto 3003.
- [x] Copia completa del sustrato del monolito (components, hooks, services, utils, types, contexts, layouts).
- [x] Purgadas páginas que NO son de rent (calculadora, packs, blog, services de evento completo, admin, commercial, test pages).
- [x] Pages retenidas: catálogo (`ProductsPage`, `ProductDetailPage`), carrito + checkout completo (Stripe/Redsys/Manual/Modification + PaymentToken/Success/Error), auth (Login/Register), cuenta (Account/Orders/OrderDetailUser/Favorites/MyData), compartidas (Contact/About/FAQs), legal, SEO landings técnicas (4 páginas principales + 14 services `Alquiler*`).
- [x] `App.tsx` nuevo con routing limpio y lazy loading.
- [x] `Layout.tsx` adaptado para soportar nested routes con `<Outlet />`.
- [x] **Build rent pasa** (9-10s, 68KB gzipped).
- [x] **Typecheck rent pasa**.
- [x] Deploy config en [apps/rent/vercel.json](../apps/rent/vercel.json).

**Pendientes no hechos en esta sesión (requieren decisión de diseño)**:
- [ ] Home nueva transaccional con selector fecha en hero.
- [ ] Guest checkout (quitar `<PrivateRoute>` de `/checkout`).
- [ ] Stripe Express / Apple Pay / Google Pay.
- [ ] WhatsApp flotante.
- [ ] Disponibilidad inline en fichas + badges de urgencia.
- [ ] Email de carrito abandonado.

### Fase 3 — Lanzar Events — ✅ COMPLETA (código, 2026-04-22)

- [x] Scaffold `apps/events/` con Vite + React + Tailwind + Router + React Query, puerto 3004.
- [x] Copia completa del sustrato del monolito.
- [x] Purgadas páginas que NO son de events (catálogo, carrito, checkout, landings `Alquiler*`, cuenta, admin, commercial, test pages).
- [x] Pages retenidas: Home, About, Contact, FAQs, EventCalculator, ServicesPage, PackDetail, SonidoBodasValencia, services `no-Alquiler` (Bodas, Producción, Iluminación escenarios/arquitectónica, Sonido bodas/corporativos, Video streaming), Blog público, Auth, Legal.
- [x] `App.tsx` nuevo con routing.
- [x] `Layout.tsx` adaptado para `<Outlet />`.
- [x] **Build events pasa** (8-10s, 67KB gzipped).
- [x] **Typecheck events pasa**.
- [x] Deploy config en [apps/events/vercel.json](../apps/events/vercel.json).

**Pendientes no hechos en esta sesión**:
- [ ] Home visual con portfolio + galería de montajes.
- [ ] Quiz 3 pasos reemplazando calculadora 6 pasos.
- [ ] CTA WhatsApp + lead form prominente.
- [ ] Teléfono obligatorio en quote request (requiere cambio backend en [quoteRequest.controller.ts:31](../packages/backend/src/controllers/quoteRequest.controller.ts#L31)).

### Fase 2 OBSOLETE — Lanzar Rent (2-3 semanas)

- [ ] Crear `apps/rent/` con Vite nuevo.
- [ ] Mover a `apps/rent/src/pages/`:
  - [ProductsPage.tsx](../packages/frontend/src/pages/ProductsPage.tsx)
  - [ProductDetailPage.tsx](../packages/frontend/src/pages/ProductDetailPage.tsx)
  - [CartPage.tsx](../packages/frontend/src/pages/CartPage.tsx)
  - `CheckoutPage*.tsx`, `PaymentToken/Success/Error`
  - `AccountPage`, `OrdersPage`, `FavoritesPage`
  - `LoginPage`, `RegisterPage`
  - Landings SEO **técnicas**: `AlquilerAltavocesValencia`, `AlquilerIluminacionValencia`, `AlquilerSonidoValencia`, `AlquilerSonidoTorrent` + las de `pages/services/` que son alquiler técnico (todas las `Alquiler*`).
- [ ] Mover contexts: `cart`, `checkout` components, `payment` components.
- [ ] **Home de Rent nueva**: transaccional puro, hero con selector fecha + buscador.
- [ ] Aplicar fixes CRO: guest checkout, WhatsApp flotante, disponibilidad inline, badges, Stripe Express, carrito simplificado, email de abandono.
- [ ] Backend: CORS para `resonarent.com`, cookie JWT en `.resona.com` (o estrategia de auth decidida).
- [ ] **Deploy paralelo**: `resonarent.com` convive con `resonaweb.com` 1-2 semanas para validar métricas de conversión antes del apagado.

**Riesgo**: alto en SEO si se precipita el apagado de resonaweb. Ver Fase 4.
**Punto de no retorno**: fin de Fase 2 (Rent vivo).

### Fase 3 — Lanzar Events (2-3 semanas)

- [ ] Crear `apps/events/`.
- [ ] Mover:
  - [EventCalculatorPage.tsx](../packages/frontend/src/pages/EventCalculatorPage.tsx) (a rediseñar como quiz 3 pasos)
  - [PackDetailPage.tsx](../packages/frontend/src/pages/PackDetailPage.tsx)
  - [ServicesPage.tsx](../packages/frontend/src/pages/ServicesPage.tsx)
  - `AboutPage`, `ContactPage`, `FAQsPage`
  - `BlogListPage`, `BlogPostPage`
  - Landings: `SonidoBodasValencia`, `Produccion*`, `Bodas*`, `SonidoEventosCorporativos`, `IluminacionArquitectonica`...
- [ ] **Rediseñar** home visual con portfolio, quiz 3 pasos, galería de montajes.
- [ ] CTA principal: lead (quote request) + WhatsApp. **Nada de carrito directo** en esta web.
- [ ] Forzar teléfono obligatorio en quote request.
- [ ] Backend: CORS para `resonaevents.com`.
- [ ] Login compartido con Rent (cookie `.resona.com` o estrategia decidida).

**Riesgo**: medio. Mucho diseño/UX nuevo, pero cero riesgo para el negocio transaccional que ya vive en Rent.

### Fase 4 — Migración SEO y apagado de resonaweb (1 semana)

- [ ] Mapear cada URL de resonaweb.com a su destino: Rent o Events (tabla URL → URL).
- [ ] Montar **301 redirects** uno a uno en el servidor de resonaweb.com (Nginx/Vercel `redirects`).
- [ ] Actualizar `sitemap.xml` de cada nuevo dominio ([generate-sitemap.ts](../packages/backend/src/scripts/generate-sitemap.ts) ya existe — duplicar y parametrizar por app).
- [ ] Google Search Console: alta los dos dominios, enviar sitemaps, usar "Cambio de dirección" de resonaweb → resonarent (intención mayoritaria).
- [ ] Actualizar canonicals y OG tags.
- [ ] Mantener resonaweb.com vivo **≥ 6 meses** solo para servir 301s.

### Fase 5 — Cleanup

- [ ] Borrar `packages/frontend/` (ya vacío de páginas).
- [ ] Consolidar CI/CD: cada app con su deploy independiente.
- [ ] Actualizar `docs/INDEX.md`, `README.md` y cualquier guía que referencie la estructura antigua.

---

## 6. Riesgos principales

| Riesgo | Mitigación |
|---|---|
| **Pérdida de SEO** al mover URLs | 301s uno a uno, no masivos. Mantener resonaweb vivo ≥6 meses. No lanzar Rent y Events el mismo día. |
| **Auth rota entre apps** | Probar cookie `.resona.com` en staging con 2 subdominios reales antes de producción. |
| **Carrito compartido con Events** | El carrito vive solo en Rent. Events usa `quoteRequest` endpoint separado, no cart. |
| **Duplicación de componentes** al copiar sin extraer | Regla: si un componente se usa en ≥2 apps, va a `packages/ui`. Sin excepciones. |
| **Divergencia de tipos frontend ↔ backend** | Generar tipos desde Prisma (`prisma generate` + exportar) y consumirlos en `packages/shared-types`. |
| **Stock inconsistente entre webs** | Backend único ya garantiza esto. No duplicar lógica de stock en frontend. |

---

## 7. Decisiones pendientes antes de Fase 2

- [ ] **Estrategia de auth cross-app**:
  - Opción A: ambos dominios son subdominios de `resona.com` (ej. `www.resona.com` para events, `rent.resona.com` para rent) → cookie `.resona.com` funciona directamente.
  - Opción B: dominios separados reales (`resonarent.com`, `resonaevents.com`) → requiere flow OAuth-style con dominio de auth central, o aceptar logins independientes por web (misma cuenta en BDD pero login duplicado).
  - **Pendiente decidir**. Impacto en UX y en coste de implementación.
- [ ] **Mapa definitivo de landings SEO** por web. Lista tentativa en Fase 2 y Fase 3; validar en hoja de cálculo antes de migrar.
- [ ] **Identidad visual**: paleta, logo variant, tono de cada web. Misma tipografía base, colores distintos. Hay que diseñarlo antes de Fase 2.
- [ ] **Copys y contenido de home** de cada web. Necesario antes del lanzamiento de cada fase.
- [ ] **Hosting y DNS**: dónde se deploya cada app (Vercel / Railway / Netlify), cómo se configuran los dominios, qué servidor sirve los 301s de resonaweb tras el apagado.

---

## 8. Estimación total

- **Solo Dani**: 10-14 semanas.
- **Dani + 1 dev en paralelo**: 6-8 semanas.
- **Punto de no retorno**: fin de Fase 2 (Rent en producción). Antes de eso, se puede volver atrás sin coste.

---

## 9. Referencias

- Análisis del funnel actual: ver sección 2 de este documento.
- Mapeo exhaustivo del repo (páginas, rutas, modelos Prisma): resumido en sección 3; fuente original en la conversación de planificación del 2026-04-22.
- Backend API: [docs/API_DOCUMENTATION.md](API_DOCUMENTATION.md).
- Modelo de datos: [docs/DATABASE_SCHEMA.md](DATABASE_SCHEMA.md).
- Flujos de usuario actuales: [docs/USER_FLOWS.md](USER_FLOWS.md).
