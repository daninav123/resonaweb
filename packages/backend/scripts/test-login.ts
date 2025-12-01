import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function testLogin() {
  try {
    const email = 'admin@resona.com';
    const password = 'Admin123!@#';

    console.log('🔍 Buscando usuario:', email);
    
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error('❌ Usuario no encontrado');
      return;
    }

    console.log('✅ Usuario encontrado:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Nombre:', user.firstName, user.lastName);
    console.log('   Rol:', user.role);
    console.log('   Activo:', user.isActive);
    console.log('   Email verificado:', user.emailVerified);

    console.log('\n🔐 Probando contraseña...');
    const isValid = await bcrypt.compare(password, user.password);
    
    if (isValid) {
      console.log('✅ CONTRASEÑA CORRECTA - Login debería funcionar');
    } else {
      console.log('❌ CONTRASEÑA INCORRECTA');
      console.log('   Hash en DB:', user.password.substring(0, 20) + '...');
      
      // Intentar recrear el hash
      console.log('\n🔧 Recreando hash...');
      const newHash = await bcrypt.hash(password, 12);
      console.log('   Nuevo hash:', newHash.substring(0, 20) + '...');
      
      // Actualizar
      await prisma.user.update({
        where: { id: user.id },
        data: { password: newHash },
      });
      console.log('✅ Hash actualizado en la base de datos');
      
      // Verificar nuevamente
      const recheckUser = await prisma.user.findUnique({
        where: { email },
      });
      const recheckValid = await bcrypt.compare(password, recheckUser!.password);
      console.log('✅ Verificación después de actualizar:', recheckValid ? 'OK' : 'FALLO');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
