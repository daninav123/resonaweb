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

  /**
   * GET /api/v1/contabilidad/evolution
   * Obtener evolución mensual
   */
  async getMonthlyEvolution(req: Request, res: Response, next: NextFunction) {
    try {
      const months = parseInt(req.query.months as string) || 12;

      if (months < 1 || months > 24) {
        return res.status(400).json({
          error: 'Invalid months parameter. Must be between 1 and 24',
        });
      }

      const evolution = await contabilidadService.getMonthlyEvolution(months);

      logger.info(`Monthly evolution retrieved: ${evolution.length} months`);
      res.json(evolution);
    } catch (error) {
      logger.error('Error getting monthly evolution:', error);
      next(error);
    }
  }

  /**
   * GET /api/v1/contabilidad/cost-breakdown
   * Obtener desglose de costes
   */
  async getCostBreakdown(req: Request, res: Response, next: NextFunction) {
    try {
      const period = (req.query.period as 'month' | 'quarter' | 'year') || 'month';

      if (!['month', 'quarter', 'year'].includes(period)) {
        return res.status(400).json({
          error: 'Invalid period. Must be month, quarter, or year',
        });
      }

      const breakdown = await contabilidadService.getCostBreakdown(period);

      logger.info(`Cost breakdown retrieved for period: ${period}`);
      res.json(breakdown);
    } catch (error) {
      logger.error('Error getting cost breakdown:', error);
      next(error);
    }
  }

  /**
   * GET /api/v1/contabilidad/export/pdf
   * Exportar informe a PDF
   */
  async exportToPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const period = (req.query.period as 'month' | 'quarter' | 'year') || 'month';

      // TODO: Implementar generación de PDF con puppeteer o pdfkit
      // Por ahora retornamos un mensaje
      res.status(501).json({
        message: 'PDF export functionality coming soon',
        period,
      });
    } catch (error) {
      logger.error('Error exporting to PDF:', error);
      next(error);
    }
  }

  /**
   * GET /api/v1/contabilidad/export/excel
   * Exportar informe a Excel
   */
  async exportToExcel(req: Request, res: Response, next: NextFunction) {
    try {
      const period = (req.query.period as 'month' | 'quarter' | 'year') || 'month';

      // TODO: Implementar generación de Excel con exceljs
      // Por ahora retornamos un mensaje
      res.status(501).json({
        message: 'Excel export functionality coming soon',
        period,
      });
    } catch (error) {
      logger.error('Error exporting to Excel:', error);
      next(error);
    }
  }
}

export const contabilidadController = new ContabilidadController();
