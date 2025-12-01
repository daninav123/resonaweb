/**
 * Script para ajustar los precios de fin de semana
 * Hace que pricePerWeekend sea igual a pricePerDay en todos los productos
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Iniciando ajuste de precios de fin de semana...\n');

  try {
    // Obtener todos los productos
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        pricePerDay: true,
        pricePerWeekend: true,
      },
    });

    console.log(`📦 Productos encontrados: ${products.length}\n`);

    let updated = 0;
    let skipped = 0;

    for (const product of products) {
      const pricePerDay = Number(product.pricePerDay);
      const pricePerWeekend = Number(product.pricePerWeekend);

      // Si el precio de fin de semana ya es igual al precio por día, saltarlo
      if (pricePerWeekend === pricePerDay) {
        console.log(`⏭️  ${product.name} (${product.sku}) - Ya tiene pricePerWeekend = pricePerDay (€${pricePerDay})`);
        skipped++;
        continue;
      }

      // Actualizar el producto
      await prisma.product.update({
        where: { id: product.id },
        data: {
          pricePerWeekend: product.pricePerDay, // Igualar al precio por día
        },
      });

      console.log(`✅ ${product.name} (${product.sku})`);
      console.log(`   Antes: €${pricePerWeekend} | Ahora: €${pricePerDay}`);
      updated++;
    }

    console.log('\n📊 Resumen:');
    console.log(`   ✅ Productos actualizados: ${updated}`);
    console.log(`   ⏭️  Productos sin cambios: ${skipped}`);
    console.log(`   📦 Total procesados: ${products.length}`);

    console.log('\n✨ Ajuste completado exitosamente');

  } catch (error) {
    console.error('❌ Error durante el ajuste:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
