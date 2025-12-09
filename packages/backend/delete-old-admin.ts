import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteOldAdmin() {
  try {
    // Eliminar el admin viejo
    await prisma.user.deleteMany({
      where: { email: 'admin@resonaevents.com' }
    });

    console.log('✅ Usuario admin anterior eliminado');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteOldAdmin();
