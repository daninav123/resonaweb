import { Request, Response, NextFunction } from 'express';
import { productPurchaseService } from '../services/productPurchase.service';
import { AppError } from '../middleware/error.middleware';

interface AuthRequest extends Request {
  user?: any;
}

export class ProductPurchaseController {
  /**
   * Create a new purchase lot
   */
  async createPurchaseLot(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const { productId, quantity, unitPrice, purchaseDate, supplier, invoiceNumber, notes } = req.body;

      if (!productId || !quantity || !unitPrice) {
        throw new AppError(400, 'Faltan campos requeridos', 'MISSING_FIELDS');
      }

      const purchase = await productPurchaseService.createPurchaseLot({
        productId,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
        supplier,
        invoiceNumber,
        notes,
      });

      res.status(201).json(purchase);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all purchase lots
   */
  async getAllPurchaseLots(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const lots = await productPurchaseService.getAllPurchaseLots();
      res.json(lots);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all purchase lots for a product
   */
  async getProductPurchaseLots(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const { productId } = req.params;

      const lots = await productPurchaseService.getProductPurchaseLots(productId);
      res.json(lots);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a purchase lot
   */
  async updatePurchaseLot(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const { lotId } = req.params;
      const { quantity, unitPrice, purchaseDate, supplier, invoiceNumber, notes } = req.body;

      const updated = await productPurchaseService.updatePurchaseLot(lotId, {
        quantity: quantity ? Number(quantity) : undefined,
        unitPrice: unitPrice ? Number(unitPrice) : undefined,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
        supplier,
        invoiceNumber,
        notes,
      });

      res.json(updated);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a purchase lot
   */
  async deletePurchaseLot(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const { lotId } = req.params;

      const result = await productPurchaseService.deletePurchaseLot(lotId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const productPurchaseController = new ProductPurchaseController();
