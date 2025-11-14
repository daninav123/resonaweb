require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAllData() {
  try {
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║       DATOS EN LA BASE DE DATOS                ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    const [users, products, orders, blogPosts, categories] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.blogPost.count(),
      prisma.blogCategory.count(),
    ]);
    
    console.log('📊 CONTADORES:\n');
    console.log(`👥 Usuarios:       ${users}`);
    console.log(`📦 Productos:      ${products}`);
    console.log(`🛒 Pedidos:        ${orders}`);
    console.log(`📝 Blog Posts:     ${blogPosts}`);
    console.log(`🏷️  Categorías:     ${categories}\n`);

    // Detalles de usuarios
    if (users > 0) {
      const userList = await prisma.user.findMany({
        select: { email: true, role: true },
        take: 5,
      });
      console.log('👥 USUARIOS (primeros 5):');
      userList.forEach(u => console.log(`   - ${u.email} (${u.role})`));
      console.log('');
    }

    // Detalles de productos
    if (products > 0) {
      const productList = await prisma.product.findMany({
        select: { name: true, price: true },
        take: 5,
      });
      console.log('📦 PRODUCTOS (primeros 5):');
      productList.forEach(p => console.log(`   - ${p.name} (€${p.price})`));
      console.log('');
    }

    // Detalles de pedidos
    if (orders > 0) {
      const orderList = await prisma.order.findMany({
        select: { id: true, status: true, total: true },
        take: 5,
      });
      console.log('🛒 PEDIDOS (primeros 5):');
      orderList.forEach(o => console.log(`   - #${o.id.slice(0,8)} - ${o.status} - €${o.total}`));
      console.log('');
    }

    console.log('╔════════════════════════════════════════════════╗');
    console.log('║               RESUMEN                          ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    if (users === 0 && products === 0 && orders === 0) {
      console.log('⚠️  BASE DE DATOS VACÍA');
      console.log('   Necesitas crear datos de prueba o ejecutar seed\n');
    } else if (products === 0) {
      console.log('⚠️  NO HAY PRODUCTOS');
      console.log('   El panel de admin mostrará "0" en productos\n');
    } else if (orders === 0) {
      console.log('⚠️  NO HAY PEDIDOS');
      console.log('   El dashboard mostrará "0" en pedidos e ingresos\n');
    } else {
      console.log('✅ HAY DATOS DISPONIBLES');
      console.log('   El panel de admin debería mostrar información real\n');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllData();
