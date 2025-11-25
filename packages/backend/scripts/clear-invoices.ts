import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearInvoices() {
  try {
    console.log('🗑️  Eliminando todas las facturas...');
    
    // Delete all invoices
    const deleted = await prisma.invoice.deleteMany({});
    
    console.log(`✅ ${deleted.count} facturas eliminadas`);
    console.log('✅ La numeración empezará desde INV-2025-00001');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearInvoices();
