/**
 * Verificar y crear usuarios normales
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function checkNormalUsers() {
  console.log('🔍 VERIFICANDO USUARIOS NORMALES\n');

  try {
    // Buscar todos los usuarios normales (role = CLIENT)
    const normalUsers = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    console.log(`📊 Usuarios normales encontrados: ${normalUsers.length}\n`);

    if (normalUsers.length > 0) {
      console.log('Lista de usuarios:');
      normalUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.email}`);
        console.log(`   Nombre: ${user.firstName} ${user.lastName}`);
        console.log(`   Activo: ${user.isActive}`);
        console.log(`   Email Verificado: ${user.emailVerified}`);
        console.log(`   Creado: ${user.createdAt.toLocaleDateString()}`);
      });
      console.log('\n⚠️  Para estos usuarios, la contraseña depende de cómo se crearon.');
      console.log('Si no recuerdas la contraseña, puedo resetearla.\n');
    } else {
      console.log('❌ No hay usuarios normales en la base de datos.\n');
      console.log('Creando usuario de prueba...\n');
      
      const testPassword = 'Test123!';
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      
      const testUser = await prisma.user.create({
        data: {
          email: 'test@resona.com',
          password: hashedPassword,
          firstName: 'Usuario',
          lastName: 'Prueba',
          role: 'CLIENT',
          isActive: true,
          emailVerified: true,
        },
      });
      
      console.log('✅ Usuario de prueba creado:');
      console.log(`   Email: ${testUser.email}`);
      console.log(`   Password: ${testPassword}`);
      console.log(`   Nombre: ${testUser.firstName} ${testUser.lastName}`);
      console.log(`   Role: ${testUser.role}\n`);
      
      console.log('Credenciales de login:');
      console.log('   📧 Email: test@resona.com');
      console.log('   🔑 Password: Test123!\n');
    }

    // Opción para resetear contraseña de un usuario específico
    console.log('─'.repeat(50));
    console.log('\n💡 TIP: Si quieres resetear la contraseña de algún usuario,');
    console.log('    modifica este script y añade el email del usuario.\n');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkNormalUsers()
  .then(() => {
    console.log('✅ Verificación completada');
    process.exit(0);
  })
  .catch(() => {
    console.error('❌ Error en verificación');
    process.exit(1);
  });
