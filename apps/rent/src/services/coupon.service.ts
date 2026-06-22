import { api } from './api';

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  discountValue: number;
  scope: 'ALL_PRODUCTS' | 'CATEGORY' | 'PRODUCT' | 'USER';
  categoryId?: string;
  category?: any;
  productId?: string;
  product?: any;
  userId?: string;
  user?: any;
  minimumAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  usageLimitPerUser?: number;
  validFrom: string;
  validTo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    couponUsages: number;
  };
}

export interface UserDiscount {
  id: string;
  userId: string;
  user: any;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  discountValue: number;
  reason?: string;
  validFrom: string;
  validTo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponValidation {
  valid: boolean;
  coupon?: {
    discountAmount: number;
    discountType: string;
    discountValue: number;
    freeShipping: boolean;
  };
  userDiscount?: {
    discountAmount: number;
    discountType: string;
    discountValue: number;
    reason: string;
  };
  finalDiscount?: {
    discountAmount: number;
    discountType: string;
    discountValue: number;
  };
}

class CouponService {
  /**
   * Validar cupón
   */
  async validateCoupon(
    code: string,
    orderAmount: number,
    categoryIds?: string[],
    productIds?: string[]
  ): Promise<CouponValidation> {
    return api.post('/coupons/validate', {
      code,
      orderAmount,
      categoryIds,
      productIds,
    });
  }

  /**
   * Obtener mi descuento VIP
   */
  async getMyDiscount(): Promise<{
    hasDiscount: boolean;
    discount?: {
      discountAmount: number;
      discountType: string;
      discountValue: number;
      reason: string;
    };
  }> {
    return api.get('/coupons/my-discount');
  }

  /**
   * Admin: Crear cupón
   */
  async createCoupon(data: Partial<Coupon>): Promise<{ message: string; coupon: Coupon }> {
    return api.post('/coupons', data);
  }

  /**
   * Admin: Listar cupones
   */
  async listCoupons(params?: {
    isActive?: boolean;
    scope?: string;
    includeExpired?: boolean;
  }): Promise<{ coupons: Coupon[]; total: number }> {
    const searchParams = new URLSearchParams();
    
    if (params?.isActive !== undefined) {
      searchParams.append('isActive', String(params.isActive));
    }
    if (params?.scope) {
      searchParams.append('scope', params.scope);
    }
    if (params?.includeExpired !== undefined) {
      searchParams.append('includeExpired', String(params.includeExpired));
    }

    return api.get(`/coupons${searchParams.toString() ? `?${searchParams}` : ''}`);
  }

  /**
   * Admin: Obtener cupón por ID
   */
  async getCouponById(id: string): Promise<Coupon> {
    return api.get(`/coupons/${id}`);
  }

  /**
   * Admin: Actualizar cupón
   */
  async updateCoupon(id: string, data: Partial<Coupon>): Promise<{ message: string; coupon: Coupon }> {
    return api.put(`/coupons/${id}`, data);
  }

  /**
   * Admin: Eliminar cupón
   */
  async deleteCoupon(id: string): Promise<{ message: string; deleted: boolean; deactivated: boolean }> {
    return api.delete(`/coupons/${id}`);
  }

  /**
   * Admin: Crear descuento VIP
   */
  async createUserDiscount(data: {
    userId: string;
    discountType: string;
    discountValue: number;
    reason?: string;
    validFrom?: string;
    validTo?: string;
  }): Promise<{ message: string; userDiscount: UserDiscount }> {
    return api.post('/coupons/user-discounts', data);
  }

  /**
   * Admin: Listar descuentos VIP
   */
  async listUserDiscounts(isActive?: boolean): Promise<{ discounts: UserDiscount[]; total: number }> {
    const params = isActive !== undefined ? `?isActive=${isActive}` : '';
    return api.get(`/coupons/user-discounts${params}`);
  }

  /**
   * Admin: Actualizar descuento VIP
   */
  async updateUserDiscount(userId: string, data: Partial<UserDiscount>): Promise<{ message: string; userDiscount: UserDiscount }> {
    return api.put(`/coupons/user-discounts/${userId}`, data);
  }
}

export const couponService = new CouponService();
