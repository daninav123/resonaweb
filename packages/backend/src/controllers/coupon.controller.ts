import { Request, Response, NextFunction } from 'express';
import { couponService } from '../services/coupon.service';
import { AppError } from '../middleware/error.middleware';
import { DiscountType, CouponScope } from '@prisma/client';

interface AuthRequest extends Request {
  user?: any;
}

export class CouponController {
  /**
   * Validar cupón
   */
  async validateCoupon(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { code, orderAmount, categoryIds, productIds } = req.body;

      if (!code) {
        throw new AppError(400, 'Código de cupón requerido', 'CODE_REQUIRED');
      }

      if (!orderAmount || orderAmount <= 0) {
        throw new AppError(400, 'Monto de orden inválido', 'INVALID_AMOUNT');
      }

      const result = await couponService.validateCoupon(
        code,
        req.user.id,
        orderAmount,
        categoryIds,
        productIds
      );

      // También verificar descuento de usuario VIP
      const userDiscount = await couponService.getUserDiscount(req.user.id, orderAmount);

      res.json({
        valid: true,
        coupon: result,
        userDiscount,
        // Aplicar el mayor descuento
        finalDiscount: userDiscount && userDiscount.discountAmount > result.discountAmount 
          ? userDiscount 
          : result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crear cupón (admin)
   */
  async createCoupon(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')) {
        throw new AppError(403, 'No autorizado', 'FORBIDDEN');
      }

      const {
        code,
        description,
        discountType,
        discountValue,
        scope,
        categoryId,
        productId,
        userId,
        minimumAmount,
        maxDiscount,
        usageLimit,
        usageLimitPerUser,
        validFrom,
        validTo,
        isActive
      } = req.body;

      if (!code || !discountType || !discountValue || !scope) {
        throw new AppError(400, 'Datos incompletos', 'MISSING_DATA');
      }

      const coupon = await couponService.createCoupon({
        code,
        description,
        discountType: discountType as DiscountType,
        discountValue,
        scope: scope as CouponScope,
        categoryId,
        productId,
        userId,
        minimumAmount,
        maxDiscount,
        usageLimit,
        usageLimitPerUser,
        validFrom: new Date(validFrom || Date.now()),
        validTo: validTo ? new Date(validTo) : undefined,
        isActive: isActive !== false
      });

      res.status(201).json({
        message: 'Cupón creado correctamente',
        coupon
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar cupón (admin)
   */
  async updateCoupon(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')) {
        throw new AppError(403, 'No autorizado', 'FORBIDDEN');
      }

      const { id } = req.params;
      const updateData = req.body;

      // Convertir fechas si vienen como strings
      if (updateData.validFrom) {
        updateData.validFrom = new Date(updateData.validFrom);
      }
      if (updateData.validTo) {
        updateData.validTo = new Date(updateData.validTo);
      }

      const coupon = await couponService.updateCoupon(id, updateData);

      res.json({
        message: 'Cupón actualizado correctamente',
        coupon
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Listar cupones (admin)
   */
  async listCoupons(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')) {
        throw new AppError(403, 'No autorizado', 'FORBIDDEN');
      }

      const { isActive, scope, includeExpired } = req.query;

      const coupons = await couponService.listCoupons({
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        scope: scope as CouponScope | undefined,
        includeExpired: includeExpired === 'true'
      });

      res.json({
        coupons,
        total: coupons.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener cupón por ID (admin)
   */
  async getCouponById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')) {
        throw new AppError(403, 'No autorizado', 'FORBIDDEN');
      }

      const { id } = req.params;
      const coupon = await couponService.getCouponById(id);

      res.json(coupon);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar cupón (admin)
   */
  async deleteCoupon(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')) {
        throw new AppError(403, 'No autorizado', 'FORBIDDEN');
      }

      const { id } = req.params;
      const result = await couponService.deleteCoupon(id);

      res.json({
        message: result.deleted 
          ? 'Cupón eliminado correctamente' 
          : 'Cupón desactivado (tiene usos registrados)',
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crear descuento para usuario VIP (admin)
   */
  async createUserDiscount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')) {
        throw new AppError(403, 'No autorizado', 'FORBIDDEN');
      }

      const {
        userId,
        discountType,
        discountValue,
        reason,
        validFrom,
        validTo
      } = req.body;

      if (!userId || !discountType || !discountValue) {
        throw new AppError(400, 'Datos incompletos', 'MISSING_DATA');
      }

      const userDiscount = await couponService.createUserDiscount({
        userId,
        discountType: discountType as DiscountType,
        discountValue,
        reason,
        validFrom: validFrom ? new Date(validFrom) : undefined,
        validTo: validTo ? new Date(validTo) : undefined
      });

      res.status(201).json({
        message: 'Descuento de usuario creado correctamente',
        userDiscount
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar descuento de usuario (admin)
   */
  async updateUserDiscount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')) {
        throw new AppError(403, 'No autorizado', 'FORBIDDEN');
      }

      const { userId } = req.params;
      const updateData = req.body;

      // Convertir fechas si vienen como strings
      if (updateData.validFrom) {
        updateData.validFrom = new Date(updateData.validFrom);
      }
      if (updateData.validTo) {
        updateData.validTo = new Date(updateData.validTo);
      }

      const userDiscount = await couponService.updateUserDiscount(userId, updateData);

      res.json({
        message: 'Descuento de usuario actualizado correctamente',
        userDiscount
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Listar descuentos de usuarios VIP (admin)
   */
  async listUserDiscounts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')) {
        throw new AppError(403, 'No autorizado', 'FORBIDDEN');
      }

      const { isActive } = req.query;
      const discounts = await couponService.listUserDiscounts(
        isActive === 'true' ? true : isActive === 'false' ? false : undefined
      );

      res.json({
        discounts,
        total: discounts.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener mi descuento (usuario)
   */
  async getMyDiscount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const discount = await couponService.getUserDiscount(req.user.id, 0);

      res.json({
        hasDiscount: !!discount,
        discount
      });
    } catch (error) {
      next(error);
    }
  }
}

export const couponController = new CouponController();
