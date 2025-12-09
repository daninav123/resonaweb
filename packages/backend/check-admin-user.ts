import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdminUser() {
  try {
    console.log('🔍 Verificando usuario admin...\n');

    const admin = await prisma.user.findFirst({
      where: { email: 'admin@resona.com' }
    });

    if (!admin) {
      console.log('❌ No se encontró usuario admin@resona.com');
      return;
    }

    console.log('✅ Usuario encontrado:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`👤 Nombre: ${admin.firstName} ${admin.lastName}`);
    console.log(`🔑 Role: ${admin.role}`);
    console.log(`✅ Activo: ${admin.isActive ? 'Sí' : 'No'}`);
    console.log(`📨 Email verificado: ${admin.emailVerified ? 'Sí' : 'No'}`);
    console.log(`🆔 ID: ${admin.id}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (admin.role !== 'SUPERADMIN' && admin.role !== 'ADMIN') {
      console.log('⚠️  PROBLEMA: El rol no es ADMIN ni SUPERADMIN');
      console.log(`   Rol actual: ${admin.role}`);
      console.log('\n🔧 Actualizando rol a SUPERADMIN...');
      
      await prisma.user.update({
        where: { id: admin.id },
        data: { role: 'SUPERADMIN' }
      });
      
      console.log('✅ Rol actualizado correctamente\n');
    } else {
      console.log('✅ El rol es correcto para acceder al panel admin\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUser();
