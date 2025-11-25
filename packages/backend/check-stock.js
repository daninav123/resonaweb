const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStock() {
  console.log('\n=== VERIFICANDO STOCK DE PRODUCTOS ===\n');
  
  // Buscar productos relacionados con micrófono
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: 'micro', mode: 'insensitive' } },
        { name: { contains: '58', mode: 'insensitive' } },
        { sku: { contains: '58', mode: 'insensitive' } }
      ]
    },
    select: {
      id: true,
      name: true,
      sku: true,
      stock: true,
      realStock: true
    }
  });
  
  console.log(`Productos encontrados: ${products.length}\n`);
  
  products.forEach(p => {
    console.log(`📦 ${p.name}`);
    console.log(`   ID: ${p.id}`);
    console.log(`   SKU: ${p.sku}`);
    console.log(`   Stock: ${p.stock}`);
    console.log(`   Real Stock: ${p.realStock}`);
    console.log('');
  });
  
  // Buscar pedidos con estos productos
  console.log('\n=== PEDIDOS CON ESTOS PRODUCTOS ===\n');
  
  const orders = await prisma.order.findMany({
    where: {
      status: 'CONFIRMED',
      startDate: { gte: new Date() }
    },
    include: {
      items: {
        where: {
          product: {
            OR: [
              { name: { contains: 'micro', mode: 'insensitive' } },
              { name: { contains: '58', mode: 'insensitive' } }
            ]
          }
        },
        include: {
          product: {
            select: {
              name: true,
              sku: true,
              stock: true
            }
          }
        }
      }
    }
  });
  
  orders.forEach(o => {
    if (o.items.length > 0) {
      console.log(`📋 ${o.orderNumber} - ${o.status} - ${new Date(o.startDate).toLocaleDateString()}`);
      o.items.forEach(item => {
        console.log(`   - ${item.product.name} x ${item.quantity} (Stock disponible: ${item.product.stock})`);
      });
      console.log('');
    }
  });
  
  await prisma.$disconnect();
}

checkStock().catch(console.error);
