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

      const scriptPath = path.join(__dirname, '../scripts/backup-now.js');
      
      await execAsync(`node "${scriptPath}"`);

      res.json({
        message: 'Backup creado exitosamente',
        timestamp: new Date().toISOString()
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
