/**
 * Buscar y verificar usuario danielnavarrocampos@icloud.com
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function checkDanielUser() {
  console.log('🔍 BUSCANDO USUARIO: danielnavarrocampos@icloud.com\n');

  try {
    const email = 'danielnavarrocampos@icloud.com';
    
    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('❌ Usuario NO EXISTE en la base de datos\n');
      console.log('Posibles causas:');
      console.log('  1. Se eliminó de la base de datos');
      console.log('  2. Se hizo un reset/seed de la base de datos');
      console.log('  3. El email es diferente\n');
      
      console.log('Buscando usuarios con "daniel" en el email...\n');
      const similarUsers = await prisma.user.findMany({
        where: {
          email: {
            contains: 'daniel',
            mode: 'insensitive',
          },
        },
        select: {
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
        },
      });

      if (similarUsers.length > 0) {
        console.log(`✅ Encontrados ${similarUsers.length} usuarios con "daniel":\n`);
        similarUsers.forEach((u, i) => {
          console.log(`${i + 1}. ${u.email}`);
          console.log(`   Nombre: ${u.firstName} ${u.lastName}`);
          console.log(`   Role: ${u.role}`);
          console.log(`   Activo: ${u.isActive}\n`);
        });
      } else {
        console.log('❌ No se encontraron usuarios similares\n');
      }

      console.log('¿Quieres crear el usuario danielnavarrocampos@icloud.com?\n');
      console.log('Creando usuario...\n');

      const newPassword = 'Daniel123!';
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const newUser = await prisma.user.create({
        data: {
          email: 'danielnavarrocampos@icloud.com',
          password: hashedPassword,
          firstName: 'Daniel',
          lastName: 'Navarro',
          role: 'CLIENT',
          isActive: true,
          emailVerified: true,
        },
      });

      console.log('✅ Usuario creado exitosamente\n');
      console.log('═'.repeat(50));
      console.log('📧 NUEVAS CREDENCIALES:');
      console.log('═'.repeat(50));
      console.log(`   Email:    ${newUser.email}`);
      console.log(`   Password: ${newPassword}`);
      console.log('═'.repeat(50));
      console.log('');
      
      return;
    }

    // Si el usuario existe
    console.log('✅ Usuario ENCONTRADO\n');
    console.log('Datos del usuario:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Nombre: ${user.firstName} ${user.lastName}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Activo: ${user.isActive}`);
    console.log(`   Email Verificado: ${user.emailVerified}`);
    console.log(`   Último Login: ${user.lastLoginAt || 'Nunca'}\n`);

    // Resetear contraseña
    console.log('Reseteando contraseña...\n');
    
    const newPassword = 'Daniel123!';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { 
        password: hashedPassword,
        isActive: true, // Asegurar que esté activo
      },
    });

    console.log('✅ Contraseña reseteada exitosamente\n');
    console.log('═'.repeat(50));
    console.log('📧 CREDENCIALES ACTUALIZADAS:');
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

checkDanielUser()
  .then(() => {
    console.log('✅ Proceso completado');
    process.exit(0);
  })
  .catch(() => {
    console.error('❌ Error en proceso');
    process.exit(1);
  });
