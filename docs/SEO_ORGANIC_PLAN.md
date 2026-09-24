# Plan SEO / Tráfico orgánico — Resona

> Auditoría técnica del código (sin datos de Search Console) y plan de mejora priorizado.
> Fecha: 2026-07. Ámbito: `apps/rent` (resonarent.com) + `apps/events` (resonaevents.com).

## Estado actual (lo que YA está bien)

- **On-page sólido**: `SEOHead` reutilizable con `title`/`description` únicos, `canonical` (sin query params, anti-canibalización), Open Graph, Twitter Card, geo tags.
- **Structured data**: JSON-LD real — `LocalBusiness`, `Service`, `FAQPage`, `BreadcrumbList`, `Article`, `Product`.
- **Sitemaps dinámicos** desde backend (`sitemap.controller.ts`) con imágenes y caché 1h; `robots.txt` por app limpios.
- **Performance**: lazy images (`OptimizedImage`), critical CSS inline, code splitting por ruta, preconnect, GA con Consent Mode v2 diferido.
- **OG/Twitter estáticos** en `index.html` para scrapers sociales sin JS.

## Problemas que limitan el orgánico (por impacto)

### 1. Renderizado CSR puro — techo principal
Las 3 apps son SPA Vite con `createRoot` (no `hydrateRoot`). El HTML inicial es `<div id="root">` vacío; título, meta y **todo el contenido** se inyectan por JS.
- Googlebot renderiza JS pero en segunda cola (retraso) y con crawl budget limitado → penaliza las landings long-tail.
- Bing y **crawlers de IA** (AI Overviews, ChatGPT, Perplexity) apenas ejecutan JS → ven páginas casi vacías.
- Fallo de fetch a la API = página sin contenido indexable.

**Acción**: prerender/SSG de rutas estáticas (home, `/servicios/*`, `/packs/*`, `/bodas`, `/eventos`, `/faqs`, blog). Ver decisión de enfoque abajo.

### 2. Monolito legacy (`packages/frontend`) aún vivo
Sigue en `workspaces`, con `build:frontend` y `packages/frontend/vercel.json`. La raíz tiene `public/sitemap.xml` (220 URLs, `resonaevents.com/productos`, `/calculadora-eventos`…) y `public/robots.txt` legacy.
- Si ese proyecto sigue desplegado en un dominio indexable → **contenido duplicado** compitiendo contra rent/events y diluyendo autoridad.
- El plan de migración prevé 301 por patrón del monolito, pero está marcado como paso futuro (posiblemente no ejecutado).

**Acción** (requiere confirmar qué proyecto Vercel sirve cada dominio): 301 total del monolito → rent/events, retirar su sitemap/robots, sacarlo de indexación. Borrar `public/sitemap.xml` y `public/robots.txt` de la raíz si el monolito ya no sirve tráfico.

### 3. Rutas mockup indexables
`/v2`…`/v10`, `/lab` en events renderizan sin `Layout` ni `SEOHead` → thin/duplicate content de la home.
**Hecho**: añadidos `Disallow` en `apps/events/public/robots.txt` (grupos `*` y `Googlebot`).

### 3b. Enlaces internos rotos (corregido)
13 de 14 landings de Rent enlazaban a `/servicios/alquiler-pantallas-led-eventos` (ruta inexistente → 404). Además la malla era plana (mismos 3 links en 12 páginas; long-tail sin enlaces entrantes).
**Hecho**: corregida la URL a `/servicios/alquiler-pantallas-led` y reconstruida la malla en clusters temáticos (sonido / iluminación / vídeo-estructura), 4 enlaces relevantes por página, sin auto-enlaces. Verificado: 0 enlaces internos rotos, typecheck OK.

### 4. Contenido moderado
Blog (~25 posts) solo en events; Rent sin blog. Long-tail poco explotado.
**Acción**: escalar landings programáticas `/{equipo}-{ciudad}` (patrón ya existe: sonido/altavoces/iluminación Valencia + Torrent) a más equipos y poblaciones del área; blog transaccional en Rent ("cuánto cuesta alquilar…", "qué equipo para…").

## Plan priorizado

| # | Acción | Impacto | Esfuerzo | Estado |
|---|--------|---------|----------|--------|
| 1 | Bloquear mockups `/v2../v10/lab` | Medio | Bajo | ✅ Hecho |
| 2 | Confirmar y ejecutar 301 total del monolito + limpiar sitemap/robots legacy | Alto | Bajo | ⏳ Requiere confirmar deploy |
| 3 | Prerender/SSG de rutas estáticas (events + rent) | Alto | Medio | ⏳ Requiere decidir enfoque |
| 4 | Consolidar sitemaps (un índice por dominio, sin legacy) | Medio | Bajo | Pendiente |
| 5 | Escalar landings long-tail + blog en Rent | Alto (medio plazo) | Alto | Pendiente |
| 6 | Malla de interlinking entre landings Rent (clusters temáticos) | Medio | Bajo | ✅ Hecho |

## Decisión pendiente: enfoque de prerender

Hallazgos que condicionan el enfoque (investigados en código):

1. **Las apps NO son SSR-safe**: usan `window`/`localStorage`/Google Maps loader en tiempo de render. Un SSG que renderice en Node (vite-react-ssg) requiere sanear todos esos accesos primero. Es un refactor real y solo verificable en build, no en deploy, desde este entorno.
2. **Trampa de duplicados con react-helmet-async**: el equipo ya dejó fuera `<meta name="description">` y `canonical` estáticos del `index.html` porque helmet-async no los deduplica y aparecían duplicados. Un prerender "ingenuo" que inyecte esos tags por ruta (estilo `generate-static-pages.js` del monolito) **reintroduce ese bug** al hidratar. OG estáticos sí son seguros (el equipo ya los usa).
3. **Existe un patrón previo en el repo**: `packages/frontend/scripts/generate-static-pages.js` clona `index.html` por ruta inyectando `<head>` — pero es meta-only (body vacío) y cae en la trampa (2) para description/canonical.

Opciones:
- **vite-react-ssg** (mejor SEO, body real, helmet hidrata sin duplicados): requiere sanear SSR-safety. Alto esfuerzo, verificación en deploy.
- **Prerender headless (Puppeteer/react-snap)**: snapshot del DOM ya renderizado; sin problema de SSR-safety ni de duplicados, pero necesita Chromium en CI y `hydrateRoot`.
- **Meta-injection acotada (solo `<title>` + OG por ruta)**: segura (respeta la práctica actual), verificable, pero valor moderado (no da body ni description a crawlers sin JS).

**Recomendación**: prerender headless (Puppeteer) en CI para body completo — es lo que mejor sirve a los crawlers de IA — con verificación en un deploy de preview. Requiere confirmar que el pipeline (Vercel/CI) puede ejecutar Chromium. Decisión de Dani antes de implementar en producción.

## Nota
No hay datos de Search Console en este análisis. Para priorizar keywords reales, exportar de GSC: Consultas, Páginas, CTR y Posición (últimos 3–6 meses).
