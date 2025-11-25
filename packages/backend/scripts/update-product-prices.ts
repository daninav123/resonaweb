import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateProductPrices() {
  try {
    console.log('🔄 Actualizando precios de todos los productos...');

    const result = await prisma.product.updateMany({
      data: {
        shippingCost: 5,              // 5 euros envío
        installationCost: 5,           // 5 euros instalación
        installationTimeMinutes: 5,    // 5 minutos montaje
      },
    });

    console.log(`✅ ${result.count} productos actualizados correctamente`);
    console.log('📊 Nuevos valores:');
    console.log('   - Precio envío: €5');
    console.log('   - Precio instalación: €5');
    console.log('   - Tiempo montaje: 5 minutos');

    // Mostrar algunos productos como ejemplo
    const sampleProducts = await prisma.product.findMany({
      take: 5,
      select: {
        name: true,
        shippingCost: true,
        installationCost: true,
        installationTimeMinutes: true,
      },
    });

    console.log('\n📦 Ejemplos de productos actualizados:');
    sampleProducts.forEach((product) => {
      console.log(`   - ${product.name}`);
      console.log(`     Envío: €${product.shippingCost}`);
      console.log(`     Instalación: €${product.installationCost}`);
      console.log(`     Montaje: ${product.installationTimeMinutes} min`);
    });

  } catch (error) {
    console.error('❌ Error al actualizar productos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
updateProductPrices()
  .then(() => {
    console.log('\n✅ Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en el script:', error);
    process.exit(1);
  });
