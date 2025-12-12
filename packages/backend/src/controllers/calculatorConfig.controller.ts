import { Request, Response, NextFunction } from 'express';
import { calculatorConfigService } from '../services/calculatorConfig.service';
import { AppError } from '../middleware/error.middleware';
import logger from '../utils/logger';

interface AuthRequest extends Request {
  user?: any;
}

class CalculatorConfigController {
  /**
   * GET /api/v1/calculator-config
   * Obtener configuración de la calculadora (ENDPOINT PÚBLICO)
   * IMPORTANTE: Filtra eventos con isActive === false antes de devolver
   */
  async getConfig(req: AuthRequest, res: Response, next: NextFunction) {
    console.log('🌐 GET /calculator-config - Endpoint PÚBLICO accedido');
    try {
      const config = await calculatorConfigService.getConfig();

      if (!config) {
        return res.status(404).json({
          error: 'No hay configuración guardada',
          message: 'Usa POST para crear una configuración'
        });
      }

      logger.info('Configuración de calculadora obtenida');
      res.json(config);
    } catch (error) {
      logger.error('Error obteniendo configuración:', error);
      next(error);
    }
  }

  /**
   * POST /api/v1/calculator-config
   * Guardar configuración de la calculadora
   */
  async saveConfig(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Verificar que sea admin
      if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')) {
        throw new AppError(403, 'Solo administradores pueden guardar la configuración', 'FORBIDDEN');
      }

      const { config } = req.body;

      if (!config) {
        throw new AppError(400, 'Configuración requerida', 'MISSING_CONFIG');
      }

      const savedConfig = await calculatorConfigService.saveConfig(config);

      logger.info('Configuración de calculadora guardada por admin');
      res.json({
        message: 'Configuración guardada correctamente',
        config: savedConfig
      });
    } catch (error) {
      logger.error('Error guardando configuración:', error);
      next(error);
    }
  }

  /**
   * POST /api/v1/calculator-config/reset
   * Resetear configuración a valores por defecto
   */
  async resetConfig(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Verificar que sea admin
      if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')) {
        throw new AppError(403, 'Solo administradores pueden resetear la configuración', 'FORBIDDEN');
      }

      const { defaultConfig } = req.body;

      if (!defaultConfig) {
        throw new AppError(400, 'Configuración por defecto requerida', 'MISSING_DEFAULT_CONFIG');
      }

      const resetConfig = await calculatorConfigService.resetConfig(defaultConfig);

      logger.info('Configuración de calculadora reseteada por admin');
      res.json({
        message: 'Configuración reseteada a valores por defecto',
        config: resetConfig
      });
    } catch (error) {
      logger.error('Error reseteando configuración:', error);
      next(error);
    }
  }
}

export const calculatorConfigController = new CalculatorConfigController();
