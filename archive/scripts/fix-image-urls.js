const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Decodificar HTML entities en una URL
 */
function decodeHTMLEntities(str) {
  if (!str) return str;
  
  return str
    .replace(/&#x2F;/g, '/')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&');
}

async function fixImageUrls() {
  try {
    console.log('🔧 Iniciando limpieza de URLs de imágenes...\n');

    // 1. Limpiar URLs de Packs
    const packs = await prisma.pack.findMany({
      where: {
        imageUrl: {
          not: null,
          contains: '&#x'
        }
      }
    });

    console.log(`📦 Encontrados ${packs.length} packs con URLs escapadas`);

    for (const pack of packs) {
      const cleanUrl = decodeHTMLEntities(pack.imageUrl);
      
      await prisma.pack.update({
        where: { id: pack.id },
        data: { imageUrl: cleanUrl }
      });
      
      console.log(`  ✅ ${pack.name}`);
      console.log(`     Antes: ${pack.imageUrl.substring(0, 50)}...`);
      console.log(`     Después: ${cleanUrl}`);
    }

    // 2. Limpiar URLs de Products (mainImageUrl)
    const products = await prisma.product.findMany({
      where: {
        mainImageUrl: {
          not: null,
          contains: '&#x'
        }
      }
    });

    console.log(`\n📦 Encontrados ${products.length} productos con URLs escapadas`);

    for (const product of products) {
      const cleanUrl = decodeHTMLEntities(product.mainImageUrl);
      
      await prisma.product.update({
        where: { id: product.id },
        data: { mainImageUrl: cleanUrl }
      });
      
      console.log(`  ✅ ${product.name}`);
      console.log(`     Antes: ${product.mainImageUrl.substring(0, 50)}...`);
      console.log(`     Después: ${cleanUrl}`);
    }

    console.log('\n✅ Limpieza completada con éxito');
    console.log('🔄 Ahora recarga la calculadora en el navegador');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixImageUrls();
