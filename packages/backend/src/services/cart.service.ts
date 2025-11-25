import { PrismaClient } from '@prisma/client';
import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

interface CartItem {
  productId: string;
  quantity: number;
  startDate: Date | string | null;
  endDate: Date | string | null;
}

interface CartData {
  userId: string;
  items: CartItem[];
  deliveryType?: 'pickup' | 'delivery';
  deliveryAddress?: string;
  notes?: string;
}

export class CartService {
  /**
   * Get user's cart
   */
  async getCart(userId: string) {
    try {
      // For now, we'll store cart in session/local storage on frontend
      // In future, we can store in DB or Redis
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      });

      if (!user) {
        throw new AppError(404, 'Usuario no encontrado', 'USER_NOT_FOUND');
      }

      // Return empty cart structure
      return {
        userId: user.id,
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        deliveryType: 'pickup',
      };
    } catch (error) {
      logger.error('Error getting cart:', error);
      throw error;
    }
  }

  /**
   * Add item to cart
   */
  async addToCart(userId: string, item: CartItem) {
    try {
      // Validate product exists and is available
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { category: true },
      });

      if (!product) {
        throw new AppError(404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND');
      }

      if (!product.isActive) {
        throw new AppError(400, 'Producto no disponible', 'PRODUCT_INACTIVE');
      }

      if (product.stock < item.quantity) {
        throw new AppError(400, 'Stock insuficiente', 'INSUFFICIENT_STOCK');
      }

      // If dates are provided, calculate pricing
      let days = 0;
      let pricePerUnit = 0;
      let totalPrice = 0;

      if (item.startDate && item.endDate) {
        const startDate = new Date(item.startDate);
        const endDate = new Date(item.endDate);
        days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        if (days <= 0) {
          throw new AppError(400, 'Fechas inválidas', 'INVALID_DATES');
        }

        // Calculate price based on rental period
        if (days === 1) {
          pricePerUnit = Number(product.pricePerDay);
        } else if (days === 2 || days === 3) {
          pricePerUnit = Number(product.pricePerWeekend);
        } else if (days >= 7) {
          const weeks = Math.ceil(days / 7);
          pricePerUnit = Number(product.pricePerWeek) * weeks;
        } else {
          pricePerUnit = Number(product.pricePerDay) * days;
        }

        totalPrice = pricePerUnit * item.quantity;
      }

      // Return cart item with calculated prices
      return {
        productId: product.id,
        product: {
          id: product.id,
          name: product.name,
          sku: product.sku,
          category: product.category?.name,
          mainImageUrl: product.mainImageUrl,
        },
        quantity: item.quantity,
        startDate: item.startDate,
        endDate: item.endDate,
        days,
        pricePerUnit,
        totalPrice,
      };
    } catch (error) {
      logger.error('Error adding to cart:', error);
      throw error;
    }
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(userId: string, productId: string, quantity: number) {
    try {
      if (quantity <= 0) {
        throw new AppError(400, 'Cantidad debe ser mayor a 0', 'INVALID_QUANTITY');
      }

      // Validate product stock
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new AppError(404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND');
      }

      if (product.stock < quantity) {
        throw new AppError(400, 'Stock insuficiente', 'INSUFFICIENT_STOCK');
      }

      logger.info(`Cart item updated for user ${userId}, product ${productId}, quantity ${quantity}`);

      return {
        success: true,
        message: 'Cantidad actualizada',
      };
    } catch (error) {
      logger.error('Error updating cart item:', error);
      throw error;
    }
  }

  /**
   * Update cart item dates
   */
  async updateCartItemDates(userId: string, itemId: string, startDate: Date, endDate: Date) {
    try {
      // Validate dates
      if (startDate >= endDate) {
        throw new AppError(400, 'La fecha de fin debe ser posterior a la fecha de inicio', 'INVALID_DATES');
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (startDate < today) {
        throw new AppError(400, 'La fecha de inicio no puede ser anterior a hoy', 'PAST_DATE');
      }

      logger.info(`Cart item dates updated for user ${userId}, item ${itemId}`);

      return {
        success: true,
        message: 'Fechas actualizadas',
        dates: {
          startDate,
          endDate
        }
      };
    } catch (error) {
      logger.error('Error updating cart item dates:', error);
      throw error;
    }
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(userId: string, productId: string) {
    try {
      logger.info(`Item removed from cart for user ${userId}, product ${productId}`);

      return {
        success: true,
        message: 'Producto eliminado del carrito',
      };
    } catch (error) {
      logger.error('Error removing from cart:', error);
      throw error;
    }
  }

  /**
   * Clear entire cart
   */
  async clearCart(userId: string) {
    try {
      logger.info(`Cart cleared for user ${userId}`);

      return {
        success: true,
        message: 'Carrito vaciado',
      };
    } catch (error) {
      logger.error('Error clearing cart:', error);
      throw error;
    }
  }

  /**
   * Calculate cart totals
   */
  async calculateTotals(items: CartItem[], deliveryType: 'pickup' | 'delivery', deliveryDistance?: number) {
    try {
      let subtotal = 0;
      let deliveryCost = 0;
      const taxRate = 0.21; // 21% IVA

      // Calculate subtotal from all items
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) continue;

        if (!item.startDate || !item.endDate) continue;
        
        const startDate = new Date(item.startDate!);
        const endDate = new Date(item.endDate!);
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        let pricePerUnit = 0;
        if (days === 1) {
          pricePerUnit = Number(product.pricePerDay);
        } else if (days === 2 || days === 3) {
          pricePerUnit = Number(product.pricePerWeekend);
        } else if (days >= 7) {
          const weeks = Math.ceil(days / 7);
          pricePerUnit = Number(product.pricePerWeek) * weeks;
        } else {
          pricePerUnit = Number(product.pricePerDay) * days;
        }

        subtotal += pricePerUnit * item.quantity;
      }

      // Calculate delivery cost if applicable
      if (deliveryType === 'delivery' && deliveryDistance) {
        // €1.5 per km for delivery
        deliveryCost = deliveryDistance * 1.5;
      }

      const tax = (subtotal + deliveryCost) * taxRate;
      const total = subtotal + deliveryCost + tax;

      return {
        subtotal: Math.round(subtotal * 100) / 100,
        deliveryCost: Math.round(deliveryCost * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        total: Math.round(total * 100) / 100,
      };
    } catch (error) {
      logger.error('Error calculating totals:', error);
      throw error;
    }
  }

  /**
   * Validate cart before checkout
   */
  async validateCart(cartData: CartData) {
    try {
      const errors: string[] = [];

      // Validate items
      if (!cartData.items || cartData.items.length === 0) {
        errors.push('El carrito está vacío');
      }

      // Check stock availability for each item
      for (const item of cartData.items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          errors.push(`Producto ${item.productId} no encontrado`);
          continue;
        }

        if (!product.isActive) {
          errors.push(`Producto ${product.name} no está disponible`);
        }

        // Validate dates first (needed for stock validation)
        if (!item.startDate || !item.endDate) {
          errors.push(`Fechas requeridas para ${product.name}`);
          continue;
        }
        
        const startDate = new Date(item.startDate!);
        const endDate = new Date(item.endDate!);
        const now = new Date();
        
        // Calcular días de antelación
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const daysUntilStart = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Stock validation con lógica de "producto bajo pedido"
        // Si la reserva es con más de 30 días de antelación, siempre se permite (tiempo para conseguir stock)
        if (daysUntilStart > 30) {
          // Con más de 30 días de antelación, siempre disponible (se puede conseguir stock)
          console.log(`✅ ${product.name}: Reserva con ${daysUntilStart} días de antelación - bajo pedido permitido`);
        } else {
          // Con menos de 30 días, verificar stock real disponible
          // Obtener reservas confirmadas que solapen con las fechas solicitadas
          const overlappingItems = await prisma.orderItem.findMany({
            where: {
              productId: product.id,
              order: {
                status: 'CONFIRMED',
                startDate: { lte: endDate },
                endDate: { gte: startDate }
              }
            },
            select: { quantity: true }
          });

          const reservedStock = overlappingItems.reduce((sum, orderItem) => sum + orderItem.quantity, 0);
          const currentStock = product.realStock ?? product.stock ?? 0;
          const availableStock = currentStock - reservedStock;

          if (availableStock < item.quantity) {
            errors.push(`Stock insuficiente para ${product.name}. Disponible: ${Math.max(0, availableStock)}, solicitado: ${item.quantity}`);
          }
        }

        if (startDate < now) {
          errors.push(`La fecha de inicio para ${product.name} debe ser futura`);
        }

        if (endDate < startDate) {
          errors.push(`La fecha de fin debe ser posterior a la fecha de inicio para ${product.name}`);
        }
      }

      // Validate delivery information
      if (cartData.deliveryType === 'delivery' && !cartData.deliveryAddress) {
        errors.push('Dirección de entrega requerida');
      }

      if (errors.length > 0) {
        throw new AppError(400, 'Errores de validación', 'VALIDATION_ERROR', { errors });
      }

      return {
        valid: true,
        message: 'Carrito válido para proceder al checkout',
      };
    } catch (error) {
      logger.error('Error validating cart:', error);
      throw error;
    }
  }
}

export const cartService = new CartService();
