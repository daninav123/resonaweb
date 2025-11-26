const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSamplePacks() {
  console.log('\n📦 CREANDO PACKS DE MUESTRA\n');
  
  try {
    // Obtener productos
    const products = await prisma.product.findMany({
      take: 15,
      select: { id: true, name: true, pricePerDay: true }
    });

    if (products.length === 0) {
      console.log('❌ No hay productos disponibles');
      await prisma.$disconnect();
      return;
    }

    console.log(`✅ Encontrados ${products.length} productos\n`);

    // Pack 1: Sonido Básico
    const pack1 = await prisma.pack.create({
      data: {
        name: 'Pack Sonido Básico',
        slug: 'pack-sonido-basico',
        description: 'Pack perfecto para eventos pequeños con equipos de sonido básicos',
        priceExtra: 25,
        discount: 5,
        autoCalculate: true,
        basePrice: 0,
        pricePerDay: 0,
        featured: true,
        isActive: true,
        items: {
          create: [
            {
              productId: products[0].id,
              quantity: 2
            },
            {
              productId: products[1].id,
              quantity: 1
            }
          ]
        }
      },
      include: { items: true }
    });

    console.log(`✅ Pack 1 creado: ${pack1.name}`);
    console.log(`   Productos: ${pack1.items.length}`);
    console.log(`   Extra: €${pack1.priceExtra}`);
    console.log(`   Descuento: ${pack1.discount}%\n`);

    // Pack 2: Sonido Profesional
    const pack2 = await prisma.pack.create({
      data: {
        name: 'Pack Sonido Profesional',
        slug: 'pack-sonido-profesional',
        description: 'Pack completo para eventos grandes con equipos de sonido profesionales',
        priceExtra: 50,
        discount: 10,
        autoCalculate: true,
        basePrice: 0,
        pricePerDay: 0,
        featured: true,
        isActive: true,
        items: {
          create: [
            {
              productId: products[0].id,
              quantity: 4
            },
            {
              productId: products[1].id,
              quantity: 2
            },
            {
              productId: products[2].id,
              quantity: 1
            }
          ]
        }
      },
      include: { items: true }
    });

    console.log(`✅ Pack 2 creado: ${pack2.name}`);
    console.log(`   Productos: ${pack2.items.length}`);
    console.log(`   Extra: €${pack2.priceExtra}`);
    console.log(`   Descuento: ${pack2.discount}%\n`);

    // Pack 3: Iluminación Básica
    const pack3 = await prisma.pack.create({
      data: {
        name: 'Pack Iluminación Básica',
        slug: 'pack-iluminacion-basica',
        description: 'Pack de iluminación para eventos medianos',
        priceExtra: 30,
        discount: 8,
        autoCalculate: true,
        basePrice: 0,
        pricePerDay: 0,
        featured: false,
        isActive: true,
        items: {
          create: [
            {
              productId: products[3].id,
              quantity: 3
            },
            {
              productId: products[4].id,
              quantity: 2
            }
          ]
        }
      },
      include: { items: true }
    });

    console.log(`✅ Pack 3 creado: ${pack3.name}`);
    console.log(`   Productos: ${pack3.items.length}`);
    console.log(`   Extra: €${pack3.priceExtra}`);
    console.log(`   Descuento: ${pack3.discount}%\n`);

    // Pack 4: Pack Completo
    const pack4 = await prisma.pack.create({
      data: {
        name: 'Pack Completo - Sonido + Iluminación',
        slug: 'pack-completo-sonido-iluminacion',
        description: 'Pack todo incluido: sonido profesional + iluminación completa',
        priceExtra: 75,
        discount: 15,
        autoCalculate: true,
        basePrice: 0,
        pricePerDay: 0,
        featured: true,
        isActive: true,
        items: {
          create: [
            {
              productId: products[0].id,
              quantity: 3
            },
            {
              productId: products[1].id,
              quantity: 2
            },
            {
              productId: products[3].id,
              quantity: 4
            },
            {
              productId: products[4].id,
              quantity: 3
            }
          ]
        }
      },
      include: { items: true }
    });

    console.log(`✅ Pack 4 creado: ${pack4.name}`);
    console.log(`   Productos: ${pack4.items.length}`);
    console.log(`   Extra: €${pack4.priceExtra}`);
    console.log(`   Descuento: ${pack4.discount}%\n`);

    // Pack 5: Pack Económico
    const pack5 = await prisma.pack.create({
      data: {
        name: 'Pack Económico',
        slug: 'pack-economico',
        description: 'Pack económico perfecto para presupuestos ajustados',
        priceExtra: 0,
        discount: 20,
        autoCalculate: true,
        basePrice: 0,
        pricePerDay: 0,
        featured: false,
        isActive: true,
        items: {
          create: [
            {
              productId: products[5].id,
              quantity: 2
            },
            {
              productId: products[6].id,
              quantity: 1
            }
          ]
        }
      },
      include: { items: true }
    });

    console.log(`✅ Pack 5 creado: ${pack5.name}`);
    console.log(`   Productos: ${pack5.items.length}`);
    console.log(`   Extra: €${pack5.priceExtra}`);
    console.log(`   Descuento: ${pack5.discount}%\n`);

    console.log('═'.repeat(60));
    console.log('\n✅ 5 PACKS DE MUESTRA CREADOS EXITOSAMENTE\n');
    console.log('📊 RESUMEN:');
    console.log(`   ⭐ Pack Sonido Básico`);
    console.log(`   ⭐ Pack Sonido Profesional`);
    console.log(`   ⭐ Pack Iluminación Básica`);
    console.log(`   ⭐ Pack Completo - Sonido + Iluminación`);
    console.log(`   ⭐ Pack Económico\n`);
    console.log('🔗 Accede a: http://localhost:3000/admin/packs\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createSamplePacks();
