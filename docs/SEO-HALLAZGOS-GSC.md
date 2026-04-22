# Hallazgos SEO — Search Console (datos reales 16 meses)

Fecha análisis: 2026-04-22

## 1. Estado crítico de indexación

| Métrica | Valor |
|---|---|
| Páginas indexadas | **14** |
| Páginas NO indexadas | **278** |
| Descubiertas, sin indexar | 141 |
| Rastreadas, sin indexar | 54 |
| Redirecciones | 78 |
| Duplicadas sin canonical | 3 |

**Conclusión**: Google conoce la web (sitemap procesado) pero **rechaza activamente indexar el 95 % del contenido**. Causas probables:

1. **Contenido renderizado por JS** (SPA sin SSR) — rastreador tarda y prioriza menos.
2. **Duplicación por parámetros** (`?category=`, `?search=`) — corregido hoy en `SEOHead.tsx`.
3. **Contenido fino** en muchos productos (poca descripción original).
4. **Mezcla www / apex** — 78 redirecciones son legacy www → apex, señales aún no consolidadas.
5. **Estructura de slugs** con posibles duplicidades entre `/packs/*` y `/productos/*`.

## 2. Top consultas con oportunidad

| Keyword | Imp | Pos | CTR | Acción |
|---|---|---|---|---|
| alquiler altavoces valencia | 942 | 9.2 | 1.5 % | Mejorar title/description → top 5 |
| alquiler altavoces | 478 | 36.2 | 0.4 % | Contenido y backlinks |
| alquilar altavoces valencia | 437 | 9.1 | 0.2 % | CTR ridículo a pos 9 → rehacer snippet |
| alquiler de altavoces | 415 | 36.2 | 0 % | Landing on-page dedicada |
| alquiler de sonido e iluminación valencia | 179 | 11.8 | 0 % | A un punto de top 10 |
| alquiler equipos de sonido valencia | 173 | 12.4 | 0 % | Idem |
| alquiler iluminación de obra exterior | 160 | 36.8 | 0 % | **Nicho sin competencia directa** |
| alquiler altavoces precio | 146 | 58.1 | 0 % | Crear landing comparativa precios |
| empresa de sonido para eventos | 131 | 64.6 | 0 % | Topical authority |
| producción de eventos valencia | 118 | 21.0 | 0 % | Rehacer página |

## 3. Páginas con mayor potencial (alta impresión, bajo CTR)

| URL | Imp | Pos | CTR |
|---|---|---|---|
| `/servicios/alquiler-sonido-valencia` | 4227 | 29.5 | 0.83 % |
| `/alquiler-iluminacion-valencia` | 2926 | 36.6 | 0.58 % |
| `/servicios/alquiler-altavoces-profesionales` | 2822 | 24.3 | 0.74 % |
| `/` (home) | 2106 | 12.6 | 3.13 % |
| `/alquiler-altavoces-valencia` | 1889 | 23.7 | 1.54 % |
| `/servicios/produccion-eventos-valencia` | 1046 | 21.3 | 0.19 % |
| `/servicios/sonido-iluminacion-bodas-valencia` | 546 | 28.6 | 0.73 % |
| `/servicios/alquiler-dj-valencia` | 534 | 29.8 | 2.62 % |
| `/productos` | 534 | 52.8 | 0 % |

## 4. Plan P0 (esta semana) basado en datos reales

1. **Rehacer title+description** de las 5 páginas con mayor `impresiones × (1 − CTR)`:
   - `/servicios/alquiler-sonido-valencia`
   - `/servicios/alquiler-altavoces-profesionales`
   - `/alquiler-iluminacion-valencia`
   - `/alquiler-altavoces-valencia`
   - `/servicios/produccion-eventos-valencia`
2. **Solicitar indexación manual** en GSC para las 10 URLs top después de aplicar P0.
3. **Ping sitemap** tras cada despliegue: `https://www.google.com/ping?sitemap=https://resonaevents.com/sitemap.xml`
4. **Consolidar www → apex**: verificar redirect HTTPS y resubmit sitemap.

## 5. Plan P1 (2 semanas)

5. **Nueva landing** `/servicios/alquiler-iluminacion-obra` para aprovechar los 160 imp del long-tail.
6. **Ampliar contenido** de páginas top a 1500+ palabras con FAQs.
7. **Prerender** de las 10 URLs top por impresiones (ya identificadas).

## 6. Plan P2 (mes)

8. Sistema de reseñas reales (F3.1).
9. Dashboard automático GSC con service account ya configurado (F5.1).
10. Clusters de contenido bodas / corporativos / conciertos con internal linking.
