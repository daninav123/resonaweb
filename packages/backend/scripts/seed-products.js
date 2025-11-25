const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createProducts() {
  console.log('🎵 Creando catálogo real de ReSona Events...\n');
  
  // Categorías
  const sonido = await prisma.category.upsert({
    where: { slug: 'sonido' },
    update: {},
    create: { name: 'Sonido', slug: 'sonido', description: 'Altavoces y equipos de sonido profesional' }
  });
  
  const iluminacion = await prisma.category.upsert({
    where: { slug: 'iluminacion' },
    update: {},
    create: { name: 'Iluminación', slug: 'iluminacion', description: 'Cabezas móviles y efectos de iluminación' }
  });
  
  const estructuras = await prisma.category.upsert({
    where: { slug: 'estructuras' },
    update: {},
    create: { name: 'Estructuras', slug: 'estructuras', description: 'Truss y estructuras para eventos' }
  });
  
  const microfonia = await prisma.category.upsert({
    where: { slug: 'microfonia' },
    update: {},
    create: { name: 'Microfonía', slug: 'microfonia', description: 'Micrófonos y mezcladores' }
  });
  
  console.log('✅ Categorías creadas\n');
  console.log('🔊 Creando productos de SONIDO...');
  
  // SONIDO - DAS 515A
  await prisma.product.create({
    data: {
      name: 'Altavoz DAS 515A',
      slug: 'altavoz-das-515a',
      sku: 'SND-DAS-515A',
      description: 'Altavoz activo profesional DAS Audio 515A de 15". Ideal para eventos medianos y grandes. Sistema bi-amplificado con 1200W de potencia.',
      categoryId: sonido.id,
      pricePerDay: 65,
      pricePerWeekend: 110,
      pricePerWeek: 280,
      stock: 4,
      realStock: 4,
      featured: true,
      isActive: true,
      weight: 28,
      dimensions: '45x75x45'
    }
  });
  
  // ICOA 12A Blanco
  await prisma.product.create({
    data: {
      name: 'Altavoz ICOA 12A Blanco',
      slug: 'altavoz-icoa-12a-blanco',
      sku: 'SND-ICOA-12A-BL',
      description: 'Altavoz activo ICOA de 12" en color blanco. Perfecto para bodas y eventos elegantes. Compacto y potente.',
      categoryId: sonido.id,
      pricePerDay: 50,
      pricePerWeekend: 85,
      pricePerWeek: 230,
      stock: 6,
      realStock: 6,
      featured: true,
      isActive: true,
      weight: 15,
      dimensions: '35x50x35'
    }
  });
  
  // ICOA 15A Negro
  await prisma.product.create({
    data: {
      name: 'Altavoz ICOA 15A Negro',
      slug: 'altavoz-icoa-15a-negro',
      sku: 'SND-ICOA-15A-NG',
      description: 'Altavoz activo ICOA de 15" en color negro. Mayor potencia y graves profundos.',
      categoryId: sonido.id,
      pricePerDay: 60,
      pricePerWeekend: 100,
      pricePerWeek: 260,
      stock: 2,
      realStock: 2,
      isActive: true,
      weight: 20,
      dimensions: '40x60x40'
    }
  });
  
  // DAS 215A
  await prisma.product.create({
    data: {
      name: 'Altavoz DAS 215A',
      slug: 'altavoz-das-215a',
      sku: 'SND-DAS-215A',
      description: 'Altavoz profesional DAS Audio 215A de doble 15". Potencia masiva para conciertos y eventos grandes.',
      categoryId: sonido.id,
      pricePerDay: 80,
      pricePerWeekend: 140,
      pricePerWeek: 360,
      stock: 2,
      realStock: 2,
      featured: true,
      isActive: true,
      weight: 45,
      dimensions: '50x90x50'
    }
  });
  
  // Subwoofer 218A
  await prisma.product.create({
    data: {
      name: 'Subwoofer DAS 218A',
      slug: 'subwoofer-das-218a',
      sku: 'SND-DAS-218A',
      description: 'Subwoofer profesional DAS Audio 218A con doble 18". Graves potentes y profundos para cualquier evento.',
      categoryId: sonido.id,
      pricePerDay: 90,
      pricePerWeekend: 160,
      pricePerWeek: 400,
      stock: 1,
      realStock: 1,
      featured: true,
      isActive: true,
      weight: 60,
      dimensions: '60x70x70'
    }
  });
  
  // Altavoz 10"
  await prisma.product.create({
    data: {
      name: 'Altavoz 10 Pulgadas',
      slug: 'altavoz-10-pulgadas',
      sku: 'SND-ALT-10',
      description: 'Altavoz compacto de 10 pulgadas. Ideal para eventos pequeños, monitores o ambientación.',
      categoryId: sonido.id,
      pricePerDay: 35,
      pricePerWeekend: 60,
      pricePerWeek: 160,
      stock: 4,
      realStock: 4,
      isActive: true,
      weight: 10,
      dimensions: '30x40x30'
    }
  });
  
  console.log('✅ 6 productos de sonido creados');
  console.log('💡 Creando productos de ILUMINACIÓN...');
  
  // ILUMINACIÓN - Cabeza 3en1 17R
  await prisma.product.create({
    data: {
      name: 'Cabeza Móvil 3en1 17R',
      slug: 'cabeza-movil-3en1-17r',
      sku: 'ILU-CM-17R',
      description: 'Cabeza móvil profesional 3 en 1 con lámpara 17R (350W). Beam, Spot y Wash en un solo equipo. DMX 512.',
      categoryId: iluminacion.id,
      pricePerDay: 80,
      pricePerWeekend: 140,
      pricePerWeek: 380,
      stock: 6,
      realStock: 6,
      featured: true,
      isActive: true,
      weight: 22,
      dimensions: '35x55x40'
    }
  });
  
  // Beam 7R
  await prisma.product.create({
    data: {
      name: 'Cabeza Móvil Beam 7R',
      slug: 'cabeza-movil-beam-7r',
      sku: 'ILU-BEAM-7R',
      description: 'Cabeza móvil Beam con lámpara 7R (230W). Haz concentrado y potente, perfecto para efectos aéreos.',
      categoryId: iluminacion.id,
      pricePerDay: 65,
      pricePerWeekend: 110,
      pricePerWeek: 300,
      stock: 4,
      realStock: 4,
      featured: true,
      isActive: true,
      weight: 15,
      dimensions: '30x45x35'
    }
  });
  
  // Mini Beam
  await prisma.product.create({
    data: {
      name: 'Mini Beam LED',
      slug: 'mini-beam-led',
      sku: 'ILU-MINIBEAM',
      description: 'Mini cabeza móvil Beam LED. Compacta y ligera, ideal para decoración y efectos.',
      categoryId: iluminacion.id,
      pricePerDay: 40,
      pricePerWeekend: 70,
      pricePerWeek: 180,
      stock: 2,
      realStock: 2,
      isActive: true,
      weight: 5,
      dimensions: '20x30x20'
    }
  });
  
  // Mini Wash
  await prisma.product.create({
    data: {
      name: 'Mini Wash LED',
      slug: 'mini-wash-led',
      sku: 'ILU-MINIWASH',
      description: 'Mini cabeza móvil Wash LED RGBW. Perfecto para iluminación ambiental y decorativa.',
      categoryId: iluminacion.id,
      pricePerDay: 40,
      pricePerWeekend: 70,
      pricePerWeek: 180,
      stock: 2,
      realStock: 2,
      isActive: true,
      weight: 5,
      dimensions: '20x30x20'
    }
  });
  
  // Foco Spot
  await prisma.product.create({
    data: {
      name: 'Foco Spot Pequeño',
      slug: 'foco-spot-pequeno',
      sku: 'ILU-SPOT-SM',
      description: 'Foco Spot LED compacto. Ideal para iluminación cenital y decorativa.',
      categoryId: iluminacion.id,
      pricePerDay: 25,
      pricePerWeekend: 45,
      pricePerWeek: 120,
      stock: 3,
      realStock: 3,
      isActive: true,
      weight: 3,
      dimensions: '15x20x15'
    }
  });
  
  // Ventilador LED
  await prisma.product.create({
    data: {
      name: 'Ventilador LED',
      slug: 'ventilador-led',
      sku: 'ILU-FANLED',
      description: 'Ventilador con iluminación LED RGB. Efecto visual único para pistas de baile.',
      categoryId: iluminacion.id,
      pricePerDay: 30,
      pricePerWeekend: 50,
      pricePerWeek: 140,
      stock: 2,
      realStock: 2,
      isActive: true,
      weight: 4,
      dimensions: '25x30x25'
    }
  });
  
  // Flash RGB
  await prisma.product.create({
    data: {
      name: 'Flash RGB 1000W',
      slug: 'flash-rgb-1000w',
      sku: 'ILU-FLASH-1000',
      description: 'Flash estroboscópico RGB de 1000W. Efectos impactantes y sincronización perfecta.',
      categoryId: iluminacion.id,
      pricePerDay: 45,
      pricePerWeekend: 80,
      pricePerWeek: 200,
      stock: 4,
      realStock: 4,
      featured: true,
      isActive: true,
      weight: 6,
      dimensions: '30x25x15'
    }
  });
  
  // Foco RGB Deco
  await prisma.product.create({
    data: {
      name: 'Foco RGB Decoración',
      slug: 'foco-rgb-decoracion',
      sku: 'ILU-RGB-DECO',
      description: 'Foco LED RGB para decoración de espacios. Control DMX y modos automáticos.',
      categoryId: iluminacion.id,
      pricePerDay: 20,
      pricePerWeekend: 35,
      pricePerWeek: 90,
      stock: 8,
      realStock: 8,
      isActive: true,
      weight: 2,
      dimensions: '15x15x15'
    }
  });
  
  console.log('✅ 8 productos de iluminación creados');
  console.log('🏗️  Creando productos de ESTRUCTURAS...');
  
  // ESTRUCTURAS - Truss 1m
  await prisma.product.create({
    data: {
      name: 'Truss 1 Metro',
      slug: 'truss-1-metro',
      sku: 'EST-TRUSS-1M',
      description: 'Truss cuadrado de aluminio de 1 metro. Sistema compatible 290x290mm. Carga máxima 250kg.',
      categoryId: estructuras.id,
      pricePerDay: 15,
      pricePerWeekend: 25,
      pricePerWeek: 70,
      stock: 7,
      realStock: 7,
      isActive: true,
      weight: 8,
      dimensions: '100x29x29'
    }
  });
  
  // Truss 2m
  await prisma.product.create({
    data: {
      name: 'Truss 2 Metros',
      slug: 'truss-2-metros',
      sku: 'EST-TRUSS-2M',
      description: 'Truss cuadrado de aluminio de 2 metros. Sistema compatible 290x290mm. Carga máxima 250kg.',
      categoryId: estructuras.id,
      pricePerDay: 25,
      pricePerWeekend: 45,
      pricePerWeek: 120,
      stock: 6,
      realStock: 6,
      isActive: true,
      weight: 15,
      dimensions: '200x29x29'
    }
  });
  
  // Base Truss
  await prisma.product.create({
    data: {
      name: 'Base para Truss',
      slug: 'base-truss',
      sku: 'EST-BASE',
      description: 'Base cuadrada para truss con placa de acero. Incluye pernos de fijación.',
      categoryId: estructuras.id,
      pricePerDay: 12,
      pricePerWeekend: 20,
      pricePerWeek: 55,
      stock: 6,
      realStock: 6,
      isActive: true,
      weight: 20,
      dimensions: '50x50x10'
    }
  });
  
  // Top Truss
  await prisma.product.create({
    data: {
      name: 'Top para Truss',
      slug: 'top-truss',
      sku: 'EST-TOP',
      description: 'Pieza superior para estructuras de truss. Permite conexiones múltiples.',
      categoryId: estructuras.id,
      pricePerDay: 15,
      pricePerWeekend: 25,
      pricePerWeek: 70,
      stock: 2,
      realStock: 2,
      isActive: true,
      weight: 12,
      dimensions: '40x40x30'
    }
  });
  
  // Semicírculo
  await prisma.product.create({
    data: {
      name: 'Semicírculo Truss 4m',
      slug: 'semicirculo-truss-4m',
      sku: 'EST-SEMI-4M',
      description: 'Semicírculo de truss de 4 metros de diámetro. Ideal para portales y estructuras curvas.',
      categoryId: estructuras.id,
      pricePerDay: 70,
      pricePerWeekend: 120,
      pricePerWeek: 320,
      stock: 2,
      realStock: 2,
      featured: true,
      isActive: true,
      weight: 40,
      dimensions: '400x200x29'
    }
  });
  
  // Cubo
  await prisma.product.create({
    data: {
      name: 'Cubo Truss',
      slug: 'cubo-truss',
      sku: 'EST-CUBO',
      description: 'Cubo de truss para decoración y suspensión de equipos. Múltiples posibilidades.',
      categoryId: estructuras.id,
      pricePerDay: 50,
      pricePerWeekend: 85,
      pricePerWeek: 230,
      stock: 2,
      realStock: 2,
      isActive: true,
      weight: 35,
      dimensions: '100x100x100'
    }
  });
  
  // Mesa DJ
  await prisma.product.create({
    data: {
      name: 'Mesa DJ 2x1m',
      slug: 'mesa-dj-2x1',
      sku: 'EST-MESA-DJ',
      description: 'Mesa profesional para DJ de 2x1 metros. Estructura plegable de aluminio con tela negra.',
      categoryId: estructuras.id,
      pricePerDay: 40,
      pricePerWeekend: 70,
      pricePerWeek: 180,
      stock: 1,
      realStock: 1,
      isActive: true,
      weight: 25,
      dimensions: '200x100x90'
    }
  });
  
  // Pata
  await prisma.product.create({
    data: {
      name: 'Pata Truss 1 Metro',
      slug: 'pata-truss-1m',
      sku: 'EST-PATA-1M',
      description: 'Pata telescópica de 1 metro para elevar estructuras. Ajustable en altura.',
      categoryId: estructuras.id,
      pricePerDay: 10,
      pricePerWeekend: 18,
      pricePerWeek: 45,
      stock: 4,
      realStock: 4,
      isActive: true,
      weight: 5,
      dimensions: '100x10x10'
    }
  });
  
  // Cabina Palets
  await prisma.product.create({
    data: {
      name: 'Cabina DJ Palets',
      slug: 'cabina-dj-palets',
      sku: 'EST-CAB-PALET',
      description: 'Cabina DJ estilo industrial con palets de madera. Incluye iluminación LED integrada.',
      categoryId: estructuras.id,
      pricePerDay: 120,
      pricePerWeekend: 200,
      pricePerWeek: 500,
      stock: 1,
      realStock: 1,
      featured: true,
      isActive: true,
      weight: 150,
      dimensions: '250x150x120'
    }
  });
  
  // Cabina Jardín
  await prisma.product.create({
    data: {
      name: 'Cabina DJ Jardín',
      slug: 'cabina-dj-jardin',
      sku: 'EST-CAB-JARD',
      description: 'Cabina DJ estilo jardín. Diseño elegante para bodas y eventos al aire libre.',
      categoryId: estructuras.id,
      pricePerDay: 150,
      pricePerWeekend: 250,
      pricePerWeek: 600,
      stock: 1,
      realStock: 1,
      featured: true,
      isActive: true,
      weight: 180,
      dimensions: '300x180x150'
    }
  });
  
  // Letras
  await prisma.product.create({
    data: {
      name: 'Letras Luminosas',
      slug: 'letras-luminosas',
      sku: 'EST-LETRAS',
      description: 'Letras luminosas LED personalizables. Ideal para photocalls y decoración.',
      categoryId: estructuras.id,
      pricePerDay: 80,
      pricePerWeekend: 140,
      pricePerWeek: 360,
      stock: 1,
      realStock: 1,
      featured: true,
      isActive: true,
      weight: 30,
      dimensions: '150x150x30'
    }
  });
  
  console.log('✅ 11 productos de estructuras creados');
  console.log('🎤 Creando productos de MICROFONÍA...');
  
  // MICROFONÍA - Audibax 58
  await prisma.product.create({
    data: {
      name: 'Micrófono Audibax 58',
      slug: 'microfono-audibax-58',
      sku: 'MIC-AUD-58',
      description: 'Micrófono dinámico Audibax 58. Cápsula cardioide, ideal para voz e instrumentos.',
      categoryId: microfonia.id,
      pricePerDay: 15,
      pricePerWeekend: 25,
      pricePerWeek: 65,
      stock: 4,
      realStock: 4,
      isActive: true,
      weight: 0.3,
      dimensions: '15x5x5'
    }
  });
  
  // Audibax 57
  await prisma.product.create({
    data: {
      name: 'Micrófono Audibax 57',
      slug: 'microfono-audibax-57',
      sku: 'MIC-AUD-57',
      description: 'Micrófono dinámico Audibax 57. Diseño específico para instrumentos, especialmente guitarra.',
      categoryId: microfonia.id,
      pricePerDay: 15,
      pricePerWeekend: 25,
      pricePerWeek: 65,
      stock: 1,
      realStock: 1,
      isActive: true,
      weight: 0.3,
      dimensions: '15x5x5'
    }
  });
  
  // Behringer
  await prisma.product.create({
    data: {
      name: 'Micrófono Behringer BA 19A',
      slug: 'microfono-behringer-ba19a',
      sku: 'MIC-BEH-19A',
      description: 'Micrófono condensador Behringer BA 19A. Alta sensibilidad para voces e instrumentos acústicos.',
      categoryId: microfonia.id,
      pricePerDay: 20,
      pricePerWeekend: 35,
      pricePerWeek: 85,
      stock: 1,
      realStock: 1,
      isActive: true,
      weight: 0.4,
      dimensions: '18x5x5'
    }
  });
  
  // Inalámbrico 1
  await prisma.product.create({
    data: {
      name: 'Micrófono Inalámbrico',
      slug: 'microfono-inalambrico',
      sku: 'MIC-WLESS-1',
      description: 'Sistema de micrófono inalámbrico con receptor. Frecuencia UHF, alcance 50m.',
      categoryId: microfonia.id,
      pricePerDay: 40,
      pricePerWeekend: 70,
      pricePerWeek: 180,
      stock: 1,
      realStock: 1,
      featured: true,
      isActive: true,
      weight: 1,
      dimensions: '20x10x8'
    }
  });
  
  // Inalámbrico 2
  await prisma.product.create({
    data: {
      name: 'Set 2 Micrófonos Inalámbricos',
      slug: 'set-2-microfonos-inalambricos',
      sku: 'MIC-WLESS-2',
      description: 'Set de 2 micrófonos inalámbricos con receptor dual. Sistema UHF profesional.',
      categoryId: microfonia.id,
      pricePerDay: 70,
      pricePerWeekend: 120,
      pricePerWeek: 320,
      stock: 1,
      realStock: 1,
      featured: true,
      isActive: true,
      weight: 2,
      dimensions: '30x15x10'
    }
  });
  
  // Mixer XR18
  await prisma.product.create({
    data: {
      name: 'Mixer Behringer X Air XR18',
      slug: 'mixer-behringer-xr18',
      sku: 'MIX-XR18',
      description: 'Mezclador digital Behringer X Air XR18 de 18 canales. Control por tablet/smartphone. Wi-Fi integrado.',
      categoryId: microfonia.id,
      pricePerDay: 80,
      pricePerWeekend: 140,
      pricePerWeek: 380,
      stock: 1,
      realStock: 1,
      featured: true,
      isActive: true,
      weight: 7,
      dimensions: '45x35x12'
    }
  });
  
  // Mixer Soundcraft
  await prisma.product.create({
    data: {
      name: 'Mixer Soundcraft',
      slug: 'mixer-soundcraft',
      sku: 'MIX-SCRAFT',
      description: 'Mezclador analógico Soundcraft profesional. Calidad de audio excepcional.',
      categoryId: microfonia.id,
      pricePerDay: 60,
      pricePerWeekend: 100,
      pricePerWeek: 280,
      stock: 1,
      realStock: 1,
      isActive: true,
      weight: 10,
      dimensions: '60x45x15'
    }
  });
  
  console.log('✅ 7 productos de microfonía creados\n');
  
  const total = await prisma.product.count();
  console.log('═══════════════════════════════════════');
  console.log('🎉 ¡CATÁLOGO COMPLETADO!');
  console.log('═══════════════════════════════════════');
  console.log(`📦 Total: ${total} productos`);
  console.log('🔊 Sonido: 6 productos');
  console.log('💡 Iluminación: 8 productos');
  console.log('🏗️  Estructuras: 11 productos');
  console.log('🎤 Microfonía: 7 productos');
  console.log('═══════════════════════════════════════\n');
  console.log('🌐 Ver en: http://localhost:3000/productos\n');
}

createProducts()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('❌ Error:', e);
    prisma.$disconnect();
    process.exit(1);
  });
