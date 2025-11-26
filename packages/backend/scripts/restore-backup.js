const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreBackup(backupFileName) {
  console.log('\n🔄 RESTAURANDO BACKUP DE BASE DE DATOS\n');
  console.log('═'.repeat(60));
  
  const backupDir = path.join(__dirname, '../../../backups/database');
  const backupFile = path.join(backupDir, backupFileName);

  if (!fs.existsSync(backupFile)) {
    console.error(`❌ Backup no encontrado: ${backupFile}`);
    process.exit(1);
  }

  try {
    console.log(`📂 Leyendo backup: ${backupFileName}\n`);
    const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'));

    console.log(`📅 Fecha del backup: ${new Date(backup.timestamp).toLocaleString()}`);
    console.log(`📊 Contenido:`);
    console.log(`   👥 Usuarios: ${backup.data.users.length}`);
    console.log(`   📦 Productos: ${backup.data.products.length}`);
    console.log(`   📁 Categorías: ${backup.data.categories.length}`);
    console.log(`   📦 Packs: ${backup.data.packs.length}`);
    console.log(`   🛍️  Pedidos: ${backup.data.orders.length}`);
    console.log(`   🧾 Facturas: ${backup.data.invoices.length}\n`);

    console.log('⚠️  ADVERTENCIA: Esto BORRARÁ todos los datos actuales.\n');
    console.log('Presiona Ctrl+C para cancelar...\n');
    
    // Esperar 3 segundos
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('🗑️  Limpiando datos actuales...\n');

    // Limpiar en orden correcto
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.packItem.deleteMany();
    await prisma.pack.deleteMany();
    await prisma.review.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    await prisma.coupon.deleteMany();
    await prisma.companySettings.deleteMany();
    await prisma.blogPost.deleteMany();

    console.log('✅ Datos limpiados\n');
    console.log('📥 Restaurando datos...\n');

    // Restaurar categorías primero
    if (backup.data.categories.length > 0) {
      for (const cat of backup.data.categories) {
        await prisma.category.create({ data: cat });
      }
      console.log(`✅ ${backup.data.categories.length} categorías restauradas`);
    }

    // Restaurar usuarios
    if (backup.data.users.length > 0) {
      for (const user of backup.data.users) {
        const { orderItems, orders, reviews, favorites, ...userData } = user;
        await prisma.user.create({ data: userData });
      }
      console.log(`✅ ${backup.data.users.length} usuarios restaurados`);
    }

    // Restaurar productos
    if (backup.data.products.length > 0) {
      for (const product of backup.data.products) {
        const { orderItems, packItems, reviews, favorites, ...productData } = product;
        await prisma.product.create({ data: productData });
      }
      console.log(`✅ ${backup.data.products.length} productos restaurados`);
    }

    // Restaurar packs
    if (backup.data.packs.length > 0) {
      for (const pack of backup.data.packs) {
        const { items, ...packData } = pack;
        await prisma.pack.create({
          data: {
            ...packData,
            items: {
              create: items.map(item => ({
                productId: item.productId,
                quantity: item.quantity
              }))
            }
          }
        });
      }
      console.log(`✅ ${backup.data.packs.length} packs restaurados`);
    }

    // Restaurar cupones
    if (backup.data.coupons.length > 0) {
      for (const coupon of backup.data.coupons) {
        await prisma.coupon.create({ data: coupon });
      }
      console.log(`✅ ${backup.data.coupons.length} cupones restaurados`);
    }

    // Restaurar company settings
    if (backup.data.companySettings.length > 0) {
      for (const settings of backup.data.companySettings) {
        await prisma.companySettings.create({ data: settings });
      }
      console.log(`✅ ${backup.data.companySettings.length} configuraciones restauradas`);
    }

    // Restaurar blog posts
    if (backup.data.blogPosts.length > 0) {
      for (const post of backup.data.blogPosts) {
        await prisma.blogPost.create({ data: post });
      }
      console.log(`✅ ${backup.data.blogPosts.length} posts restaurados`);
    }

    console.log('\n═'.repeat(60));
    console.log('\n✅ RESTAURACIÓN COMPLETADA EXITOSAMENTE\n');
    console.log(`🕐 ${new Date().toLocaleString()}\n`);

  } catch (error) {
    console.error('\n❌ Error durante la restauración:', error.message);
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

const backupFileName = process.argv[2];

if (!backupFileName) {
  console.error('❌ Uso: node restore-backup.js <nombre-del-backup.json>');
  process.exit(1);
}

restoreBackup(backupFileName);
