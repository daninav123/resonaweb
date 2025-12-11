import { Request, Response, NextFunction } from 'express';
import { GdprService } from '../services/gdpr.service';
import { logger } from '../utils/logger';

const gdprService = new GdprService();

export class GdprController {
  /**
   * RGPD: Descargar todos los datos del usuario (Derecho de Portabilidad)
   */
  async downloadMyData(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado',
        });
      }

      logger.info(`📥 Usuario ${userId} solicitó descarga de datos RGPD`);

      const userData = await gdprService.getUserData(userId);

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="mis-datos-resona-${new Date().toISOString().split('T')[0]}.json"`
      );

      return res.status(200).json(userData);
    } catch (error) {
      logger.error('Error al descargar datos RGPD:', error);
      next(error);
    }
  }

  /**
   * RGPD: Obtener resumen de datos del usuario
   */
  async getMyDataSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado',
        });
      }

      const summary = await gdprService.getUserDataSummary(userId);

      return res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      logger.error('Error al obtener resumen RGPD:', error);
      next(error);
    }
  }

  /**
   * RGPD: Actualizar consentimientos del usuario
   */
  async updateConsents(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { marketingConsent } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado',
        });
      }

      logger.info(`🔄 Usuario ${userId} actualizó consentimientos RGPD`);

      await gdprService.updateConsents(userId, { marketingConsent });

      return res.status(200).json({
        success: true,
        message: 'Consentimientos actualizados correctamente',
      });
    } catch (error) {
      logger.error('Error al actualizar consentimientos:', error);
      next(error);
    }
  }

  /**
   * RGPD: Solicitar eliminación de cuenta (Derecho de Supresión)
   */
  async requestAccountDeletion(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { password, reason } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado',
        });
      }

      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Debes confirmar tu contraseña',
        });
      }

      logger.warn(`⚠️ Usuario ${userId} solicitó eliminación de cuenta RGPD`);

      // Verificar contraseña y eliminar cuenta
      await gdprService.deleteUserAccount(userId, password, reason);

      // Limpiar sesión
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      return res.status(200).json({
        success: true,
        message: 'Tu cuenta ha sido eliminada correctamente. Lamentamos verte partir.',
      });
    } catch (error: any) {
      logger.error('Error al eliminar cuenta:', error);
      
      if (error.message === 'INVALID_PASSWORD') {
        return res.status(401).json({
          success: false,
          message: 'Contraseña incorrecta',
        });
      }

      if (error.message === 'HAS_ACTIVE_ORDERS') {
        return res.status(400).json({
          success: false,
          message: 'No puedes eliminar tu cuenta mientras tengas pedidos activos. Contacta con soporte.',
        });
      }

      next(error);
    }
  }

  /**
   * RGPD: Obtener historial de consentimientos
   */
  async getConsentHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado',
        });
      }

      const history = await gdprService.getConsentHistory(userId);

      return res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error) {
      logger.error('Error al obtener historial de consentimientos:', error);
      next(error);
    }
  }
}
