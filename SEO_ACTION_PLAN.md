# 🚀 PLAN DE ACCIÓN SEO - RESONA EVENTS

**Objetivo:** Aparecer en primeras búsquedas de Google para palabras clave relevantes  
**Plazo:** 3 meses  
**Responsable:** Equipo de Marketing/Desarrollo

---

## 📊 DIAGNÓSTICO ACTUAL

### ✅ Lo que está BIEN
- ✅ robots.txt optimizado
- ✅ Meta tags básicos
- ✅ Schema.org implementado
- ✅ HTTPS/SSL
- ✅ Mobile responsive
- ✅ Velocidad aceptable

### ❌ Lo que FALTA
- ❌ **SSR (Server-Side Rendering)** - CRÍTICO
- ❌ Sitemap dinámico actualizado
- ❌ Contenido de blog fresco
- ❌ Google My Business
- ❌ Optimización de imágenes
- ❌ Local SEO
- ❌ Link building

---

## 🎯 SEMANA 1: FUNDAMENTOS

### Tarea 1.1: Actualizar Sitemap (1 hora)
**Problema:** Sitemap estático, no incluye productos individuales

**Solución:**
```typescript
// packages/frontend/src/pages/sitemap.xml.ts
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // Obtener todos los productos
  const products = await fetch('http://localhost:3001/api/products').then(r => r.json());
  
  // Generar XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${products.map(p => `
        <url>
          <loc>https://resona.com/productos/${p.slug}</loc>
          <lastmod>${p.updatedAt}</lastmod>
          <priority>0.7</priority>
        </url>
      `).join('')}
    </urlset>`;
  
  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();
};
```

### Tarea 1.2: Crear Google My Business (30 minutos)
1. Ir a https://business.google.com
2. Crear perfil para Resona Events
3. Agregar:
   - Dirección completa
   - Teléfono
   - Horarios
   - Categoría: "Alquiler de equipos de eventos"
   - Fotos de eventos
   - Descripción detallada

### Tarea 1.3: Agregar Atributos Alt a Imágenes (2 horas)
```typescript
// Ejemplo: ProductCard.tsx
<img 
  src={product.image}
  alt={`${product.name} - Alquiler de ${product.category} para eventos`}
  loading="lazy"
