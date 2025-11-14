import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { generateBlogArticle } from '../services/openai.service';

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
    console.log('\n🤖 === PRUEBA: Generando 2 artículos con IA ===\n');
    
    // Buscar admin user
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!adminUser) {
      throw new Error('❌ No se encontró usuario admin');
    }
    console.log('✅ Usuario admin encontrado:', adminUser.email);

    // Generar 2 artículos
    for (let i = 1; i <= 2; i++) {
      console.log(`\n📝 Generando artículo ${i}/2...`);
      
      const article = await generateBlogArticle();
      console.log(`✅ IA generó: "${article.title}"`);
      
      const slug = generateSlug(article.title);

      // Buscar o crear categoría
      let category = await prisma.blogCategory.findUnique({
        where: { name: article.category },
      });

      if (!category) {
        console.log(`📁 Creando categoría: ${article.category}`);
        category = await prisma.blogCategory.create({
          data: {
            name: article.category,
            slug: generateSlug(article.category),
            description: `Artículos sobre ${article.category.toLowerCase()}`,
            color: '#5ebbff',
          },
        });
      }

      // Crear post
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
          status: 'PUBLISHED',
          publishedAt: new Date(),
          authorId: adminUser.id,
          aiGenerated: true,
          aiPrompt: `OpenAI GPT-4 generated article`,
        },
      });

      console.log(`✅ ${i}/2: Artículo creado y PUBLICADO: "${post.title}"\n`);
      
      // Esperar 2 segundos antes del siguiente
      if (i < 2) {
        console.log('⏳ Esperando 2 segundos...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('\n🎉 ¡PRUEBA COMPLETADA! 2 artículos creados\n');

  } catch (error: any) {
    console.error(`\n❌ ERROR: ${error.message}\n`);
    if (error.response?.data) {
      console.error('Detalles:', error.response.data);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
