import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...\n');

  // ✅ VERIFICACIÓN DE SEGURIDAD: No borrar datos existentes
  console.log('🔍 Verificando si hay datos existentes...');
  const existingProducts = await prisma.product.count();
  const existingUsers = await prisma.user.count();
  const existingCategories = await prisma.category.count();

  if (existingProducts > 0 || existingUsers > 0 || existingCategories > 0) {
    console.log('\n⚠️  ¡ADVERTENCIA! La base de datos ya contiene datos:\n');
    console.log(`   📦 Productos: ${existingProducts}`);
    console.log(`   👥 Usuarios: ${existingUsers}`);
    console.log(`   📁 Categorías: ${existingCategories}`);
    console.log('\n❌ Abortando seed para proteger tus datos.\n');
    console.log('💡 OPCIONES:\n');
    console.log('   1. Si quieres RESETEAR la BD completamente:');
    console.log('      npm run db:reset\n');
    console.log('   2. Si quieres FORZAR el seed (CUIDADO - borra todo):');
    console.log('      FORCE_SEED=true npm run db:seed\n');
    console.log('   3. Si quieres MANTENER los datos actuales:');
    console.log('      Simplemente cancela este proceso.\n');
    process.exit(0);
  }

  console.log('✅ Base de datos vacía. Procediendo con seed...\n');

  // 1. Limpiar datos existentes (ahora es seguro porque verificamos)
  console.log('🗑️  Limpiando datos existentes...');
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
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
  console.log('✅ Admin creado: admin@resona.com / Admin123!\n');

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
  console.log('✅ Cliente creado: cliente@test.com / User123!\n');

  // 4. Crear categorías
  console.log('📁 Creando categorías...');
  
  const categoriaFotografia = await prisma.category.create({
    data: {
      name: 'Fotografía y Video',
      slug: 'fotografia-video',
      description: 'Equipos profesionales de fotografía y video para bodas',
      isActive: true,
    },
  });

  const categoriaIluminacion = await prisma.category.create({
    data: {
      name: 'Iluminación',
      slug: 'iluminacion',
      description: 'Equipos de iluminación profesional para eventos',
      isActive: true,
    },
  });

  const categoriaSonido = await prisma.category.create({
    data: {
      name: 'Sonido',
      slug: 'sonido',
      description: 'Sistemas de sonido profesional',
      isActive: true,
    },
  });

  const categoriaDecoracion = await prisma.category.create({
    data: {
      name: 'Decoración',
      slug: 'decoracion',
      description: 'Elementos decorativos para bodas y eventos',
      isActive: true,
    },
  });

  const categoriaMobiliario = await prisma.category.create({
    data: {
      name: 'Mobiliario',
      slug: 'mobiliario',
      description: 'Mesas, sillas y mobiliario para eventos',
      isActive: true,
    },
  });

  console.log('✅ 5 categorías creadas\n');

  // 5. Crear productos
  console.log('📦 Creando productos de prueba...');

  const productos = [
    // FOTOGRAFÍA Y VIDEO
    {
      categoryId: categoriaFotografia.id,
      sku: 'CAM-SONY-A7III',
      name: 'Cámara Sony A7 III',
      slug: 'camara-sony-a7iii',
      description: 'Cámara mirrorless full-frame perfecta para fotografía de bodas. 24.2MP, sensor BSI CMOS, grabación 4K. La Sony A7 III es la cámara ideal para fotografía de bodas profesional. Con su sensor full-frame de 24.2MP y capacidades de video 4K, capturarás cada momento especial con calidad excepcional.',
      pricePerDay: 85,
      pricePerWeekend: 150,
      pricePerWeek: 400,
      stock: 5,
      realStock: 5,
      customDeposit: 500,
      weight: 1.2,
      isActive: true,
      featured: true,
      tags: ['cámara', 'sony', 'fotografía', 'video'],
    },
    {
      categoryId: categoriaFotografia.id,
      sku: 'LENS-50MM',
      name: 'Objetivo Canon 50mm f/1.2',
      slug: 'objetivo-canon-50mm',
      description: 'Objetivo profesional de focal fija 50mm con apertura f/1.2 para retratos espectaculares. El objetivo perfecto para retratos de boda. La apertura f/1.2 proporciona un bokeh cremoso y hermoso, ideal para destacar a los novios.',
      pricePerDay: 45,
      pricePerWeekend: 80,
      pricePerWeek: 200,
      stock: 8,
      realStock: 8,
      customDeposit: 300,
      weight: 0.6,
      isActive: true,
      featured: true,
      tags: ['objetivo', 'canon', 'retrato'],
    },
    {
      categoryId: categoriaFotografia.id,
      sku: 'DRONE-DJI',
      name: 'Drone DJI Mavic 3 Pro',
      slug: 'drone-dji-mavic-3-pro',
      description: 'Drone profesional para tomas aéreas espectaculares de bodas y eventos. Captura vistas aéreas impresionantes de la ceremonia y el lugar de celebración. El DJI Mavic 3 Pro ofrece video 4K y es perfecto para crear recuerdos únicos.',
      pricePerDay: 120,
      pricePerWeekend: 200,
      pricePerWeek: 550,
      stock: 3,
      realStock: 3,
      customDeposit: 800,
      weight: 0.9,
      isActive: true,
      featured: true,
      tags: ['drone', 'aéreo', 'video'],
    },

    // ILUMINACIÓN
    {
      categoryId: categoriaIluminacion.id,
      sku: 'LED-PANEL-1000',
      name: 'Panel LED 1000W Profesional',
      slug: 'panel-led-1000w',
      description: 'Panel LED de alta potencia para iluminación de eventos y fotografía. Panel LED profesional con 1000W de potencia, control de temperatura de color y dimmer integrado. Perfecto para iluminar espacios amplios.',
      pricePerDay: 35,
      pricePerWeekend: 60,
      pricePerWeek: 150,
      stock: 10,
      realStock: 10,
      customDeposit: 200,
      weight: 3.5,
      isActive: true,
      featured: false,
      tags: ['led', 'iluminación', 'panel'],
    },
    {
      categoryId: categoriaIluminacion.id,
      sku: 'FLASH-GODOX',
      name: 'Flash Godox AD600 Pro',
      slug: 'flash-godox-ad600',
      description: 'Flash de estudio portátil de 600W ideal para fotografía de bodas. Flash profesional con batería incorporada, perfecto para sesiones en exteriores. TTL, HSS y reciclaje rápido.',
      pricePerDay: 40,
      pricePerWeekend: 70,
      pricePerWeek: 180,
      stock: 6,
      realStock: 6,
      customDeposit: 250,
      weight: 2.8,
      isActive: true,
      featured: false,
      tags: ['flash', 'godox', 'portátil'],
    },
    {
      categoryId: categoriaIluminacion.id,
      sku: 'SPOT-RGB',
      name: 'Foco RGB LED Inteligente',
      slug: 'foco-rgb-led',
      description: 'Foco LED RGB con 16 millones de colores para crear ambientes únicos. Crea la atmósfera perfecta para tu boda con estos focos RGB controlables vía DMX o app móvil. Incluye efectos predefinidos.',
      pricePerDay: 25,
      pricePerWeekend: 45,
      pricePerWeek: 110,
      stock: 15,
      realStock: 15,
      customDeposit: 150,
      weight: 2.0,
      isActive: true,
      featured: true,
      tags: ['rgb', 'led', 'ambiente'],
    },

    // SONIDO
    {
      categoryId: categoriaSonido.id,
      sku: 'SPEAKER-JBL-PRX',
      name: 'Altavoz JBL PRX815W',
      slug: 'altavoz-jbl-prx815w',
      description: 'Altavoz profesional activo de 15" con 1500W de potencia. Sistema de sonido profesional perfecto para ceremonias y recepciones. Calidad de audio excepcional con WiFi integrado para control remoto.',
      pricePerDay: 60,
      pricePerWeekend: 100,
      pricePerWeek: 250,
      stock: 8,
      realStock: 8,
      customDeposit: 400,
      weight: 23,
      isActive: true,
      featured: true,
      tags: ['altavoz', 'jbl', 'activo'],
    },
    {
      categoryId: categoriaSonido.id,
      sku: 'MIC-SHURE-SM58',
      name: 'Micrófono Shure SM58',
      slug: 'microfono-shure-sm58',
      description: 'Micrófono vocal profesional, el estándar de la industria. El micrófono más utilizado en el mundo para voces. Perfecto para discursos, celebrantes y animadores.',
      pricePerDay: 15,
      pricePerWeekend: 25,
      pricePerWeek: 60,
      stock: 20,
      realStock: 20,
      customDeposit: 100,
      weight: 0.3,
      isActive: true,
      featured: false,
      tags: ['micrófono', 'shure', 'vocal'],
    },
    {
      categoryId: categoriaSonido.id,
      sku: 'MIXER-YAMAHA',
      name: 'Mesa de Mezclas Yamaha MG16XU',
      slug: 'mesa-mezclas-yamaha',
      description: 'Mesa de mezclas de 16 canales con efectos integrados. Mesa de mezclas profesional con 16 canales, efectos digitales, compresor y ecualizador. Incluye interfaz USB.',
      pricePerDay: 50,
      pricePerWeekend: 85,
      pricePerWeek: 210,
      stock: 4,
      realStock: 4,
      customDeposit: 300,
      weight: 8.5,
      isActive: true,
      featured: false,
      tags: ['mixer', 'yamaha', 'audio'],
    },

    // DECORACIÓN
    {
      categoryId: categoriaDecoracion.id,
      sku: 'ARCO-FLORES',
      name: 'Arco Ceremonial con Flores',
      slug: 'arco-ceremonial-flores',
      description: 'Arco decorativo de metal con flores artificiales premium. Hermoso arco ceremonial de 2.5m de altura, decorado con flores artificiales de alta calidad en tonos blancos y verdes.',
      pricePerDay: 80,
      pricePerWeekend: 140,
      pricePerWeek: 350,
      stock: 3,
      realStock: 3,
      customDeposit: 200,
      weight: 15,
      isActive: true,
      featured: true,
      tags: ['arco', 'flores', 'ceremonia'],
    },
    {
      categoryId: categoriaDecoracion.id,
      sku: 'LETTERS-LOVE',
      name: 'Letras Luminosas LOVE',
      slug: 'letras-luminosas-love',
      description: 'Letras gigantes iluminadas LOVE de 1.2m de altura. Letras luminosas de metacrilato con luces LED cálidas. Perfectas para photocall y decoración de la recepción.',
      pricePerDay: 70,
      pricePerWeekend: 120,
      pricePerWeek: 300,
      stock: 2,
      realStock: 2,
      customDeposit: 250,
      weight: 25,
      isActive: true,
      featured: true,
      tags: ['letras', 'luminosas', 'decoración'],
    },
    {
      categoryId: categoriaDecoracion.id,
      sku: 'BACKDROP-WHITE',
      name: 'Fondo Photocall Blanco 3x2m',
      slug: 'fondo-photocall-blanco',
      description: 'Fondo de tela blanca con estructura para photocall. Sistema completo de photocall con estructura de aluminio y fondo de tela blanca sin arrugas. Montaje rápido.',
      pricePerDay: 45,
      pricePerWeekend: 75,
      pricePerWeek: 180,
      stock: 5,
      realStock: 5,
      customDeposit: 150,
      weight: 12,
      isActive: true,
      featured: false,
      tags: ['photocall', 'fondo', 'blanco'],
    },

    // MOBILIARIO
    {
      categoryId: categoriaMobiliario.id,
      sku: 'SILLA-CHIAVARI-GOLD',
      name: 'Silla Chiavari Dorada (Pack 10)',
      slug: 'silla-chiavari-dorada',
      description: 'Pack de 10 sillas Chiavari doradas elegantes para eventos. Las clásicas sillas Chiavari en acabado dorado. Ligeras, elegantes y cómodas. Incluye cojines blancos.',
      pricePerDay: 40,
      pricePerWeekend: 70,
      pricePerWeek: 170,
      stock: 20,
      realStock: 200,
      customDeposit: 100,
      weight: 35,
      isActive: true,
      featured: false,
      tags: ['silla', 'chiavari', 'dorada'],
    },
    {
      categoryId: categoriaMobiliario.id,
      sku: 'MESA-IMPERIAL',
      name: 'Mesa Imperial 3m x 1m',
      slug: 'mesa-imperial',
      description: 'Mesa imperial rectangular de madera para presidencia. Mesa imperial de madera noble de 3 metros. Perfecta para la mesa de los novios con capacidad para 8 personas.',
      pricePerDay: 55,
      pricePerWeekend: 95,
      pricePerWeek: 230,
      stock: 6,
      realStock: 6,
      customDeposit: 200,
      weight: 45,
      isActive: true,
      featured: false,
      tags: ['mesa', 'imperial', 'presidencia'],
    },
    {
      categoryId: categoriaMobiliario.id,
      sku: 'MESA-COCKTAIL',
      name: 'Mesa Cocktail Alta (Pack 5)',
      slug: 'mesa-cocktail-alta',
      description: 'Pack de 5 mesas altas tipo cocktail con funda blanca. Mesas altas de 110cm para cóctel o aperitivo. Incluyen fundas blancas stretch. Diámetro 80cm.',
      pricePerDay: 30,
      pricePerWeekend: 50,
      pricePerWeek: 120,
      stock: 10,
      realStock: 50,
      customDeposit: 80,
      weight: 40,
      isActive: true,
      featured: false,
      tags: ['mesa', 'cocktail', 'alta'],
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

  console.log('✅ Seed completado exitosamente!\n');
  console.log('==========================================');
  console.log('📧 CREDENCIALES DE ACCESO:');
  console.log('==========================================');
  console.log('');
  console.log('👑 ADMINISTRADOR:');
  console.log('   Email:    admin@resona.com');
  console.log('   Password: Admin123!');
  console.log('');
  console.log('👤 CLIENTE:');
  console.log('   Email:    cliente@test.com');
  console.log('   Password: User123!');
  console.log('');
  console.log('==========================================');
  console.log('📊 DATOS CREADOS:');
  console.log('==========================================');
  console.log(`   • 2 usuarios`);
  console.log(`   • 5 categorías`);
  console.log(`   • ${productos.length} productos`);
  console.log(`   • 5 reviews`);
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
