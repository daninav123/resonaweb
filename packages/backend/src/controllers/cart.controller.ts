import { Request, Response, NextFunction } from 'express';
import { cartService } from '../services/cart.service';
import { AppError } from '../middleware/error.middleware';

interface AuthRequest extends Request {
  user?: any;
}

export class CartController {
  /**
   * Get current user's cart
   */
  async getCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const cart = await cartService.getCart(req.user.id);
      res.json(cart);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add item to cart
   */
  async addToCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { productId, quantity, startDate, endDate } = req.body;

      if (!productId || !quantity) {
        throw new AppError(400, 'productId y quantity son requeridos', 'MISSING_DATA');
      }

      const item = await cartService.addToCart(req.user.id, {
        productId,
        quantity,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      });

      res.status(201).json({
        message: 'Producto añadido al carrito',
        item,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { productId } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity <= 0) {
        throw new AppError(400, 'Cantidad inválida', 'INVALID_QUANTITY');
      }

      const result = await cartService.updateCartItem(req.user.id, productId, quantity);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update cart item dates
   */
  async updateCartItemDates(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { itemId } = req.params;
      const { startDate, endDate } = req.body;

      if (!startDate || !endDate) {
        throw new AppError(400, 'startDate y endDate son requeridos', 'MISSING_DATES');
      }

      const result = await cartService.updateCartItemDates(
        req.user.id,
        itemId,
        new Date(startDate),
        new Date(endDate)
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { productId } = req.params;
      const result = await cartService.removeFromCart(req.user.id, productId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clear entire cart
   */
  async clearCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const result = await cartService.clearCart(req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Calculate cart totals with delivery options
   */
  async calculateTotals(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { items, deliveryType, deliveryDistance } = req.body;

      if (!items || !Array.isArray(items)) {
        throw new AppError(400, 'Items inválidos', 'INVALID_ITEMS');
      }

      const totals = await cartService.calculateTotals(items, deliveryType, deliveryDistance);
      res.json(totals);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate cart before checkout
   */
  async validateCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const cartData = {
        userId: req.user.id,
        ...req.body,
      };

      const validation = await cartService.validateCart(cartData);
      res.json(validation);
    } catch (error) {
      next(error);
    }
  }
}

export const cartController = new CartController();
