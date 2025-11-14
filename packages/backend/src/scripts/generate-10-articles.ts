import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { generateMultipleArticles } from '../services/openai.service';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

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

async function main() {
  try {
    logger.info('🤖 Iniciando generación de 10 artículos con IA...');
    logger.info('⏳ Esto tomará aproximadamente 5-10 minutos...');

    // Buscar admin user
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!adminUser) {
      throw new Error('No se encontró usuario admin');
    }

    // Generar 10 artículos con IA
    const articles = await generateMultipleArticles(10);

    logger.info(`\n✅ Generados ${articles.length} artículos con IA`);
    logger.info('📝 Creando posts en la base de datos...\n');

    let created = 0;
    for (const article of articles) {
      try {
        const slug = generateSlug(article.title);

        // Verificar si ya existe
        const existing = await prisma.blogPost.findUnique({ where: { slug } });
        if (existing) {
          logger.warn(`⚠️  Artículo ya existe: ${article.title}`);
          continue;
        }

        // Buscar o crear categoría
        let category = await prisma.blogCategory.findUnique({
          where: { name: article.category },
        });

        if (!category) {
          category = await prisma.blogCategory.create({
            data: {
              name: article.category,
              slug: generateSlug(article.category),
              description: `Artículos sobre ${article.category.toLowerCase()}`,
              color: '#5ebbff',
            },
          });
        }

        // Crear post con diferentes estados
        const post = await prisma.blogPost.create({
          data: {
            title: article.title,
            slug,
            excerpt: article.excerpt,
            content: article.content,
            metaTitle: article.metaTitle,
            metaDescription: article.metaDescription,
            metaKeywords: article.metaKeywords,
            categoryId: category.id,
            status: created < 5 ? 'PUBLISHED' : created < 8 ? 'SCHEDULED' : 'DRAFT',
            publishedAt: created < 5 ? new Date() : undefined,
            scheduledFor: created >= 5 && created < 8 
              ? new Date(Date.now() + (created - 4) * 24 * 60 * 60 * 1000) 
              : undefined,
            authorId: adminUser.id,
            aiGenerated: true,
            aiPrompt: `OpenAI GPT-4 generated article`,
          },
        });

        created++;
        logger.info(`✅ ${created}/10: "${post.title}" (${post.status})`);
      } catch (error: any) {
        logger.error(`❌ Error creando artículo "${article.title}": ${error.message}`);
      }
    }

    logger.info(`\n🎉 ¡Completado! ${created} artículos creados con IA`);
    logger.info(`   - Publicados: ${created >= 5 ? 5 : created}`);
    logger.info(`   - Programados: ${created > 5 ? (created >= 8 ? 3 : created - 5) : 0}`);
    logger.info(`   - Borradores: ${created > 8 ? created - 8 : 0}`);

  } catch (error: any) {
    logger.error(`❌ Error: ${error.message}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
