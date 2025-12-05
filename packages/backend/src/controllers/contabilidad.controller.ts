import { Request, Response, NextFunction } from 'express';
import { contabilidadService } from '../services/contabilidad.service';
import { logger } from '../utils/logger';

export class ContabilidadController {
  /**
   * GET /api/v1/contabilidad/summary
   * Obtener resumen financiero
   */
  async getFinancialSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const period = (req.query.period as 'month' | 'quarter' | 'year') || 'month';

      if (!['month', 'quarter', 'year'].includes(period)) {
        return res.status(400).json({
          error: 'Invalid period. Must be month, quarter, or year',
        });
      }

      const summary = await contabilidadService.getFinancialSummary(period);

      logger.info(`Financial summary retrieved for period: ${period}`);
      res.json(summary);
    } catch (error) {
      logger.error('Error getting financial summary:', error);
      next(error);
    }
  }

  /**
   * GET /api/v1/contabilidad/rentabilidad
   * Obtener análisis de rentabilidad
   */
  async getRentabilidadAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const analysis = await contabilidadService.getAnalysisRentabilidad();

      logger.info(`Rentabilidad analysis retrieved: ${analysis.length} items`);
      res.json(analysis);
    } catch (error) {
      logger.error('Error getting rentabilidad analysis:', error);
      next(error);
    }
  }
}

export const contabilidadController = new ContabilidadController();
