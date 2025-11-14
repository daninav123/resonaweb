import cron from 'node-cron';
import { blogService } from '../services/blog.service';
import { generateBlogArticle, generateBlogImage } from '../services/openai.service';
import { logger } from '../utils/logger';

// Generar slug a partir del título
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Plantillas de artículos para generación automática
const articleTemplates = [
  {
    category: 'Guías',
    titles: [
      'Cómo elegir el equipo de sonido perfecto para tu boda',
      '10 consejos para una iluminación profesional en eventos',
      'Guía completa de alquiler de material audiovisual',
      'Checklist esencial para organizar un evento con material alquilado',
      'Cómo calcular el presupuesto de equipos para tu evento',
    ],
  },
  {
    category: 'Equipamiento',
    titles: [
      'Top 5 micrófonos profesionales para eventos en 2025',
      'Altavoces vs Monitores: ¿Cuál necesitas para tu evento?',
      'Iluminación LED: Ventajas y desventajas para eventos',
      'Cámaras profesionales: ¿Comprar o alquilar?',
      'Equipos de sonido para conferencias: Guía completa',
    ],
  },
  {
    category: 'Tipos de Eventos',
    titles: [
      'Material audiovisual esencial para bodas',
      'Equipamiento profesional para conciertos al aire libre',
      'Sonido e iluminación para eventos corporativos',
      'Alquiler de equipos para festivales y ferias',
      'Tecnología audiovisual para conferencias y seminarios',
    ],
  },
  {
    category: 'Consejos',
    titles: [
      '5 errores comunes al alquilar material para eventos',
      'Cómo ahorrar en el alquiler de equipos sin sacrificar calidad',
      'Tiempos de entrega: ¿Cuándo reservar tu material?',
      'Mantenimiento básico del equipo alquilado',
      'Qué hacer si falla el equipo durante tu evento',
    ],
  },
];

// Generar contenido de artículo basado en título
function generateArticleContent(title: string, category: string): { excerpt: string; content: string; keywords: string } {
  const slug = generateSlug(title);
  
  const excerpt = `Descubre todo lo que necesitas saber sobre ${title.toLowerCase()}. Guía completa con consejos profesionales, recomendaciones de equipos y mejores prácticas para tu evento.`;
  
  const content = `
# ${title}

## Introducción

En el mundo de los eventos, contar con el equipamiento adecuado marca la diferencia entre un evento memorable y una experiencia mediocre. En esta guía completa, exploraremos todo lo que necesitas saber sobre ${title.toLowerCase()}.

## ¿Por qué es importante?

El alquiler de material profesional para eventos se ha convertido en la opción preferida tanto para organizadores experimentados como para quienes planean su primer evento. Las ventajas son claras:

- **Acceso a tecnología de última generación** sin inversión inicial
- **Flexibilidad** para adaptar el equipo a cada tipo de evento
- **Soporte técnico profesional** incluido
- **Sin preocupaciones de mantenimiento** o almacenamiento

## Factores clave a considerar

### 1. Tamaño y tipo de evento

El número de asistentes y el tipo de evento determinan las necesidades de equipamiento. Un evento íntimo requiere un enfoque diferente a un concierto masivo o una conferencia corporativa.

### 2. Presupuesto disponible

Es fundamental establecer un presupuesto realista que contemple:
- Alquiler de equipos principales
- Accesorios y cables
- Transporte y montaje
- Seguro (opcional pero recomendado)

### 3. Duración del evento

La duración influye directamente en el coste. Muchas empresas ofrecen tarifas especiales para alquileres de varios días o semanas.

## Recomendaciones profesionales

### Para eventos de 50-100 personas
- 2 altavoces principales (500-800W)
- Mesa de mezclas de 8-12 canales
- 2-4 micrófonos
- Iluminación básica (4-6 focos LED)

### Para eventos de 100-300 personas
- Sistema de PA completo (1000-2000W)
- Mesa de mezclas digital
- 4-8 micrófonos (inalámbricos recomendados)
- Iluminación profesional (8-12 focos)
- Sistema de monitorización

### Para eventos grandes (300+ personas)
- Sistema line array
- Mesa digital con opciones de grabación
- Set completo de micrófonos inalámbricos
- Diseño de iluminación completo
- Equipo de backup

## Checklist antes de alquilar

✅ Define claramente tus necesidades
✅ Compara presupuestos de al menos 3 proveedores
✅ Verifica la disponibilidad para tus fechas
✅ Pregunta por el soporte técnico incluido
✅ Lee las condiciones de cancelación
✅ Confirma los horarios de entrega y recogida
✅ Inspecciona el equipo al recibirlo

## Errores comunes a evitar

### 1. Esperar hasta el último momento
Los mejores equipos se reservan con semanas o incluso meses de antelación, especialmente en temporada alta.

### 2. No calcular correctamente las necesidades
Subestimar las necesidades puede arruinar tu evento, pero sobreestimar genera gastos innecesarios.

### 3. No solicitar una prueba de sonido
Siempre que sea posible, solicita una demostración o prueba del equipo antes del día del evento.

## Preguntas frecuentes

**¿Cuánto tiempo antes debo reservar?**
Recomendamos reservar con al menos 2-4 semanas de antelación. Para eventos grandes o en fechas populares, reserva con 2-3 meses de anticipación.

**¿Qué pasa si el equipo falla durante el evento?**
Las empresas profesionales incluyen soporte técnico y equipos de respaldo. Asegúrate de que esto esté contemplado en tu contrato.

**¿Necesito seguro?**
Aunque no es obligatorio, el seguro protege contra daños accidentales y puede ahorrarte costes significativos.

**¿Incluye el montaje?**
Depende del proveedor y del paquete contratado. Muchos incluyen montaje básico, pero el diseño completo puede tener un coste adicional.

## Conclusión

${title} no tiene por qué ser complicado. Con la planificación adecuada, presupuesto realista y el proveedor correcto, tu evento contará con el equipamiento profesional que merece.

En Resona Events, ofrecemos equipos de última generación, asesoramiento profesional y soporte técnico completo. Utiliza nuestra [calculadora de presupuestos](/calculadora-evento) para obtener una estimación instantánea.

## ¿Listo para tu evento?

Contacta con nosotros para un presupuesto personalizado o explora nuestro [catálogo completo](/productos) de equipos profesionales disponibles para alquiler.

---

*Última actualización: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}*
`;

  const keywords = `${slug}, alquiler material eventos, ${category.toLowerCase()}, equipos profesionales, eventos`;

  return { excerpt, content, keywords };
}

