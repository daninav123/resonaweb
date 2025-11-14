const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkArticles() {
  try {
    const posts = await prisma.blogPost.findMany({
      include: {
        category: true,
        author: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log(`\n📊 Total artículos en BD: ${posts.length}\n`);
    
    posts.forEach((post, i) => {
      console.log(`${i + 1}. ${post.title}`);
      console.log(`   Estado: ${post.status} | IA: ${post.aiGenerated ? 'Sí' : 'No'} | Categoría: ${post.category?.name || 'Sin categoría'}`);
      console.log(`   Creado: ${post.createdAt.toLocaleString('es-ES')}\n`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkArticles();
