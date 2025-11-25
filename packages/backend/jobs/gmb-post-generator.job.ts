import cron from 'node-cron';
import { logger } from '../utils/logger';
import { generateBlogPost } from '../services/openai.service';
import fs from 'fs/promises';
import path from 'path';

/**
 * Generador automático de posts para Google My Business
 * 
 * Cada lunes a las 9:00 AM:
 * 1. Detecta el último artículo del blog generado
 * 2. Genera un post GMB resumiéndolo
 * 3. Guarda el post en un archivo para copiar/pegar
 */

interface GMBPost {
  date: string;
  blogArticleTitle: string;
  blogArticleUrl: string;
  postType: 'novedad' | 'oferta' | 'evento';
  text: string;
  cta: string;
  suggestedPhoto: string;
  instructions: string;
}

/**
 * Genera un post para Google My Business basado en un artículo del blog
 */
async function generateGMBPostFromBlog(blogTitle: string, blogSummary: string, blogUrl: string): Promise<GMBPost> {
  const postTemplates = {
    novedad: (title: string, summary: string) => `📖 NUEVA GUÍA: ${title}

${summary}

Lee la guía completa en nuestra web 👇
📞 Presupuesto gratuito: 613 88 14 14

#EventosValencia #AlquilerMaterial #ResonaEvents`,

    producto: (title: string, summary: string) => `🎤 DESTACADO: ${title}

${summary}

💰 Consulta precios en web
📦 Stock disponible
✨ Servicio técnico incluido

📞 Reserva: 613 88 14 14

#Alquiler #EventosProfesionales #Valencia`,

    consejo: (title: string, summary: string) => `💡 CONSEJO PRO: ${title}

${summary}

¿Necesitas ayuda con tu evento?
📞 Llámanos: 613 88 14 14
🌐 Más info en web

#TipsEventos #EventosValencia #ReSona`
  };

  // Determinar tipo de post según el título
  let postType: 'novedad' | 'oferta' | 'evento' = 'novedad';
  let template = postTemplates.novedad;

  if (blogTitle.toLowerCase().includes('cómo') || blogTitle.toLowerCase().includes('guía')) {
    template = postTemplates.consejo;
  } else if (blogTitle.toLowerCase().includes('altavoz') || blogTitle.toLowerCase().includes('equipo')) {
    template = postTemplates.producto;
  }

  // Generar resumen corto (máximo 150 caracteres)
  const shortSummary = blogSummary.substring(0, 150) + '...';

  // Extraer palabras clave del título
  const keywords = blogTitle.toLowerCase().split(' ').filter(word => word.length > 4);
  
  // Sugerencia de foto basada en keywords
  let suggestedPhoto = 'Foto genérica de evento';
  if (keywords.includes('altavoz') || keywords.includes('sonido')) {
    suggestedPhoto = 'Foto de altavoces en un evento real';
  } else if (keywords.includes('iluminación') || keywords.includes('luces')) {
    suggestedPhoto = 'Foto de iluminación profesional en acción';
  } else if (keywords.includes('boda')) {
    suggestedPhoto = 'Foto de equipo en una boda';
  } else if (keywords.includes('corporativo') || keywords.includes('empresa')) {
    suggestedPhoto = 'Foto de evento corporativo';
  }

  const post: GMBPost = {
    date: new Date().toISOString(),
    blogArticleTitle: blogTitle,
    blogArticleUrl: blogUrl,
    postType,
    text: template(blogTitle, shortSummary),
    cta: 'Más información',
    suggestedPhoto,
    instructions: `
📱 CÓMO PUBLICAR EN GOOGLE MY BUSINESS:

1. Ve a: https://business.google.com
2. Selecciona "ReSona Events"
3. Click en "Crear publicación" o "Posts"
4. Selecciona tipo: "Novedad"
5. Copia y pega el texto de arriba
6. Añade foto sugerida: ${suggestedPhoto}
7. Botón acción: "Más información" → ${blogUrl}
8. Click "Publicar"

⏱️ Tiempo: 1-2 minutos
📊 Duración del post: 7 días
    `
  };

  return post;
}

/**
 * Guarda el post GMB en un archivo markdown para fácil acceso
 */
async function saveGMBPost(post: GMBPost): Promise<string> {
  const fileName = `GMB_POST_${new Date().toISOString().split('T')[0]}.md`;
  const filePath = path.join(process.cwd(), '..', '..', fileName);

  const content = `# 📱 POST GOOGLE MY BUSINESS - ${new Date().toLocaleDateString('es-ES')}

## 🎯 Artículo relacionado:
**${post.blogArticleTitle}**  
URL: ${post.blogArticleUrl}

---

## 📝 TEXTO DEL POST (Copiar y pegar):

\`\`\`
${post.text}
\`\`\`

---

## 📸 FOTO SUGERIDA:
${post.suggestedPhoto}

---

## 🔘 BOTÓN DE ACCIÓN:
Tipo: ${post.cta}  
Link: ${post.blogArticleUrl}

---

${post.instructions}

---

## ✅ CHECKLIST:

- [ ] Copiar texto del post
- [ ] Buscar foto sugerida
- [ ] Ir a Google My Business
- [ ] Crear nueva publicación
- [ ] Pegar texto
- [ ] Subir foto
- [ ] Añadir botón "Más información"
- [ ] Publicar
- [ ] Verificar que aparece en el perfil

---

**Próximo post:** ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')}
`;

  await fs.writeFile(filePath, content, 'utf-8');
  logger.info(`✅ Post GMB guardado en: ${fileName}`);
  
  return filePath;
}

/**
 * Job principal que se ejecuta semanalmente
 */
export function setupGMBPostGenerator() {
  // Ejecutar cada lunes a las 9:30 AM (después de generar el blog)
  cron.schedule('30 9 * * 1', async () => {
    try {
      logger.info('🤖 Generando post para Google My Business...');

      // TODO: Obtener el último artículo del blog de la base de datos
      // Por ahora, usamos un ejemplo
      const latestBlogPost = {
        title: 'Guía Completa: Cómo elegir altavoces para tu boda en Valencia',
        summary: 'Descubre qué equipos de sonido necesitas para tu boda. Desde la ceremonia hasta la fiesta, te explicamos todo.',
        url: 'https://resonaevents.com/blog/altavoces-bodas-valencia',
      };

      // Generar el post GMB
      const gmbPost = await generateGMBPostFromBlog(
        latestBlogPost.title,
        latestBlogPost.summary,
        latestBlogPost.url
      );

      // Guardar en archivo
      const filePath = await saveGMBPost(gmbPost);

      logger.info(`✅ Post GMB generado: ${filePath}`);
      logger.info('📱 Revisa el archivo y cópialo a Google My Business');

    } catch (error) {
      logger.error('❌ Error generando post GMB:', error);
    }
  });

  logger.info('✅ Generador de posts GMB activado (cada lunes 9:30 AM)');
}
