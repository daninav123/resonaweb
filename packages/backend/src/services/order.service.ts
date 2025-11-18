import { PrismaClient, OrderStatus, PaymentStatus, DeliveryType } from '@prisma/client';
import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { cartService } from './cart.service';

interface OrderItem {
  productId: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  startDate: Date;
  endDate: Date;
}

interface CreateOrderData {
  userId: string;
  items: OrderItem[];
  deliveryType: DeliveryType;
  deliveryAddress?: string;
  deliveryDate?: Date;
  notes?: string;
  eventType?: string;
  eventLocation?: string;
  attendees?: number;
  // Campos opcionales de contacto
  contactPerson?: string;
  contactPhone?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export class OrderService {
  /**
   * Generate unique order number
   */
  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const lastOrder = await prisma.order.findFirst({
      where: {
        orderNumber: {
          startsWith: `RES-${year}-`,
        },
      },
      orderBy: {
        orderNumber: 'desc',
      },
    });

    let nextNumber = 1;
    if (lastOrder) {
      const lastNumber = parseInt(lastOrder.orderNumber.split('-').pop() || '0');
      nextNumber = lastNumber + 1;
    }

    return `RES-${year}-${nextNumber.toString().padStart(4, '0')}`;
  }

  /**
   * Create a new order from cart
   */
  async createOrder(data: CreateOrderData) {
    try {
      // Validate cart items
      const validationResult = await cartService.validateCart({
        userId: data.userId,
        items: data.items,
        deliveryType: data.deliveryType as any,
        deliveryAddress: data.deliveryAddress,
      });

      if (!validationResult.valid) {
        throw new AppError(400, 'Carrito inválido', 'INVALID_CART');
      }

      // Calculate totals
      const totals = await cartService.calculateTotals(
        data.items,
        data.deliveryType as any,
        data.deliveryType === 'DELIVERY' ? 10 : 0 // Default 10km for now
      );

      // Generate order number
      const orderNumber = await this.generateOrderNumber();

      // Create order
      const order = await prisma.order.create({
        data: {
          orderNumber,
          userId: data.userId,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          deliveryType: data.deliveryType as any,
          deliveryAddress: data.deliveryAddress ? JSON.stringify({ address: data.deliveryAddress }) : undefined,
          deliveryDate: data.deliveryDate || new Date(),
          startDate: data.items[0].startDate,
          endDate: data.items[data.items.length - 1].endDate,
          
          // Campos de contacto requeridos
          contactPerson: (data as any).contactPerson || `${(data as any).firstName || ''} ${(data as any).lastName || ''}`.trim() || 'Cliente',
          contactPhone: (data as any).contactPhone || (data as any).phone || 'N/A',
          
          // Totales
          subtotal: totals.subtotal,
          totalBeforeAdjustment: totals.subtotal,
          taxAmount: totals.tax,
          total: totals.total,
          deliveryFee: totals.deliveryCost,
          tax: totals.tax,
          totalAmount: totals.total,
          
          // Costes adicionales requeridos
          shippingCost: totals.deliveryCost,
          depositAmount: 0, // Por ahora sin fianza
          
          // Información adicional
          notes: data.notes,
          eventType: data.eventType,
          eventLocation: JSON.stringify({ address: data.deliveryAddress || 'PICKUP' }),
          attendees: data.attendees,
          items: {
            create: data.items.map(item => {
              // Calcular días de alquiler
              const start = new Date(item.startDate);
              const end = new Date(item.endDate);
              const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;
              
              // pricePerUnit ya incluye días * pricePerDay, así que dividimos
              const pricePerDay = Number(item.pricePerUnit) / days;
              const subtotal = Number(item.totalPrice);
              
              return {
                productId: item.productId,
                quantity: item.quantity,
                pricePerDay: pricePerDay,
                subtotal: subtotal,
                pricePerUnit: item.pricePerUnit,
                totalPrice: item.totalPrice,
                startDate: item.startDate,
                endDate: item.endDate,
              };
            }),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          user: true,
        },
      });

      // Update product stock (reserve products)
      for (const item of data.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      logger.info(`Order created: ${orderNumber} for user ${data.userId}`);

      return order;
    } catch (error) {
      logger.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Get all orders for a user
   */
  async getUserOrders(userId: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where: { userId },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                    mainImageUrl: true,
                  },
                },
              },
            },
            payment: true,
          },
        }),
        prisma.order.count({ where: { userId } }),
      ]);

      return {
        data: orders,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error getting user orders:', error);
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string, userId?: string) {
    try {
      const where: any = { id: orderId };
      
      // Si se pasa userId, agregar al filtro
      if (userId) {
        where.userId = userId;
      }

      // Si userId está presente, usar findFirst (permite múltiples condiciones)
      // Si no, usar findUnique (más eficiente para búsqueda por id solo)
      const order = userId 
        ? await prisma.order.findFirst({
            where,
            include: {
              items: {
                include: {
                  product: {
                    include: {
                      category: true,
                    },
                  },
                },
              },
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  phone: true,
                },
              },
              payment: true,
              invoice: true,
            },
          })
        : await prisma.order.findUnique({
            where: { id: orderId },
            include: {
              items: {
                include: {
                  product: {
                    include: {
                      category: true,
                    },
                  },
                },
              },
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  phone: true,
                },
              },
              payment: true,
              invoice: true,
            },
          });

      if (!order) {
        throw new AppError(404, 'Pedido no encontrado', 'ORDER_NOT_FOUND');
      }

      return order;
    } catch (error) {
      logger.error('Error getting order:', error);
      throw error;
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: OrderStatus, userId?: string) {
    try {
      const order = await this.getOrderById(orderId, userId);

      // Validate status transition
      const validTransitions: Record<OrderStatus, OrderStatus[]> = {
        [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
        [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
        [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
        [OrderStatus.READY]: [OrderStatus.IN_TRANSIT, OrderStatus.DELIVERED, OrderStatus.CANCELLED],
        [OrderStatus.IN_TRANSIT]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
        [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED, OrderStatus.RETURNED],
        [OrderStatus.COMPLETED]: [OrderStatus.RETURNED],
        [OrderStatus.CANCELLED]: [],
        [OrderStatus.RETURNED]: [],
      };

      if (!validTransitions[order.status]?.includes(status)) {
        throw new AppError(
          400,
          `No se puede cambiar de ${order.status} a ${status}`,
          'INVALID_STATUS_TRANSITION'
        );
      }

      // Update order
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { 
          status,
          ...(status === OrderStatus.DELIVERED && { deliveredAt: new Date() }),
          ...(status === OrderStatus.COMPLETED && { completedAt: new Date() }),
          ...(status === OrderStatus.CANCELLED && { cancelledAt: new Date() }),
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // If cancelled, release product stock
      if (status === OrderStatus.CANCELLED) {
        for (const item of order.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      logger.info(`Order ${orderId} status updated to ${status}`);

      return updatedOrder;
    } catch (error) {
      logger.error('Error updating order status:', error);
      throw error;
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, userId: string, reason?: string) {
    try {
      const order = await this.getOrderById(orderId, userId);

      if (order.status === OrderStatus.CANCELLED) {
        throw new AppError(400, 'El pedido ya está cancelado', 'ALREADY_CANCELLED');
      }

      if ([OrderStatus.DELIVERED, OrderStatus.COMPLETED].includes(order.status as any)) {
        throw new AppError(400, 'No se puede cancelar un pedido entregado', 'CANNOT_CANCEL');
      }

      return await this.updateOrderStatus(orderId, OrderStatus.CANCELLED, userId);
    } catch (error) {
      logger.error('Error cancelling order:', error);
      throw error;
    }
  }

  /**
   * Get all orders (admin)
   */
  async getAllOrders(filters?: {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    startDate?: Date;
    endDate?: Date;
    search?: string;
  }, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;
      const where: any = {};

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.paymentStatus) {
        where.paymentStatus = filters.paymentStatus;
      }

      if (filters?.startDate && filters?.endDate) {
        where.createdAt = {
          gte: filters.startDate,
          lte: filters.endDate,
        };
      }

      if (filters?.search) {
        where.OR = [
          { orderNumber: { contains: filters.search, mode: 'insensitive' } },
          { user: { email: { contains: filters.search, mode: 'insensitive' } } },
          { user: { firstName: { contains: filters.search, mode: 'insensitive' } } },
          { user: { lastName: { contains: filters.search, mode: 'insensitive' } } },
        ];
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                  },
                },
              },
            },
            payment: true,
          },
        }),
        prisma.order.count({ where }),
      ]);

      return {
        data: orders,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error getting all orders:', error);
      throw error;
    }
  }

  /**
   * Get order statistics
   */
  async getOrderStats(period: 'day' | 'week' | 'month' | 'year' = 'month') {
    try {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'day':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }

      const stats = await prisma.order.groupBy({
        by: ['status'],
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        _count: {
          _all: true,
        },
        _sum: {
          totalAmount: true,
        },
      });

      const totalOrders = await prisma.order.count({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
      });

      const totalRevenue = await prisma.order.aggregate({
        where: {
          createdAt: {
            gte: startDate,
          },
          status: {
            in: [OrderStatus.COMPLETED, OrderStatus.DELIVERED],
          },
        },
        _sum: {
          totalAmount: true,
        },
      });

      return {
        period,
        startDate,
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        byStatus: stats,
      };
    } catch (error) {
      logger.error('Error getting order stats:', error);
      throw error;
    }
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(days: number = 7) {
    try {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);

      const events = await prisma.order.findMany({
        where: {
          startDate: {
            gte: startDate,
            lte: endDate,
          },
          status: {
            in: [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY],
          },
        },
        orderBy: {
          startDate: 'asc',
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          items: {
            select: {
              quantity: true,
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return events;
    } catch (error) {
      logger.error('Error getting upcoming events:', error);
      throw error;
    }
  }
}

export const orderService = new OrderService();
