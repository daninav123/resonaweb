const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixStockStatus() {
  try {
    console.log('🔧 Arreglando stockStatus de productos...\n');

    // Contar productos con ON_DEMAND
    const onDemandCount = await prisma.product.count({
      where: { stockStatus: 'ON_DEMAND' }
    });

    console.log(`📊 Productos con ON_DEMAND: ${onDemandCount}`);

    // Actualizar todos los productos con stock > 0 a IN_STOCK
    const result = await prisma.product.updateMany({
      where: {
        stockStatus: 'ON_DEMAND',
        stock: {
          gt: 0
        }
      },
      data: {
        stockStatus: 'IN_STOCK'
      }
    });

    console.log(`✅ Actualizados ${result.count} productos a IN_STOCK\n`);

    // Mostrar resumen
    const inStockCount = await prisma.product.count({
      where: { stockStatus: 'IN_STOCK' }
    });

    const stillOnDemand = await prisma.product.count({
      where: { stockStatus: 'ON_DEMAND' }
    });

    console.log('📊 RESUMEN FINAL:');
    console.log(`   - IN_STOCK: ${inStockCount} productos`);
    console.log(`   - ON_DEMAND: ${stillOnDemand} productos`);
    console.log(`   - Total: ${inStockCount + stillOnDemand} productos\n`);

    console.log('✅ ¡Proceso completado exitosamente!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixStockStatus();