/>
```

### Tarea 1.4: Crear 3 Blog Posts (3 horas)

**Post 1:** "Guía Completa: Alquiler de Sonido para Bodas"
- Palabras clave: "alquiler sonido bodas", "DJ bodas Valencia"
- Longitud: 1500+ palabras
- Incluir: Precios, tipos de sonido, consejos

**Post 2:** "Cómo Elegir Iluminación para tu Evento"
- Palabras clave: "iluminación eventos", "luces discoteca alquiler"
- Longitud: 1500+ palabras
- Incluir: Tipos de iluminación, presupuesto, tendencias

**Post 3:** "Calculadora de Presupuesto: ¿Cuánto Cuesta tu Evento?"
- Palabras clave: "presupuesto evento", "costo boda"
- Longitud: 1200+ palabras
- Incluir: Desglose de costos, ejemplos reales

---

## 🎯 SEMANA 2-3: CONTENIDO

### Tarea 2.1: Crear 5 Blog Posts Más (10 horas)

**Post 4:** "Alquiler de Equipos Audiovisuales para Conferencias Corporativas"
- Palabras clave: "equipos audiovisuales conferencias", "sonido profesional eventos"
- Dirigido a: Empresas, eventos corporativos

**Post 5:** "Presupuesto DJ: Tarifas y Precios 2025"
- Palabras clave: "precio DJ", "DJ bodas Valencia", "DJ eventos"
- Dirigido a: Novios, organizadores de eventos

**Post 6:** "Alquiler vs Compra: ¿Qué es Mejor para tu Evento?"
- Palabras clave: "alquiler vs compra equipos", "alquiler material eventos"
- Dirigido a: Empresas, organizadores profesionales

**Post 7:** "Tendencias en Iluminación para Eventos 2025"
- Palabras clave: "iluminación eventos 2025", "luces LED eventos"
- Dirigido a: Diseñadores, organizadores

**Post 8:** "Guía de Fotografía y Video para Eventos"
- Palabras clave: "fotografía eventos", "video eventos profesional"
- Dirigido a: Novios, empresas

### Tarea 2.2: Optimizar Imágenes (4 horas)
- Convertir a WebP
- Comprimir tamaños
- Agregar lazy loading
- Agregar atributos alt descriptivos

### Tarea 2.3: Crear FAQ Schema (1 hora)
```typescript
// Agregar a EventCalculatorPage.tsx
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Cuánto cuesta alquilar sonido para una boda?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El costo depende del tipo de evento y la duración..."
      }
    }
  ]
};
```

---

## 🎯 SEMANA 4-8: OPTIMIZACIÓN TÉCNICA

### Tarea 3.1: Implementar SSR con Next.js (40 horas)
**ESTA ES LA MEJORA MÁS IMPORTANTE**

Beneficios:
- +300% mejor indexación en Google
- Mejor velocidad de página
- Mejor experiencia de usuario
- Mejor para redes sociales

Pasos:
1. Crear proyecto Next.js
2. Migrar componentes React
3. Implementar SSR en rutas principales
4. Configurar ISR (Incremental Static Regeneration)
5. Testear y desplegar

### Tarea 3.2: Crear Breadcrumb Schema (2 horas)
```typescript
// En ProductDetailPage.tsx
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Inicio",
      "item": "https://resona.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Productos",
      "item": "https://resona.com/productos"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": product.name,
      "item": `https://resona.com/productos/${product.slug}`
    }
  ]
};
```

### Tarea 3.3: Implementar AggregateRating Schema (2 horas)
- Agregar reseñas de clientes
- Schema de calificación
- Mostrar en Google

---

## 🎯 SEMANA 9-12: LINK BUILDING Y PROMOCIÓN

### Tarea 4.1: Link Building (5 horas/semana)
1. **Directorios de empresas:**
   - Google My Business (ya hecho)
   - Yelp
   - Páginas Amarillas
   - Directorios locales Valencia

2. **Blogs de eventos:**
   - Contactar blogs de bodas
   - Blogs de eventos corporativos
   - Blogs de música/DJ

3. **Asociaciones:**
   - Asociación de eventos Valencia
   - Cámaras de comercio
   - Directorios de proveedores

### Tarea 4.2: Contenido Local (3 horas/semana)
Crear posts para palabras clave locales:
- "Alquiler sonido Valencia"
- "DJ bodas Montesinos"
- "Equipos audiovisuales Comunidad Valenciana"
- "Iluminación eventos Castellón"

### Tarea 4.3: Redes Sociales (2 horas/semana)
- Compartir blog posts
- Mostrar eventos realizados
- Engagement con clientes
- Hashtags relevantes

---

## 📈 MÉTRICAS DE ÉXITO

### Mes 1
- ✅ 5+ blog posts publicados
- ✅ Google My Business activo
- ✅ Sitemap dinámico
- ✅ Imágenes optimizadas

### Mes 2
- ✅ 10+ blog posts
- ✅ SSR implementado (opcional)
- ✅ 50+ backlinks
- ✅ Tráfico orgánico +30%

### Mes 3
- ✅ 15+ blog posts
- ✅ Posicionamiento en palabras clave principales
- ✅ Tráfico orgánico +100%
- ✅ Primeras búsquedas en Google

---

## 🔑 PALABRAS CLAVE OBJETIVO

### Tier 1 (Máxima prioridad)
- Alquiler sonido Valencia
- Alquiler iluminación eventos
- DJ bodas Valencia
- Calculadora presupuesto eventos
- Equipos audiovisuales alquiler

### Tier 2 (Alta prioridad)
- Alquiler material eventos Valencia
- Sonido profesional eventos
- Iluminación disco alquiler
- Fotografía video eventos
- Montaje eventos profesional

### Tier 3 (Prioridad media)
- Alquiler sonido para boda pequeña
- Presupuesto DJ boda 2025
- Equipos iluminación discoteca
- Servicio fotografía eventos corporativos
- Alquiler equipos audiovisuales profesionales

---

## 💰 INVERSIÓN ESTIMADA

| Tarea | Tiempo | Costo |
|-------|--------|-------|
| Contenido blog (15 posts) | 30 horas | €600-1000 |
| Optimización técnica | 40 horas | €800-1200 |
| Link building | 20 horas | €400-600 |
| Google My Business | 1 hora | Gratis |
| **TOTAL** | **91 horas** | **€1800-2800** |

---

## ✅ CHECKLIST

### Semana 1
- [ ] Sitemap dinámico
- [ ] Google My Business
- [ ] Alt text en imágenes
- [ ] 3 blog posts

### Semana 2-3
- [ ] 5 blog posts más
- [ ] Imágenes optimizadas
- [ ] FAQ schema

### Semana 4-8
- [ ] SSR con Next.js (opcional)
- [ ] Breadcrumb schema
- [ ] AggregateRating schema

### Semana 9-12
- [ ] 50+ backlinks
- [ ] Contenido local
- [ ] Promoción en redes

---

## 🎯 RESULTADO ESPERADO

**Antes:** Página solo visible si haces click en enlace  
**Después:** Primeras búsquedas en Google para palabras clave principales

**Tráfico estimado:**
- Mes 1: +30% tráfico orgánico
- Mes 2: +100% tráfico orgánico
- Mes 3: +300% tráfico orgánico

---

**Próximo paso:** Comenzar con Semana 1 (Sitemap, Google My Business, Blog)

