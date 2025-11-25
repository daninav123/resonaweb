import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPacks() {
  console.log('📦 Creando packs de equipamiento para eventos...\n');

  try {
    // Obtener productos
    const products = await prisma.product.findMany({
      select: { id: true, name: true }
    });

    if (products.length === 0) {
      console.log('⚠️  No hay productos. Ejecuta seed primero.');
      return;
    }

    console.log(`Productos disponibles: ${products.length}\n`);

    // ============= PACK 1: BODA PEQUEÑA =============
    console.log('💍 Pack Boda Pequeña...');
    await prisma.pack.create({
      data: {
        name: 'Pack Boda Pequeña (50-100 personas)',
        slug: 'boda-pequena-50-100',
        description: 'Pack completo para bodas íntimas. Incluye sonido de calidad, iluminación ambiental y micrófono inalámbrico.',
        pricePerDay: 450,
        discount: 50,
        imageUrl: '/images/packs/boda-pequena.jpg',
        featured: true,
        items: {
          create: [
            { productId: products[0].id, quantity: 2 },
            { productId: products[1 % products.length].id, quantity: 1 },
            { productId: products[2 % products.length].id, quantity: 4 }
          ]
        }
      }
    });
    console.log('✅ Creado\n');

    // ============= PACK 2: BODA GRANDE =============
    console.log('💒 Pack Boda Grande...');
    await prisma.pack.create({
      data: {
        name: 'Pack Boda Grande (150-300 personas)',
        slug: 'boda-grande-150-300',
        description: 'Pack profesional para bodas grandes. Sistema de sonido line array, iluminación completa y DJ setup.',
        pricePerDay: 1200,
        discount: 150,
        imageUrl: '/images/packs/boda-grande.jpg',
        featured: true,
        items: {
          create: [
            { productId: products[0].id, quantity: 4 },
            { productId: products[1 % products.length].id, quantity: 2 },
            { productId: products[2 % products.length].id, quantity: 1 },
            { productId: products[3 % products.length].id, quantity: 2 },
            { productId: products[4 % products.length].id, quantity: 8 }
          ]
        }
      }
    });
    console.log('✅ Creado\n');

    // ============= PACK 3: FIESTA CORPORATIVA =============
    console.log('🏢 Pack Corporativo...');
    await prisma.pack.create({
      data: {
        name: 'Pack Fiesta Corporativa (100-200 personas)',
        slug: 'fiesta-corporativa-100-200',
        description: 'Pack ideal para eventos corporativos. Sonido equilibrado, iluminación elegante y pantalla.',
        pricePerDay: 800,
        discount: 100,
        imageUrl: '/images/packs/corporativo.jpg',
        featured: true,
        items: {
          create: [
            { productId: products[0].id, quantity: 4 },
            { productId: products[1 % products.length].id, quantity: 2 },
            { productId: products[2 % products.length].id, quantity: 10 }
          ]
        }
      }
    });
    console.log('✅ Creado\n');

    // ============= PACK 4: CUMPLEAÑOS INFANTIL =============
    console.log('🎈 Pack Cumpleaños Infantil...');
    await prisma.pack.create({
      data: {
        name: 'Pack Cumpleaños Infantil (30-50 niños)',
        slug: 'cumpleanos-infantil-30-50',
        description: 'Pack divertido para fiestas infantiles. Sistema de sonido portátil, iluminación colorida y karaoke.',
        pricePerDay: 250,
        discount: 30,
        imageUrl: '/images/packs/infantil.jpg',
        featured: false,
        items: {
          create: [
            { productId: products[0].id, quantity: 2 },
            { productId: products[1 % products.length].id, quantity: 2 },
            { productId: products[2 % products.length].id, quantity: 6 }
          ]
        }
      }
    });
    console.log('✅ Creado\n');

    // ============= PACK 5: CONCIERTO PEQUEÑO =============
    console.log('🎸 Pack Concierto...');
    await prisma.pack.create({
      data: {
        name: 'Pack Concierto Pequeño (200-500 personas)',
        slug: 'concierto-pequeno-200-500',
        description: 'Pack profesional para conciertos y bandas. Sistema PA completo, monitores e iluminación profesional.',
        pricePerDay: 1500,
        discount: 200,
        imageUrl: '/images/packs/concierto.jpg',
        featured: true,
        items: {
          create: [
            { productId: products[0].id, quantity: 4 },
            { productId: products[1 % products.length].id, quantity: 4 },
            { productId: products[2 % products.length].id, quantity: 4 },
            { productId: products[3 % products.length].id, quantity: 6 },
            { productId: products[4 % products.length].id, quantity: 12 }
          ]
        }
      }
    });
    console.log('✅ Creado\n');

    // ============= PACK 6: CONFERENCIA =============
    console.log('🎤 Pack Conferencia...');
    await prisma.pack.create({
      data: {
        name: 'Pack Presentación/Conferencia (50-100 personas)',
        slug: 'presentacion-conferencia-50-100',
        description: 'Pack profesional para conferencias y presentaciones. Audio cristalino, proyección HD y micrófonos.',
        pricePerDay: 400,
        discount: 50,
        imageUrl: '/images/packs/conferencia.jpg',
        featured: false,
        items: {
          create: [
            { productId: products[0].id, quantity: 2 },
            { productId: products[1 % products.length].id, quantity: 3 },
            { productId: products[2 % products.length].id, quantity: 1 }
          ]
        }
      }
    });
    console.log('✅ Creado\n');

    // ============= PACK 7: FIESTA EN CASA =============
    console.log('🏠 Pack Fiesta en Casa...');
    await prisma.pack.create({
      data: {
        name: 'Pack Fiesta en Casa (20-40 personas)',
        slug: 'fiesta-casa-20-40',
        description: 'Pack compacto para fiestas caseras. Sistema de sonido portátil e iluminación básica.',
        pricePerDay: 180,
        discount: 20,
        imageUrl: '/images/packs/fiesta-casa.jpg',
        featured: false,
        items: {
          create: [
            { productId: products[0].id, quantity: 2 },
            { productId: products[1 % products.length].id, quantity: 4 },
            { productId: products[2 % products.length].id, quantity: 1 }
          ]
        }
      }
    });
    console.log('✅ Creado\n');

    // ============= PACK 8: DJ PROFESIONAL =============
    console.log('🎧 Pack DJ Profesional...');
    await prisma.pack.create({
      data: {
        name: 'Pack DJ Profesional (100-300 personas)',
        slug: 'dj-profesional-100-300',
        description: 'Setup completo de DJ profesional. CDJs, mesa Pioneer, sistema de sonido potente e iluminación.',
        pricePerDay: 900,
        discount: 120,
        imageUrl: '/images/packs/dj-pro.jpg',
        featured: true,
        items: {
          create: [
            { productId: products[0].id, quantity: 2 },
            { productId: products[1 % products.length].id, quantity: 1 },
            { productId: products[2 % products.length].id, quantity: 4 },
            { productId: products[3 % products.length].id, quantity: 2 },
            { productId: products[4 % products.length].id, quantity: 8 }
          ]
        }
      }
    });
    console.log('✅ Creado\n');

    const total = await prisma.pack.count();
    console.log('═'.repeat(60));
    console.log(`\n✅ ¡${total} packs creados!\n`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedPacks();
