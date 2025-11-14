// Quick seed script usando CommonJS
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed rápido...\n');

  try {
    // 1. Limpiar datos
    console.log('🗑️  Limpiando...');
    await prisma.review.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Limpiado\n');

    // 2. Crear admin
    console.log('👤 Creando admin...');
    const adminPassword = await bcrypt.hash('Admin123!', 12);
    await prisma.user.create({
      data: {
        email: 'admin@resona.com',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'Resona',
        role: 'ADMIN',
        isActive: true,
        emailVerified: true,
        phone: '+34 600 000 000',
      },
    });
    console.log('✅ Admin creado\n');

    // 3. Crear categorías
    console.log('📁 Creando categorías...');
    const fotografia = await prisma.category.create({
      data: {
        name: 'Fotografía y Video',
        slug: 'fotografia-video',
        description: 'Equipos de fotografía y video',
        isActive: true,
      },
    });

    const iluminacion = await prisma.category.create({
      data: {
        name: 'Iluminación',
        slug: 'iluminacion',
        description: 'Equipos de iluminación',
        isActive: true,
      },
    });

    const sonido = await prisma.category.create({
      data: {
        name: 'Sonido',
        slug: 'sonido',
        description: 'Sistemas de sonido',
        isActive: true,
      },
    });
    console.log('✅ 3 categorías creadas\n');

    // 4. Crear productos
    console.log('📦 Creando productos...');
    await prisma.product.create({
      data: {
        categoryId: fotografia.id,
        sku: 'CAM-SONY-A7III',
        name: 'Cámara Sony A7 III',
        slug: 'camara-sony-a7iii',
        description: 'Cámara mirrorless full-frame 24.2MP',
        pricePerDay: 85,
        pricePerWeekend: 150,
        pricePerWeek: 400,
        stock: 5,
        realStock: 5,
        weight: 1.2,
        isActive: true,
        featured: true,
        mainImageUrl: 'https://via.placeholder.com/400x300?text=Sony+A7+III',
      },
    });

    await prisma.product.create({
      data: {
        categoryId: fotografia.id,
        sku: 'LENS-50MM',
        name: 'Objetivo Canon 50mm f/1.2',
        slug: 'objetivo-canon-50mm',
        description: 'Objetivo profesional 50mm f/1.2',
        pricePerDay: 45,
        pricePerWeekend: 80,
        pricePerWeek: 200,
        stock: 8,
        realStock: 8,
        weight: 0.6,
        isActive: true,
        featured: true,
      },
    });

    await prisma.product.create({
      data: {
        categoryId: iluminacion.id,
        sku: 'LED-PANEL-1000',
        name: 'Panel LED 1000W Profesional',
        slug: 'panel-led-1000w',
        description: 'Panel LED de alta potencia',
        pricePerDay: 35,
        pricePerWeekend: 60,
        pricePerWeek: 150,
        stock: 10,
        realStock: 10,
        weight: 3.5,
        isActive: true,
      },
    });

    await prisma.product.create({
      data: {
        categoryId: sonido.id,
        sku: 'SPEAKER-JBL',
        name: 'Altavoz JBL PRX815W',
        slug: 'altavoz-jbl-prx815w',
        description: 'Altavoz profesional de 1500W',
        pricePerDay: 60,
        pricePerWeekend: 100,
        pricePerWeek: 250,
        stock: 8,
        realStock: 8,
        weight: 23,
        isActive: true,
        featured: true,
      },
    });

    await prisma.product.create({
      data: {
        categoryId: sonido.id,
        sku: 'MIC-SHURE',
        name: 'Micrófono Shure SM58',
        slug: 'microfono-shure-sm58',
        description: 'Micrófono vocal profesional',
        pricePerDay: 15,
        pricePerWeekend: 25,
        pricePerWeek: 60,
        stock: 20,
        realStock: 20,
        weight: 0.3,
        isActive: true,
      },
    });

    console.log('✅ 5 productos creados\n');

    console.log('\n✅ SEED COMPLETADO!\n');
    console.log('==========================================');
    console.log('📧 CREDENCIALES:');
    console.log('   Email:    admin@resona.com');
    console.log('   Password: Admin123!');
    console.log('==========================================\n');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
