import { PrismaClient, OrderStatus, PaymentStatus, DeliveryType } from '@prisma/client';
import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { cartService } from './cart.service';
import { InstallmentService } from './installment.service';

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
  deliveryDistance?: number;
  includeInstallation?: boolean;
  shippingCost?: number;
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
  // Campos para pago a plazos
  eligibleForInstallments?: boolean;
  isCalculatorEvent?: boolean;
}

export class OrderService {
  /**
   * Calculate VIP discount based on user level
   * EXCLUYE TODA LA CALCULADORA del descuento (equipos y montajes)
   * Solo aplica descuento a productos individuales normales
   */
  private calculateVIPDiscount(userLevel: string, items: any[]): number {
    if (userLevel !== 'VIP' && userLevel !== 'VIP_PLUS') {
      return 0;
    }

    // Calcular subtotal SOLO de productos normales (NO de calculadora)
    let subtotalProductosNormales = 0;

    for (const item of items) {
      // Si el item tiene eventMetadata (viene de calculadora)
      if (item.eventMetadata) {
        const metadata = item.eventMetadata;
        const partsTotal = Number(metadata.partsTotal || 0);
        const extrasTotal = Number(metadata.extrasTotal || 0);
        const totalCalculadora = partsTotal + extrasTotal;
        
        // NO incluir NADA de la calculadora en el descuento VIP
        logger.info(`❌ Item de CALCULADORA - SIN descuento VIP: Equipos €${partsTotal} + Montajes €${extrasTotal} = €${totalCalculadora}`);
      } else {
        // Para productos normales, SÍ incluir el precio completo
        const totalProducto = Number(item.totalPrice || 0);
        subtotalProductosNormales += totalProducto;
        logger.info(`✅ Producto NORMAL - CON descuento VIP: €${totalProducto}`);
      }
    }

    logger.info(`💰 Subtotal SOLO productos normales (para descuento VIP): €${subtotalProductosNormales.toFixed(2)}`);

    // Aplicar descuento según nivel SOLO sobre productos normales
    // VIP: 25% de descuento, VIP_PLUS: 70% de descuento
    const discountRate = userLevel === 'VIP' ? 0.25 : 0.70;
    const discount = subtotalProductosNormales * discountRate;
    
    if (subtotalProductosNormales === 0) {
      logger.info('ℹ️ Solo hay items de calculadora - NO hay descuento VIP');
    }
    
    return discount;
  }

