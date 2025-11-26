const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backupDatabase() {
  console.log('\n💾 CREANDO BACKUP DE BASE DE DATOS\n');
  console.log('═'.repeat(60));
  
  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
  const backupDir = path.join(__dirname, '../../../backups/database');
  const backupFile = path.join(backupDir, `backup_${timestamp}.json`);

  try {
    // Asegurar que existe el directorio
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    console.log('📊 Extrayendo TODOS los datos de la base de datos...\n');

    // Extraer TODOS los datos
    const backup = {
      timestamp: new Date().toISOString(),
      version: '2.0',
      data: {
        // Usuarios y datos relacionados
        users: await prisma.user.findMany(),
        billingData: await prisma.billingData.findMany(),
        userDiscounts: await prisma.userDiscount.findMany(),
        customerNotes: await prisma.customerNote.findMany(),
        
        // Catálogo de productos
        categories: await prisma.category.findMany(),
        products: await prisma.product.findMany(),
        productSpecifications: await prisma.productSpecification.findMany(),
        productComponents: await prisma.productComponent.findMany(),
        
        // Packs
        packs: await prisma.pack.findMany(),
        packItems: await prisma.packItem.findMany(),
        
        // Pedidos y relacionados
        orders: await prisma.order.findMany(),
        orderItems: await prisma.orderItem.findMany(),
        orderNotes: await prisma.orderNote.findMany(),
        orderServices: await prisma.orderService.findMany(),
        orderModifications: await prisma.orderModification.findMany(),
        
        // Entregas
        deliveries: await prisma.delivery.findMany(),
        
        // Facturas y pagos
        invoices: await prisma.invoice.findMany(),
        customInvoices: await prisma.customInvoice.findMany(),
        payments: await prisma.payment.findMany(),
        
        // Servicios
        services: await prisma.service.findMany(),
        shippingRates: await prisma.shippingRate.findMany(),
        
        // Reviews y favoritos
        reviews: await prisma.review.findMany(),
        favorites: await prisma.favorite.findMany(),
        
        // Blog
        blogPosts: await prisma.blogPost.findMany(),
        blogCategories: await prisma.blogCategory.findMany(),
        blogTags: await prisma.blogTag.findMany(),
        
        // Cupones
        coupons: await prisma.coupon.findMany(),
        couponUsages: await prisma.couponUsage.findMany(),
        
        // Configuración
        companySettings: await prisma.companySettings.findMany(),
        shippingConfig: await prisma.shippingConfig.findMany(),
        systemConfig: await prisma.systemConfig.findMany(),
        
        // Notificaciones
        notifications: await prisma.notification.findMany(),
        emailNotifications: await prisma.emailNotification.findMany(),
        
        // Analytics y métricas
        productInteractions: await prisma.productInteraction.findMany(),
        productDemandAnalytics: await prisma.productDemandAnalytics.findMany(),
        
        // Solicitudes de presupuesto
        quoteRequests: await prisma.quoteRequest.findMany(),
        
        // API y seguridad
        apiKeys: await prisma.apiKey.findMany(),
        auditLogs: await prisma.auditLog.findMany()
      }
    };

    console.log('✅ Datos extraídos:');
    console.log(`   👥 Usuarios: ${backup.data.users.length}`);
    console.log(`   📦 Productos: ${backup.data.products.length}`);
    console.log(`   📁 Categorías: ${backup.data.categories.length}`);
    console.log(`   📦 Packs: ${backup.data.packs.length}`);
    console.log(`   🛍️  Pedidos: ${backup.data.orders.length}`);
    console.log(`   🧾 Facturas: ${backup.data.invoices.length}`);
    console.log(`   🎫 Cupones: ${backup.data.coupons.length}`);
    console.log(`   📰 Blog Posts: ${backup.data.blogPosts.length}\n`);

    // Guardar backup
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));

    const fileSize = (fs.statSync(backupFile).size / 1024 / 1024).toFixed(2);
    
    console.log('═'.repeat(60));
    console.log('\n✅ BACKUP COMPLETADO\n');
    console.log(`📁 Archivo: ${backupFile}`);
    console.log(`💾 Tamaño: ${fileSize} MB`);
    console.log(`🕐 Fecha: ${new Date().toLocaleString()}\n`);

    // Mantener solo los últimos 20 backups
    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('backup_') && f.endsWith('.json'))
      .sort()
      .reverse();

    if (files.length > 20) {
      console.log('🧹 Limpiando backups antiguos...');
      files.slice(20).forEach(f => {
        fs.unlinkSync(path.join(backupDir, f));
        console.log(`   Eliminado: ${f}`);
      });
      console.log('');
    }

    console.log('═'.repeat(60));
    console.log('\n💡 Para restaurar este backup:\n');
    console.log(`   node scripts/restore-backup.js ${path.basename(backupFile)}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

backupDatabase();
