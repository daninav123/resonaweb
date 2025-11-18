import { Request, Response, NextFunction } from 'express';
import { shippingConfigService } from '../services/shipping-config.service';
import { AppError } from '../middleware/error.middleware';

interface AuthRequest extends Request {
  user?: any;
}

export class ShippingConfigController {
  /**
   * Get shipping configuration
   */
  async getConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const config = await shippingConfigService.getConfig();
      res.json(config);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update shipping configuration (Admin only)
   */
  async updateConfig(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')) {
        throw new AppError(403, 'Acceso denegado', 'FORBIDDEN');
      }

      const config = await shippingConfigService.updateConfig(req.body);
      
      res.json({
        message: 'Configuración actualizada exitosamente',
        config
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Calculate shipping cost based on distance
   */
  async calculateShipping(req: Request, res: Response, next: NextFunction) {
    try {
      const { distance, includeInstallation, products } = req.body;

      if (!distance || distance < 0) {
        throw new AppError(400, 'Distancia inválida', 'INVALID_DISTANCE');
      }

      // Validar formato de productos
      const productsData = Array.isArray(products) ? products : [];

      const result = await shippingConfigService.calculateShippingCost(
        Number(distance),
        Boolean(includeInstallation),
        productsData
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const shippingConfigController = new ShippingConfigController();
