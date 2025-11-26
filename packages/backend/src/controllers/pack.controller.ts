import { Request, Response, NextFunction } from 'express';
import { packService } from '../services/pack.service';
import { AppError } from '../middleware/error.middleware';

interface AuthRequest extends Request {
  user?: any;
}

class PackController {
  /**
   * Obtener todos los packs activos
   */
  async getPacks(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const packs = await packService.getActivePacks(start, end);
      
      res.json({ packs });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener pack por ID
   */
  async getPackById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const pack = await packService.getPackById(id);
      
      res.json({ pack });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verificar disponibilidad de pack
   */
  async checkAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { startDate, endDate, quantity } = req.body;

      if (!startDate || !endDate) {
        throw new AppError(400, 'Fechas requeridas', 'MISSING_DATES');
      }

      const availability = await packService.checkAvailability(
        id,
        new Date(startDate),
        new Date(endDate),
        quantity || 1
      );
      
      res.json(availability);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener cantidad máxima disponible de un pack
   */
  async getMaxAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw new AppError(400, 'Fechas requeridas', 'MISSING_DATES');
      }

      const result = await packService.getPackMaxAvailability(
        id,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crear pack (ADMIN)
   */
  async createPack(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')) {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const pack = await packService.createPack(req.body);
      
      res.status(201).json({
        message: 'Pack creado correctamente',
        pack,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar pack (ADMIN)
   */
  async updatePack(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')) {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const { id } = req.params;
      const pack = await packService.updatePack(id, req.body);
      
      res.json({
        message: 'Pack actualizado correctamente',
        pack,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar pack (ADMIN)
   */
  async deletePack(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')) {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const { id } = req.params;
      await packService.deletePack(id);
      
      res.json({
        message: 'Pack eliminado correctamente',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const packController = new PackController();
