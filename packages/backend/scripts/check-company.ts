import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCompany() {
  try {
    const settings = await prisma.companySettings.findFirst();
    console.log('📋 DATOS DE LA EMPRESA:');
    console.log(JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCompany();
