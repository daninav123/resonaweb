# 🚨 Problema crítico: Storage efímero en Render pierde imágenes de productos

## Síntoma
Muchas URLs `https://resonaevents.com/uploads/products/*.png` devuelven **HTTP 404**. Esto significa que:

- Los productos en la web muestran imágenes rotas (placeholder o vacío).
- Google no puede indexar imágenes → perdemos tráfico de Google Images.
- El sitemap reportaba URLs rotas a Google (fix defensivo aplicado: solo incluye imágenes que existen en disco al generar el sitemap).

## Causa raíz
Render **no tiene disco persistente en el plan gratuito**. Cada vez que el backend se redespliega (push a main, o reinicio por inactividad), el filesystem se reinicia al estado del repositorio git. Todo lo subido por los admins desde el panel (productos, blog, facturas) se pierde.

## Evidencia
- Sitemap hoy: **158 URLs de imagen** referenciadas → **solo ~124 existen en disco** tras redeploy (34 perdidas solo en esta sesión).
- Las imágenes con timestamp reciente (ej. `1766793692878` = 2025-12-26) suelen ser las perdidas.

## Solución definitiva (elige una)

### Opción A — Cloudinary (recomendada, gratis hasta 25 GB)
1. Crear cuenta en https://cloudinary.com.
2. `npm i cloudinary multer-storage-cloudinary` en `packages/backend`.
3. Añadir a `.env`:
   ```
   CLOUDINARY_CLOUD_NAME=xxx
   CLOUDINARY_API_KEY=xxx
   CLOUDINARY_API_SECRET=xxx
   ```
4. Refactor `middleware/upload.middleware.ts` para usar Cloudinary storage.
5. Migrar imágenes existentes (las 96 del repo local) a Cloudinary con un script one-off.
6. Actualizar BD: `UPDATE products SET main_image_url = REPLACE(main_image_url, '/uploads/products/', 'https://res.cloudinary.com/TU_CLOUD/image/upload/products/')`.
7. Eliminar middleware `/uploads` del backend cuando todo migrado.

**Ventajas**: CDN global, transformaciones automáticas (WebP, AVIF, resize), sin downtime, gratis para este volumen.

### Opción B — Render Disk persistente
1. En dashboard Render → Service → Settings → **Disks** → Add Disk.
2. Mount path: `/opt/render/project/src/packages/backend/uploads`.
3. Size: 1 GB (~$1/mes).
4. Redespliegue.
5. **Las imágenes perdidas NO se recuperan** — hay que volver a subirlas todas.

**Ventajas**: cero cambios de código. **Desventajas**: coste mensual, no CDN, backups manuales.

### Opción C — Cloudflare R2 (para equipo técnico)
Más trabajo pero más barato a escala. Usa SDK S3-compatible. Gratis hasta 10 GB.

## Recuperación de imágenes perdidas
1. **En local** tienes **96 archivos** en `/Users/dani/resonaweb/packages/backend/uploads/` (32 MB) — súbelas al almacenamiento elegido.
2. **Las subidas posteriores al último push** (timestamps > último commit de uploads) están **perdidas irrecuperablemente**. Hay que re-subirlas manualmente desde los originales.

## Fix temporal aplicado hoy
- `packages/backend/src/controllers/sitemap.controller.ts`: filtra `<image:image>` del sitemap para solo incluir archivos que existen en disco, evitando reportar URLs rotas a Google.

## Acción recomendada
Mientras no se migre storage, **cada push a main perderá imágenes subidas recientemente**. Avisar a los admins de no subir imágenes críticas hasta tener almacenamiento persistente.

---

**Prioridad**: **P0 — crítica para el negocio** (independientemente de SEO).
**Esfuerzo estimado**: 3-4 horas (Opción A con Cloudinary, incluida migración).
