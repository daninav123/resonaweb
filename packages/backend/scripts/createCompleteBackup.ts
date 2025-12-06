import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

const prisma = new PrismaClient();

async function createCompleteBackup() {
  try {
    console.log('🚀 Creando BACKUP COMPLETO 100%...\n');

    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
    const backupDir = path.join(__dirname, '../../../../backups/database');
    const backupFile = path.join(backupDir, `backup_${timestamp}.zip`);
    const tempDbFile = path.join(backupDir, `temp_${timestamp}.json`);

    // Crear directorio si no existe
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    console.log('📊 Extrayendo TODOS los datos de la BD...\n');

    const backup = {
      timestamp: new Date().toISOString(),
      version: '3.0',
      data: {
        // ===== CONFIGURACIÓN DEL SISTEMA =====
        systemConfig: await prisma.systemConfig.findMany(),
        companySettings: await prisma.companySettings.findMany(),
        shippingConfig: await prisma.shippingConfig.findMany(),

        // ===== USUARIOS =====
        users: await prisma.user.findMany(),
        billingData: await prisma.billingData.findMany(),
        userDiscounts: await prisma.userDiscount.findMany(),
        customerNotes: await prisma.customerNote.findMany(),

        // ===== CATÁLOGO =====
        categories: await prisma.category.findMany(),
        extraCategories: await prisma.extraCategory.findMany(),
        products: await prisma.product.findMany(),
        productSpecifications: await prisma.productSpecification.findMany(),
        productComponents: await prisma.productComponent.findMany(),
        productPurchases: await prisma.productPurchase.findMany(),

        // ===== PACKS Y MONTAJES =====
        packs: await prisma.pack.findMany(),
        packItems: await prisma.packItem.findMany(),

        // ===== PEDIDOS =====
        orders: await prisma.order.findMany(),
        orderItems: await prisma.orderItem.findMany(),
        orderNotes: await prisma.orderNote.findMany(),
        orderServices: await prisma.orderService.findMany(),
        orderModifications: await prisma.orderModification.findMany(),

        // ===== ENTREGAS =====
        deliveries: await prisma.delivery.findMany(),

        // ===== FACTURAS Y PAGOS =====
        invoices: await prisma.invoice.findMany(),
        customInvoices: await prisma.customInvoice.findMany(),
        payments: await prisma.payment.findMany(),
        paymentInstallments: await prisma.paymentInstallment.findMany(),

        // ===== SERVICIOS =====
        services: await prisma.service.findMany(),
        shippingRates: await prisma.shippingRate.findMany(),

        // ===== REVIEWS Y FAVORITOS =====
        reviews: await prisma.review.findMany(),
        favorites: await prisma.favorite.findMany(),

        // ===== BLOG =====
        blogPosts: await prisma.blogPost.findMany(),
        blogCategories: await prisma.blogCategory.findMany(),
        blogTags: await prisma.blogTag.findMany(),

        // ===== CUPONES =====
        coupons: await prisma.coupon.findMany(),
        couponUsages: await prisma.couponUsage.findMany(),

        // ===== NOTIFICACIONES =====
        notifications: await prisma.notification.findMany(),
        emailNotifications: await prisma.emailNotification.findMany(),

        // ===== ANALYTICS =====
        productInteractions: await prisma.productInteraction.findMany(),
        productDemandAnalytics: await prisma.productDemandAnalytics.findMany(),

        // ===== OTROS =====
        quoteRequests: await prisma.quoteRequest.findMany(),
        carts: await prisma.cart.findMany(),
        cartItems: await prisma.cartItem.findMany(),
        apiKeys: await prisma.apiKey.findMany(),
        auditLogs: await prisma.auditLog.findMany()
      }
    };

    // Mostrar resumen
    console.log('📊 Resumen del backup:');
    let totalRecords = 0;
    Object.entries(backup.data).forEach(([key, value]: [string, any]) => {
      const count = Array.isArray(value) ? value.length : 0;
      totalRecords += count;
      if (count > 0) {
        console.log(`   ✅ ${key}: ${count} registros`);
      }
    });

    console.log(`\n📈 TOTAL: ${totalRecords} registros\n`);

    await prisma.$disconnect();

    // Guardar JSON
    console.log('💾 Guardando JSON...');
    fs.writeFileSync(tempDbFile, JSON.stringify(backup, null, 2));

    // Crear ZIP
    console.log('📦 Creando archivo ZIP...');

    const output = fs.createWriteStream(backupFile);
    const archive = archiver('zip', { zlib: { level: 9 } });

    await new Promise<void>((resolve, reject) => {
      output.on('close', () => {
        fs.unlinkSync(tempDbFile);
        console.log(`✅ Backup creado: ${backupFile}`);
        console.log(`📊 Tamaño: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
        resolve();
      });

      archive.on('error', reject);
      archive.pipe(output);

      // Añadir JSON
      archive.file(tempDbFile, { name: 'database.json' });

      // Añadir imágenes
      const uploadsProductsDir = path.join(__dirname, '../../uploads/products');
      if (fs.existsSync(uploadsProductsDir)) {
        archive.directory(uploadsProductsDir, 'uploads/products');
        console.log('📸 Incluyendo imágenes de productos...');
      }

      // Añadir facturas
      const uploadsInvoicesDir = path.join(__dirname, '../../uploads/invoices');
      if (fs.existsSync(uploadsInvoicesDir)) {
        archive.directory(uploadsInvoicesDir, 'uploads/invoices');
        console.log('🧾 Incluyendo facturas...');
      }

      archive.finalize();
    });

    console.log('\n✅ BACKUP COMPLETO CREADO EXITOSAMENTE');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createCompleteBackup();
