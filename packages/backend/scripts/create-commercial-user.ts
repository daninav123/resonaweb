import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createCommercialUser() {
  try {
    console.log('🔐 Configurando usuario comercial...\n');

    const email = 'comercial@resona.com';
    const password = 'Comercial123!';

    // Verificar si ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('⚠️  El usuario comercial ya existe');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Rol: ${existingUser.role}`);
      console.log(`   Estado: ${existingUser.isActive ? 'Activo' : 'Inactivo'}`);
      
      // Preguntar si quiere resetear la contraseña
      console.log('\n💡 Para resetear la contraseña, elimina el usuario primero y vuelve a ejecutar este script');
      console.log('   O actualiza manualmente en la BD\n');
      return;
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario comercial
    const commercial = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: 'Comercial',
        lastName: 'Resona',
        phone: '+34 613 881 415',
        role: 'COMMERCIAL',
        userLevel: 'STANDARD',
        isActive: true,
        emailVerified: true,
        acceptedTermsAt: new Date(),
        acceptedPrivacyAt: new Date(),
      }
    });

    console.log('✅ Usuario comercial creado exitosamente\n');
    console.log('📋 Credenciales:');
    console.log(`   Email: ${commercial.email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Rol: ${commercial.role}`);
    console.log(`   Nivel: ${commercial.userLevel}`);
    console.log(`   Estado: ${commercial.isActive ? 'Activo' : 'Inactivo'}`);
    console.log(`   ID: ${commercial.id}\n`);
    
    console.log('🔑 IMPORTANTE: Guarda estas credenciales de forma segura');
    console.log('   Las necesitarás para acceder al panel comercial\n');

  } catch (error) {
    console.error('❌ Error configurando usuario comercial:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createCommercialUser();
