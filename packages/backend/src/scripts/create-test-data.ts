import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🧪 CREANDO DATOS DE PRUEBA\n');
  console.log('='.repeat(70) + '\n');

  try {
    // 1. OBTENER O CREAR CATEGORÍAS
    console.log('📁 1. Obteniendo categorías...');
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { slug: 'sonido-profesional-test' },
        update: {},
        create: {
          name: 'Sonido Profesional Test',
          slug: 'sonido-profesional-test',
          description: 'Equipos de sonido profesional',
          isActive: true,
        },
      }),
      prisma.category.upsert({
        where: { slug: 'iluminacion-led-test' },
        update: {},
        create: {
          name: 'Iluminación LED Test',
          slug: 'iluminacion-led-test',
          description: 'Sistemas de iluminación LED',
          isActive: true,
        },
      }),
      prisma.category.upsert({
        where: { slug: 'mobiliario-test' },
        update: {},
        create: {
          name: 'Mobiliario Test',
          slug: 'mobiliario-test',
          description: 'Mesas, sillas y mobiliario',
          isActive: true,
        },
      }),
    ]);
    console.log(`   ✅ ${categories.length} categorías obtenidas\n`);

    // 2. CREAR USUARIOS
    console.log('👥 2. Creando usuarios de prueba...');
    const users = await Promise.all([
      prisma.user.upsert({
        where: { email: 'test.user@example.com' },
        update: {},
        create: {
          email: 'test.user@example.com',
          password: await bcrypt.hash('TestUser123!', 12),
          firstName: 'Juan',
          lastName: 'García',
          role: 'CLIENT',
          isActive: true,
          emailVerified: true,
          phone: '+34 666 777 888',
        },
      }),
      prisma.user.upsert({
        where: { email: 'test.user2@example.com' },
        update: {},
        create: {
          email: 'test.user2@example.com',
          password: await bcrypt.hash('TestUser456!', 12),
          firstName: 'María',
          lastName: 'López',
          role: 'CLIENT',
          isActive: true,
          emailVerified: true,
          phone: '+34 666 777 999',
        },
      }),
    ]);
    console.log(`   ✅ ${users.length} usuarios obtenidos\n`);

    // 3. CREAR PRODUCTOS
    console.log('📦 3. Creando productos de prueba...');
    const timestamp = Date.now();
    const products = await Promise.all([
      prisma.product.create({
        data: {
          categoryId: categories[0].id,
          sku: `DAS-515-TEST-${timestamp}`,
          name: 'DAS 515 - Altavoz Profesional',
          slug: `das-515-altavoz-${timestamp}`,
          description: 'Altavoz profesional DAS 515 con 500W de potencia, ideal para eventos y conciertos.',
          pricePerDay: 250,
          pricePerWeekend: 400,
          pricePerWeek: 1000,
          stock: 5,
          realStock: 5,
          customDeposit: 800,
          weight: 25,
          dimensions: { value: '60x60x80 cm' },
          isActive: true,
          featured: true,
          tags: ['sonido', 'das', 'altavoz', 'profesional'],
        },
      }),
      prisma.product.create({
        data: {
          categoryId: categories[1].id,
          sku: `LED-PANEL-500-${timestamp}`,
          name: 'Panel LED RGB 500W',
          slug: `panel-led-rgb-500-${timestamp}`,
          description: 'Panel LED RGB profesional con 500W, control DMX, 16 millones de colores.',
          pricePerDay: 150,
          pricePerWeekend: 250,
          pricePerWeek: 600,
          stock: 8,
          realStock: 8,
          customDeposit: 500,
          weight: 15,
          dimensions: { value: '100x100x10 cm' },
          isActive: true,
          featured: true,
          tags: ['led', 'rgb', 'iluminacion', 'profesional'],
        },
      }),
      prisma.product.create({
        data: {
          categoryId: categories[2].id,
          sku: `MESA-IMPERIAL-TEST-${timestamp}`,
          name: 'Mesa Imperial 3m x 1m',
          slug: `mesa-imperial-3x1-${timestamp}`,
          description: 'Mesa imperial de 3 metros x 1 metro, ideal para banquetes y eventos.',
          pricePerDay: 80,
          pricePerWeekend: 120,
          pricePerWeek: 300,
          stock: 12,
          realStock: 12,
          customDeposit: 200,
          weight: 20,
          dimensions: { value: '300x100x75 cm' },
          isActive: true,
          featured: false,
          tags: ['mesa', 'mobiliario', 'banquete'],
        },
      }),
      prisma.product.create({
        data: {
          categoryId: categories[2].id,
          sku: `SILLA-CHIAVARI-GOLD-${timestamp}`,
          name: 'Silla Chiavari Dorada',
          slug: `silla-chiavari-dorada-${timestamp}`,
          description: 'Silla Chiavari de alta calidad, acabado dorado, perfecta para eventos elegantes.',
          pricePerDay: 5,
          pricePerWeekend: 8,
          pricePerWeek: 20,
          stock: 100,
          realStock: 100,
          customDeposit: 50,
          weight: 4,
          dimensions: { value: '45x45x90 cm' },
          isActive: true,
          featured: false,
          tags: ['silla', 'chiavari', 'dorada', 'mobiliario'],
        },
      }),
    ]);
    console.log(`   ✅ ${products.length} productos creados\n`);

    // 4. CREAR BLOG POSTS
    console.log('📝 4. Creando posts de blog...');
    const posts = await Promise.all([
      prisma.blogPost.create({
        data: {
          title: 'Cómo elegir el equipo de sonido perfecto para tu evento',
          slug: 'como-elegir-sonido-evento',
          content: 'En este artículo te explicamos cómo elegir el equipo de sonido adecuado...',
          excerpt: 'Guía completa para elegir sonido profesional',
          authorId: users[0].id,
          status: 'PUBLISHED',
          views: 0,
          publishedAt: new Date(),
        },
      }),
      prisma.blogPost.create({
        data: {
          title: 'Tendencias en iluminación LED para 2025',
          slug: 'tendencias-iluminacion-2025',
          content: 'Las últimas tendencias en iluminación LED para eventos...',
          excerpt: 'Descubre las nuevas tendencias en iluminación',
          authorId: users[1].id,
          status: 'PUBLISHED',
          views: 0,
          publishedAt: new Date(),
        },
      }),
    ]);
    console.log(`   ✅ ${posts.length} posts creados\n`);

    // 5. CREAR PEDIDOS (SIMPLIFICADO)
    console.log('📋 5. Creando pedidos de prueba...');
    const orders = [];
    console.log(`   ✅ 0 pedidos creados (simplificado para prueba)\n`);

    // 6. CREAR FACTURAS (SIMPLIFICADO)
    console.log('🧾 6. Creando facturas de prueba...');
    const invoices = [];
    console.log(`   ✅ 0 facturas creadas (simplificado para prueba)\n`);

    // 7. CREAR REVIEWS
    console.log('⭐ 7. Creando reviews de prueba...');
    const reviews = await Promise.all([
      prisma.review.create({
        data: {
          productId: products[0].id,
          userId: users[0].id,
          rating: 5,
          comment: 'Excelente altavoz, sonido cristalino y potente. Muy recomendado.',
        },
      }),
      prisma.review.create({
        data: {
          productId: products[1].id,
          userId: users[1].id,
          rating: 4,
          comment: 'Muy buena iluminación, fácil de usar. Solo le falta más control de colores.',
        },
      }),
    ]);
    console.log(`   ✅ ${reviews.length} reviews creados\n`);

    // RESUMEN
    console.log('='.repeat(70));
    console.log('✅ DATOS DE PRUEBA CREADOS EXITOSAMENTE\n');
    console.log('📊 RESUMEN:');
    console.log(`   📁 Categorías: ${categories.length}`);
    console.log(`   👥 Usuarios: ${users.length}`);
    console.log(`   📦 Productos: ${products.length}`);
    console.log(`   📝 Posts: ${posts.length}`);
    console.log(`   📋 Pedidos: ${orders.length}`);
    console.log(`   🧾 Facturas: ${invoices.length}`);
    console.log(`   ⭐ Reviews: ${reviews.length}`);
    console.log('\n💡 Próximos pasos:');
    console.log('   1. Hacer backup: npm run backup');
    console.log('   2. Probar seed: npm run db:seed');
    console.log('   3. Verificar que los datos se mantienen\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
