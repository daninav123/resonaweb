const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updatePackPrices() {
  console.log('\n🔄 ACTUALIZANDO PRECIOS DE PACKS\n');
  console.log('═'.repeat(60));
  
  try {
    const packs = await prisma.pack.findMany({
      include: {
        items: {
          include: {
            product: {
              select: {
                pricePerDay: true
              }
            }
          }
        }
      }
    });

    console.log(`\n📦 Encontrados ${packs.length} packs\n`);

    for (const pack of packs) {
      console.log(`\n🔄 Procesando: ${pack.name}`);
      
      // Calcular basePrice (suma de productos)
      const basePrice = pack.items.reduce((sum, item) => {
        const productPrice = Number(item.product.pricePerDay);
        return sum + (productPrice * item.quantity);
      }, 0);

      const priceExtra = Number(pack.priceExtra || 0);
      const discount = Number(pack.discount || 0);

      // Calcular precio final
      const priceBeforeDiscount = basePrice + priceExtra;
      const discountAmount = priceBeforeDiscount * (discount / 100);
      const finalPrice = priceBeforeDiscount - discountAmount;

      console.log(`   Base (productos):    €${basePrice.toFixed(2)}`);
      console.log(`   Extra:               €${priceExtra.toFixed(2)}`);
      console.log(`   Descuento:           ${discount}% (-€${discountAmount.toFixed(2)})`);
      console.log(`   ─────────────────────────────────`);
      console.log(`   Precio final:        €${finalPrice.toFixed(2)}`);

      // Actualizar en la BD
      await prisma.pack.update({
        where: { id: pack.id },
        data: {
          basePrice,
          pricePerDay: finalPrice
        }
      });

      console.log(`   ✅ Actualizado`);
    }

    console.log('\n═'.repeat(60));
    console.log(`\n✅ ${packs.length} packs actualizados correctamente\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePackPrices();
