/**
 * Script para subir automáticamente los 5 artículos SEO al blog
 * Ejecutar: node upload-blog-articles.js
 */

const axios = require('axios');

// Configuración
const API_BASE_URL = 'http://localhost:3001/api/v1';
const ADMIN_EMAIL = 'admin@resona.com';
const ADMIN_PASSWORD = 'Admin123!';

let authToken = '';

// Función para login y obtener token
async function login() {
  try {
    console.log('🔐 Autenticando como admin...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    // El backend devuelve { message, data: { accessToken, refreshToken, user } }
    authToken = response.data.data?.accessToken || response.data.token || response.data.accessToken;
    
    if (!authToken) {
      console.error('❌ No se recibió token. Respuesta:', response.data);
      throw new Error('No se recibió token de autenticación');
    }
    
    console.log('✅ Autenticación exitosa\n');
    return authToken;
  } catch (error) {
    console.error('❌ Error en autenticación:', error.response?.data || error.message);
    throw error;
  }
}

// Función para crear categorías si no existen
async function ensureCategories() {
  try {
    console.log('📁 Verificando categorías...');
    const response = await axios.get(`${API_BASE_URL}/blog/categories`);
    const existingCategories = response.data;
    
    const requiredCategories = [
      { name: 'Bodas', slug: 'bodas', description: 'Todo sobre bodas y celebraciones' },
      { name: 'Guías', slug: 'guias', description: 'Guías completas y tutoriales' },
      { name: 'Eventos Corporativos', slug: 'eventos-corporativos', description: 'Eventos de empresa' }
    ];
    
    const categoryMap = {};
    
    for (const cat of requiredCategories) {
      const existing = existingCategories.find(c => c.slug === cat.slug);
      if (existing) {
        console.log(`  ✅ Categoría "${cat.name}" ya existe`);
        categoryMap[cat.slug] = existing.id;
      } else {
        console.log(`  📝 Creando categoría "${cat.name}"...`);
        const newCat = await axios.post(
          `${API_BASE_URL}/blog/admin/categories`,
          cat,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        categoryMap[cat.slug] = newCat.data.id;
        console.log(`  ✅ Categoría "${cat.name}" creada`);
      }
    }
    
    console.log('✅ Categorías listas\n');
    return categoryMap;
  } catch (error) {
    console.error('❌ Error gestionando categorías:', error.response?.data || error.message);
    throw error;
  }
}

// Artículos a crear
const articles = [
  {
    title: "Alquiler de Sonido para Bodas en Valencia - Guía Completa 2025",
    slug: "alquiler-sonido-bodas-valencia-guia-completa-2025",
    excerpt: "Guía completa sobre alquiler de sonido para bodas en Valencia. Precios reales, equipos recomendados y consejos de expertos para que tu boda tenga el mejor sonido profesional.",
    categorySlug: "bodas",
    metaKeywords: "alquiler sonido bodas valencia, sonido profesional bodas, equipos audiovisuales bodas valencia",
    tags: ["bodas", "sonido", "valencia", "alquiler"],
    content: `# Alquiler de Sonido para Bodas en Valencia - Guía Completa 2025

¿Estás organizando tu boda en Valencia y buscas el **alquiler de sonido perfecto**? El sonido es uno de los elementos más importantes de tu gran día. Una boda sin buen sonido puede arruinar momentos especiales como la ceremonia, los discursos o la fiesta. En esta guía completa te explicamos todo lo que necesitas saber sobre el alquiler de equipos de sonido profesional para bodas en Valencia.

## ¿Por qué es importante el sonido en una boda?

El sonido profesional garantiza que:
- **La ceremonia se escuche perfectamente** - Tus votos y la música llegarán a todos los invitados
- **Los discursos emocionen** - Micrófono de calidad para que cada palabra se entienda
- **La fiesta sea inolvidable** - Música potente y clara para bailar toda la noche
- **No haya problemas técnicos** - Equipos profesionales = cero interrupciones

## Equipos de sonido esenciales para bodas

### 1. Sistema de sonido para la ceremonia
Para una ceremonia al aire libre o en un espacio sin sonido, necesitas:
- **Altavoces autoamplificados** (2 unidades mínimo)
- **Micrófono inalámbrico** para el oficiante
- **Micrófono de solapa** para los novios
- **Mesa de mezclas pequeña**
- **Reproductor de música** (portátil o conexión Bluetooth)

**Precio orientativo:** 150-250€/día

### 2. Sonido para el banquete y discursos
Durante la cena y los discursos:
- **Sistema de altavoces potente** (300-500W por lado)
- **2-4 micrófonos inalámbricos** para discursos
- **Mesa de mezclas profesional**
- **Música ambiental** para crear el ambiente perfecto

**Precio orientativo:** 200-350€/día

### 3. Equipo completo para la fiesta
Para que tus invitados bailen hasta el amanecer:
- **Altavoces profesionales** de alta potencia (1000-2000W)
- **Subwoofers** para graves profundos
- **Mesa de mezclas DJ**
- **CDJs o controlador DJ**
- **Micrófono** para animación

**Precio orientativo:** 400-700€/día

## Precios reales de alquiler de sonido para bodas en Valencia

Los precios varían según el número de invitados y la duración:

**Boda pequeña (hasta 80 invitados):**
- Ceremonia + Banquete + Fiesta: **600-900€**

**Boda mediana (80-150 invitados):**
- Ceremonia + Banquete + Fiesta: **900-1.400€**

**Boda grande (+150 invitados):**
- Ceremonia + Banquete + Fiesta: **1.400-2.200€**

*Precios incluyen: equipos, transporte, montaje, desmontaje y técnico durante el evento*

## Consejos de expertos para elegir sonido para tu boda

### 1. Reserva con antelación
Las mejores empresas de sonido en Valencia se reservan con 6-12 meses de antelación, especialmente para bodas en temporada alta (mayo-octubre).

### 2. Visita las instalaciones
Antes de contratar, visita la empresa y ve los equipos. Asegúrate de que son modernos y están en buen estado.

### 3. Pide referencias
Pregunta por bodas anteriores y, si es posible, contacta con parejas que ya contrataron el servicio.

### 4. Incluye un técnico de sonido
Nunca alquiles solo los equipos. Un técnico profesional ajustará el volumen, mezclará la música y solucionará cualquier imprevisto.

### 5. Haz una prueba de sonido
Si es posible, visita el lugar de tu boda con la empresa de sonido para hacer una prueba y ajustar los equipos al espacio.

## Errores comunes al alquilar sonido para bodas

❌ **Contratar equipos baratos de baja calidad** → El sonido se corta, hay interferencias
❌ **No incluir sonido para la ceremonia** → Los invitados no oyen los votos
❌ **Alquilar equipos sin técnico** → Nadie ajusta el volumen, problemas técnicos
❌ **Dejar para última hora** → Las mejores empresas ya están reservadas

## Por qué elegir ReSona Events

En ReSona Events ofrecemos:
✅ Equipos profesionales de última generación (JBL, Pioneer, Shure)
✅ Técnico especializado incluido en todos los paquetes
✅ Montaje y desmontaje sin cargos adicionales
✅ Asesoramiento personalizado para tu tipo de boda
✅ Presupuesto online gratuito en 24h

### Calcula tu presupuesto ahora

[Utiliza nuestra calculadora](/calculadora-eventos) para obtener un presupuesto personalizado en minutos, o contacta directamente por WhatsApp.

### Contacta con nosotros

📞 **WhatsApp:** [613 88 14 14](https://wa.me/34613881414)
📧 **Email:** info@resonaevents.com
🌐 **Web:** [Ver catálogo de equipos](/productos)

---

**Conclusión**: El alquiler de sonido profesional es fundamental para que tu boda en Valencia sea perfecta. Con equipos de calidad, un técnico experto y una buena planificación, garantizarás que cada momento se escuche perfectamente.

¿Necesitas ayuda para elegir el equipo perfecto? Contacta con ReSona Events y te asesoramos sin compromiso.`
  },
  {
    title: "Cuánto Cuesta Alquilar Iluminación para Eventos - Precios Reales 2025",
    slug: "cuanto-cuesta-alquilar-iluminacion-eventos-precios-2025",
    excerpt: "Descubre los precios reales de alquiler de iluminación para eventos en Valencia. Guía completa con costes, equipos y consejos para elegir la iluminación perfecta.",
    categorySlug: "guias",
    metaKeywords: "alquiler iluminación eventos, precios iluminación bodas, iluminación profesional valencia",
    tags: ["iluminación", "eventos", "precios", "valencia"],
    content: `# Cuánto Cuesta Alquilar Iluminación para Eventos - Precios Reales 2025

La **iluminación profesional** transforma completamente cualquier evento. Pero, ¿cuánto cuesta realmente alquilar iluminación en Valencia? En esta guía te mostramos precios reales, equipos disponibles y consejos para que tomes la mejor decisión.

## Por qué la iluminación es clave en tu evento

La iluminación adecuada:
- **Crea ambiente y emoción** - Transforma espacios simples en mágicos
- **Destaca momentos importantes** - Primer baile, entrada, corte de tarta
- **Mejora las fotos y vídeos** - Recuerdos profesionales increíbles
- **Adapta espacios** - Convierte cualquier lugar en el perfecto para tu evento

## Tipos de iluminación para eventos

### 1. Iluminación ambiental

**Qué es:** Luces LED que crean atmósfera general

**Equipos:**
- Focos LED PAR (RGB)
- Barras LED
- Uplights para paredes

**Precio:** 150-300€/día (pack básico)
**Ideal para:** Bodas, eventos corporativos, cumpleaños

### 2. Iluminación arquitectónica

**Qué es:** Ilumina edificios, paredes, jardines

**Equipos:**
- Proyectores LED exteriores
- Wash lights
- Uplights potentes

**Precio:** 200-400€/día
**Ideal para:** Bodas al aire libre, eventos en masías

### 3. Iluminación de baile/fiesta

**Qué es:** Efectos dinámicos para la pista de baile

**Equipos:**
- Moving heads
- Focos robotizados
- Láser
- Máquina de humo
- Estroboscopios

**Precio:** 300-600€/día
**Ideal para:** Fiestas, conciertos, discotecas móviles

### 4. Iluminación decorativa

**Qué es:** Elementos decorativos luminosos

**Equipos:**
- Letras luminosas
- Cortinas de luces
- Guirnaldas LED
- Velas LED

**Precio:** 100-250€/día
**Ideal para:** Bodas vintage, eventos temáticos

## Precios reales por tipo de evento

### Boda completa

**Pack básico (50-80 invitados):**
- Iluminación ambiental + Pista de baile: **450-700€**

**Pack completo (100-150 invitados):**
- Ambiental + Arquitectónica + Baile: **900-1.400€**

**Pack premium (+150 invitados):**
- Todo incluido + Efectos especiales: **1.600-2.500€**

### Evento corporativo

**Presentación/Conferencia:**
- Iluminación profesional + Focos escenario: **400-800€**

**Cena de empresa:**
- Ambiental + Mesa presidencial: **500-900€**

### Cumpleaños/Fiesta privada

**Fiesta pequeña (hasta 50 personas):**
- Luces básicas + Efectos: **300-500€**

**Fiesta grande (100+ personas):**
- Pack completo: **600-1.200€**

## Qué incluyen los precios

✅ Alquiler de equipos
✅ Transporte (zona Valencia)
✅ Montaje y desmontaje
✅ Técnico de iluminación
✅ Prueba previa (opcional)
✅ Programación personalizada

❌ NO incluyen:
- Estructuras especiales (truss)
- Generadores eléctricos
- Horas extra de evento

## Consejos para ahorrar

💡 **Reserva con antelación** - Descuentos hasta 15%
💡 **Combina servicios** - Sonido + Iluminación = descuento
💡 **Temporada baja** - Nov-Mar más económico
💡 **Packs predefinidos** - Más baratos que personalizar

## Calcula tu presupuesto personalizado

[Usa nuestra calculadora gratuita](/calculadora-eventos) para obtener un presupuesto exacto en minutos.

### ReSona Events - Transparencia de precios

En ReSona Events creemos en la **transparencia total**:
- Presupuestos detallados
- Sin cargos ocultos
- Asesoramiento gratuito
- Visita nuestras instalaciones

📞 **Contacto:**
WhatsApp: [613 88 14 14](https://wa.me/34613881414)
Email: info@resonaevents.com

---

**Conclusión**: El alquiler de iluminación profesional en Valencia tiene precios muy variados según tus necesidades. Con esta guía ya conoces los costes reales y puedes planificar tu presupuesto con confianza.

¿Quieres un presupuesto personalizado? Contacta con nosotros y te ayudamos a elegir la iluminación perfecta para tu evento.`
  },
  {
    title: "Mejores Equipos DJ para Bodas en Valencia - Comparativa 2025",
    slug: "mejores-equipos-dj-bodas-valencia-comparativa-2025",
    excerpt: "Comparativa completa de equipos DJ profesionales para bodas en Valencia. CDJs, controladoras, mesas de mezclas y todo lo que necesitas para contratar al mejor DJ.",
    categorySlug: "bodas",
    metaKeywords: "equipos dj bodas valencia, alquiler equipo dj, dj profesional bodas valencia",
    tags: ["dj", "bodas", "valencia", "equipos"],
    content: `# Mejores Equipos DJ para Bodas en Valencia - Comparativa 2025

¿Vas a contratar un DJ para tu boda en Valencia? Los **equipos DJ profesionales** marcan la diferencia entre una fiesta memorable y una decepción. En esta guía te explicamos todo sobre equipos DJ, precios y cómo elegir el mejor para tu boda.

## Por qué es importante el equipo DJ

Un DJ con equipo profesional garantiza:
- **Música sin cortes** - Equipos de calidad = cero interrupciones
- **Mejor sonido** - Transiciones suaves y ecualización perfecta
- **Más opciones musicales** - Acceso a cualquier canción al instante
- **Backup de seguridad** - Si falla algo, hay plan B inmediato

## Configuraciones completas para bodas

### Setup básico (boda 50-80 invitados)
**Equipo:**
- Controlador DJ profesional
- Laptop con software
- Altavoces 500W
- Micrófono inalámbrico
**Precio total:** 350-550€/día

### Setup profesional (boda 100-150 invitados)
**Equipo:**
- 2x CDJ-2000 NXS2
- Mesa mezclas DJM-900
- Altavoces 1000W + Subwoofer
- Iluminación básica
- Micrófono
**Precio total:** 700-1.000€/día

## ReSona Events - Equipos DJ profesionales

Ofrecemos:
✅ CDJs Pioneer última generación
✅ Mesas de mezclas profesionales
✅ Técnico especializado incluido
✅ Iluminación DJ opcional
✅ Asesoramiento en selección musical

### Contacto
📞 WhatsApp: [613 88 14 14](https://wa.me/34613881414)
📧 Email: info@resonaevents.com`
  },
  {
    title: "Checklist Completo: Organizar tu Boda en Valencia Paso a Paso",
    slug: "checklist-completo-organizar-boda-valencia",
    excerpt: "Guía paso a paso para organizar tu boda en Valencia. Checklist completo con fechas, proveedores y todo lo que necesitas para que tu boda sea perfecta.",
    categorySlug: "bodas",
    metaKeywords: "organizar boda valencia, checklist boda, planificar boda valencia",
    tags: ["bodas", "organización", "valencia", "checklist"],
    content: `# Checklist Completo: Organizar tu Boda en Valencia Paso a Paso

Organizar una **boda en Valencia** puede parecer abrumador. ¿Por dónde empezar? ¿Qué contratar primero? En esta guía completa te damos el checklist definitivo, mes a mes, para que no se te escape ningún detalle.

## 12 meses antes - Los básicos

### ✅ Definir presupuesto total
- Calcular cuánto podéis invertir
- Distribución: 40% lugar, 20% catering, 15% foto/vídeo, 15% sonido/iluminación, 10% otros

### ✅ Elegir fecha y estación
**Temporada alta** (Mayo-Octubre): Más caro pero mejor clima
**Temporada baja** (Nov-Abril): 20-30% más económico

### ✅ Reservar el lugar
Los mejores espacios en Valencia se reservan con 12-18 meses

## 6-9 meses antes - Detalles importantes

### ✅ Sonido e iluminación
[Calcula presupuesto iluminación](/blog/cuanto-cuesta-alquilar-iluminacion-eventos-precios-2025)

**Necesitas:**
- Sonido ceremonia
- Sonido banquete
- Iluminación ambiental
- Iluminación pista de baile

[Ver opciones sonido bodas](/blog/alquiler-sonido-bodas-valencia-guia-completa-2025)

## Presupuesto típico boda Valencia

**Boda 100 invitados (estándar):**
- Lugar: 2.000-4.000€
- Catering: 4.000-7.000€
- Foto/Vídeo: 1.500-3.000€
- Sonido/Iluminación: 800-1.500€
**TOTAL:** 11.000-21.000€

## Herramientas útiles

### Calculadora de presupuesto
[Calcula tu boda gratis](/calculadora-eventos)

### Contacto proveedores
📞 **Sonido/Iluminación:** [ReSona Events](https://wa.me/34613881414)
📧 Email: info@resonaevents.com`
  },
  {
    title: "Pantallas LED vs Proyectores para Eventos Corporativos - Guía 2025",
    slug: "pantallas-led-vs-proyectores-eventos-corporativos-guia",
    excerpt: "¿Pantalla LED o proyector para tu evento corporativo? Comparativa completa con ventajas, precios y cuándo usar cada uno para presentaciones profesionales.",
    categorySlug: "eventos-corporativos",
    metaKeywords: "pantallas led eventos, proyectores eventos corporativos, alquiler pantallas valencia",
    tags: ["pantallas led", "proyectores", "eventos corporativos", "valencia"],
    content: `# Pantallas LED vs Proyectores para Eventos Corporativos - Guía 2025

¿**Pantalla LED o proyector** para tu evento corporativo en Valencia? Ambos tienen ventajas, pero elegir mal puede arruinar tu presentación. En esta guía comparamos ambos sistemas para que tomes la mejor decisión.

## Pantallas LED: Características

### Ventajas
✅ **Visibles con luz** - Funcionan perfectamente de día
✅ **Colores vibrantes** - Mayor brillo y contraste
✅ **Cualquier tamaño** - Modulares, se adaptan al espacio

### Precio alquiler Valencia
- Pantalla 2x3m: 400-700€/día
- Pantalla 4x3m: 800-1.200€/día
- Pantalla 6x4m: 1.500-2.500€/día

## Proyectores: Características

### Ventajas
✅ **Más económicos** - 50-70% más baratos
✅ **Fácil instalación** - Setup rápido
✅ **Portátiles** - Fácil de mover

### Precio alquiler Valencia
- Proyector 3.000 lúmenes: 100-200€/día
- Proyector 5.000 lúmenes: 200-350€/día
- Proyector 10.000 lúmenes: 400-600€/día

## Cuándo usar cada uno

### USA PANTALLA LED si:
✅ Evento al aire libre o con mucha luz
✅ Audiencia grande (+200 personas)
✅ Necesitas impactar visualmente

### USA PROYECTOR si:
✅ Evento en interior con control de luz
✅ Audiencia pequeña-mediana (hasta 150)
✅ Presupuesto ajustado

## Calcula tu presupuesto
[Calculadora de eventos corporativos](/calculadora-eventos)

## ReSona Events - Expertos AV

Ofrecemos:
✅ Pantallas LED modulares (P2.5 a P5)
✅ Proyectores 3.000-12.000 lúmenes
✅ Asesoramiento técnico gratuito

### Contacto
📞 WhatsApp: [613 88 14 14](https://wa.me/34613881414)
📧 Email: info@resonaevents.com`
  }
];

// Función principal
async function uploadArticles() {
  try {
    console.log('🚀 INICIANDO SUBIDA DE ARTÍCULOS SEO\n');
    console.log('=====================================\n');
    
    // 1. Login
    await login();
    
    // 2. Asegurar categorías
    const categoryMap = await ensureCategories();
    
    // 3. Subir artículos
    console.log('📝 Subiendo artículos...\n');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const [index, article] of articles.entries()) {
      try {
        console.log(`  [${index + 1}/${articles.length}] "${article.title}"...`);
        
        const postData = {
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content,
          metaTitle: article.title,
          metaDescription: article.excerpt,
          metaKeywords: article.metaKeywords,
          categoryId: categoryMap[article.categorySlug],
          tags: article.tags,
          status: 'PUBLISHED' // Publicar directamente
        };
        
        const response = await axios.post(
          `${API_BASE_URL}/blog/admin/posts`,
          postData,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        
        console.log(`  ✅ Artículo creado y publicado (ID: ${response.data.id})\n`);
        successCount++;
        
      } catch (error) {
        console.error(`  ❌ Error: ${error.response?.data?.error || error.message}\n`);
        errorCount++;
      }
    }
    
    console.log('\n=====================================');
    console.log('📊 RESUMEN FINAL:');
    console.log(`✅ Exitosos: ${successCount}/${articles.length}`);
    console.log(`❌ Errores: ${errorCount}/${articles.length}`);
    console.log('=====================================\n');
    
    if (successCount === articles.length) {
      console.log('🎉 ¡TODOS LOS ARTÍCULOS SUBIDOS EXITOSAMENTE!\n');
      console.log('Próximo paso: Verifica en /admin/blog\n');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR FATAL:', error.message);
    process.exit(1);
  }
}

// Ejecutar
uploadArticles();
