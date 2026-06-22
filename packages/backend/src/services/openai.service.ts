import OpenAI from 'openai';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { uploadImageToCloudinary as uploadToCloudinary } from './cloudinary.service';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  project: process.env.OPENAI_PROJECT_ID,
  organization: process.env.OPENAI_ORG_ID, // opcional
});

// Temas para artículos de blog
const articleTopics = [
  {
    category: 'Guías',
    topics: [
      'Cómo elegir el equipo de sonido perfecto para bodas',
      'Guía completa de iluminación profesional para eventos',
      'Cómo calcular el presupuesto de alquiler para tu evento',
      'Checklist esencial para organizar eventos con material alquilado',
      'Mejores prácticas para el montaje de equipos audiovisuales',
    ],
  },
  {
    category: 'Equipamiento',
    topics: [
      'Comparativa de micrófonos profesionales para eventos',
      'Altavoces vs Sistemas Line Array: cuál elegir',
      'Iluminación LED para eventos: ventajas y aplicaciones',
      'Cámaras profesionales: cuándo comprar vs alquilar',
      'Mesas de mezclas digitales vs analógicas',
    ],
  },
  {
    category: 'Tipos de Eventos',
    topics: [
      'Material audiovisual esencial para bodas perfectas',
      'Equipamiento profesional para conciertos al aire libre',
      'Sonido e iluminación para eventos corporativos',
      'Tecnología audiovisual para conferencias y seminarios',
      'Equipos para festivales: qué necesitas',
    ],
  },
  {
    category: 'Consejos',
    topics: [
      'Errores comunes al alquilar material para eventos y cómo evitarlos',
      'Cómo ahorrar en alquiler de equipos sin sacrificar calidad',
      'Cuándo reservar tu material: timing perfecto',
      'Mantenimiento básico del equipo alquilado',
      'Qué hacer si falla el equipo durante tu evento',
    ],
  },
  {
    category: 'Tendencias',
    topics: [
      'Últimas tendencias en tecnología audiovisual para eventos',
      'Innovaciones en iluminación LED para eventos 2025',
      'El futuro del sonido profesional en eventos',
      'Tecnología inmersiva: realidad virtual en eventos',
      'Sostenibilidad en eventos: equipos eco-friendly',
    ],
  },
];

