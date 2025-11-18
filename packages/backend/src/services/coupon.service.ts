import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';
import { DiscountType, CouponScope, Prisma } from '@prisma/client';

export class CouponService {
  /**
   * Validar y aplicar cupón
   */
  async validateCoupon(code: string, userId: string, orderAmount: number, categoryIds?: string[], productIds?: string[]) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        category: true,
        product: true,
        user: true,
        couponUsages: {
          where: { userId }
        }
      }
    });

    if (!coupon) {
      throw new AppError(400, 'Cupón no válido', 'INVALID_COUPON');
    }

    if (!coupon.isActive) {
      throw new AppError(400, 'Cupón inactivo', 'COUPON_INACTIVE');
    }

    // Validar fechas
    const now = new Date();
    if (now < coupon.validFrom) {
      throw new AppError(400, 'Cupón aún no está vigente', 'COUPON_NOT_YET_VALID');
    }

    if (coupon.validTo && now > coupon.validTo) {
      throw new AppError(400, 'Cupón expirado', 'COUPON_EXPIRED');
    }

    // Validar monto mínimo
    if (coupon.minimumAmount && orderAmount < Number(coupon.minimumAmount)) {
      throw new AppError(400, `Monto mínimo requerido: €${coupon.minimumAmount}`, 'MINIMUM_AMOUNT_NOT_MET');
    }

    // Validar límite de usos totales
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new AppError(400, 'Cupón agotado', 'COUPON_EXHAUSTED');
    }

    // Validar límite de usos por usuario
    const userUsages = coupon.couponUsages.length;
    if (coupon.usageLimitPerUser && userUsages >= coupon.usageLimitPerUser) {
      throw new AppError(400, 'Ya has usado este cupón', 'COUPON_ALREADY_USED');
    }

    // Validar alcance del cupón
    switch (coupon.scope) {
      case CouponScope.USER:
        if (coupon.userId !== userId) {
          throw new AppError(400, 'Este cupón no es válido para tu cuenta', 'COUPON_NOT_FOR_USER');
        }
        break;

      case CouponScope.CATEGORY:
        if (!categoryIds || !coupon.categoryId || !categoryIds.includes(coupon.categoryId)) {
          throw new AppError(400, 'Este cupón no aplica a los productos en tu carrito', 'COUPON_NOT_FOR_CATEGORY');
        }
        break;

      case CouponScope.PRODUCT:
        if (!productIds || !coupon.productId || !productIds.includes(coupon.productId)) {
          throw new AppError(400, 'Este cupón no aplica a los productos en tu carrito', 'COUPON_NOT_FOR_PRODUCT');
        }
        break;
    }

    // Calcular descuento
    let discountAmount = 0;
    
    switch (coupon.discountType) {
      case DiscountType.PERCENTAGE:
        discountAmount = (orderAmount * Number(coupon.discountValue)) / 100;
        // Aplicar límite máximo de descuento si existe
        if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
          discountAmount = Number(coupon.maxDiscount);
        }
        break;

      case DiscountType.FIXED_AMOUNT:
        discountAmount = Number(coupon.discountValue);
        // No puede ser mayor que el total del pedido
        if (discountAmount > orderAmount) {
          discountAmount = orderAmount;
        }
        break;

      case DiscountType.FREE_SHIPPING:
        // Se manejará en el checkout
        discountAmount = 0;
        break;
    }

    return {
      coupon,
      discountAmount,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      freeShipping: coupon.discountType === DiscountType.FREE_SHIPPING
    };
  }

  /**
   * Aplicar descuento de usuario VIP
   */
  async getUserDiscount(userId: string, orderAmount: number) {
    const userDiscount = await prisma.userDiscount.findUnique({
      where: { userId },
    });

    if (!userDiscount || !userDiscount.isActive) {
      return null;
    }

    // Validar fechas
    const now = new Date();
    if (now < userDiscount.validFrom) {
      return null;
    }

    if (userDiscount.validTo && now > userDiscount.validTo) {
      return null;
    }

    // Calcular descuento
    let discountAmount = 0;
    
    switch (userDiscount.discountType) {
      case DiscountType.PERCENTAGE:
        discountAmount = (orderAmount * Number(userDiscount.discountValue)) / 100;
        break;

      case DiscountType.FIXED_AMOUNT:
        discountAmount = Number(userDiscount.discountValue);
        if (discountAmount > orderAmount) {
          discountAmount = orderAmount;
        }
        break;
    }

    return {
      discountAmount,
      discountType: userDiscount.discountType,
      discountValue: Number(userDiscount.discountValue),
      reason: userDiscount.reason
    };
  }

  /**
   * Registrar uso de cupón
   */
  async useCoupon(couponId: string, userId: string, orderId: string, discountApplied: number) {
    // Crear registro de uso
    const usage = await prisma.couponUsage.create({
      data: {
        couponId,
        userId,
        orderId,
        discountApplied
      }
    });

    // Incrementar contador de usos
    await prisma.coupon.update({
      where: { id: couponId },
      data: {
        usageCount: { increment: 1 }
      }
    });

    return usage;
  }

  /**
   * Crear cupón
   */
  async createCoupon(data: {
    code: string;
    description?: string;
    discountType: DiscountType;
    discountValue: number;
    scope: CouponScope;
    categoryId?: string;
    productId?: string;
    userId?: string;
    minimumAmount?: number;
    maxDiscount?: number;
    usageLimit?: number;
    usageLimitPerUser?: number;
    validFrom: Date;
    validTo?: Date;
    isActive?: boolean;
  }) {
    // Verificar que el código no existe
    const existing = await prisma.coupon.findUnique({
      where: { code: data.code.toUpperCase() }
    });

    if (existing) {
      throw new AppError(400, 'El código de cupón ya existe', 'COUPON_CODE_EXISTS');
    }

    const coupon = await prisma.coupon.create({
      data: {
        ...data,
        code: data.code.toUpperCase(),
        discountValue: new Prisma.Decimal(data.discountValue),
        minimumAmount: data.minimumAmount ? new Prisma.Decimal(data.minimumAmount) : undefined,
        maxDiscount: data.maxDiscount ? new Prisma.Decimal(data.maxDiscount) : undefined,
      },
      include: {
        category: true,
        product: true,
        user: true
      }
    });

    return coupon;
  }

  /**
   * Actualizar cupón
   */
  async updateCoupon(id: string, data: Partial<{
    description: string;
    discountValue: number;
    minimumAmount: number;
    maxDiscount: number;
    usageLimit: number;
    usageLimitPerUser: number;
    validFrom: Date;
    validTo: Date;
    isActive: boolean;
  }>) {
    const updateData: any = { ...data };
    
    if (data.discountValue !== undefined) {
      updateData.discountValue = new Prisma.Decimal(data.discountValue);
    }
    if (data.minimumAmount !== undefined) {
      updateData.minimumAmount = new Prisma.Decimal(data.minimumAmount);
    }
    if (data.maxDiscount !== undefined) {
      updateData.maxDiscount = new Prisma.Decimal(data.maxDiscount);
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        product: true,
        user: true,
        _count: {
          select: { couponUsages: true }
        }
      }
    });

    return coupon;
  }

  /**
   * Listar cupones
   */
  async listCoupons(filters?: {
    isActive?: boolean;
    scope?: CouponScope;
    includeExpired?: boolean;
  }) {
    const where: any = {};

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.scope) {
      where.scope = filters.scope;
    }

    if (!filters?.includeExpired) {
      where.OR = [
        { validTo: null },
        { validTo: { gte: new Date() } }
      ];
    }

    const coupons = await prisma.coupon.findMany({
      where,
      include: {
        category: true,
        product: true,
        user: true,
        _count: {
          select: { couponUsages: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return coupons;
  }

  /**
   * Obtener cupón por ID
   */
  async getCouponById(id: string) {
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        category: true,
        product: true,
        user: true,
        couponUsages: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            order: {
              select: {
                id: true,
                orderNumber: true,
                total: true
              }
            }
          },
          orderBy: {
            usedAt: 'desc'
          }
        }
      }
    });

    if (!coupon) {
      throw new AppError(404, 'Cupón no encontrado', 'COUPON_NOT_FOUND');
    }

    return coupon;
  }

  /**
   * Eliminar cupón
   */
  async deleteCoupon(id: string) {
    // Verificar si el cupón ha sido usado
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        _count: {
          select: { couponUsages: true }
        }
      }
    });

    if (!coupon) {
      throw new AppError(404, 'Cupón no encontrado', 'COUPON_NOT_FOUND');
    }

    if (coupon._count.couponUsages > 0) {
      // No eliminar, solo desactivar
      await prisma.coupon.update({
        where: { id },
        data: { isActive: false }
      });
      
      return { deleted: false, deactivated: true };
    }

    // Eliminar completamente si no ha sido usado
    await prisma.coupon.delete({
      where: { id }
    });

    return { deleted: true, deactivated: false };
  }

  /**
   * Crear descuento para usuario VIP
   */
  async createUserDiscount(data: {
    userId: string;
    discountType: DiscountType;
    discountValue: number;
    reason?: string;
    validFrom?: Date;
    validTo?: Date;
  }) {
    // Verificar si ya existe un descuento para este usuario
    const existing = await prisma.userDiscount.findUnique({
      where: { userId: data.userId }
    });

    if (existing) {
      // Actualizar el existente
      return await prisma.userDiscount.update({
        where: { userId: data.userId },
        data: {
          discountType: data.discountType,
          discountValue: new Prisma.Decimal(data.discountValue),
          reason: data.reason,
          validFrom: data.validFrom || new Date(),
          validTo: data.validTo,
          isActive: true
        }
      });
    }

    // Crear nuevo
    const userDiscount = await prisma.userDiscount.create({
      data: {
        userId: data.userId,
        discountType: data.discountType,
        discountValue: new Prisma.Decimal(data.discountValue),
        reason: data.reason,
        validFrom: data.validFrom || new Date(),
        validTo: data.validTo
      }
    });

    return userDiscount;
  }

  /**
   * Actualizar descuento de usuario
   */
  async updateUserDiscount(userId: string, data: Partial<{
    discountType: DiscountType;
    discountValue: number;
    reason: string;
    validFrom: Date;
    validTo: Date;
    isActive: boolean;
  }>) {
    const updateData: any = { ...data };
    
    if (data.discountValue !== undefined) {
      updateData.discountValue = new Prisma.Decimal(data.discountValue);
    }

    const userDiscount = await prisma.userDiscount.update({
      where: { userId },
      data: updateData
    });

    return userDiscount;
  }

  /**
   * Listar descuentos de usuarios VIP
   */
  async listUserDiscounts(isActive?: boolean) {
    const where: any = {};
    
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const discounts = await prisma.userDiscount.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return discounts;
  }
}

export const couponService = new CouponService();
