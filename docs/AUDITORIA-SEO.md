# Auditoría SEO — ReSona Events

## 1. Arquitectura actual

- **Frontend**: React SPA (Vite) en Vercel, sin SSR. Meta tags dinámicos con `react-helmet-async`.
- **Componente SEO**: `packages/frontend/src/components/SEO/SEOHead.tsx` (title, description, canonical, OG, Twitter, robots, JSON-LD).
- **Schemas**: `components/SEO/schemas.ts` (LocalBusiness, Organization, WebSite+SearchAction, FAQ, Breadcrumb) y `utils/seo/schemaGenerator.ts` (Product, Breadcrumb).
- **Sitemap dinámico**: backend Express `controllers/sitemap.controller.ts` con SEO pages, categorías, productos, packs y blog.
- **RSS**: `/rss` del blog.
- **robots.txt duplicado** en frontend y backend; Vercel reescribe a Render.
- **Landings HTML pre-renderizadas**: `scripts/generate-static-pages.js` (calculadora, faqs, servicios/*, packs/*).
- **Redirect 301** www → apex + redirects legacy.
- **GSC** verificado en `index.html`; **GA4** G-4F522M345Z con carga diferida.

## 2. Problemas críticos

1. **Reviews y ratings falsos** — `schemas.ts` LocalBusiness expone `aggregateRating 4.8/127` con 5 reseñas inventadas. `ProductDetailPage.tsx` y `PackDetailPage.tsx` inyectan `4.7/23` con 3 reseñas hardcoded ("Ana García", "Pedro Sánchez", "Laura Martín") en **todos** los productos/packs. Viola las Review snippet policies de Google → riesgo de manual action.
2. **Sin SSR/prerender** — Productos, packs, blog y home dependen del render JS. Los bots sociales (WhatsApp, FB, LinkedIn) NO leen Helmet → OG ausentes al compartir.
3. **robots.txt duplicado e incoherente** — Si Render está dormido, `/robots.txt` devuelve 502 puntualmente.
4. **Logo 1.7 MB** (`logo-resona.png`) arruina LCP. `schemas.ts` referencia `/logo.png` que no existe.
5. **Canonical por `window.location.href`** en listados con filtros → canibalización por query params.
6. **`index.html` sin meta description ni OG por defecto** — bots sin JS ven sólo el title.

## 3. Problemas importantes

7. Sitemap declara `xmlns:image` pero no incluye imágenes de productos (pérdida de Google Images).
8. `vercel.json` reescribe slugs concretos a HTMLs hardcoded; si cambia un slug cae al catch-all.
9. Breadcrumbs ausentes en Home y listados.
10. BlogPost inyecta JSON-LD fuera de SEOHead (duplicación Helmet).
11. Mezcla `og-image.jpg` y `og-image.png` sin consistencia.
12. Meta keywords con stuffing repetido de "valencia".

## 4. Mejoras sugeridas

- Añadir Schema `Service` y `Event` en landings de bodas/conciertos/corporativos.
- Integrar sistema real de reviews (Google Reviews API o modelo propio ligado a pedidos finalizados).
- `VideoObject` / `ImageObject` en galerías.
- CSP en `vercel.json` headers (ahora solo en backend).
- Self-host Inter (ahorra ~200 ms LCP).
- Preload hero image home.
- `lastmod` ISO8601 completo y `ETag` en sitemap.
- Sitemap index dividido si supera 50k URLs / 50 MB.
- `hreflang` y `og:locale` consistentes (hoy sólo es_ES, OK si se queda monolingüe).

## 5. Plan de acción por fases

### Fase 1 — Urgente (1 semana)
1. Eliminar reviews y aggregateRating falsos de schemas (LocalBusiness, Product, Pack). Mostrar sólo si `reviewCount > 0` con datos reales.
2. Unificar `robots.txt` (dejar uno solo; recomendado servir desde Vercel como estático, eliminar rewrite).
3. Optimizar logo: `logo.webp` <100 KB, `logo.png` 200x200 <30 KB, `logo.svg`. Actualizar referencias en schemas.
4. Añadir meta description, OG y canonical por defecto en `index.html` estático.
5. Forzar canonical absoluta sin query params en listados (ProductsPage, categorías, búsqueda).

### Fase 2 — Indexación y rich results (2-3 semanas)
6. **Prerender**: integrar `vite-plugin-prerender-spa` o `react-snap` para `/`, `/productos`, `/packs`, `/blog`, `/servicios/*`, `/faqs`, `/sobre-nosotros`, `/contacto` + top 50 productos/packs. Alternativa definitiva: migrar a **Next.js** (ISR).
7. Enriquecer sitemap con `<image:image>` por producto/pack/post.
8. Validar todos los schemas con Rich Results Test y Schema Markup Validator.
9. Añadir `Service` schema a cada página de servicios y `Event` a landings de bodas/conciertos.
10. Corregir BlogPost para que use solo SEOHead.

### Fase 3 — Contenido y autoridad (continua)
11. Estrategia de contenido: 2-4 posts/mes con keywords long-tail ("alquiler sonido boda torrent", "pantalla LED concierto castellón"…).
12. Link building local: directorios Valencia, colaboraciones con salones de bodas, proveedores.
13. Google Business Profile optimizado (horarios, fotos, reseñas reales, posts semanales).
14. Páginas de servicios por ubicación (Valencia, Torrent, Paterna, Castellón, Alicante).
15. Sistema de reseñas reales post-pedido (email automático solicitando review) y mostrarlas como JSON-LD válido.

### Fase 4 — Rendimiento y Core Web Vitals
16. Self-host Inter, preload WOFF2.
17. Preload hero image.
18. Convertir todas las imágenes a WebP/AVIF con `srcset` responsive (ya hay fallback WebP en backend, extender al frontend).
19. Lazy-load secciones below-the-fold.
20. Reducir bundle: code-splitting por ruta, eliminar `moment` a favor de `date-fns`.

### Fase 5 — Medición
21. Configurar **Search Console** properties separadas (apex y www) y conectar con GA4.
22. Configurar **Bing Webmaster Tools**.
23. Dashboard interno con posicionamiento de 20 keywords core (hay `check-google-ranking.py` — actualizar y ejecutar semanalmente).
24. Monitorizar CWV con Vercel Analytics + CrUX.

## 6. Accesos que necesito

Para afinar el plan con datos reales, pásame:

- **Google Search Console** (añadir a la propiedad como usuario o exportar: Rendimiento últimos 12 meses, Páginas, Consultas, Cobertura, Core Web Vitals).
- **Google Analytics 4** (acceso lectura a la propiedad G-4F522M345Z o export de Landing pages + Source/Medium últimos 90 días).
- **Google Business Profile** (acceso o captura de métricas y reseñas actuales).
- **Ahrefs / Semrush / Ubersuggest** si tienes (backlinks, keywords rankeadas).
- **PageSpeed Insights** / CrUX para las URLs principales (puedo correr yo si me confirmas que mida apex).
- **Lista de keywords objetivo** priorizadas por negocio.

Con GSC y GA4 puedo cuantificar el tráfico actual, detectar páginas canibalizadas, mapear keywords con potencial y priorizar los fixes por ROI real.
