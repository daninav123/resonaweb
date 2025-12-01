# 🎯 Guía Paso a Paso: Google Search Console

## ⏰ Tiempo Total: 10-15 minutos

---

## 📝 **PASO 1: Acceder a Google Search Console (1 minuto)**

1. **Abre tu navegador** (Chrome recomendado)
2. **Ve a:** https://search.google.com/search-console
3. **Inicia sesión** con tu cuenta de Google (la que usas para Gmail)
4. Si es tu primera vez, verás un botón **"Empezar ahora"** → Haz clic

---

## 🌐 **PASO 2: Añadir Tu Propiedad (2 minutos)**

1. **Clic en "Añadir propiedad"** (arriba a la izquierda)

2. **Verás 2 opciones:**
   - ⬜ Dominio
   - ✅ **Prefijo de URL** ← **Selecciona esta**

3. **Escribe:** `https://resona.com`

4. **Clic en "Continuar"**

---

## ✅ **PASO 3: Verificar tu Sitio (5 minutos)**

Google te mostrará varios métodos de verificación. El más fácil es **"Etiqueta HTML"**:

### **Opción Recomendada: Etiqueta HTML**

1. **Selecciona** "Etiqueta HTML" de la lista
2. **Copia el código** que te aparece. Será algo como:
   ```html
   <meta name="google-site-verification" content="ABC123XYZ_CODIGO_LARGO_AQUI">
   ```

3. **Pégalo en tu archivo `index.html`:**
   - Abre el archivo: `/packages/frontend/index.html`
   - Busca las líneas 27-29 que dicen:
     ```html
     <!-- Google Search Console Verification -->
     <!-- PEGA AQUÍ el meta tag... -->
     ```
   - **Reemplaza** el comentario con tu código de verificación
   - Debería quedar así:
     ```html
     <!-- Google Search Console Verification -->
     <meta name="google-site-verification" content="TU_CODIGO_REAL_AQUI">
     ```

4. **Guarda el archivo**

5. **Despliega** los cambios:
   ```bash
   git add packages/frontend/index.html
   git commit -m "Add Google Search Console verification"
   git push origin main
   ```

6. **Espera 2-3 minutos** a que se despliegue

7. **Vuelve a Google Search Console** y haz clic en **"Verificar"**

8. **¡Listo!** Verás un mensaje de éxito ✅

---

## 📄 **PASO 4: Enviar el Sitemap (3 minutos)**

Ahora que tu sitio está verificado:

1. **En el menú lateral izquierdo**, busca **"Sitemaps"**
2. **Clic en "Sitemaps"**
3. **En "Agregar un nuevo sitemap":**
   - Escribe: `https://api.resona.com/sitemap.xml`
   - **Clic en "Enviar"**

4. **¡Hecho!** Verás algo como:
   ```
   Estado: Correcto ✅
   Descubierto: Hace unos momentos
   Enviado: Hace unos momentos
   ```

5. **Espera 24-48 horas** y Google empezará a mostrar:
   - URLs descubiertas
   - URLs indexadas
   - Errores (si los hay)

---

## 🚀 **PASO 5: Indexar Tu Primer Artículo (2 minutos)**

Para que Google indexe un artículo nuevo **YA** (sin esperar):

1. **Publica un artículo** en tu panel de admin
2. **Copia la URL** del artículo, ejemplo:
   ```
   https://resona.com/blog/alquiler-sonido-bodas-valencia
   ```

3. **En Google Search Console:**
   - Arriba verás un campo de búsqueda **"Inspeccionar cualquier URL"**
   - **Pega** la URL de tu artículo
   - **Enter**

4. **Espera 10-15 segundos** mientras Google inspecciona

5. **Verás uno de dos mensajes:**
   - ❌ "La URL no está en Google" → **Clic en "Solicitar indexación"**
   - ✅ "La URL está en Google" → Ya está indexado

6. **Si solicitaste indexación:**
   - Espera 1-2 minutos mientras Google procesa
   - Verás "Indexación solicitada"
   - **Google lo indexará en 24-48 horas** (a veces en minutos)

---

## 📊 **PASO 6: Monitorear Resultados (Cada Semana)**

### **Qué revisar cada semana:**

1. **Ve a "Rendimiento"** (menú lateral)
2. **Verás:**
   - **Clics totales:** Cuántas personas visitan tu web desde Google
   - **Impresiones totales:** Cuántas veces apareces en búsquedas
   - **CTR promedio:** % de personas que hacen clic
   - **Posición media:** En qué posición apareces

