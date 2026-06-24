const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createPersonalProducts() {
  try {
    console.log('🔍 Buscando categoría "Personal"...\n');
    
    // Buscar categoría Personal
    const personalCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: 'Personal',
          mode: 'insensitive'
        }
      }
    });

    if (!personalCategory) {
      console.log('❌ No se encontró la categoría "Personal"');
      console.log('Ejecuta primero: Reinicia el backend para que se cargue la categoría');
      return;
    }

    console.log(`✅ Categoría "Personal" encontrada: ${personalCategory.id}\n`);

    const personalProducts = [
      {
        name: 'Montador',
        sku: 'PERS-MONTADOR-001',
        slug: 'montador',
        description: 'Montador profesional con experiencia en estructuras, iluminación y sonido. Tarifa por hora.',
        categoryId: personalCategory.id,
        purchasePrice: 15.00, // Coste por hora
        pricePerDay: 25.00, // Precio de venta por hora
        pricePerWeekend: 25.00,
        pricePerWeek: 25.00,
        stock: 5, // 5 montadores disponibles
        realStock: 5,
        availableStock: 5,
        status: 'AVAILABLE',
        stockStatus: 'IN_STOCK',
        isActive: true,
        isPack: false
      },
      {
        name: 'DJ Profesional',
        sku: 'PERS-DJ-001',
        slug: 'dj-profesional',
        description: 'DJ profesional con equipamiento propio. Especializado en bodas, eventos corporativos y fiestas. Tarifa por hora.',
        categoryId: personalCategory.id,
        purchasePrice: 50.00, // Coste por hora
        pricePerDay: 80.00, // Precio de venta por hora
        pricePerWeekend: 80.00,
        pricePerWeek: 80.00,
        stock: 3,
        realStock: 3,
        availableStock: 3,
        status: 'AVAILABLE',
        stockStatus: 'IN_STOCK',
        isActive: true,
        isPack: false
      },
      {
        name: 'Técnico de Sonido',
        sku: 'PERS-TECSON-001',
        slug: 'tecnico-sonido',
        description: 'Técnico de sonido certificado. Montaje, ajuste y operación de sistemas de audio. Tarifa por hora.',
        categoryId: personalCategory.id,
        purchasePrice: 30.00,
        pricePerDay: 50.00,
        pricePerWeekend: 50.00,
        pricePerWeek: 50.00,
        stock: 4,
        realStock: 4,
        availableStock: 4,
        status: 'AVAILABLE',
        stockStatus: 'IN_STOCK',
        isActive: true,
        isPack: false
      },
      {
        name: 'Técnico de Iluminación',
        sku: 'PERS-TECILUM-001',
        slug: 'tecnico-iluminacion',
        description: 'Técnico especializado en iluminación profesional, efectos y programación de shows. Tarifa por hora.',
        categoryId: personalCategory.id,
        purchasePrice: 30.00,
        pricePerDay: 50.00,
        pricePerWeekend: 50.00,
        pricePerWeek: 50.00,
        stock: 3,
        realStock: 3,
        availableStock: 3,
        status: 'AVAILABLE',
        stockStatus: 'IN_STOCK',
        isActive: true,
        isPack: false
      },
      {
        name: 'Operador de Cámara',
        sku: 'PERS-CAMARA-001',
        slug: 'operador-camara',
        description: 'Operador de cámara profesional para eventos en directo. Incluye equipamiento básico. Tarifa por hora.',
        categoryId: personalCategory.id,
        purchasePrice: 40.00,
        pricePerDay: 65.00,
        pricePerWeekend: 65.00,
        pricePerWeek: 65.00,
        stock: 2,
        realStock: 2,
        availableStock: 2,
        status: 'AVAILABLE',
        stockStatus: 'IN_STOCK',
        isActive: true,
        isPack: false
      },
      {
        name: 'Ayudante General',
        sku: 'PERS-AYUDANTE-001',
        slug: 'ayudante-general',
        description: 'Ayudante para tareas generales: carga, descarga, montaje básico y apoyo al equipo técnico. Tarifa por hora.',
        categoryId: personalCategory.id,
        purchasePrice: 10.00,
        pricePerDay: 18.00,
        pricePerWeekend: 18.00,
        pricePerWeek: 18.00,
        stock: 10,
        realStock: 10,
        availableStock: 10,
        status: 'AVAILABLE',
        stockStatus: 'IN_STOCK',
        isActive: true,
        isPack: false
      }
    ];

    console.log('📦 Creando productos de Personal...\n');

    for (const product of personalProducts) {
      // Verificar si ya existe
      const existing = await prisma.product.findFirst({
        where: { sku: product.sku }
      });

      if (existing) {
        console.log(`⏭️  ${product.name} ya existe (SKU: ${product.sku})`);
        continue;
      }

      const created = await prisma.product.create({
        data: product
      });

      console.log(`✅ ${product.name} creado`);
      console.log(`   - Coste: €${product.purchasePrice}/h`);
      console.log(`   - Precio: €${product.pricePerDay}/h`);
      console.log(`   - Margen: €${(product.pricePerDay - product.purchasePrice).toFixed(2)}/h (${((product.pricePerDay - product.purchasePrice) / product.pricePerDay * 100).toFixed(1)}%)`);
      console.log('');
    }

    console.log('\n🎉 ¡Productos de Personal creados exitosamente!');
    console.log('\n💡 Ahora puedes:');
    console.log('   1. Ir al panel de admin → Productos');
    console.log('   2. Ver los productos de la categoría "Personal"');
    console.log('   3. Añadirlos a tus packs');
    console.log('   4. Ver el margen de beneficio en tiempo real');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createPersonalProducts();