  /**
   * Calculate deposit - VIP users don't pay deposit
   */
  private async calculateDeposit(userLevel: string, items: OrderItem[]): Promise<number> {
    // VIP and VIP_PLUS don't pay deposit
    if (userLevel === 'VIP' || userLevel === 'VIP_PLUS') {
      return 0;
    }
    
    // For STANDARD users, calculate deposit based on products
    let totalDeposit = 0;
    
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { customDeposit: true, pricePerDay: true }
      });
      
      if (!product) continue;
      
      // Si el producto tiene fianza personalizada, usarla
      if (product.customDeposit && Number(product.customDeposit) > 0) {
        totalDeposit += Number(product.customDeposit) * item.quantity;
      } else {
        // Si no, calcular 20% del precio total del item
        const itemTotal = Number(item.totalPrice || 0);
        totalDeposit += itemTotal * 0.2;
      }
    }
    
    return totalDeposit;
  }

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
   * Uses transaction to prevent race conditions on stock
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

      // Get user with userLevel for VIP discount calculation
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { userLevel: true },
      });

      if (!user) {
        throw new AppError(404, 'Usuario no encontrado', 'USER_NOT_FOUND');
      }

      // Calculate totals - usar distancia y costo de envío del frontend si están disponibles
      let deliveryCost = 0;
      
      if (data.deliveryType === 'DELIVERY') {
        // Si el frontend envía el costo de envío calculado, usarlo directamente
        if (data.shippingCost !== undefined && data.shippingCost !== null) {
          deliveryCost = Number(data.shippingCost);
        } else if (data.deliveryDistance) {
          // Si no, calcular basado en distancia
          deliveryCost = data.deliveryDistance * 1.5;
        } else {
          // Fallback: 10km por defecto
          deliveryCost = 10 * 1.5;
        }
      }
      
      // Calcular subtotal de items
      let subtotal = 0;
      for (const item of data.items) {
        subtotal += Number(item.totalPrice || 0);
      }

      // Apply VIP discount ANTES de calcular IVA (excluye montajes de calculadora)
      const vipDiscount = this.calculateVIPDiscount(user.userLevel, data.items);
      const subtotalAfterDiscount = subtotal - vipDiscount;
      
      // Calcular IVA sobre (subtotal CON descuento + envío)
      const taxRate = 0.21;
      const tax = (subtotalAfterDiscount + deliveryCost) * taxRate;
      
      const totals = {
        subtotal,
        deliveryCost,
        tax,
        total: subtotalAfterDiscount + deliveryCost + tax
      };

      // Calculate deposit (VIP users don't pay)
      const depositAmount = await this.calculateDeposit(user.userLevel, data.items);

      // Total final
      const finalTotal = subtotalAfterDiscount + totals.deliveryCost + totals.tax;

      // Generate order number
      const orderNumber = await this.generateOrderNumber();

      // Log VIP discount if applied
      if (vipDiscount > 0) {
        logger.info(`VIP discount applied: ${user.userLevel} - €${vipDiscount.toFixed(2)} (${user.userLevel === 'VIP' ? '25%' : '70%'})`);      }

      // Use transaction to prevent race conditions
      const order = await prisma.$transaction(async (tx) => {
        // First, verify and lock stock for all products
        for (const item of data.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { id: true, name: true, stock: true, realStock: true }
          });

          if (!product) {
            throw new AppError(404, `Producto no encontrado: ${item.productId}`, 'PRODUCT_NOT_FOUND');
          }

          // Calcular días hasta el evento
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const startDate = new Date(item.startDate);
          startDate.setHours(0, 0, 0, 0);
          const daysUntilEvent = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          // Si la reserva es con más de 30 días de antelación, siempre está disponible
          if (daysUntilEvent > 30) {
            logger.info(`Pedido con ${daysUntilEvent} días de antelación - stock no validado (tiempo suficiente para adquirir)`);
            continue; // Saltar validación de stock
          }

          // Para reservas con menos de 30 días, validar stock real
          const currentStock = product.realStock ?? product.stock ?? 0;
          if (currentStock < item.quantity) {
            throw new AppError(400, 
              `Stock insuficiente para ${product.name}. Disponible: ${currentStock}, Solicitado: ${item.quantity}`,
              'INSUFFICIENT_STOCK'
            );
          }
        }

        // Create order and update stock atomically
        const createdOrder = await tx.order.create({
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
            
            // Totales con descuento VIP aplicado
            subtotal: totals.subtotal, // Subtotal original
            discountAmount: vipDiscount, // Descuento VIP aplicado
            totalBeforeAdjustment: subtotalAfterDiscount, // Subtotal después del descuento
            taxAmount: totals.tax,
            total: finalTotal, // Total final con descuento aplicado
            deliveryFee: totals.deliveryCost,
            tax: totals.tax,
            totalAmount: finalTotal, // Total final
            
            // Costes adicionales requeridos
            shippingCost: totals.deliveryCost,
            depositAmount: depositAmount, // 0 para VIP, calculado para STANDARD
            
            // Información adicional
            notes: data.notes,
            eventType: data.eventType,
            eventLocation: JSON.stringify({ address: data.deliveryAddress || 'PICKUP' }),
            attendees: data.attendees,
            
            // Campos para pago a plazos
            eligibleForInstallments: data.eligibleForInstallments || false,
            isCalculatorEvent: data.isCalculatorEvent || false,
            
            // Vincular con Payment Intent de Stripe
            stripePaymentIntentId: (data as any).stripePaymentIntentId || null,
            
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
                  notes: (item as any).notes || null, // Notas específicas del producto
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

        // Update product stock and usage stats atomically in same transaction
        for (const item of data.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
              timesUsed: {
                increment: item.quantity, // Incrementar por la cantidad alquilada
              },
            },
          });
        }

        return createdOrder;
      });

      logger.info(`Order created: ${orderNumber} for user ${data.userId}`);

      // Crear plazos de pago si es elegible
      if (data.eligibleForInstallments && data.isCalculatorEvent && finalTotal > 500) {
        try {
          logger.info(`Creating installment plan for order ${order.id} - Total: €${finalTotal}`);
          const installmentService = new InstallmentService(prisma);
          
          // Obtener fecha del evento (primera fecha de inicio de los items)
          const eventDate = data.items[0]?.startDate || new Date();
          
          await installmentService.createInstallments(
            order.id,
            finalTotal,
            eventDate
          );
          
          logger.info(`✅ Installment plan created successfully for order ${order.id}`);
          
          // Marcar el primer plazo como PAGADO (el pago ya se realizó antes de crear la orden)
          const stripePaymentIntentId = (data as any).stripePaymentIntentId;
          if (stripePaymentIntentId) {
            try {
              // Obtener el primer installment
              const firstInstallment = await prisma.paymentInstallment.findFirst({
                where: {
                  orderId: order.id,
                  installmentNumber: 1
                }
              });
              
              if (firstInstallment) {
                await installmentService.markInstallmentAsPaid(
                  firstInstallment.id,
                  stripePaymentIntentId,
                  undefined // chargeId no disponible aquí
                );
                logger.info(`✅ First installment marked as PAID for order ${order.id}`);
              }
            } catch (markError) {
              logger.error('❌ Error marking first installment as paid:', markError);
            }
          }
        } catch (installmentError) {
          logger.error('❌ Error creating installments:', installmentError);
          // No fallar la creación de la orden si falla la creación de plazos
          // El admin puede crearlos manualmente después
        }
      }

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
              installments: {
                orderBy: {
                  installmentNumber: 'asc'
                }
              },
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
              installments: {
                orderBy: {
                  installmentNumber: 'asc'
                }
              },
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
   * Update order (Edit - Admin only)
   */
  async updateOrder(orderId: string, updateData: any) {
    try {
      // Verificar que el pedido existe
      const existing = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!existing) {
        throw new AppError(404, 'Pedido no encontrado', 'ORDER_NOT_FOUND');
      }

      // No permitir editar pedidos completados o entregados
      if ([OrderStatus.COMPLETED, OrderStatus.DELIVERED].includes(existing.status as any)) {
        throw new AppError(400, 'No se puede editar un pedido ya completado o entregado', 'CANNOT_EDIT');
      }

      // Validar que queden al menos 24 horas antes del evento
      const eventDate = new Date(existing.startDate);
      const now = new Date();
      const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntilEvent < 24) {
        throw new AppError(400, 'No se puede editar un pedido con menos de 24 horas antes del evento', 'TOO_CLOSE_TO_EVENT');
      }

      // Campos permitidos para editar
      const allowedFields = [
        'deliveryDate',
        'returnDate',
        'deliveryType',
        'deliveryAddress',
        'notes',
        'internalNotes',
      ];

      const dataToUpdate: any = {};
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          dataToUpdate[field] = updateData[field];
        }
      });

      const updated = await prisma.order.update({
        where: { id: orderId },
        data: dataToUpdate,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          },
          items: {
            include: {
              product: true,
            }
          }
        }
      });

      logger.info(`Order ${orderId} updated by admin`);

      return updated;
    } catch (error) {
      logger.error('Error updating order:', error);
      throw error;
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, userId?: string, reason?: string) {
    try {
      const order = await this.getOrderById(orderId, userId);

      if (order.status === OrderStatus.CANCELLED) {
        throw new AppError(400, 'El pedido ya está cancelado', 'ALREADY_CANCELLED');
      }

      if ([OrderStatus.DELIVERED, OrderStatus.COMPLETED].includes(order.status as any)) {
        throw new AppError(400, 'No se puede cancelar un pedido entregado o completado', 'CANNOT_CANCEL');
      }

      // Calcular si se puede reembolsar (más de 7 días antes del evento)
      const eventDate = new Date(order.startDate);
      const now = new Date();
      const daysUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      const canRefund = daysUntilEvent >= 7;
      
      // Añadir información sobre reembolso en las notas
      const refundNote = canRefund 
        ? 'Se procederá con el reembolso completo del adelanto.'
        : 'IMPORTANTE: Al cancelar con menos de 7 días de antelación, no se reembolsará el 50% del adelanto pagado.';

      // Si hay un motivo, añadirlo a las notas
      const updateData: any = {
        status: OrderStatus.CANCELLED,
      };

      if (reason) {
        const currentNotes = order.notes || '';
        updateData.notes = `${currentNotes}\n\n[CANCELADO] ${new Date().toLocaleString('es-ES')}:\nMotivo: ${reason}\nPolítica de reembolso: ${refundNote}`.trim();
      } else {
        const currentNotes = order.notes || '';
        updateData.notes = `${currentNotes}\n\n[CANCELADO] ${new Date().toLocaleString('es-ES')}\nPolítica de reembolso: ${refundNote}`.trim();
      }

      const cancelled = await prisma.order.update({
        where: { id: orderId },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          }
        }
      });

      logger.info(`Order ${orderId} cancelled${reason ? ` with reason: ${reason}` : ''}`);

      return cancelled;
    } catch (error) {
      logger.error('Error cancelling order:', error);
      throw error;
    }
  }

  /**
   * Delete order (admin only - hard delete)
   */
  async deleteOrder(orderId: string) {
    try {
      // Verificar que existe
      const order = await prisma.order.findUnique({
        where: { id: orderId }
      });

      if (!order) {
        throw new AppError(404, 'Pedido no encontrado', 'NOT_FOUND');
      }

      // Eliminar (CASCADE eliminará items, installments, etc.)
      await prisma.order.delete({
        where: { id: orderId }
      });

      logger.info(`Order ${orderId} deleted permanently`);
      
      return { success: true };
    } catch (error) {
      logger.error('Error deleting order:', error);
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
            installments: {
              orderBy: {
                installmentNumber: 'asc'
              }
            },
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

  /**
   * Marcar pedido como devuelto
   */
  async markAsReturned(orderId: string, returnData: {
    notes?: string;
    condition?: 'PERFECT' | 'GOOD' | 'DAMAGED';
    returnedBy: string;
  }) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
        },
      });

      if (!order) {
        throw new AppError(404, 'Pedido no encontrado', 'ORDER_NOT_FOUND');
      }

      // Actualizar orden a RETURNED o COMPLETED
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.RETURNED,
          depositStatus: 'RELEASED', // Liberar fianza
          returnedAt: new Date(),
          returnNotes: returnData.notes,
          returnCondition: returnData.condition || 'GOOD',
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

      // Devolver stock
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

      logger.info(`Order ${orderId} marked as returned by user ${returnData.returnedBy}`);

      return updatedOrder;
    } catch (error) {
      logger.error('Error marking order as returned:', error);
      throw error;
    }
  }

  /**
   * Cobrar fianza - Genera Payment Link para móvil
   */
  async captureDeposit(orderId: string, notes?: string) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: true,
        },
      });

      if (!order) {
        throw new AppError(404, 'Pedido no encontrado', 'ORDER_NOT_FOUND');
      }

      if (order.depositStatus === 'CAPTURED') {
        throw new AppError(400, 'La fianza ya ha sido cobrada', 'DEPOSIT_ALREADY_CAPTURED');
      }

      if (Number(order.depositAmount) <= 0) {
        throw new AppError(400, 'El pedido no tiene fianza a cobrar', 'NO_DEPOSIT');
      }

      // Importar stripeService dinámicamente para evitar dependencias circulares
      const { stripeService } = await import('./stripe.service');

      // Crear Payment Link de Stripe (se puede abrir en móvil y usar Tap to Pay)
      const paymentLink = await stripeService.createDepositPaymentLink(
        orderId,
        Number(order.depositAmount)
      );

      // Actualizar estado a AUTHORIZED (pendiente de pago)
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          depositStatus: 'AUTHORIZED',
          depositNotes: notes || `Payment Link creado: ${paymentLink.url}`,
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

      logger.info(`Payment Link created for order ${orderId}: ${paymentLink.url}`);

      // Retornar con el URL del payment link
      return {
        ...updatedOrder,
        depositPaymentLink: paymentLink.url,
      };
    } catch (error) {
      logger.error('Error capturing deposit:', error);
      throw error;
    }
  }

  /**
   * Devolver fianza
   */
  async releaseDeposit(orderId: string, retainedAmount?: number, notes?: string) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new AppError(404, 'Pedido no encontrado', 'ORDER_NOT_FOUND');
      }

      if (order.depositStatus === 'RELEASED') {
        throw new AppError(400, 'La fianza ya ha sido devuelta', 'DEPOSIT_ALREADY_RELEASED');
      }

      const depositStatus = retainedAmount && retainedAmount > 0 
        ? 'PARTIALLY_RETAINED' 
        : 'RELEASED';

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          depositStatus,
          depositReleasedAt: new Date(),
          depositRetainedAmount: retainedAmount || 0,
          depositNotes: notes || (retainedAmount ? 'Fianza parcialmente retenida' : 'Fianza devuelta completamente'),
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

      logger.info(`Deposit released for order ${orderId}, retained: ${retainedAmount || 0}`);

      return updatedOrder;
    } catch (error) {
      logger.error('Error releasing deposit:', error);
      throw error;
    }
  }
}

export const orderService = new OrderService();
