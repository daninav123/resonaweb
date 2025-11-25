const { PrismaClient } = require('@prisma/client');
const he = require('he');

const prisma = new PrismaClient();

async function fixEncodedUrls() {
  console.log('\n🔧 ARREGLANDO URLs CODIFICADAS\n');
  
  try {
    // Buscar productos con URLs codificadas
    const products = await prisma.product.findMany({
      where: {
        mainImageUrl: {
          contains: '&#x'
        }
      },
      select: {
        id: true,
        name: true,
        mainImageUrl: true
      }
    });
    
    console.log(`📦 Encontrados ${products.length} productos con URLs codificadas\n`);
    
    let fixed = 0;
    
    for (const product of products) {
      // Decodificar las entidades HTML
      const decoded = he.decode(product.mainImageUrl);
      
      console.log(`🔄 ${product.name}`);
      console.log(`   ANTES: ${product.mainImageUrl}`);
      console.log(`   DESPUÉS: ${decoded}`);
      
      // Actualizar en la BD
      await prisma.product.update({
        where: { id: product.id },
        data: { mainImageUrl: decoded }
      });
      
      console.log(`   ✅ Actualizado\n`);
      fixed++;
    }
    
    console.log(`\n✅ ${fixed} productos arreglados`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixEncodedUrls();
