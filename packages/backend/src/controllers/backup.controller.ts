import { Request, Response, NextFunction } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { AppError } from '../middleware/error.middleware';

const execAsync = promisify(exec);

interface AuthRequest extends Request {
  user?: any;
}

class BackupController {
  /**
   * Listar backups disponibles
   */
  async listBackups(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const backupDir = path.join(__dirname, '../../../../backups/database');
      
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const files = fs.readdirSync(backupDir)
        .filter(f => f.startsWith('backup_') && f.endsWith('.json'))
        .map(filename => {
          const filepath = path.join(backupDir, filename);
          const stats = fs.statSync(filepath);
          const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));

          return {
            filename,
            date: new Date(data.timestamp).toLocaleString('es-ES'),
            size: `${(stats.size / 1024).toFixed(2)} KB`,
            products: data.data.products?.length || 0,
            users: data.data.users?.length || 0,
            packs: data.data.packs?.length || 0,
            timestamp: data.timestamp
          };
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // No cachear esta respuesta
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      const response = {
        backups: files,
        count: files.length
      };

      console.log('📋 Enviando lista de backups:', response);

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crear nuevo backup
   */
  async createBackup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      // Ejecutar script de backup directamente usando require  
      const backupScript = path.join(__dirname, '../../../../backups/database');
      
      // Asegurar que existe el directorio
      if (!fs.existsSync(backupScript)) {
        fs.mkdirSync(backupScript, { recursive: true });
      }

      // Importar y ejecutar la función de backup
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const now = new Date();
      const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
      const backupFile = path.join(backupScript, `backup_${timestamp}.json`);

      // Extraer TODOS los datos de la base de datos
      console.log('📊 Extrayendo todos los datos...');
      
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

      console.log('✅ Datos extraídos completamente');

      // Guardar backup
      fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));

      await prisma.$disconnect();

      console.log('✅ Backup creado:', backupFile);
      console.log('📁 Tamaño:', (fs.statSync(backupFile).size / 1024).toFixed(2), 'KB');

      const response = {
        message: 'Backup creado exitosamente',
        timestamp: new Date().toISOString(),
        filename: `backup_${timestamp}.json`,
        path: backupFile
      };

      console.log('📤 Enviando respuesta:', response);

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Restaurar backup
   */
  async restoreBackup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const { filename } = req.body;

      if (!filename) {
        throw new AppError(400, 'Filename requerido', 'MISSING_FILENAME');
      }

      const backupPath = path.join(__dirname, '../../../../backups/database', filename);

      if (!fs.existsSync(backupPath)) {
        throw new AppError(404, 'Backup no encontrado', 'BACKUP_NOT_FOUND');
      }

      console.log('🔄 Restaurando backup:', backupPath);

      // Leer backup
      const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      try {
        console.log('🗑️  Limpiando datos actuales...');

        // Limpiar en orden correcto para evitar errores de foreign key
        // Primero las tablas dependientes
        await prisma.auditLog.deleteMany();
        await prisma.couponUsage.deleteMany();
        await prisma.productInteraction.deleteMany();
        await prisma.productDemandAnalytics.deleteMany();
        await prisma.emailNotification.deleteMany();
        await prisma.notification.deleteMany();
        await prisma.customerNote.deleteMany();
        await prisma.quoteRequest.deleteMany();
        await prisma.orderModification.deleteMany();
        await prisma.orderNote.deleteMany();
        await prisma.orderService.deleteMany();
        await prisma.orderItem.deleteMany();
        await prisma.delivery.deleteMany();
        await prisma.payment.deleteMany();
        await prisma.invoice.deleteMany();
        await prisma.customInvoice.deleteMany();
        await prisma.order.deleteMany();
        await prisma.packItem.deleteMany();
        await prisma.pack.deleteMany();
        await prisma.productSpecification.deleteMany();
        await prisma.productComponent.deleteMany();
        await prisma.review.deleteMany();
        await prisma.favorite.deleteMany();
        await prisma.product.deleteMany();
        await prisma.category.deleteMany();
        await prisma.blogPost.deleteMany();
        await prisma.blogCategory.deleteMany();
        await prisma.blogTag.deleteMany();
        await prisma.service.deleteMany();
        await prisma.shippingRate.deleteMany();
        await prisma.coupon.deleteMany();
        await prisma.userDiscount.deleteMany();
        await prisma.billingData.deleteMany();
        await prisma.user.deleteMany();
        await prisma.apiKey.deleteMany();
        await prisma.companySettings.deleteMany();
        await prisma.shippingConfig.deleteMany();
        await prisma.systemConfig.deleteMany();

        console.log('✅ Datos limpiados');
        console.log('📥 Restaurando datos...');

        // Función helper para restaurar sin relaciones
        const restoreSimple = async (modelName: string, dataArray: any[]) => {
          if (!dataArray?.length) return 0;
          for (const item of dataArray) {
            await (prisma as any)[modelName].create({ data: item });
          }
          return dataArray.length;
        };

        let restored = {
          categories: 0,
          users: 0,
          products: 0,
          packs: 0,
          orders: 0,
          others: 0
        };

        // 1. Configuración del sistema (primero)
        restored.others += await restoreSimple('systemConfig', backupData.data.systemConfig);
        restored.others += await restoreSimple('companySettings', backupData.data.companySettings);
        restored.others += await restoreSimple('shippingConfig', backupData.data.shippingConfig);
        
        // 2. Usuarios y datos relacionados
        restored.users = await restoreSimple('user', backupData.data.users);
        restored.others += await restoreSimple('billingData', backupData.data.billingData);
        restored.others += await restoreSimple('userDiscount', backupData.data.userDiscounts);
        restored.others += await restoreSimple('apiKey', backupData.data.apiKeys);
        
        // 3. Catálogo
        restored.categories = await restoreSimple('category', backupData.data.categories);
        restored.products = await restoreSimple('product', backupData.data.products);
        restored.others += await restoreSimple('productSpecification', backupData.data.productSpecifications);
        restored.others += await restoreSimple('productComponent', backupData.data.productComponents);
        
        // 4. Blog
        restored.others += await restoreSimple('blogCategory', backupData.data.blogCategories);
        restored.others += await restoreSimple('blogTag', backupData.data.blogTags);
        restored.others += await restoreSimple('blogPost', backupData.data.blogPosts);
        
        // 5. Servicios y tarifas
        restored.others += await restoreSimple('service', backupData.data.services);
        restored.others += await restoreSimple('shippingRate', backupData.data.shippingRates);
        
        // 6. Packs
        restored.packs = await restoreSimple('pack', backupData.data.packs);
        restored.others += await restoreSimple('packItem', backupData.data.packItems);
        
        // 7. Reviews y favoritos
        restored.others += await restoreSimple('review', backupData.data.reviews);
        restored.others += await restoreSimple('favorite', backupData.data.favorites);
        
        // 8. Cupones
        restored.others += await restoreSimple('coupon', backupData.data.coupons);
        restored.others += await restoreSimple('couponUsage', backupData.data.couponUsages);
        
        // 9. Pedidos y relacionados
        restored.orders = await restoreSimple('order', backupData.data.orders);
        restored.others += await restoreSimple('orderItem', backupData.data.orderItems);
        restored.others += await restoreSimple('orderNote', backupData.data.orderNotes);
        restored.others += await restoreSimple('orderService', backupData.data.orderServices);
        restored.others += await restoreSimple('orderModification', backupData.data.orderModifications);
        restored.others += await restoreSimple('delivery', backupData.data.deliveries);
        
        // 10. Facturas y pagos
        restored.others += await restoreSimple('invoice', backupData.data.invoices);
        restored.others += await restoreSimple('customInvoice', backupData.data.customInvoices);
        restored.others += await restoreSimple('payment', backupData.data.payments);
        
        // 11. Notificaciones
        restored.others += await restoreSimple('notification', backupData.data.notifications);
        restored.others += await restoreSimple('emailNotification', backupData.data.emailNotifications);
        restored.others += await restoreSimple('customerNote', backupData.data.customerNotes);
        
        // 12. Analytics
        restored.others += await restoreSimple('productInteraction', backupData.data.productInteractions);
        restored.others += await restoreSimple('productDemandAnalytics', backupData.data.productDemandAnalytics);
        
        // 13. Otros
        restored.others += await restoreSimple('quoteRequest', backupData.data.quoteRequests);
        restored.others += await restoreSimple('auditLog', backupData.data.auditLogs);

        console.log('✅ Restauración completada');

        await prisma.$disconnect();

        res.json({
          message: 'Backup restaurado exitosamente',
          filename,
          restored: {
            users: backupData.data.users?.length || 0,
            products: backupData.data.products?.length || 0,
            categories: backupData.data.categories?.length || 0,
            packs: backupData.data.packs?.length || 0
          }
        });
      } catch (error) {
        await prisma.$disconnect();
        throw error;
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Descargar backup
   */
  async downloadBackup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const { filename } = req.params;

      if (!filename) {
        throw new AppError(400, 'Filename requerido', 'MISSING_FILENAME');
      }

      const backupPath = path.join(__dirname, '../../../../backups/database', filename);

      if (!fs.existsSync(backupPath)) {
        throw new AppError(404, 'Backup no encontrado', 'BACKUP_NOT_FOUND');
      }

      res.download(backupPath, filename);
    } catch (error) {
      next(error);
    }
  }
}

export const backupController = new BackupController();
