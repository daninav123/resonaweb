import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...\n');

  // 1. Limpiar datos existentes
  console.log('🗑️  Limpiando datos existentes...');
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.blogPost.deleteMany(); // Eliminar posts del blog primero
  await prisma.user.deleteMany();
  console.log('✅ Datos limpiados\n');

  // 2. Crear usuario administrador
  console.log('👤 Creando usuario administrador...');
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.create({
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

  // 3. Crear usuario cliente de prueba
  console.log('👤 Creando usuario cliente...');
  const userPassword = await bcrypt.hash('User123!', 12);
  const user = await prisma.user.create({
    data: {
      email: 'cliente@test.com',
      password: userPassword,
      firstName: 'Cliente',
      lastName: 'Prueba',
      role: 'CLIENT',
      isActive: true,
      emailVerified: true,
      phone: '+34 600 111 222',
    },
  });
  console.log('✅ Cliente creado\n');

  // 4. Crear categorías
  console.log('📁 Creando categorías...');
  
  const categorias = await Promise.all([
    // Fotografía y Video
    prisma.category.create({
      data: {
        name: 'Fotografía y Video',
        slug: 'fotografia-video',
        description: 'Equipos profesionales de fotografía y video para eventos',
        isActive: true,
      },
    }),
    // Iluminación
    prisma.category.create({
      data: {
        name: 'Iluminación',
        slug: 'iluminacion',
        description: 'Equipos de iluminación profesional para eventos y espectáculos',
        isActive: true,
      },
    }),
    // Sonido General
    prisma.category.create({
      data: {
        name: 'Sonido',
        slug: 'sonido',
        description: 'Sistemas de sonido profesional: altavoces, amplificadores y más',
        isActive: true,
      },
    }),
    // Microfonía
    prisma.category.create({
      data: {
        name: 'Microfonía',
        slug: 'microfonia',
        description: 'Micrófonos inalámbricos, de mano, de solapa y diademas',
        isActive: true,
      },
    }),
    // Mesas de Mezcla para Directo
    prisma.category.create({
      data: {
        name: 'Mesas de Mezcla para Directo',
        slug: 'mesas-mezcla-directo',
        description: 'Mesas digitales y analógicas para eventos en vivo',
        isActive: true,
      },
    }),
    // Equipamiento DJ
    prisma.category.create({
      data: {
        name: 'Equipamiento DJ',
        slug: 'equipamiento-dj',
        description: 'Controladoras, CDJs, platos y todo para DJs profesionales',
        isActive: true,
      },
    }),
    // Elementos de Escenario
    prisma.category.create({
      data: {
        name: 'Elementos de Escenario',
        slug: 'elementos-escenario',
        description: 'Tarimas, estructuras, barras y accesorios para escenarios',
        isActive: true,
      },
    }),
    // Elementos Decorativos
    prisma.category.create({
      data: {
        name: 'Elementos Decorativos',
        slug: 'elementos-decorativos',
        description: 'Decoración para bodas, eventos corporativos y celebraciones',
        isActive: true,
      },
    }),
    // Mobiliario
    prisma.category.create({
      data: {
        name: 'Mobiliario',
        slug: 'mobiliario',
        description: 'Mesas, sillas y mobiliario para eventos',
        isActive: true,
      },
    }),
    // CATEGORÍAS EXTRAS SUGERIDAS:
    // Backline (instrumentos musicales)
    prisma.category.create({
      data: {
        name: 'Backline',
        slug: 'backline',
        description: 'Amplificadores, baterías, teclados y backline completo',
        isActive: true,
      },
    }),
    // Pantallas y Proyección
    prisma.category.create({
      data: {
        name: 'Pantallas y Proyección',
        slug: 'pantallas-proyeccion',
        description: 'Pantallas LED, proyectores y sistemas de video para eventos',
        isActive: true,
      },
    }),
    // Efectos Especiales
    prisma.category.create({
      data: {
        name: 'Efectos Especiales',
        slug: 'efectos-especiales',
        description: 'Máquinas de humo, confeti, CO2, fuegos artificiales fríos',
        isActive: true,
      },
    }),
    // Comunicaciones
    prisma.category.create({
      data: {
        name: 'Comunicaciones',
        slug: 'comunicaciones',
        description: 'Walkies, intercoms y sistemas de comunicación para eventos',
        isActive: true,
      },
    }),
    // Energía y Distribución
    prisma.category.create({
      data: {
        name: 'Energía y Distribución',
        slug: 'energia-distribucion',
        description: 'Generadores, cuadros eléctricos y distribución de potencia',
        isActive: true,
      },
    }),
    // Cables y Conectores
    prisma.category.create({
      data: {
        name: 'Cables y Conectores',
        slug: 'cables-conectores',
        description: 'Cables de audio, video, DMX, alimentación y conectores',
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ ${categorias.length} categorías creadas\n`);

  // 5. Crear productos
  console.log('📦 Creando productos de prueba...');

  const productos = [
    // FOTOGRAFÍA
    {
      categoryId: categorias[0].id,
      sku: 'CAM-SONY-A7III',
      name: 'Cámara Sony A7 III',
      slug: 'camara-sony-a7iii',
      description: 'Cámara mirrorless full-frame perfecta para fotografía de bodas. 24.2MP, sensor BSI CMOS, grabación 4K.',
      pricePerDay: 85,
      pricePerWeekend: 150,
      pricePerWeek: 400,
      stock: 5,
      realStock: 5,
      weight: 1.2,
      isActive: true,
      featured: true,
      mainImageUrl: 'https://picsum.photos/400/300?random=1',
    },
    {
      categoryId: categorias[0].id,
      sku: 'LENS-50MM',
      name: 'Objetivo Canon 50mm f/1.2',
      slug: 'objetivo-canon-50mm',
      description: 'Objetivo profesional de focal fija 50mm con apertura f/1.2 para retratos espectaculares.',
      pricePerDay: 45,
      pricePerWeekend: 80,
      pricePerWeek: 200,
      stock: 8,
      realStock: 8,
      weight: 0.6,
      isActive: true,
      featured: true,
    },
    {
      categoryId: categorias[0].id,
      sku: 'DRONE-DJI',
      name: 'Drone DJI Mavic 3 Pro',
      slug: 'drone-dji-mavic-3-pro',
      description: 'Drone profesional para tomas aéreas espectaculares de bodas y eventos.',
      pricePerDay: 120,
      pricePerWeekend: 200,
      pricePerWeek: 550,
      stock: 3,
      realStock: 3,
      weight: 0.9,
      isActive: true,
      featured: true,
    },
    // ILUMINACIÓN
    {
      categoryId: categorias[1].id,
      sku: 'LED-PANEL-1000',
      name: 'Panel LED 1000W Profesional',
      slug: 'panel-led-1000w',
      description: 'Panel LED de alta potencia para iluminación de eventos y fotografía.',
      pricePerDay: 35,
      pricePerWeekend: 60,
      pricePerWeek: 150,
      stock: 10,
      realStock: 10,
      weight: 3.5,
      isActive: true,
    },
    {
      categoryId: categorias[1].id,
      sku: 'FLASH-GODOX',
      name: 'Flash Godox AD600 Pro',
      slug: 'flash-godox-ad600',
      description: 'Flash de estudio portátil de 600W ideal para fotografía de bodas.',
      pricePerDay: 40,
      pricePerWeekend: 70,
      pricePerWeek: 180,
      stock: 6,
      realStock: 6,
      weight: 2.8,
      isActive: true,
    },
    {
      categoryId: categorias[1].id,
      sku: 'SPOT-RGB',
      name: 'Foco RGB LED Inteligente',
      slug: 'foco-rgb-led',
      description: 'Foco LED RGB con 16 millones de colores para crear ambientes únicos.',
      pricePerDay: 25,
      pricePerWeekend: 45,
      pricePerWeek: 110,
      stock: 15,
      realStock: 15,
      weight: 2.0,
      isActive: true,
      featured: true,
    },
    // SONIDO
    {
      categoryId: categorias[2].id,
      sku: 'SPEAKER-JBL-PRX',
      name: 'Altavoz JBL PRX815W',
      slug: 'altavoz-jbl-prx815w',
      description: 'Altavoz profesional activo de 15" con 1500W de potencia.',
      pricePerDay: 60,
      pricePerWeekend: 100,
      pricePerWeek: 250,
      stock: 8,
      realStock: 8,
      weight: 23,
      isActive: true,
      featured: true,
    },
    {
      categoryId: categorias[2].id,
      sku: 'MIC-SHURE-SM58',
      name: 'Micrófono Shure SM58',
      slug: 'microfono-shure-sm58',
      description: 'Micrófono vocal profesional, el estándar de la industria.',
      pricePerDay: 15,
      pricePerWeekend: 25,
      pricePerWeek: 60,
      stock: 20,
      realStock: 20,
      weight: 0.3,
      isActive: true,
    },
    {
      categoryId: categorias[2].id,
      sku: 'MIXER-YAMAHA',
      name: 'Mesa de Mezclas Yamaha MG16XU',
      slug: 'mesa-mezclas-yamaha',
      description: 'Mesa de mezclas de 16 canales con efectos integrados.',
      pricePerDay: 50,
      pricePerWeekend: 85,
      pricePerWeek: 210,
      stock: 4,
      realStock: 4,
      weight: 8.5,
      isActive: true,
    },
    // DECORACIÓN
    {
      categoryId: categorias[3].id,
      sku: 'ARCO-FLORES',
      name: 'Arco Ceremonial con Flores',
      slug: 'arco-ceremonial-flores',
      description: 'Hermoso arco ceremonial de 2.5m de altura, decorado con flores artificiales de alta calidad.',
      pricePerDay: 80,
      pricePerWeekend: 140,
      pricePerWeek: 350,
      stock: 3,
      realStock: 3,
      weight: 15,
      length: 250,
      width: 200,
      height: 50,
      isActive: true,
      featured: true,
    },
    {
      categoryId: categorias[3].id,
      sku: 'LETTERS-LOVE',
      name: 'Letras Luminosas LOVE',
      slug: 'letras-luminosas-love',
      description: 'Letras gigantes iluminadas LOVE de 1.2m de altura. Perfectas para photocall.',
      pricePerDay: 70,
      pricePerWeekend: 120,
      pricePerWeek: 300,
      stock: 2,
      realStock: 2,
      weight: 25,
      length: 400,
      width: 120,
      height: 20,
      isActive: true,
      featured: true,
    },
    {
      categoryId: categorias[3].id,
      sku: 'BACKDROP-WHITE',
      name: 'Fondo Photocall Blanco 3x2m',
      slug: 'fondo-photocall-blanco',
      description: 'Fondo de tela blanca con estructura para photocall. Sistema completo con estructura de aluminio.',
      pricePerDay: 45,
      pricePerWeekend: 75,
      pricePerWeek: 180,
      stock: 5,
      realStock: 5,
      weight: 12,
      length: 300,
      width: 200,
      isActive: true,
    },
    // MOBILIARIO
    {
      categoryId: categorias[4].id,
      sku: 'SILLA-CHIAVARI-GOLD',
      name: 'Silla Chiavari Dorada (Pack 10)',
      slug: 'silla-chiavari-dorada',
      description: 'Pack de 10 sillas Chiavari doradas elegantes. Incluye cojines blancos.',
      pricePerDay: 40,
      pricePerWeekend: 70,
      pricePerWeek: 170,
      stock: 20,
      realStock: 200,
      weight: 35,
      isActive: true,
    },
    {
      categoryId: categorias[4].id,
      sku: 'MESA-IMPERIAL',
      name: 'Mesa Imperial 3m x 1m',
      slug: 'mesa-imperial',
      description: 'Mesa imperial rectangular de madera para presidencia. Capacidad para 8 personas.',
      pricePerDay: 55,
      pricePerWeekend: 95,
      pricePerWeek: 230,
      stock: 6,
      realStock: 6,
      weight: 45,
      length: 300,
      width: 100,
      height: 75,
      isActive: true,
    },
    {
      categoryId: categorias[4].id,
      sku: 'MESA-COCKTAIL',
      name: 'Mesa Cocktail Alta (Pack 5)',
      slug: 'mesa-cocktail-alta',
      description: 'Pack de 5 mesas altas tipo cocktail con funda blanca. Diámetro 80cm, altura 110cm.',
      pricePerDay: 30,
      pricePerWeekend: 50,
      pricePerWeek: 120,
      stock: 10,
      realStock: 50,
      weight: 40,
      isActive: true,
    },
  ];

  for (const producto of productos) {
    await prisma.product.create({ data: producto });
  }

  console.log(`✅ ${productos.length} productos creados\n`);

  // 6. Crear algunas reviews
  console.log('⭐ Creando reviews...');
  const productosCreados = await prisma.product.findMany({ take: 5 });
  
  for (const producto of productosCreados) {
    await prisma.review.create({
      data: {
        productId: producto.id,
        userId: user.id,
        rating: 5,
        comment: '¡Excelente producto! Superó nuestras expectativas para nuestra boda.',
      },
    });
  }

  console.log('✅ Reviews creadas\n');

  console.log('\n✅ Seed completado exitosamente!\n');
  console.log('==========================================');
  console.log('📧 CREDENCIALES DE ACCESO:');
  console.log('==========================================');
  console.log('');
  console.log('👑 ADMINISTRADOR:');
  console.log('   Email:    admin@resona.com');
  console.log('   Password: Admin123!');
  console.log('   URL:      http://localhost:3000/login');
  console.log('');
  console.log('👤 CLIENTE:');
  console.log('   Email:    cliente@test.com');
  console.log('   Password: User123!');
  console.log('');
  console.log('==========================================');
  console.log('📊 DATOS CREADOS:');
  console.log('==========================================');
  console.log(`   • 2 usuarios`);
  console.log(`   • ${categorias.length} categorías`);
  console.log(`   • ${productos.length} productos`);
  console.log(`   • 5 reviews`);
  console.log('');
  console.log('🌐 URLs:');
  console.log('   Frontend: http://localhost:3000');
  console.log('   Backend:  http://localhost:3001');
  console.log('   Adminer:  http://localhost:8080');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
