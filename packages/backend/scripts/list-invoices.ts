import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listInvoices() {
  try {
    console.log('📋 Listando facturas en la BD...\n');
    
    const invoices = await prisma.invoice.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (invoices.length === 0) {
      console.log('❌ No hay facturas en la base de datos');
      return;
    }
    
    console.log(`✅ Total: ${invoices.length} facturas\n`);
    
    invoices.forEach((inv, i) => {
      console.log(`${i + 1}. ${inv.invoiceNumber}`);
      console.log(`   ID: ${inv.id}`);
      console.log(`   orderId: ${inv.orderId || 'null (MANUAL)'}`);
      console.log(`   Total: ${inv.total}€`);
      console.log(`   Fecha: ${inv.createdAt.toISOString()}`);
      console.log(`   Metadata: ${JSON.stringify(inv.metadata, null, 2).substring(0, 200)}...`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listInvoices();