export async function generateBlogArticle(recentTitles: string[] = []): Promise<{
  title: string;
  category: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}> {
  try {
    // Seleccionar tema evitando los ya usados recientemente (anti-contenido-duplicado)
    const used = recentTitles.map((t) => t.toLowerCase());
    const allTopics = articleTopics.flatMap((c) => c.topics.map((t) => ({ category: c.category, topic: t })));
    const available = allTopics.filter((t) => !used.some((u) => u.includes(t.topic.toLowerCase())));
    const pool = available.length > 0 ? available : allTopics;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    const categoryTemplate = { category: picked.category };
    const topic = picked.topic;

    logger.info(`🤖 Generando artículo con IA: ${topic}`);

    const prompt = `Eres un experto en alquiler de material audiovisual para eventos (sonido, iluminación, fotografía, video).

Escribe un artículo de blog profesional y SEO-optimizado sobre: "${topic}"

El artículo debe:
- Tener entre 1800-2200 palabras
- Estar en español de España
- Ser informativo y útil para organizadores de eventos
- Incluir consejos prácticos y profesionales
- Mencionar ejemplos específicos de equipos (micrófonos Shure, altavoces JBL, luces LED, etc.)
- Enfoque local SEO: menciona de forma natural Valencia y la Comunidad Valenciana (Resona Events opera en Valencia), sin forzar
- Incluir una sección de preguntas frecuentes (FAQ)
- Terminar con un call-to-action suave hacia Resona Events
- Usar formato Markdown con títulos H2 y H3

Estructura requerida:
# [Título principal]

## Introducción
[Explicar el problema y la importancia del tema]

## [Sección 1: Conceptos clave]
[Contenido relevante]

### [Subsección si es necesario]

## [Sección 2: Recomendaciones prácticas]
[Contenido con ejemplos específicos]

## [Sección 3: Factores a considerar]
[Consejos detallados]

## Preguntas Frecuentes

**¿Pregunta 1?**
Respuesta detallada

**¿Pregunta 2?**
Respuesta detallada

[Mínimo 4 preguntas]

## Conclusión
[Resumen y mención natural de Resona Events con enlace a /calculadora-evento y /productos]

---
*Última actualización: [Fecha actual]*

NO inventes información técnica falsa. Usa datos generales del sector.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto redactor de contenido sobre alquiler de material audiovisual para eventos. Escribes artículos profesionales, informativos y optimizados para SEO.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 4000,
    });

    const fullContent = completion.choices[0].message.content || '';

    // Extraer título del contenido (primera línea con #)
    const titleMatch = fullContent.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : topic;

    // Generar extracto
    const excerptPrompt = `Resume este artículo en máximo 160 caracteres para meta description:\n\n${fullContent.substring(0, 500)}`;
    
    const excerptCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: excerptPrompt }],
      temperature: 0.7,
      max_tokens: 100,
    });

    const excerpt = excerptCompletion.choices[0].message.content || '';

    // Generar keywords
    const keywordsPrompt = `Genera 5-8 keywords SEO relevantes (separadas por comas) para este artículo sobre: ${topic}. Enfocadas en alquiler de material para eventos en España.`;
    
    const keywordsCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: keywordsPrompt }],
      temperature: 0.7,
      max_tokens: 100,
    });

    const keywords = keywordsCompletion.choices[0].message.content || '';

    logger.info(`✅ Artículo generado: "${title}" (${fullContent.length} caracteres)`);

    return {
      title,
      category: categoryTemplate.category,
      excerpt: excerpt.replace(/["""]/g, '').trim().substring(0, 300),
      content: fullContent,
      metaTitle: title.length <= 60 ? title : title.substring(0, 57) + '...',
      metaDescription: excerpt.replace(/["""]/g, '').trim().substring(0, 155),
      metaKeywords: keywords.replace(/["""]/g, '').trim(),
    };
  } catch (error: any) {
    logger.error(`❌ Error generando artículo con IA: ${error.message}`);
    throw error;
  }
}

// Función para generar múltiples artículos (para seed inicial)
export async function generateMultipleArticles(count: number = 10) {
  const articles = [];
  
  for (let i = 0; i < count; i++) {
    try {
      logger.info(`📝 Generando artículo ${i + 1}/${count}...`);
      const article = await generateBlogArticle();
      articles.push(article);
      
      // Esperar 2 segundos entre llamadas para no saturar la API
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      logger.error(`Error generando artículo ${i + 1}: ${error}`);
    }
  }
  
  return articles;
}

// Función para generar imagen con gpt-image-1
export async function generateBlogImage(articleTitle: string, articleExcerpt: string): Promise<string | null> {
  try {
    logger.info(`🎨 Generando imagen con gpt-image-1 para: "${articleTitle}"`);

    // Crear prompt descriptivo basado en el título
    const imagePrompt = `Professional high-quality photograph for a blog article about: "${articleTitle}". 
The image should depict modern professional audio-visual equipment for events including: 
sound systems, speakers, microphones, LED lighting, mixing consoles, in an elegant event venue setting.
Style: Professional photography, bright natural lighting, ultra realistic, 8k quality, 
commercial photography aesthetic. No text or logos in the image.`;

    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: imagePrompt,
      n: 1,
      size: '1024x1024',
      quality: 'medium',
    });

    const img = response.data?.[0] as { url?: string; b64_json?: string } | undefined;
    const imageSource = img?.url ?? (img?.b64_json ? `data:image/png;base64,${img.b64_json}` : null);

    if (!imageSource) {
      logger.error('No se generó imagen');
      return null;
    }

    logger.info('✅ Imagen generada con gpt-image-1');

    // Subir a Cloudinary para uso en producción (funciona tanto en local como en producción)
    const cloudinaryUrl = await uploadImageToCloudinary(imageSource, articleTitle);
    
    return cloudinaryUrl;
  } catch (error: any) {
    logger.error(`❌ Error generando imagen: ${error.message}`);
    return null;
  }
}

// Función para subir imagen a Cloudinary
async function uploadImageToCloudinary(imageUrl: string, articleTitle: string): Promise<string> {
  try {
    // Generar nombre único para Cloudinary
    const timestamp = Date.now();
    const slug = articleTitle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    
    const publicId = `${slug}-${timestamp}`;
    
    // Subir a Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(imageUrl, 'blog', publicId);
    return cloudinaryUrl;
  } catch (error: any) {
    logger.error(`❌ Error subiendo imagen a Cloudinary: ${error.message}`);
    throw error;
  }
}

// Función para descargar y guardar imagen (legacy - solo para local)
async function downloadAndSaveImage(imageUrl: string, articleTitle: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Crear carpeta de imágenes si no existe
      const uploadsDir = path.join(__dirname, '../../public/uploads/blog');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generar nombre de archivo único
      const timestamp = Date.now();
      const slug = articleTitle
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
      
      const filename = `${slug}-${timestamp}.png`;
      const filepath = path.join(uploadsDir, filename);
      const publicPath = `/uploads/blog/${filename}`;

      // Descargar imagen
      const protocol = imageUrl.startsWith('https') ? https : http;
      
      const file = fs.createWriteStream(filepath);
      
      protocol.get(imageUrl, (response) => {
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          logger.info(`💾 Imagen guardada: ${publicPath}`);
          resolve(publicPath);
        });
      }).on('error', (err) => {
        fs.unlink(filepath, () => {});
        logger.error(`Error descargando imagen: ${err.message}`);
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}
