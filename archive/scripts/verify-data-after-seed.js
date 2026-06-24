const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  console.log('🔍 VERIFICANDO DATOS DESPUÉS DEL SEED SEGURO\n');
  console.log('='.repeat(70) + '\n');

  try {
    const productCount = await prisma.product.count();
    const userCount = await prisma.user.count();
    const categoryCount = await prisma.category.count();
    const postCount = await prisma.blogPost.count();
    const reviewCount = await prisma.review.count();

    console.log('📊 CONTEOS ACTUALES:\n');
    console.log(`   📦 Productos: ${productCount}`);
    console.log(`   👥 Usuarios: ${userCount}`);
    console.log(`   📁 Categorías: ${categoryCount}`);
    console.log(`   📝 Posts: ${postCount}`);
    console.log(`   ⭐ Reviews: ${reviewCount}`);

    // Buscar DAS 515
    const das515 = await prisma.product.findFirst({
      where: {
        sku: { contains: 'DAS-515' }
      }
    });

    console.log('\n🔎 BÚSQUEDA DE DATOS DE PRUEBA:\n');
    if (das515) {
      console.log(`   ✅ DAS 515 encontrado: ${das515.name}`);
      console.log(`      SKU: ${das515.sku}`);
      console.log(`      Precio: ${das515.pricePerDay}€/día`);
    } else {
      console.log('   ❌ DAS 515 NO encontrado');
    }

    // Buscar usuarios de prueba
    const testUser = await prisma.user.findFirst({
      where: {
        email: 'test.user@example.com'
      }
    });

    if (testUser) {
      console.log(`   ✅ Usuario de prueba encontrado: ${testUser.firstName} ${testUser.lastName}`);
    } else {
      console.log('   ❌ Usuario de prueba NO encontrado');
    }

    // Buscar posts
    const posts = await prisma.blogPost.findMany({
      where: {
        title: { contains: 'sonido' }
      }
    });

    if (posts.length > 0) {
      console.log(`   ✅ Posts encontrados: ${posts.length}`);
      posts.forEach(p => {
        console.log(`      - ${p.title}`);
      });
    } else {
      console.log('   ❌ Posts NO encontrados');
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ CONCLUSIÓN:\n');
    
    if (das515 && testUser && posts.length > 0) {
      console.log('   ✅ TODOS LOS DATOS DE PRUEBA SE MANTIENEN');
      console.log('   ✅ EL SEED SEGURO FUNCIONÓ CORRECTAMENTE');
      console.log('   ✅ LOS DATOS NO FUERON BORRADOS');
    } else {
      console.log('   ❌ ALGUNOS DATOS SE PERDIERON');
      console.log('   ❌ VERIFICAR QUÉ PASÓ');
    }

    console.log('\n' + '='.repeat(70) + '\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
