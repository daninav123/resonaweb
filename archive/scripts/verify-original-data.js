const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllData() {
  console.log('🔍 BUSCANDO DATOS ORIGINALES EN LA BASE DE DATOS\n');
  console.log('='.repeat(70) + '\n');

  try {
    await prisma.$connect();

    // Productos
    console.log('📦 PRODUCTOS:');
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'asc' }
    });
    
    console.log(`   Total: ${products.length}`);
    console.log(`\n   Productos por fecha de creación:`);
    products.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name}`);
      console.log(`      SKU: ${p.sku}`);
      console.log(`      Creado: ${p.createdAt.toLocaleString()}`);
      console.log(`      Actualizado: ${p.updatedAt.toLocaleString()}`);
    });

    // Categorías
    console.log('\n\n' + '='.repeat(70));
    console.log('📁 CATEGORÍAS:');
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        _count: {
          select: { products: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    
    console.log(`   Total: ${categories.length}\n`);
    categories.forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.name} (${c.slug})`);
      console.log(`      Productos: ${c._count.products}`);
      console.log(`      Creada: ${c.createdAt.toLocaleString()}`);
    });

    // Usuarios
    console.log('\n\n' + '='.repeat(70));
    console.log('👥 USUARIOS:');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });
    
    console.log(`   Total: ${users.length}\n`);
    users.forEach((u, i) => {
      console.log(`   ${i + 1}. ${u.email}`);
      console.log(`      Nombre: ${u.firstName} ${u.lastName}`);
      console.log(`      Rol: ${u.role}`);
      console.log(`      Creado: ${u.createdAt.toLocaleString()}`);
    });

    // Pedidos
    console.log('\n\n' + '='.repeat(70));
    console.log('📋 PEDIDOS:');
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`   Total: ${orders.length}`);
    if (orders.length > 0) {
      console.log('\n   Últimos pedidos:');
      orders.slice(0, 10).forEach((o, i) => {
        console.log(`   ${i + 1}. Pedido #${o.orderNumber}`);
        console.log(`      Usuario: ${o.user.email}`);
        console.log(`      Total: ${o.total}€`);
        console.log(`      Estado: ${o.status}`);
        console.log(`      Fecha: ${o.createdAt.toLocaleString()}`);
      });
    } else {
      console.log('   ⚠️  No hay pedidos en el sistema');
    }

    // Facturas
    console.log('\n\n' + '='.repeat(70));
    console.log('🧾 FACTURAS:');
    const invoices = await prisma.invoice.findMany({
      select: {
        id: true,
        invoiceNumber: true,
        total: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`   Total: ${invoices.length}`);
    if (invoices.length > 0) {
      console.log('\n   Últimas facturas:');
      invoices.slice(0, 10).forEach((inv, i) => {
        console.log(`   ${i + 1}. Factura #${inv.invoiceNumber}`);
        console.log(`      Total: ${inv.total}€`);
        console.log(`      Estado: ${inv.status}`);
        console.log(`      Fecha: ${inv.createdAt.toLocaleString()}`);
      });
    } else {
      console.log('   ⚠️  No hay facturas en el sistema');
    }

    // Blog posts
    console.log('\n\n' + '='.repeat(70));
    console.log('📝 BLOG POSTS:');
    const posts = await prisma.blogPost.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        author: {
          select: {
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`   Total: ${posts.length}`);
    if (posts.length > 0) {
      console.log('\n   Posts:');
      posts.slice(0, 10).forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.title}`);
        console.log(`      Autor: ${p.author.email}`);
        console.log(`      Estado: ${p.status}`);
        console.log(`      Fecha: ${p.createdAt.toLocaleString()}`);
      });
    } else {
      console.log('   ⚠️  No hay posts en el sistema');
    }

    // Reviews
    console.log('\n\n' + '='.repeat(70));
    console.log('⭐ REVIEWS:');
    const reviews = await prisma.review.findMany({
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: {
          select: {
            email: true
          }
        },
        product: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`   Total: ${reviews.length}`);
    if (reviews.length > 0) {
      console.log('\n   Reviews:');
      reviews.slice(0, 10).forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.product.name} - ${r.rating}⭐`);
        console.log(`      Usuario: ${r.user.email}`);
        console.log(`      Comentario: ${r.comment?.substring(0, 50)}...`);
        console.log(`      Fecha: ${r.createdAt.toLocaleString()}`);
      });
    } else {
      console.log('   ⚠️  No hay reviews en el sistema');
    }

    // ANÁLISIS
    console.log('\n\n' + '='.repeat(70));
    console.log('📊 ANÁLISIS DE DATOS:');
    console.log('='.repeat(70));
    
    const oldestProduct = products[0];
    const newestProduct = products[products.length - 1];
    
    console.log('\n🔍 PRODUCTOS:');
    console.log(`   Más antiguo: ${oldestProduct?.name} (${oldestProduct?.createdAt.toLocaleString()})`);
    console.log(`   Más reciente: ${newestProduct?.name} (${newestProduct?.createdAt.toLocaleString()})`);
    
    const oldestUser = users[0];
    console.log('\n👥 USUARIOS:');
    console.log(`   Primer usuario: ${oldestUser?.email} (${oldestUser?.createdAt.toLocaleString()})`);
    
    // Verificar si todos los productos son del seed
    const seedDate = new Date('2025-11-21T17:13:29.718Z');
    const productsFromSeed = products.filter(p => 
      Math.abs(p.createdAt - seedDate) < 10000 // 10 segundos de diferencia
    );
    
    console.log('\n⚠️  DETECCIÓN:');
    if (productsFromSeed.length === products.length) {
      console.log('   ❌ TODOS los productos parecen ser del seed automático (21 Nov 2025)');
      console.log('   ❌ NO se encontraron productos originales');
      console.log('   ⚠️  Los datos originales se PERDIERON al ejecutar el seed');
    } else {
      console.log(`   ✅ ${products.length - productsFromSeed.length} productos originales encontrados`);
      console.log(`   ⚠️  ${productsFromSeed.length} productos del seed`);
    }

  } catch (error) {
    console.log('❌ ERROR:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllData();
