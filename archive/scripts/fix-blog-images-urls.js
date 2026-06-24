/**
 * Script para corregir URLs de localhost en imágenes de blog
 * Convierte: http://localhost:3001/uploads/... 
 * A: https://resonaevents.com/uploads/...
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixBlogImageUrls() {
  console.log('🔧 Iniciando corrección de URLs de imágenes...\n');

  try {
    // Obtener todos los posts
    const posts = await prisma.blogPost.findMany({
      select: {
        id: true,
        title: true,
        featuredImage: true,
      },
    });

    console.log(`📊 Total de posts encontrados: ${posts.length}\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const post of posts) {
      const { id, title, featuredImage } = post;

      // Verificar si la URL tiene localhost
      if (featuredImage && featuredImage.includes('localhost')) {
        const oldUrl = featuredImage;
        
        // Reemplazar localhost por el dominio de producción
        const newUrl = featuredImage.replace(
          /https?:\/\/localhost:\d+/,
          'https://resonaevents.com'
        );

        // Actualizar en la BD
        await prisma.blogPost.update({
          where: { id },
          data: { featuredImage: newUrl },
        });

        console.log(`✅ CORREGIDO: ${title}`);
        console.log(`   Antes: ${oldUrl}`);
        console.log(`   Ahora: ${newUrl}\n`);
        
        updatedCount++;
      } else {
        console.log(`⏭️  SKIP: ${title} (URL ya correcta o sin imagen)`);
        skippedCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN:');
    console.log(`   ✅ Posts corregidos: ${updatedCount}`);
    console.log(`   ⏭️  Posts omitidos: ${skippedCount}`);
    console.log(`   📝 Total procesados: ${posts.length}`);
    console.log('='.repeat(60) + '\n');

    if (updatedCount > 0) {
      console.log('🎉 ¡URLs corregidas exitosamente!');
      console.log('💡 Recarga la página en modo incógnito para ver los cambios.\n');
    } else {
      console.log('ℹ️  No había URLs de localhost para corregir.\n');
    }

  } catch (error) {
    console.error('❌ Error al corregir URLs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
fixBlogImageUrls()
  .then(() => {
    console.log('✅ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