// Función para generar artículo automáticamente con IA
async function generateDailyArticle(authorId: string) {
  try {
    logger.info('🤖 Iniciando generación de artículo con IA...');
    logger.info(`OpenAI API Key configurada: ${process.env.OPENAI_API_KEY ? 'Sí (longitud: ' + process.env.OPENAI_API_KEY.length + ')' : 'No'}`);

    // Generar contenido con OpenAI
    const aiArticle = await generateBlogArticle();
    
    // Generar imagen con DALL-E 3
    let featuredImage: string | null = null;
    try {
      logger.info('🎨 Generando imagen con DALL-E 3...');
      featuredImage = await generateBlogImage(aiArticle.title, aiArticle.excerpt);
      
      if (featuredImage) {
        logger.info(`✅ Imagen generada y guardada: ${featuredImage}`);
      }
    } catch (imageError: any) {
      logger.error(`❌ Error generando imagen: ${imageError.message}`);
    }
    
    const slug = generateSlug(aiArticle.title);

    // Verificar si ya existe un artículo con este slug
    const existing = await blogService.getPostBySlug(slug);
    if (existing) {
      logger.info(`Article with slug ${slug} already exists, skipping generation`);
      return null;
    }

    // Buscar o crear categoría
    let categories = await blogService.getCategories();
    let category = categories.find(c => c.name === aiArticle.category);
    
    if (!category) {
      category = await blogService.createCategory({
        name: aiArticle.category,
        slug: generateSlug(aiArticle.category),
        description: `Artículos sobre ${aiArticle.category.toLowerCase()}`,
        color: '#5ebbff',
      });
    }

    // Crear post programado para mañana a las 9 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    const post = await blogService.createPost({
      title: aiArticle.title,
      slug,
      excerpt: aiArticle.excerpt,
      content: aiArticle.content,
      metaTitle: aiArticle.metaTitle,
      metaDescription: aiArticle.metaDescription,
      metaKeywords: aiArticle.metaKeywords,
      featuredImage: featuredImage || undefined,
      categoryId: category.id,
      tags: aiArticle.category.split(' '),
      status: 'SCHEDULED',
      scheduledFor: tomorrow,
      authorId,
      aiGenerated: true,
      aiPrompt: `OpenAI GPT-4 generated article about: ${aiArticle.title}`,
    });

    logger.info(`✅ AI-generated article: "${aiArticle.title}" scheduled for ${tomorrow.toISOString()}`);
    return post;
  } catch (error: any) {
    logger.error(`❌ Error generating daily article with AI: ${error.message}`);
    return null;
  }
}

