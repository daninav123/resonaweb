require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkImages() {
  try {
    console.log('\n📊 ESTADO DE IMÁGENES EN BLOG\n');

    const posts = await prisma.blogPost.findMany({
      select: {
        id: true,
        title: true,
        featuredImage: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const withImage = posts.filter(p => p.featuredImage);
    const withoutImage = posts.filter(p => !p.featuredImage);

    console.log('=== ARTÍCULOS ===\n');
    posts.forEach(p => {
      const status = p.featuredImage ? '✅' : '❌';
      const title = p.title.length > 60 ? p.title.substring(0, 57) + '...' : p.title;
      console.log(`${status} ${title}`);
    });

    console.log('\n=== RESUMEN ===\n');
    console.log(`Total artículos: ${posts.length}`);
    console.log(`✅ Con imagen: ${withImage.length}`);
    console.log(`❌ Sin imagen: ${withoutImage.length}\n`);

    if (withoutImage.length > 0) {
      console.log('Para generar imágenes ejecuta:');
      console.log('  node generar-3-imagenes-prueba.js (solo 3 para probar)');
      console.log('  node generate-images-existing-posts.js (todos)\n');
    }

  } catch (error) {
    console.error('❌ ERROR:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkImages();
