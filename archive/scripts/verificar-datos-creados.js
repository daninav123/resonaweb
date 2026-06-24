const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  console.log('🔍 VERIFICACIÓN DETALLADA DE DATOS CREADOS\n');
  console.log('='.repeat(70) + '\n');

  try {
    // 1. USUARIOS
    console.log('👥 USUARIOS:\n');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`   Total: ${users.length}\n`);
    users.forEach((u, i) => {
      console.log(`   ${i + 1}. ${u.email}`);
      console.log(`      Nombre: ${u.firstName} ${u.lastName}`);
      console.log(`      Rol: ${u.role}`);
      console.log(`      Creado: ${u.createdAt.toLocaleString()}\n`);
    });

    // 2. PRODUCTOS
    console.log('='.repeat(70));
    console.log('\n📦 PRODUCTOS:\n');
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        pricePerDay: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log(`   Total: ${products.length} (mostrando últimos 10)\n`);
    products.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name}`);
      console.log(`      SKU: ${p.sku}`);
      console.log(`      Precio: ${p.pricePerDay}€/día`);
      console.log(`      Creado: ${p.createdAt.toLocaleString()}\n`);
    });

    // 3. BLOG POSTS
    console.log('='.repeat(70));
    console.log('\n📝 BLOG POSTS:\n');
    const posts = await prisma.blogPost.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        author: {
          select: {
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`   Total: ${posts.length}\n`);
    posts.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.title}`);
      console.log(`      Autor: ${p.author.email}`);
      console.log(`      Estado: ${p.status}`);
      console.log(`      Creado: ${p.createdAt.toLocaleString()}\n`);
    });

    // 4. FACTURAS
    console.log('='.repeat(70));
    console.log('\n🧾 FACTURAS:\n');
    const invoices = await prisma.invoice.findMany({
      select: {
        id: true,
        invoiceNumber: true,
        total: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`   Total: ${invoices.length}\n`);
    if (invoices.length > 0) {
      invoices.forEach((inv, i) => {
        console.log(`   ${i + 1}. Factura #${inv.invoiceNumber}`);
        console.log(`      Total: ${inv.total}€`);
        console.log(`      Estado: ${inv.status}`);
        console.log(`      Creada: ${inv.createdAt.toLocaleString()}\n`);
      });
    } else {
      console.log('   ⚠️  NO HAY FACTURAS\n');
    }

    // 5. REVIEWS
    console.log('='.repeat(70));
    console.log('\n⭐ REVIEWS:\n');
    const reviews = await prisma.review.findMany({
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: {
          select: {
            email: true,
          },
        },
        product: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`   Total: ${reviews.length}\n`);
    reviews.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.product.name} - ${r.rating}⭐`);
      console.log(`      Usuario: ${r.user.email}`);
      console.log(`      Comentario: ${r.comment?.substring(0, 50)}...`);
      console.log(`      Creada: ${r.createdAt.toLocaleString()}\n`);
    });

    // 6. PEDIDOS
    console.log('='.repeat(70));
    console.log('\n📋 PEDIDOS:\n');
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`   Total: ${orders.length}\n`);
    if (orders.length > 0) {
      orders.forEach((o, i) => {
        console.log(`   ${i + 1}. Pedido #${o.orderNumber}`);
        console.log(`      Total: ${o.total}€`);
        console.log(`      Estado: ${o.status}`);
        console.log(`      Creado: ${o.createdAt.toLocaleString()}\n`);
      });
    } else {
      console.log('   ⚠️  NO HAY PEDIDOS\n');
    }

    // RESUMEN
    console.log('='.repeat(70));
    console.log('\n📊 RESUMEN:\n');
    console.log(`   👥 Usuarios: ${users.length}`);
    console.log(`   📦 Productos: ${products.length}`);
    console.log(`   📝 Posts: ${posts.length}`);
    console.log(`   🧾 Facturas: ${invoices.length}`);
    console.log(`   ⭐ Reviews: ${reviews.length}`);
    console.log(`   📋 Pedidos: ${orders.length}`);

    console.log('\n' + '='.repeat(70) + '\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
