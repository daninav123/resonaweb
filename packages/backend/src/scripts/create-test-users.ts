/**
 * Crea (o actualiza) 2 usuarios de prueba usando SQL directo
 * para evitar incompatibilidades entre el schema Prisma y la BDD real.
 *
 * Seguro para usar contra prod: los emails .test están reservados por RFC 2606,
 * no colisionan con cuentas reales.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();

const users = [
  {
    email: 'admin@resona.test',
    password: 'admin1234',
    firstName: 'Admin',
    lastName: 'Resona',
    role: 'SUPERADMIN',
    label: 'Panel admin (gestion.resonaevents.com → http://localhost:3002)',
  },
  {
    email: 'cliente@resona.test',
    password: 'cliente1234',
    firstName: 'Cliente',
    lastName: 'Prueba',
    role: 'CLIENT',
    label: 'Rent / Events como cliente',
  },
];

async function main() {
  console.log('\n=== Creando/actualizando usuarios de prueba (SQL directo) ===\n');

  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, 12);
    const id = crypto.randomUUID();
    const email = u.email.toLowerCase();

    // Intenta INSERT, si conflict en email hace UPDATE del password y role
    await prisma.$executeRawUnsafe(
      `
      INSERT INTO "User" (id, email, password, "firstName", "lastName", role, "userLevel", "isActive", "emailVerified", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6::"UserRole", 'STANDARD'::"UserLevel", true, true, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE
        SET password = EXCLUDED.password,
            "firstName" = EXCLUDED."firstName",
            "lastName" = EXCLUDED."lastName",
            role = EXCLUDED.role,
            "isActive" = true,
            "emailVerified" = true,
            "updatedAt" = NOW()
      `,
      id,
      email,
      hashed,
      u.firstName,
      u.lastName,
      u.role,
    );

    console.log(`✓ ${u.label}`);
    console.log(`  email:    ${u.email}`);
    console.log(`  password: ${u.password}`);
    console.log(`  role:     ${u.role}\n`);
  }

  console.log('Listo. Usa esas credenciales para probar las apps.\n');
}

main()
  .catch((e) => {
    console.error('Error:', e.message || e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
