import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedProductPacks() {
  console.log('📦 Creando packs como PRODUCTOS...\n');

  try {
    // Obtener categoría de Packs
    let packsCategory = await prisma.category.findUnique({
      where: { slug: 'packs' }
    });

    if (!packsCategory) {
      console.log('Creando categoría Packs...');
      packsCategory = await prisma.category.create({
        data: {
          name: 'Packs',
          slug: 'packs',
          description: 'Packs completos de equipamiento',
          imageUrl: '/images/categories/packs.jpg',
          featured: true
        }
      });
    }

    // Obtener productos existentes para usar como componentes
    const products = await prisma.product.findMany({
      where: { isPack: false, isActive: true },
      select: { id: true, name: true, pricePerDay: true }
    });

    if (products.length < 3) {
      console.log('⚠️  Necesitas al menos 3 productos para crear packs');
      return;
    }

    console.log(`✅ ${products.length} productos disponibles como componentes\n`);

    // Borrar packs existentes
    console.log('🧹 Limpiando packs anteriores...');
    const existingPacks = await prisma.product.findMany({
      where: { isPack: true },
      select: { id: true }
    });
    
    if (existingPacks.length > 0) {
      await prisma.productComponent.deleteMany({
        where: { packId: { in: existingPacks.map(p => p.id) } }
      });
      await prisma.product.deleteMany({
        where: { isPack: true }
      });
      console.log(`✅ ${existingPacks.length} packs anteriores eliminados\n`);
    }

    // ============= PACK 1: BODA PEQUEÑA =============
    console.log('💍 Pack Boda Pequeña...');
    const bodaPequena = await prisma.product.create({
      data: {
        sku: 'PACK-BODA-50',
        name: 'Pack Boda Pequeña (50-100 personas)',
        slug: 'pack-boda-pequena-50-100',
        description: 'Pack completo para bodas íntimas. Incluye sonido de calidad, iluminación ambiental y micrófono inalámbrico para ceremonias.',
        categoryId: packsCategory.id,
        pricePerDay: 400,
        pricePerWeekend: 600,
        pricePerWeek: 2000,
        stock: 0,
        realStock: 0, // Se calculará automáticamente según componentes
        isPack: true,
        featured: true,
        mainImageUrl: '/images/packs/boda-pequena.jpg',
        stockStatus: 'IN_STOCK',
        status: 'AVAILABLE'
      }
    });

    // Añadir componentes
    await prisma.productComponent.createMany({
      data: [
        { packId: bodaPequena.id, componentId: products[0].id, quantity: 2 },
        { packId: bodaPequena.id, componentId: products[1 % products.length].id, quantity: 1 },
        { packId: bodaPequena.id, componentId: products[2 % products.length].id, quantity: 4 }
      ]
    });
    console.log('✅ Creado con 3 componentes\n');

    // ============= PACK 2: BODA GRANDE =============
    console.log('💒 Pack Boda Grande...');
    const bodaGrande = await prisma.product.create({
      data: {
        sku: 'PACK-BODA-150',
        name: 'Pack Boda Grande (150-300 personas)',
        slug: 'pack-boda-grande-150-300',
        description: 'Pack profesional para bodas grandes. Sistema de sonido line array, iluminación completa, DJ setup y efectos especiales.',
        categoryId: packsCategory.id,
        pricePerDay: 1050,
        pricePerWeekend: 1575,
        pricePerWeek: 5250,
        stock: 0,
        realStock: 0,
        isPack: true,
        featured: true,
        mainImageUrl: '/images/packs/boda-grande.jpg',
        stockStatus: 'IN_STOCK',
        status: 'AVAILABLE'
      }
    });

    await prisma.productComponent.createMany({
      data: [
        { packId: bodaGrande.id, componentId: products[0].id, quantity: 4 },
        { packId: bodaGrande.id, componentId: products[1 % products.length].id, quantity: 2 },
        { packId: bodaGrande.id, componentId: products[2 % products.length].id, quantity: 1 },
        { packId: bodaGrande.id, componentId: products[3 % products.length].id, quantity: 2 },
        { packId: bodaGrande.id, componentId: products[4 % products.length].id, quantity: 8 }
      ]
    });
    console.log('✅ Creado con 5 componentes\n');

    // ============= PACK 3: CORPORATIVO =============
    console.log('🏢 Pack Corporativo...');
    const corporativo = await prisma.product.create({
      data: {
        sku: 'PACK-CORP-100',
        name: 'Pack Corporativo (100-200 personas)',
        slug: 'pack-corporativo-100-200',
        description: 'Pack ideal para eventos corporativos. Sonido equilibrado, iluminación elegante y pantalla para presentaciones.',
        categoryId: packsCategory.id,
        pricePerDay: 700,
        pricePerWeekend: 1050,
        pricePerWeek: 3500,
        stock: 0,
        realStock: 0,
        isPack: true,
        featured: true,
        mainImageUrl: '/images/packs/corporativo.jpg',
        stockStatus: 'IN_STOCK',
        status: 'AVAILABLE'
      }
    });

    await prisma.productComponent.createMany({
      data: [
        { packId: corporativo.id, componentId: products[0].id, quantity: 4 },
        { packId: corporativo.id, componentId: products[1 % products.length].id, quantity: 2 },
        { packId: corporativo.id, componentId: products[2 % products.length].id, quantity: 10 }
      ]
    });
    console.log('✅ Creado con 3 componentes\n');

    // ============= PACK 4: DJ PROFESIONAL =============
    console.log('🎧 Pack DJ Profesional...');
    const djPro = await prisma.product.create({
      data: {
        sku: 'PACK-DJ-PRO',
        name: 'Pack DJ Profesional (100-300 personas)',
        slug: 'pack-dj-profesional-100-300',
        description: 'Setup completo de DJ profesional. CDJs, mesa Pioneer, sistema de sonido potente e iluminación sincronizada.',
        categoryId: packsCategory.id,
        pricePerDay: 780,
        pricePerWeekend: 1170,
        pricePerWeek: 3900,
        stock: 0,
        realStock: 0,
        isPack: true,
        featured: true,
        mainImageUrl: '/images/packs/dj-pro.jpg',
        stockStatus: 'IN_STOCK',
        status: 'AVAILABLE'
      }
    });

    await prisma.productComponent.createMany({
      data: [
        { packId: djPro.id, componentId: products[0].id, quantity: 2 },
        { packId: djPro.id, componentId: products[1 % products.length].id, quantity: 1 },
        { packId: djPro.id, componentId: products[2 % products.length].id, quantity: 4 },
        { packId: djPro.id, componentId: products[3 % products.length].id, quantity: 2 },
        { packId: djPro.id, componentId: products[4 % products.length].id, quantity: 8 }
      ]
    });
    console.log('✅ Creado con 5 componentes\n');

    // ============= PACK 5: CONCIERTO =============
    console.log('🎸 Pack Concierto...');
    const concierto = await prisma.product.create({
      data: {
        sku: 'PACK-CONCERT-200',
        name: 'Pack Concierto (200-500 personas)',
        slug: 'pack-concierto-200-500',
        description: 'Pack profesional para conciertos y bandas. Sistema PA completo, monitores de escenario e iluminación profesional.',
        categoryId: packsCategory.id,
        pricePerDay: 1300,
        pricePerWeekend: 1950,
        pricePerWeek: 6500,
        stock: 0,
        realStock: 0,
        isPack: true,
        featured: true,
        mainImageUrl: '/images/packs/concierto.jpg',
        stockStatus: 'IN_STOCK',
        status: 'AVAILABLE'
      }
    });

    await prisma.productComponent.createMany({
      data: [
        { packId: concierto.id, componentId: products[0].id, quantity: 4 },
        { packId: concierto.id, componentId: products[1 % products.length].id, quantity: 4 },
        { packId: concierto.id, componentId: products[2 % products.length].id, quantity: 4 },
        { packId: concierto.id, componentId: products[3 % products.length].id, quantity: 6 },
        { packId: concierto.id, componentId: products[4 % products.length].id, quantity: 12 }
      ]
    });
    console.log('✅ Creado con 5 componentes\n');

    // Borrar packs del modelo Pack (los que creé antes por error)
    console.log('\n🧹 Limpiando packs del modelo Pack...');
    const deletedItems = await prisma.packItem.deleteMany({});
    const deletedPacks = await prisma.pack.deleteMany({});
    console.log(`✅ ${deletedPacks.count} packs y ${deletedItems.count} items eliminados\n`);

    // Contar packs creados
    const totalPacks = await prisma.product.count({
      where: { isPack: true }
    });

    console.log('═'.repeat(60));
    console.log(`\n✅ ¡${totalPacks} packs creados como PRODUCTOS!\n`);
    console.log('Estos packs:');
    console.log('  ✅ Aparecen en el catálogo como productos');
    console.log('  ✅ Stock calculado automáticamente según componentes');
    console.log('  ✅ Se pueden alquilar como cualquier producto');
    console.log('  ✅ Admin puede gestionar componentes\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedProductPacks();
