const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://resona_user:resona_password@localhost:5432/resona_db?schema=public'
    }
  }
});

async function checkAllData() {
  console.log('📊 VERIFICANDO TODOS LOS DATOS EN LA BASE DE DATOS\n');
  console.log('='.repeat(60));

  try {
    // Usuarios
    const users = await prisma.user.findMany({
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });
    console.log(`\n👥 USUARIOS: ${users.length} encontrados`);
    users.forEach(u => {
      console.log(`   - ${u.email} (${u.role}) - Creado: ${u.createdAt.toLocaleDateString()}`);
    });

    // Productos
    const products = await prisma.product.count();
    console.log(`\n📦 PRODUCTOS: ${products} encontrados`);

    // Blog posts
    const blogPosts = await prisma.blogPost?.count() || 0;
    console.log(`\n📝 BLOG POSTS: ${blogPosts} encontrados`);
    
    if (blogPosts > 0) {
      const posts = await prisma.blogPost.findMany({
        take: 10,
        select: {
          title: true,
          createdAt: true
        }
      });
      posts.forEach(p => {
        console.log(`   - ${p.title} - ${p.createdAt.toLocaleDateString()}`);
      });
    }

    // Categorías
    const categories = await prisma.category.findMany({
      select: {
        name: true,
        _count: {
          select: { products: true }
        }
      }
    });
    console.log(`\n📁 CATEGORÍAS: ${categories.length} encontradas`);
    categories.forEach(c => {
      console.log(`   - ${c.name}: ${c._count.products} productos`);
    });

    // Pedidos
    const orders = await prisma.order.count();
    console.log(`\n🛒 PEDIDOS: ${orders} encontrados`);

    // Reviews
    const reviews = await prisma.review.count();
    console.log(`\n⭐ REVIEWS: ${reviews} encontradas`);

    // Cupones
    const coupons = await prisma.coupon?.count() || 0;
    console.log(`\n🎫 CUPONES: ${coupons} encontrados`);

    // Notificaciones
    const notifications = await prisma.notification?.count() || 0;
    console.log(`\n🔔 NOTIFICACIONES: ${notifications} encontradas`);

    console.log('\n' + '='.repeat(60));
    console.log('\n📅 FECHAS DE CREACIÓN:');
    
    const oldestUser = await prisma.user.findFirst({
      orderBy: { createdAt: 'asc' },
      select: { email: true, createdAt: true }
    });
    
    const oldestProduct = await prisma.product.findFirst({
      orderBy: { createdAt: 'asc' },
      select: { name: true, createdAt: true }
    });

    if (oldestUser) {
      console.log(`   Usuario más antiguo: ${oldestUser.email} - ${oldestUser.createdAt.toLocaleString()}`);
    }
    if (oldestProduct) {
      console.log(`   Producto más antiguo: ${oldestProduct.name} - ${oldestProduct.createdAt.toLocaleString()}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllData();