// Job: Publicar posts programados (cada hora)
export function setupPublishScheduledPosts() {
  cron.schedule('0 * * * *', async () => {
    try {
      const published = await blogService.publishScheduledPosts();
      if (published > 0) {
        logger.info(`✅ Published ${published} scheduled blog posts`);
      }
    } catch (error: any) {
      logger.error(`Error publishing scheduled posts: ${error.message}`);
    }
  });

  logger.info('📅 Scheduled posts publisher job started (runs every hour)');
}

// Job: Generar artículo diario (cada día a las 2 AM)
export function setupDailyArticleGeneration(adminUserId: string) {
  cron.schedule('0 2 * * *', async () => {
    try {
      await generateDailyArticle(adminUserId);
    } catch (error: any) {
      logger.error(`Error in daily article generation: ${error.message}`);
    }
  });

  logger.info('📝 Daily article generation job started (runs at 2 AM daily)');
}

// Función manual para generar artículo (para testing)
export async function manualGenerateArticle(authorId: string) {
  return await generateDailyArticle(authorId);
}

// Función para generar artículo y publicarlo inmediatamente (para el botón)
export async function generateArticleNow(authorId: string) {
  try {
    logger.info('🤖 Generación manual con IA - publicación inmediata');

    // Generar contenido con OpenAI
    const aiArticle = await generateBlogArticle();
    
    // Generar imagen con DALL-E 3
    let featuredImage: string | null = null;
    try {
      logger.info('🎨 Generando imagen con DALL-E 3...');
      featuredImage = await generateBlogImage(aiArticle.title, aiArticle.excerpt);
      
      if (featuredImage) {
        logger.info(`✅ Imagen generada y guardada: ${featuredImage}`);
      } else {
        logger.warn('⚠️  No se pudo generar la imagen');
      }
    } catch (imageError: any) {
      logger.error(`❌ Error generando imagen: ${imageError.message}`);
      logger.warn('⚠️  Continuando sin imagen...');
    }
    
    const slug = generateSlug(aiArticle.title);

    // Verificar si ya existe y generar slug único
    let finalSlug = slug;
    let existing = await blogService.getPostBySlug(finalSlug);
    
    if (existing) {
      // Agregar timestamp para hacer el slug único
      const timestamp = Date.now();
      finalSlug = `${slug}-${timestamp}`;
      logger.info(`Slug duplicado, usando: ${finalSlug}`);
    }

    // Buscar o crear categoría
    let categories = await blogService.getCategories();
    let category = categories.find((c: any) => c.name === aiArticle.category);
    
    if (!category) {
      category = await blogService.createCategory({
        name: aiArticle.category,
        slug: generateSlug(aiArticle.category),
        description: `Artículos sobre ${aiArticle.category.toLowerCase()}`,
        color: '#5ebbff',
      });
    }

    // Crear post PUBLICADO inmediatamente
    const post = await blogService.createPost({
      title: aiArticle.title,
      slug: finalSlug,
      excerpt: aiArticle.excerpt,
      content: aiArticle.content,
      metaTitle: aiArticle.metaTitle,
      metaDescription: aiArticle.metaDescription,
      metaKeywords: aiArticle.metaKeywords,
      featuredImage: featuredImage || undefined, // ✅ IMAGEN GENERADA CON IA
      categoryId: category.id,
      tags: aiArticle.category.split(' '),
      status: 'PUBLISHED', // ✅ PUBLICADO INMEDIATAMENTE
      publishedAt: new Date(),
      authorId,
      aiGenerated: true,
      aiPrompt: `OpenAI GPT-4 manual generation with DALL-E 3 image`,
    });

    logger.info(`✅ AI article published: "${aiArticle.title}"`);
    return post;
  } catch (error: any) {
    logger.error(`❌ Error in generateArticleNow: ${error.message}`);
    logger.error(error.stack);
    throw error; // Re-throw para que el controlador lo capture
  }
}
