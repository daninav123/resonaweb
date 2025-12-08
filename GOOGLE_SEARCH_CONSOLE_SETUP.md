# 🔍 GUÍA: CONFIGURAR GOOGLE SEARCH CONSOLE

## PASO A PASO PARA VERIFICACIÓN Y OPTIMIZACIÓN

---

## 1️⃣ VERIFICACIÓN DE PROPIEDAD

### Opción A: Verificación por DNS (Recomendado)
1. Ir a [Google Search Console](https://search.google.com/search-console)
2. Click en "Añadir propiedad"
3. Seleccionar "Dominio"
4. Introducir: `resonaevents.com`
5. Google te dará un registro TXT
6. Añadir en tu proveedor de dominio:
   ```
   Tipo: TXT
   Nombre: @
   Valor: google-site-verification=XXXXXXXXX
   TTL: 3600
   ```
7. Esperar 5-10 minutos y verificar

### Opción B: Verificación por HTML (Más rápido)
1. Google te da un archivo HTML
2. Subir a: `packages/frontend/public/google-verification.html`
3. Verificar que se puede acceder en: `https://resonaevents.com/google-verification.html`
4. Click en "Verificar"

### Opción C: Meta Tag (Si no tienes acceso al servidor)
1. Google te da un meta tag
2. Añadir en `index.html`:
   ```html
   <meta name="google-site-verification" content="XXXXXXXXX" />
   ```
3. Deploy y verificar

---

## 2️⃣ ENVIAR SITEMAP

### Paso 1: Generar sitemap actualizado
```bash
npm run seo:sitemap
```

### Paso 2: Verificar sitemap
Abrir en navegador:
```
https://resonaevents.com/sitemap.xml
```

Debe mostrar XML válido con todas las URLs.

### Paso 3: Enviar a Google
1. En Search Console → Sitemaps
2. Introducir URL: `sitemap.xml`
3. Click en "Enviar"
4. Esperar 24-48h para primera indexación

### Paso 4: Configurar actualizaciones automáticas
Añadir en `package.json`:
```json
"scripts": {
  "postbuild": "npm run seo:sitemap"
}
```

---

## 3️⃣ CONFIGURAR AJUSTES IMPORTANTES

### Rendimiento y Core Web Vitals
1. Ir a "Experiencia" → "Experiencia de página"
2. Monitorear:
   - LCP (Largest Contentful Paint): < 2.5s ✅
   - FID (First Input Delay): < 100ms ✅
   - CLS (Cumulative Layout Shift): < 0.1 ✅

### Cobertura de Indexación
1. Ir a "Indexación" → "Páginas"
2. Verificar que todas las páginas están indexadas
3. Solucionar errores mostrados

### URLs a Indexar Prioritariamente
```
https://resonaevents.com/
https://resonaevents.com/productos
https://resonaevents.com/calculadora-evento
https://resonaevents.com/blog
https://resonaevents.com/contacto
```

---

## 4️⃣ SOLICITAR INDEXACIÓN MANUAL

Para páginas nuevas importantes:

1. Ir a "Inspección de URLs"
2. Pegar URL completa
3. Si no está indexada, click "Solicitar indexación"
4. Repetir para cada página importante

**URLs prioritarias a indexar manualmente:**
- Homepage
- Calculadora
- Catálogo de productos
- Cada nuevo blog post

---

## 5️⃣ CONFIGURAR ALERTAS Y NOTIFICACIONES

### Email Notifications
1. Configuración → "Usuarios y permisos"
2. Añadir email: `info@resonaevents.com`
3. Activar notificaciones para:
   - Errores críticos de indexación
   - Problemas de seguridad
   - Cambios importantes en rendimiento

---

## 6️⃣ INTEGRAR CON GOOGLE ANALYTICS

### Vincular Cuentas
1. En Search Console: Configuración → "Asociaciones"
2. Vincular con Google Analytics
3. Beneficios:
   - Datos más completos
   - Informes integrados
   - Mejor análisis de conversiones

---

## 7️⃣ MONITOREO CONTINUO (Weekly Tasks)

### Checklist Semanal
- [ ] Revisar páginas indexadas
- [ ] Verificar errores de rastreo
- [ ] Monitorear posiciones de keywords
- [ ] Revisar Core Web Vitals
- [ ] Analizar páginas más visitadas
- [ ] Verificar backlinks nuevos

### Métricas Clave a Monitorear

#### Rendimiento
- Impresiones totales
- Clics totales
- CTR promedio
- Posición promedio

#### Cobertura
- Páginas válidas
- Páginas con errores
- Páginas excluidas
- Páginas con advertencias

#### Mejoras
- Usabilidad móvil
- Datos estructurados
- Experiencia de página

---

## 8️⃣ RESOLVER PROBLEMAS COMUNES

### Problema: "Página no indexada"
**Soluciones:**
1. Verificar que no está en `robots.txt` Disallow
2. Verificar que tiene contenido único (no duplicado)
3. Verificar que está en el sitemap
4. Solicitar indexación manual
5. Esperar 2-3 días

### Problema: "Rastreado, actualmente no indexado"
**Soluciones:**
1. Mejorar contenido (más palabras, más valor)
2. Añadir enlaces internos desde otras páginas
3. Mejorar velocidad de página
4. Esperar - Google indexará eventualmente

### Problema: "Error 404"
**Soluciones:**
1. Verificar que la URL existe
2. Configurar redirección 301 si cambió
3. Actualizar sitemap
4. Eliminar de Search Console

### Problema: "Contenido duplicado"
**Soluciones:**
1. Usar canonical URLs
2. Configurar redirects 301
3. Usar `noindex` en páginas duplicadas
4. Consolidar contenido similar

---

## 9️⃣ KEYWORDS A MONITOREAR

### Tier 1 - Alta Prioridad
```
- alquiler sonido valencia
- alquiler iluminación valencia
- DJ bodas valencia
- alquiler equipos audiovisuales valencia
```

### Tier 2 - Media Prioridad
```
- alquiler material eventos valencia
- sonido profesional bodas
- iluminación eventos
- calculadora presupuesto eventos
```

### Tier 3 - Long-tail
```
- alquiler sonido bodas pequeñas valencia
- precio DJ boda valencia 2025
- equipos audiovisuales eventos corporativos
- montaje eventos valencia
```

### Cómo Añadir Keywords
1. No se añaden directamente en Search Console
2. Google las detecta automáticamente del contenido
3. Aparecerán en "Rendimiento" → "Consultas"
4. Filtrar y analizar las que traen más tráfico

---

## 🔟 INFORMES ÚTILES

### Informe 1: Páginas con Más Impresiones
- Ver qué páginas aparecen más en búsquedas
- Optimizar meta descriptions para mejorar CTR
- Añadir más contenido relacionado

### Informe 2: Consultas con Baja Posición
- Identificar keywords en posición 11-20
- Pequeñas mejoras pueden llevar a página 1
- Optimizar contenido existente

### Informe 3: Páginas con Bajo CTR
- Mejorar titles para ser más atractivos
- Añadir fechas (2025) para frescura
- Usar números y emojis moderadamente

### Informe 4: Enlaces Entrantes
- Ver quién enlaza a tu sitio
- Contactar para mejorar relación
- Identificar oportunidades de guest posting

---

## ✅ CHECKLIST POST-CONFIGURACIÓN

- [ ] Propiedad verificada
- [ ] Sitemap enviado y aceptado
- [ ] Todas las páginas principales indexadas
- [ ] Alertas de email configuradas
- [ ] Google Analytics vinculado
- [ ] Core Web Vitals monitoreados
- [ ] Primera revisión de keywords completada
- [ ] Errores críticos resueltos

---

## 📊 MÉTRICAS DE ÉXITO

### Semana 1
- [ ] 20+ páginas indexadas
- [ ] 0 errores críticos
- [ ] Sitemap procesado correctamente

### Mes 1
- [ ] 50+ páginas indexadas
- [ ] 100+ impresiones/día
- [ ] 10+ clics/día

### Mes 3
- [ ] 100+ páginas indexadas
- [ ] 1000+ impresiones/día
- [ ] 50+ clics/día
- [ ] Top 10 en 5+ keywords

### Mes 6
- [ ] 150+ páginas indexadas
- [ ] 5000+ impresiones/día
- [ ] 200+ clics/día
- [ ] #1 en 10+ keywords locales

---

## 🚀 PRÓXIMOS PASOS

1. **Hoy:** Verificar propiedad + enviar sitemap
2. **Esta semana:** Monitorear indexación inicial
3. **Próximas 2 semanas:** Crear primeros 10 blog posts
4. **Mensual:** Revisar métricas y optimizar

---

## 📞 SOPORTE

Si tienes problemas:
- [Centro de Ayuda de Google Search Console](https://support.google.com/webmasters)
- [Comunidad de Search Console](https://support.google.com/webmasters/community)

---

**¡Todo listo para dominar Google Search Console!** 🏆
