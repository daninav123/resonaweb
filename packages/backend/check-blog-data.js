require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('\n📊 VERIFICANDO DATOS DEL BLOG...\n');
    
    // Contar posts
    const totalPosts = await prisma.blogPost.count();
    const published = await prisma.blogPost.count({ where: { status: 'PUBLISHED' } });
    const scheduled = await prisma.blogPost.count({ where: { status: 'SCHEDULED' } });
    const drafts = await prisma.blogPost.count({ where: { status: 'DRAFT' } });
    
    console.log('POSTS:');
    console.log(`  Total: ${totalPosts}`);
    console.log(`  Publicados: ${published}`);
    console.log(`  Programados: ${scheduled}`);
    console.log(`  Borradores: ${drafts}\n`);
    
    // Contar categorías
    const categories = await prisma.blogCategory.count();
    console.log(`CATEGORÍAS: ${categories}\n`);
    
    // Listar últimos 5 posts
    const recentPosts = await prisma.blogPost.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
      },
    });
    
    console.log('ÚLTIMOS 5 POSTS:');
    recentPosts.forEach((post, i) => {
      console.log(`  ${i + 1}. [${post.status}] ${post.title}`);
      console.log(`     ID: ${post.id}`);
    });
    
    console.log('\n');
    
    // Verificar productos
    const totalProducts = await prisma.product.count();
    console.log(`PRODUCTOS: ${totalProducts}\n`);
    
  } catch (error) {
    console.error('ERROR:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
