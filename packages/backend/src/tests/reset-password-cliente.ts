/**
 * Resetear contraseña del usuario cliente@test.com
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetPassword() {
  console.log('🔐 RESETEANDO CONTRASEÑA\n');

  try {
    const email = 'cliente@test.com';
    const newPassword = 'Cliente123!';
    
    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`❌ Usuario ${email} no encontrado\n`);
      return;
    }

    console.log(`✅ Usuario encontrado: ${user.firstName} ${user.lastName}\n`);

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    console.log('✅ Contraseña actualizada exitosamente\n');
    console.log('═'.repeat(50));
    console.log('📧 CREDENCIALES DE LOGIN:');
    console.log('═'.repeat(50));
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${newPassword}`);
    console.log('═'.repeat(50));
    console.log('');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword()
  .then(() => {
    console.log('✅ Proceso completado');
    process.exit(0);
  })
  .catch(() => {
    console.error('❌ Error en proceso');
    process.exit(1);
  });
