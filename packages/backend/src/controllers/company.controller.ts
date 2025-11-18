import { Request, Response, NextFunction } from 'express';
import { companyService } from '../services/company.service';
import { AppError } from '../middleware/error.middleware';

interface AuthRequest extends Request {
  user?: any;
}

export class CompanyController {
  /**
   * Get company settings
   */
  async getSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const settings = await companyService.getSettings();
      res.json(settings);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update company settings (Admin only)
   */
  async updateSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const settings = await companyService.updateSettings(req.body);

      res.json({
        message: 'Configuración actualizada',
        settings,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const companyController = new CompanyController();
