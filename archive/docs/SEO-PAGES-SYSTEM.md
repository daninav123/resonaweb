# 🎯 Sistema Dinámico de Páginas SEO

## ✅ Implementación Completada

Has pedido crear un sistema **100% automático** para gestionar páginas SEO landing. Ahora está completamente funcional.

---

## 🚀 Qué se Implementó

### **1. Base de Datos**
✅ Tabla `seo_pages` creada con Prisma:
```prisma
model SeoPage {
  id          String   @id @default(uuid())
  slug        String   @unique              // "alquiler-altavoces-valencia"
  title       String                        // Meta title
  description String   @db.Text             // Meta description
  keywords    String[]                      // Keywords para SEO
  priority    Float    @default(0.9)        // Prioridad sitemap (0.0-1.0)
  changefreq  String   @default("weekly")   // Frecuencia de cambio
  content     String?  @db.Text             // Contenido (futuro)
  isActive    Boolean  @default(true)       // Activa/Desactivada
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### **2. API REST Completa**
✅ Endpoints creados en `/api/v1/seo-pages`:

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| `GET` | `/api/v1/seo-pages` | Público | Listar páginas activas |
| `GET` | `/api/v1/seo-pages/all` | Admin | Listar todas (incluso inactivas) |
| `GET` | `/api/v1/seo-pages/:slug` | Público | Obtener por slug |
| `POST` | `/api/v1/seo-pages` | Admin | Crear página SEO |
| `PUT` | `/api/v1/seo-pages/:id` | Admin | Actualizar página |
| `DELETE` | `/api/v1/seo-pages/:id` | Admin | Eliminar página |

### **3. Sitemap Dinámico**
✅ El sitemap ahora carga páginas SEO desde BD automáticamente:
```typescript
// sitemap.controller.ts
const seoPages = await prisma.seoPage.findMany({
  where: { isActive: true }
});

