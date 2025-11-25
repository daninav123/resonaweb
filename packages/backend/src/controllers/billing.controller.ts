import { Request, Response, NextFunction } from 'express';
import { billingService } from '../services/billing.service';
import { AppError } from '../middleware/error.middleware';

export class BillingController {
  /**
   * Get billing data for current user
   */
  async getBillingData(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError(401, 'No autenticado', 'UNAUTHORIZED');
      }

      const billingData = await billingService.getBillingData(userId);

      res.json({
        data: billingData,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create or update billing data
   */
  async upsertBillingData(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError(401, 'No autenticado', 'UNAUTHORIZED');
      }

      const billingData = await billingService.upsertBillingData(userId, req.body);

      res.json({
        message: 'Datos de facturación guardados',
        data: billingData,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete billing data
   */
  async deleteBillingData(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError(401, 'No autenticado', 'UNAUTHORIZED');
      }

      const result = await billingService.deleteBillingData(userId);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate tax ID
   */
  async validateTaxId(req: Request, res: Response, next: NextFunction) {
    try {
      const { taxId, type } = req.body;

      if (!taxId) {
        throw new AppError(400, 'Tax ID es requerido', 'MISSING_TAX_ID');
      }

      const isValid = billingService.validateSpanishTaxId(taxId, type || 'NIF');

      res.json({
        valid: isValid,
        taxId: taxId.trim().toUpperCase(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const billingController = new BillingController();
