/**
 * Verificar el stock de un producto específico
 * Ejecutar: npx ts-node src/check-product-stock.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProductStock() {
  console.log('\n🔍 === VERIFICANDO STOCK DE PRODUCTOS ===\n');

  try {
    // Buscar productos con "Micrófono" en el nombre
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'Micrófono', mode: 'insensitive' } },
          { name: { contains: 'Shure', mode: 'insensitive' } },
          { name: { contains: 'Mezcladora', mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        realStock: true,
        updatedAt: true,
      },
    });

    console.log(`📦 Productos encontrados: ${products.length}\n`);

    for (const product of products) {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📦 ${product.name}`);
      console.log(`   SKU: ${product.sku}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Stock: ${product.stock}`);
      console.log(`   Stock Real: ${product.realStock}`);
      console.log(`   Última actualización: ${product.updatedAt.toLocaleString()}`);
      
      // Ver qué valor usaría el servicio
      const stockUsed = product.realStock ?? product.stock ?? 0;
      console.log(`   → Stock usado en alertas: ${stockUsed}`);
      console.log('');
    }

    // Mostrar TODOS los productos con sus stocks
    console.log('\n📊 === TODOS LOS PRODUCTOS (resumen) ===\n');
    const allProducts = await prisma.product.findMany({
      select: {
        name: true,
        stock: true,
        realStock: true,
      },
      orderBy: { name: 'asc' },
    });

    for (const p of allProducts) {
      const stockUsed = p.realStock ?? p.stock ?? 0;
      console.log(`${p.name.padEnd(40)} | Stock: ${String(p.stock).padStart(3)} | Real: ${String(p.realStock).padStart(3)} | Usado: ${stockUsed}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductStock();
