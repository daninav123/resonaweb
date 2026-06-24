// Script para crear el producto virtual "Evento Personalizado"
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createVirtualProduct() {
  try {
    console.log('🔧 Creando producto virtual para eventos personalizados...');

    // 1. Buscar o crear categoría "Eventos Personalizados"
    let category = await prisma.category.findUnique({
      where: { slug: 'eventos-personalizados' }
    });

    if (!category) {
      console.log('📁 Creando categoría "Eventos Personalizados"...');
      category = await prisma.category.create({
        data: {
          name: 'Eventos Personalizados',
          slug: 'eventos-personalizados',
          description: 'Categoría para pedidos personalizados creados desde la calculadora de eventos',
          isActive: true,
        }
      });
      console.log('✅ Categoría creada:', category.id);
    } else {
      console.log('✅ Categoría ya existe:', category.id);
    }

    // 2. Buscar si el producto virtual ya existe
    let product = await prisma.product.findUnique({
      where: { id: 'product-custom-event-virtual' }
    });

    if (product) {
      console.log('✅ Producto virtual ya existe:', product.id);
      console.log('   Nombre:', product.name);
      return product;
    }

    // 3. Crear el producto virtual
    console.log('📦 Creando producto virtual...');
    product = await prisma.product.create({
      data: {
        id: 'product-custom-event-virtual',
        sku: 'VIRTUAL-EVENT-001',
        name: 'Evento Personalizado',
        slug: 'evento-personalizado-virtual',
        description: 'Producto virtual para pedidos personalizados creados desde la calculadora de eventos. El precio real se calcula según la configuración del evento.',
        category: {
          connect: { id: category.id }
        },
        pricePerDay: 0,
        pricePerWeekend: 0,
        pricePerWeek: 0,
        purchasePrice: 0,
        stock: 9999,
        realStock: 9999,
        stockStatus: 'IN_STOCK',
        isActive: true,
        featured: false,
        isPack: false,
        shippingCost: 0,
        installationCost: 0,
      }
    });

    console.log('✅ Producto virtual creado exitosamente!');
    console.log('   ID:', product.id);
    console.log('   Nombre:', product.name);
    console.log('   Slug:', product.slug);

    return product;

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
createVirtualProduct()
  .then(() => {
    console.log('\n✅ ¡Producto virtual listo para usar!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
