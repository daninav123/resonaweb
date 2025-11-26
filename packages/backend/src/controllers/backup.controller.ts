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

      const backupDir = path.join(__dirname, '../../../backups/database');
      
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

      res.json({
        backups: files,
        count: files.length
      });
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
      const backupScript = path.join(__dirname, '../../../backups/database');
      
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

      // Extraer datos
      const backup = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {
          users: await prisma.user.findMany(),
          products: await prisma.product.findMany({
            include: {
              orderItems: true,
              packItems: true,
              reviews: true,
              favorites: true
            }
          }),
          categories: await prisma.category.findMany(),
          packs: await prisma.pack.findMany({
            include: {
              items: {
                include: {
                  product: true
                }
              }
            }
          }),
          orders: await prisma.order.findMany({
            include: {
              items: true,
              user: true
            }
          }),
          invoices: await prisma.invoice.findMany(),
          coupons: await prisma.coupon.findMany(),
          companySettings: await prisma.companySettings.findMany(),
          blogPosts: await prisma.blogPost.findMany()
        }
      };

      // Guardar backup
      fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));

      await prisma.$disconnect();

      console.log('✅ Backup creado:', backupFile);
      console.log('📁 Tamaño:', (fs.statSync(backupFile).size / 1024).toFixed(2), 'KB');

      res.json({
        message: 'Backup creado exitosamente',
        timestamp: new Date().toISOString(),
        filename: `backup_${timestamp}.json`,
        path: backupFile
      });
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

      const backupPath = path.join(__dirname, '../../../backups/database', filename);

      if (!fs.existsSync(backupPath)) {
        throw new AppError(404, 'Backup no encontrado', 'BACKUP_NOT_FOUND');
      }

      const scriptPath = path.join(__dirname, '../scripts/restore-backup.js');
      
      await execAsync(`node "${scriptPath}" "${filename}"`);

      res.json({
        message: 'Backup restaurado exitosamente',
        filename
      });
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

      const backupPath = path.join(__dirname, '../../../backups/database', filename);

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
