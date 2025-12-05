import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para migrar productos existentes al sistema de lotes
 * Este script crea un lote inicial para cada producto que tenga purchasePrice
 */
async function migrateToPurchaseLots() {
  try {
    console.log('🚀 Iniciando migración al sistema de lotes...\n');

    // Obtener todos los productos que tienen purchasePrice
    const productsWithPurchase = await prisma.product.findMany({
      where: {
        purchasePrice: {
          not: null,
        },
        isPack: false, // Excluir packs
      },
      select: {
        id: true,
        name: true,
        sku: true,
        purchasePrice: true,
        purchaseDate: true,
        stock: true,
      },
    });

    console.log(`📦 Encontrados ${productsWithPurchase.length} productos con precio de compra\n`);

    let created = 0;
    let skipped = 0;

    for (const product of productsWithPurchase) {
      // Verificar si ya tiene lotes
      const existingLots = await prisma.productPurchase.count({
        where: { productId: product.id },
      });

      if (existingLots > 0) {
        console.log(`⏭️  ${product.name} (${product.sku}): Ya tiene ${existingLots} lote(s), omitiendo...`);
        skipped++;
        continue;
      }

      // Crear lote inicial
      const unitPrice = product.purchasePrice;
      const quantity = Math.max(product.stock || 1, 1); // Al menos 1 unidad
      const totalCost = Number(unitPrice) * quantity;

      await prisma.productPurchase.create({
        data: {
          productId: product.id,
          purchaseDate: product.purchaseDate || new Date(),
          quantity,
          unitPrice,
          totalCost,
          supplier: null,
          invoiceNumber: null,
          notes: 'Lote inicial migrado del sistema antiguo',
          totalGenerated: 0,
          isAmortized: false,
        },
      });

      console.log(`✅ ${product.name} (${product.sku}): Lote creado - ${quantity} unidad(es) × €${unitPrice} = €${totalCost}`);
      created++;
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✅ Migración completada:`);
    console.log(`   - Lotes creados: ${created}`);
    console.log(`   - Productos omitidos (ya tenían lotes): ${skipped}`);
    console.log(`   - Total procesados: ${created + skipped}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración
migrateToPurchaseLots()
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
