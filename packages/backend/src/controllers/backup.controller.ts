import { Request, Response, NextFunction } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import extract from 'extract-zip';
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

      const files = await Promise.all(
        fs.readdirSync(backupDir)
          .filter(f => f.startsWith('backup_') && (f.endsWith('.zip') || f.endsWith('.json')))
          .map(async filename => {
            const filepath = path.join(backupDir, filename);
            const stats = fs.statSync(filepath);
            
            let data: any = { timestamp: stats.mtime, data: {} };
            
            // Leer datos del backup
            if (filename.endsWith('.json')) {
              try {
                data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
              } catch (e) {
                console.error('Error leyendo JSON:', e);
              }
            } else if (filename.endsWith('.zip')) {
              try {
                // Extraer y leer el database.json del ZIP
                const tempExtractDir = path.join(backupDir, `temp_read_${Date.now()}`);
                await extract(filepath, { dir: tempExtractDir });
                
                const dbJsonPath = path.join(tempExtractDir, 'database.json');
                if (fs.existsSync(dbJsonPath)) {
                  data = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));
                }
                
                // Limpiar carpeta temporal
                fs.rmSync(tempExtractDir, { recursive: true, force: true });
              } catch (e) {
                console.error('Error leyendo ZIP:', e);
              }
            }

            return {
              filename,
              date: new Date(data.timestamp || stats.mtime).toLocaleString('es-ES'),
              size: stats.size >= 1024 * 1024 
                ? `${(stats.size / 1024 / 1024).toFixed(2)} MB` 
                : `${(stats.size / 1024).toFixed(2)} KB`,
              products: data.data?.products?.length || 0,
              users: data.data?.users?.length || 0,
              packs: data.data?.packs?.length || 0,
              timestamp: data.timestamp || stats.mtime,
              type: filename.endsWith('.zip') ? 'complete' : 'database'
            };
          })
      );

      const sortedFiles = files.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // No cachear esta respuesta
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      const response = {
        backups: sortedFiles,
        count: sortedFiles.length
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
      const backupFile = path.join(backupScript, `backup_${timestamp}.zip`);
      const tempDbFile = path.join(backupScript, `temp_${timestamp}.json`);

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
          extraCategories: await prisma.extraCategory.findMany(),
          products: await prisma.product.findMany(),
          productSpecifications: await prisma.productSpecification.findMany(),
          productComponents: await prisma.productComponent.findMany(),
          productPurchases: await prisma.productPurchase.findMany(),
          
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
          paymentInstallments: await prisma.paymentInstallment.findMany(),
          
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
          
          // Carritos de compra
          carts: await prisma.cart.findMany(),
          cartItems: await prisma.cartItem.findMany(),
          
          // API y seguridad
          apiKeys: await prisma.apiKey.findMany(),
          auditLogs: await prisma.auditLog.findMany()
        }
      };

      console.log('✅ Datos extraídos completamente');

      await prisma.$disconnect();

      // Guardar JSON temporal
      console.log('💾 Guardando datos temporales...');
      fs.writeFileSync(tempDbFile, JSON.stringify(backup, null, 2));

      // Crear archivo ZIP
      console.log('📦 Creando archivo ZIP con imágenes...');
      
      const output = fs.createWriteStream(backupFile);
      const archive = archiver('zip', { zlib: { level: 9 } });

      await new Promise<void>((resolve, reject) => {
        output.on('close', () => {
          // Borrar archivo temporal
          fs.unlinkSync(tempDbFile);
          
          console.log('✅ Backup ZIP creado:', backupFile);
          console.log('📁 Tamaño:', (archive.pointer() / 1024 / 1024).toFixed(2), 'MB');
          resolve();
        });

        archive.on('error', (err) => {
          reject(err);
        });

        archive.pipe(output);

        // Añadir el JSON de la base de datos
        archive.file(tempDbFile, { name: 'database.json' });

        // Añadir carpeta de imágenes de productos
        const uploadsProductsDir = path.join(__dirname, '../../uploads/products');
        if (fs.existsSync(uploadsProductsDir)) {
          archive.directory(uploadsProductsDir, 'uploads/products');
          console.log('📸 Incluyendo imágenes de productos...');
        }

        // Añadir carpeta de facturas
        const uploadsInvoicesDir = path.join(__dirname, '../../uploads/invoices');
        if (fs.existsSync(uploadsInvoicesDir)) {
          archive.directory(uploadsInvoicesDir, 'uploads/invoices');
          console.log('🧾 Incluyendo facturas...');
        }

        archive.finalize();
      });

      const response = {
        message: 'Backup completo creado exitosamente',
        timestamp: new Date().toISOString(),
        filename: `backup_${timestamp}.zip`,
        path: backupFile,
        includesImages: true
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

      let backupData: any;
      let tempExtractDir: string | null = null;

      // Detectar si es ZIP o JSON
      if (filename.endsWith('.zip')) {
        console.log('📦 Descomprimiendo backup ZIP...');
        tempExtractDir = path.join(__dirname, `../../../../backups/temp_${Date.now()}`);
        
        // Extraer ZIP
        await extract(backupPath, { dir: tempExtractDir });
        
        // Leer el database.json del ZIP
        const dbJsonPath = path.join(tempExtractDir, 'database.json');
        if (!fs.existsSync(dbJsonPath)) {
          throw new AppError(400, 'Archivo database.json no encontrado en el ZIP', 'INVALID_BACKUP');
        }
        backupData = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));
      } else {
        // Es JSON directo (backups antiguos)
        backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      }
      
      console.log('📊 Backup info:', {
        version: backupData.version,
        timestamp: backupData.timestamp,
        products: backupData.data?.products?.length || 0,
        users: backupData.data?.users?.length || 0,
        categories: backupData.data?.categories?.length || 0
      });
      
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
        await prisma.cartItem.deleteMany();
        await prisma.cart.deleteMany();
        await prisma.orderModification.deleteMany();
        await prisma.orderNote.deleteMany();
        await prisma.orderService.deleteMany();
        await prisma.orderItem.deleteMany();
        await prisma.paymentInstallment.deleteMany();
        await prisma.delivery.deleteMany();
        await prisma.payment.deleteMany();
        await prisma.invoice.deleteMany();
        await prisma.customInvoice.deleteMany();
        await prisma.order.deleteMany();
        await prisma.packItem.deleteMany();
        await prisma.pack.deleteMany();
        await prisma.productPurchase.deleteMany();
        await prisma.productSpecification.deleteMany();
        await prisma.productComponent.deleteMany();
        await prisma.review.deleteMany();
        await prisma.favorite.deleteMany();
        await prisma.product.deleteMany();
        await prisma.extraCategory.deleteMany();
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
          let count = 0;
          for (const item of dataArray) {
            try {
              await (prisma as any)[modelName].create({ data: item });
              count++;
            } catch (error: any) {
              console.error(`❌ Error restaurando ${modelName}:`, error.message);
              console.error('Dato problemático:', JSON.stringify(item, null, 2));
              throw new Error(`Error restaurando ${modelName}: ${error.message}`);
            }
          }
          return count;
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
        restored.others += await restoreSimple('extraCategory', backupData.data.extraCategories);
        restored.products = await restoreSimple('product', backupData.data.products);
        restored.others += await restoreSimple('productSpecification', backupData.data.productSpecifications);
        restored.others += await restoreSimple('productComponent', backupData.data.productComponents);
        restored.others += await restoreSimple('productPurchase', backupData.data.productPurchases);
        
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
        restored.others += await restoreSimple('paymentInstallment', backupData.data.paymentInstallments);
        
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
        
        // 14. Carritos de compra
        restored.others += await restoreSimple('cart', backupData.data.carts);
        restored.others += await restoreSimple('cartItem', backupData.data.cartItems);

        console.log('✅ Restauración de base de datos completada');

        await prisma.$disconnect();

        // Restaurar imágenes si es un backup ZIP
        if (tempExtractDir && filename.endsWith('.zip')) {
          console.log('📸 Restaurando imágenes...');
          
          const extractedUploadsDir = path.join(tempExtractDir, 'uploads');
          const targetUploadsDir = path.join(__dirname, '../../uploads');
          
          if (fs.existsSync(extractedUploadsDir)) {
            // Copiar productos
            const extractedProductsDir = path.join(extractedUploadsDir, 'products');
            const targetProductsDir = path.join(targetUploadsDir, 'products');
            
            if (fs.existsSync(extractedProductsDir)) {
              // Limpiar carpeta destino
              if (fs.existsSync(targetProductsDir)) {
                fs.rmSync(targetProductsDir, { recursive: true, force: true });
              }
              fs.mkdirSync(targetProductsDir, { recursive: true });
              
              // Copiar archivos
              const files = fs.readdirSync(extractedProductsDir);
              for (const file of files) {
                fs.copyFileSync(
                  path.join(extractedProductsDir, file),
                  path.join(targetProductsDir, file)
                );
              }
              console.log(`✅ ${files.length} imágenes de productos restauradas`);
            }
            
            // Copiar facturas
            const extractedInvoicesDir = path.join(extractedUploadsDir, 'invoices');
            const targetInvoicesDir = path.join(targetUploadsDir, 'invoices');
            
            if (fs.existsSync(extractedInvoicesDir)) {
              // Limpiar carpeta destino
              if (fs.existsSync(targetInvoicesDir)) {
                fs.rmSync(targetInvoicesDir, { recursive: true, force: true });
              }
              fs.mkdirSync(targetInvoicesDir, { recursive: true });
              
              // Copiar archivos
              const files = fs.readdirSync(extractedInvoicesDir);
              for (const file of files) {
                fs.copyFileSync(
                  path.join(extractedInvoicesDir, file),
                  path.join(targetInvoicesDir, file)
                );
              }
              console.log(`✅ ${files.length} facturas restauradas`);
            }
          }
          
          // Limpiar directorio temporal
          console.log('🧹 Limpiando archivos temporales...');
          fs.rmSync(tempExtractDir, { recursive: true, force: true });
        }

        console.log('✅ Restauración completada');

        res.json({
          message: 'Backup restaurado exitosamente',
          filename,
          restored: {
            users: backupData.data.users?.length || 0,
            products: backupData.data.products?.length || 0,
            categories: backupData.data.categories?.length || 0,
            packs: backupData.data.packs?.length || 0
          },
          imagesRestored: filename.endsWith('.zip')
        });
      } catch (error) {
        await prisma.$disconnect();
        
        // Limpiar directorio temporal en caso de error
        if (tempExtractDir && fs.existsSync(tempExtractDir)) {
          fs.rmSync(tempExtractDir, { recursive: true, force: true });
        }
        
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

      const stats = fs.statSync(backupPath);
      console.log('📥 Descargando backup:', {
        filename,
        size: stats.size,
        path: backupPath
      });

      // Configurar headers para descarga
      res.setHeader('Content-Type', filename.endsWith('.zip') ? 'application/zip' : 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', stats.size);

      // Enviar archivo usando stream
      const fileStream = fs.createReadStream(backupPath);
      fileStream.pipe(res);

      fileStream.on('error', (error) => {
        console.error('❌ Error enviando archivo:', error);
        next(error);
      });

      fileStream.on('end', () => {
        console.log('✅ Archivo enviado correctamente');
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Subir backup desde archivo local
   */
  async uploadBackup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      console.log('📤 Recibiendo archivo:', {
        hasFile: !!req.file,
        originalname: req.file?.originalname,
        size: req.file?.size,
        mimetype: req.file?.mimetype,
        path: req.file?.path
      });

      if (!req.file) {
        throw new AppError(400, 'No se proporcionó archivo', 'NO_FILE');
      }

      // Verificar que el archivo tiene contenido
      if (req.file.size === 0) {
        fs.unlinkSync(req.file.path);
        throw new AppError(400, 'El archivo está vacío', 'EMPTY_FILE');
      }

      const backupDir = path.join(__dirname, '../../../../backups/database');
      
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      // Validar que sea JSON o ZIP
      const filename = req.file.originalname;
      if (!filename.endsWith('.json') && !filename.endsWith('.zip')) {
        fs.unlinkSync(req.file.path);
        throw new AppError(400, 'Solo se aceptan archivos JSON o ZIP', 'INVALID_FORMAT');
      }

      // Generar nombre único si ya existe
      let finalFilename = `backup_${Date.now()}_${filename}`;
      const finalPath = path.join(backupDir, finalFilename);

      // Verificar que el archivo temporal existe y tiene contenido
      const tempStats = fs.statSync(req.file.path);
      console.log('📊 Archivo temporal:', {
        path: req.file.path,
        size: tempStats.size,
        exists: fs.existsSync(req.file.path)
      });

      // Mover archivo a la carpeta de backups
      fs.renameSync(req.file.path, finalPath);

      // Verificar que se movió correctamente
      const finalStats = fs.statSync(finalPath);
      console.log('✅ Backup subido:', {
        path: finalPath,
        size: finalStats.size,
        exists: fs.existsSync(finalPath)
      });

      // Verificar que el archivo está en la carpeta correcta
      const filesInDir = fs.readdirSync(backupDir);
      console.log('📁 Archivos en carpeta de backups:', filesInDir);
      console.log('🔍 Archivo subido está en la lista:', filesInDir.includes(finalFilename));

      res.json({
        message: 'Backup subido exitosamente',
        filename: finalFilename,
        size: finalStats.size,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // Limpiar archivo si hay error
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {
          // Ignorar error al limpiar
        }
      }
      next(error);
    }
  }
}

export const backupController = new BackupController();
