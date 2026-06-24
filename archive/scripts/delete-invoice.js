const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteInvoice() {
  try {
    const orderId = 'c6b3999a-1029-4004-ae65-4d50613d6a3f';
    
    console.log('🗑️ Eliminando factura para pedido:', orderId);
    
    const result = await prisma.invoice.deleteMany({
      where: { orderId },
    });
    
    console.log(`✅ Eliminadas ${result.count} facturas`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

deleteInvoice();
