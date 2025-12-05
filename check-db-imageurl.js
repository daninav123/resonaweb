const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkImageUrls() {
  try {
    const packs = await prisma.pack.findMany({
      where: {
        imageUrl: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        imageUrl: true
      }
    });

    console.log('\n=== URLs DE IMÁGENES EN LA BASE DE DATOS ===\n');
    
    packs.forEach(pack => {
      console.log(`Pack: ${pack.name}`);
      console.log(`  imageUrl en BD: "${pack.imageUrl}"`);
      console.log(`  Tiene HTML entities: ${pack.imageUrl.includes('&#x') ? 'SÍ ❌' : 'NO ✅'}`);
      console.log('');
    });

    console.log(`\nTotal: ${packs.length} packs con imágenes`);
    
    // Verificar si necesitamos limpiar
    const needsCleaning = packs.some(p => p.imageUrl.includes('&#x'));
    if (needsCleaning) {
      console.log('\n⚠️  PROBLEMA: Las URLs están guardadas con HTML entities en la BD');
      console.log('💡 Solución: Necesitamos ejecutar un script para limpiar las URLs');
    } else {
      console.log('\n✅ Las URLs en la BD están correctas');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImageUrls();