seoPages.forEach(page => {
  xml += `
  <url>
    <loc>${baseUrl}/${page.slug}</loc>
    <lastmod>${page.updatedAt}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
});
```

**Resultado:** Cada vez que añades una página SEO en la BD, aparece automáticamente en el sitemap.

### **4. Datos Iniciales (Seed)**
✅ Script ejecutado con 5 páginas SEO:
- `/alquiler-altavoces-valencia` (priority: 0.98)
- `/alquiler-sonido-valencia` (priority: 0.95)
- `/alquiler-iluminacion-valencia` (priority: 0.95)
- `/sonido-bodas-valencia` (priority: 0.95)
- `/alquiler-sonido-torrent` (priority: 0.90)

---

## 📊 Cómo Funciona

### **Antes (Sistema Antiguo):**
```typescript
// ❌ Hardcoded en sitemap.controller.ts
<url>
  <loc>https://resonaevents.com/alquiler-altavoces-valencia</loc>
  <priority>0.98</priority>
</url>
```
- Cada página nueva requería editar código
- Sin gestión centralizada
- No escalable

### **Ahora (Sistema Nuevo):**
```typescript
// ✅ Dinámico desde BD
const seoPages = await prisma.seoPage.findMany({ where: { isActive: true } });
// Genera automáticamente XML para cada página
```
- Añadir páginas desde admin (sin tocar código)
- Activar/Desactivar sin borrar
- Sitemap se actualiza solo
- Escalable a 100+ páginas

---

## 🎮 Cómo Usar el Sistema

### **Opción A: Desde la API (Por Ahora)**

#### **1. Crear una Nueva Página SEO:**
```bash
POST https://api.resonaevents.com/api/v1/seo-pages
Authorization: Bearer <tu_token_admin>

{
  "slug": "alquiler-pantallas-led-valencia",
  "title": "Alquiler de Pantallas LED en Valencia | ReSona Events",
  "description": "Alquiler de pantallas LED profesionales...",
  "keywords": ["alquiler pantallas led valencia", "alquiler LED valencia"],
  "priority": 0.95,
  "changefreq": "weekly"
}
```

#### **2. Listar Páginas SEO:**
```bash
GET https://api.resonaevents.com/api/v1/seo-pages
# Público - no requiere auth
```

#### **3. Actualizar Página:**
```bash
PUT https://api.resonaevents.com/api/v1/seo-pages/{id}
Authorization: Bearer <tu_token_admin>

{
  "title": "Nuevo título optimizado",
  "priority": 0.98
}
```

#### **4. Desactivar (sin borrar):**
```bash
PUT https://api.resonaevents.com/api/v1/seo-pages/{id}
Authorization: Bearer <tu_token_admin>

{
  "isActive": false
}
```

### **Opción B: Desde Panel Admin (Futuro - Recomendado)**

**Panel visual en construcción:**
- Dashboard → SEO Pages
- Formulario para crear/editar
- Tabla con lista de páginas
- Toggle para activar/desactivar
- Ordenar por prioridad

---

## 🧪 Verificar que Funciona

### **1. Ver Páginas en la BD:**
```sql
-- En tu base de datos PostgreSQL
SELECT slug, title, priority, "isActive" FROM seo_pages;
```

**Resultado esperado:**
```
slug                              | title                                    | priority | isActive
----------------------------------+------------------------------------------+----------+---------
alquiler-altavoces-valencia       | Alquiler de Altavoces...                | 0.98     | true
alquiler-sonido-valencia          | Alquiler de Sonido...                   | 0.95     | true
...
```

### **2. Ver en Sitemap:**
```bash
curl https://resonaevents.com/sitemap.xml
```

**Busca:**
```xml
<url>
  <loc>https://resonaevents.com/alquiler-altavoces-valencia</loc>
  <lastmod>2025-12-14</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.98</priority>
</url>
```

### **3. Probar API:**
```bash
curl https://api.resonaevents.com/api/v1/seo-pages
```

**Respuesta esperada:**
```json
{
  "pages": [
    {
      "id": "uuid...",
      "slug": "alquiler-altavoces-valencia",
      "title": "Alquiler de Altavoces Profesionales en Valencia...",
      "priority": 0.98,
      "isActive": true
    },
    ...
  ]
}
```

---

## 🎯 Ventajas del Nuevo Sistema

| Característica | Antes | Ahora |
|---------------|-------|-------|
| **Añadir página** | Editar código + commit | API call o admin panel |
| **Actualizar SEO** | Editar código + commit | API call o admin panel |
| **Desactivar** | Borrar código + commit | Toggle isActive |
| **Prioridad sitemap** | Hardcoded | Configurable por página |
| **Escalabilidad** | Difícil (código crece) | Fácil (solo BD) |
| **Historial** | Git commits | Timestamps en BD |
| **Gestión** | Desarrollador | Admin sin conocimientos técnicos |

---

## 📝 Próximos Pasos (Opcional)

### **1. Panel de Admin (Recomendado):**
Crear interfaz visual para gestionar páginas SEO:
```
Admin Dashboard → SEO Pages
├── Tabla con lista de páginas
├── Botón "Crear Nueva Página"
├── Editar inline
├── Toggle activar/desactivar
└── Vista previa del sitemap
```

### **2. Generación Automática de Páginas:**
En lugar de crear componentes `.tsx` manualmente, generar HTML desde el campo `content`:
```typescript
// Renderizar página dinámica desde BD
<SeoPageTemplate 
  title={page.title}
  content={page.content}
  keywords={page.keywords}
/>
```

### **3. Analytics por Página:**
Trackear rendimiento de cada landing:
```sql
ALTER TABLE seo_pages ADD COLUMN views INT DEFAULT 0;
ALTER TABLE seo_pages ADD COLUMN conversions INT DEFAULT 0;
```

---

## 🔧 Mantenimiento

### **Añadir Nueva Página SEO:**
```bash
# Opción 1: API
curl -X POST https://api.resonaevents.com/api/v1/seo-pages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "nueva-pagina",
    "title": "Título SEO",
    "description": "Description",
    "keywords": ["keyword1", "keyword2"],
    "priority": 0.9
  }'

# Opción 2: Script seed (actualizar seed-seo-pages.ts)
# Luego ejecutar: npx ts-node src/scripts/seed-seo-pages.ts
```

### **Actualizar Sitemap:**
**¡No hacer nada!** El sitemap se genera dinámicamente cada vez que alguien accede a `/sitemap.xml`

### **Sincronizar con Google:**
```bash
# Después de añadir páginas nuevas:
# 1. Ve a Google Search Console
# 2. Sitemaps → Reenviar sitemap.xml
# 3. Google re-crawleará automáticamente
```

---

## 🚀 Estado Actual

✅ **Sistema completamente funcional**  
✅ **5 páginas SEO en BD**  
✅ **Sitemap dinámico generando XML**  
✅ **API REST lista para usar**  
✅ **Middleware configurado (público GET, auth POST/PUT/DELETE)**  

**Próximo paso recomendado:** Crear panel de admin visual para gestionar páginas sin usar la API directamente.

---

## 📚 Archivos Creados/Modificados

### **Nuevos:**
- `prisma/schema.prisma` - Modelo SeoPage
- `src/services/seoPage.service.ts` - Lógica de negocio
- `src/controllers/seoPage.controller.ts` - Controlador API
- `src/routes/seoPage.routes.ts` - Rutas API
- `src/scripts/seed-seo-pages.ts` - Script seed inicial

### **Modificados:**
- `src/index.ts` - Registrar rutas SEO Pages
- `src/middleware/auth.middleware.ts` - Permitir GET público
- `src/controllers/sitemap.controller.ts` - Generar URLs dinámicas

---

**¿Necesitas ayuda con algún paso o quieres que cree el panel de admin visual?** 🎨
