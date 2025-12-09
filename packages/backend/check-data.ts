import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('🔍 Verificando estado de la base de datos...\n');

    // Verificar usuarios
    const usersCount = await prisma.user.count();
    console.log(`👥 Usuarios: ${usersCount}`);
    
    const admin = await prisma.user.findFirst({
      where: { email: 'admin@resona.com' }
    });
    if (admin) {
      console.log(`   ✅ Admin existe: ${admin.email} (${admin.role})`);
    } else {
      console.log('   ❌ No se encontró admin');
    }

    // Verificar categorías
    const categoriesCount = await prisma.category.count();
    console.log(`\n📂 Categorías: ${categoriesCount}`);
    if (categoriesCount > 0) {
      const categories = await prisma.category.findMany({ take: 5 });
      categories.forEach(cat => {
        console.log(`   - ${cat.name} (${cat.isActive ? 'activa' : 'inactiva'})`);
      });
    } else {
      console.log('   ⚠️  No hay categorías creadas');
    }

    // Verificar productos
    const productsCount = await prisma.product.count();
    console.log(`\n📦 Productos: ${productsCount}`);
    if (productsCount > 0) {
      const products = await prisma.product.findMany({ take: 5 });
      products.forEach(prod => {
        console.log(`   - ${prod.name} (${prod.isActive ? 'activo' : 'inactivo'})`);
      });
    } else {
      console.log('   ⚠️  No hay productos creados');
    }

    // Verificar packs
    const packsCount = await prisma.pack.count();
    console.log(`\n🎁 Packs: ${packsCount}`);
    if (packsCount > 0) {
      const packs = await prisma.pack.findMany({ take: 5 });
      packs.forEach(pack => {
        console.log(`   - ${pack.name} (${pack.isActive ? 'activo' : 'inactivo'})`);
      });
    } else {
      console.log('   ⚠️  No hay packs creados');
    }

    console.log('\n📊 Resumen:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total de datos en BD:`);
    console.log(`  - Usuarios: ${usersCount}`);
    console.log(`  - Categorías: ${categoriesCount}`);
    console.log(`  - Productos: ${productsCount}`);
    console.log(`  - Packs: ${packsCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (categoriesCount === 0) {
      console.log('⚠️  ALERTA: La base de datos está vacía después del reset');
      console.log('📝 Necesitas crear:');
      console.log('   1. Categorías (Sonido, Iluminación, etc.)');
      console.log('   2. Productos');
      console.log('   3. Packs/Montajes');
      console.log('   4. Configuración de calculadora\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