3. **Objetivo mensual:**
   - Impresiones: +20% cada mes
   - CTR: > 3%
   - Posición: Subir posiciones (número más bajo)

---

## ⚡ **Preguntas Frecuentes**

### **¿Cuándo veré resultados en Google?**

| Tiempo | Resultado |
|--------|-----------|
| **1-3 días** | Google empieza a rastrear tu sitemap |
| **1 semana** | Primeros artículos indexados |
| **2-4 semanas** | Primeras impresiones en búsquedas |
| **1-2 meses** | Primeros clics desde Google |
| **3-6 meses** | Tráfico orgánico estable |

### **¿Tengo que actualizar el sitemap manualmente?**

**NO.** El sitemap es 100% automático:
- Publicas un artículo → Se añade solo al sitemap
- Borras un artículo → Se quita solo del sitemap
- Actualizas un producto → Se actualiza solo

**Google lo rastrea automáticamente** cada pocos días.

### **¿Con qué frecuencia rastrea Google mi sitemap?**

Depende de:
- **Sitios nuevos:** 1 vez por semana
- **Sitios con contenido frecuente:** 1 vez al día
- **Sitios establecidos:** Varias veces al día

**Puedes configurarlo:**
1. Search Console → Sitemaps
2. Verás "Frecuencia de rastreo"
3. Google lo ajusta automáticamente según tu actividad

### **¿Cuántos artículos debo publicar?**

**Recomendación:**
- **Mínimo:** 1-2 artículos/semana
- **Ideal:** 2-3 artículos/semana
- **Ambicioso:** 1 artículo/día

**Ya tienes un generador automático de artículos** que se ejecuta cada día a las 2:00 AM. Revísalos y publícalos si te gustan.

### **¿Qué pasa si cambio la URL de un artículo?**

1. Google lo detectará automáticamente
2. Configurar una **redirección 301** (te ayudo si necesitas)
3. La nueva URL se indexará
4. La antigua desaparecerá gradualmente

---

## 🎯 **Checklist Completo**

**ANTES de empezar:**
- [ ] Tengo cuenta de Google (Gmail)
- [ ] Tengo acceso al código del proyecto
- [ ] Puedo desplegar cambios

**Configuración:**
- [ ] Crear cuenta en Google Search Console
- [ ] Añadir propiedad `https://resona.com`
- [ ] Verificar con etiqueta HTML
- [ ] Enviar sitemap: `https://api.resona.com/sitemap.xml`

**Primer artículo:**
- [ ] Publicar artículo de calidad (800+ palabras)
- [ ] Solicitar indexación manual
- [ ] Compartir en redes sociales

**Seguimiento:**
- [ ] Revisar Search Console cada semana
- [ ] Publicar 2-3 artículos/semana
- [ ] Monitorear palabras clave
- [ ] Ajustar estrategia según datos

---

## 🆘 **Solución de Problemas**

### **"No puedo verificar mi sitio"**

**Posibles causas:**
1. El meta tag no está bien copiado
   - Verifica que pegaste TODO el código
   - Debe empezar con `<meta name="google-site-verification"`

2. Los cambios no se desplegaron
   - Espera 5 minutos después de hacer push
   - Limpia caché del navegador (Ctrl + Shift + R)

3. Estás verificando con HTTP en lugar de HTTPS
   - Asegúrate de usar `https://resona.com`

### **"El sitemap devuelve error"**

**Verifica:**
1. El backend está corriendo
2. La URL es exacta: `https://api.resona.com/sitemap.xml`
3. Puedes abrirla en el navegador directamente

**Test rápido:**
```bash
curl https://api.resona.com/sitemap.xml
```
Debe devolver XML, no un error.

### **"No aparecen mis artículos en el sitemap"**

**Verifica:**
1. El artículo está **PUBLICADO** (no borrador)
2. El estado es `status: PUBLISHED`
3. Recarga el sitemap en el navegador

---

## 📞 **¿Necesitas Ayuda?**

Si tienes problemas en cualquier paso:
1. Revisa esta guía de nuevo
2. Verifica los logs del backend
3. Consulta la documentación oficial de Google

---

## 🎉 **¡Felicitaciones!**

Una vez completados estos pasos:
- ✅ Google rastreará tu sitio automáticamente
- ✅ Tus artículos se indexarán sin intervención
- ✅ Empezarás a recibir tráfico orgánico
- ✅ Mejorarás tu posicionamiento SEO

**El sistema es 100% automático. Tú solo creas contenido de calidad.**

---

**Próximo paso:** ¡Publicar tu primer artículo optimizado para SEO! 🚀
