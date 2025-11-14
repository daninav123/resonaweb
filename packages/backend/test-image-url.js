require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testImageUrls() {
  try {
    const posts = await prisma.blogPost.findMany({
      select: {
        title: true,
        featuredImage: true,
      },
      take: 3,
    });

    console.log('\n📸 URLs DE IMÁGENES:\n');
    posts.forEach(post => {
      console.log(`Título: ${post.title.substring(0, 50)}...`);
      console.log(`Imagen: ${post.featuredImage || 'SIN IMAGEN'}`);
      if (post.featuredImage) {
        console.log(`URL completa: http://localhost:3001${post.featuredImage}`);
      }
      console.log('---');
    });

  } catch (error) {
    console.error('❌ ERROR:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testImageUrls();
