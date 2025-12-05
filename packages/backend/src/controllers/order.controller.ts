import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service';
import { AppError } from '../middleware/error.middleware';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { NotificationHelper } from '../utils/notificationHelper';
import { InstallmentService } from '../services/installment.service';

interface AuthRequest extends Request {
  user?: any;
}

export class OrderController {
  /**
   * Create a new order
   */
  async createOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const orderData = {
        userId: req.user.id,
        ...req.body,
      };

      const order = await orderService.createOrder(orderData);
      
      console.log('📦 createOrder result:', order);
      console.log('📦 createOrder type:', typeof order);
      
      // 🔔 Enviar notificación de nuevo pedido a admins
      try {
        const customerName = req.user.firstName && req.user.lastName 
          ? `${req.user.firstName} ${req.user.lastName}`
          : req.user.email;
        await NotificationHelper.notifyNewOrder(
          order.orderNumber,
          customerName,
          parseFloat(order.total.toString())
        );
      } catch (notifError) {
        console.error('⚠️  Error enviando notificación de nuevo pedido:', notifError);
      }
      
      const response = {
        message: 'Pedido creado exitosamente',
        order,
      };
      
      console.log('📦 Response to send:', JSON.stringify(response, null, 2));

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's orders
   */
  async getUserOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await orderService.getUserOrders(req.user.id, page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { id } = req.params;
      const userId = req.user.role === 'ADMIN' ? undefined : req.user.id;

      const order = await orderService.getOrderById(id, userId);
      res.json(order);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { id } = req.params;
      const { status } = req.body;

      console.log('📝 Actualizando estado del pedido:', { orderId: id, newStatus: status });

      // Validar que el estado existe
      const validStatuses: OrderStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
      
      if (!status) {
        console.error('❌ Estado no proporcionado');
        throw new AppError(400, 'Estado requerido', 'STATUS_REQUIRED');
      }

      if (!validStatuses.includes(status as OrderStatus)) {
        console.error('❌ Estado inválido:', status, 'Estados válidos:', validStatuses);
        throw new AppError(
          400, 
          `Estado inválido. Estados válidos: ${validStatuses.join(', ')}`, 
          'INVALID_STATUS'
        );
      }

      console.log('✅ Estado válido:', status);

      // Only admin can update any order
      const userId = req.user.role === 'ADMIN' || req.user.role === 'SUPERADMIN' ? undefined : req.user.id;

      const order = await orderService.updateOrderStatus(id, status, userId);
      
      res.json({
        message: 'Estado del pedido actualizado',
        order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update order (Edit - Admin only)
   */
  async updateOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores pueden editar pedidos', 'FORBIDDEN');
      }

      const { id } = req.params;
      const updateData = req.body;

      const order = await orderService.updateOrder(id, updateData);
      
      res.json({
        message: 'Pedido actualizado exitosamente',
        order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { id } = req.params;
      const { reason } = req.body;

      // Si es admin o superadmin, puede cancelar cualquier pedido (no pasar userId)
      // Si es usuario normal, solo puede cancelar sus propios pedidos (pasar userId)
      const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPERADMIN';
      const userId = isAdmin ? undefined : req.user.id;

      const order = await orderService.cancelOrder(id, userId, reason);
      
      res.json({
        message: 'Pedido cancelado exitosamente',
        order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all orders (admin only)
   */
  async getAllOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Acceso denegado', 'FORBIDDEN');
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const filters: any = {};
      if (req.query.status) filters.status = req.query.status as OrderStatus;
      if (req.query.paymentStatus) filters.paymentStatus = req.query.paymentStatus as PaymentStatus;
      if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
      if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);
      if (req.query.search) filters.search = req.query.search as string;

      const result = await orderService.getAllOrders(filters, page, limit);
      console.log('📦 getAllOrders result:', result);
      console.log('📦 getAllOrders type:', typeof result);
      console.log('📦 getAllOrders JSON:', JSON.stringify(result, null, 2));
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order statistics (admin only)
   */
  async getOrderStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Acceso denegado', 'FORBIDDEN');
      }

      const period = (req.query.period as 'day' | 'week' | 'month' | 'year') || 'month';
      const stats = await orderService.getOrderStats(period);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get upcoming events (admin only)
   */
  async getUpcomingEvents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Acceso denegado', 'FORBIDDEN');
      }

      const days = parseInt(req.query.days as string) || 7;
      const events = await orderService.getUpcomingEvents(days);
      res.json(events);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crear pedido directamente desde la calculadora
   */
  async createOrderFromCalculator(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const userId = req.user.id;
      const {
        eventType,
        attendees,
        duration,
        durationType,
        eventDate,
        eventLocation,
        selectedPack,
        selectedExtras,
        estimatedTotal,
        customOrderDetails, // NUEVO: Para pedidos personalizados
        stripePaymentIntentId // Payment Intent ID de Stripe
      } = req.body;

      const { prisma } = await import('../index');
      const { logger } = await import('../utils/logger');

      logger.info(`[createOrderFromCalculator] Creando pedido desde calculadora para usuario ${userId}`);

      // 1. Calcular fechas
      const startDate = eventDate ? new Date(eventDate) : new Date();
      startDate.setHours(10, 0, 0, 0);
      
      const days = durationType === 'hours' 
        ? Math.ceil(duration / 8) 
        : duration;
      
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + (durationType === 'hours' ? duration : duration * 8));
      
      const deliveryDate = new Date(startDate);
      deliveryDate.setDate(deliveryDate.getDate() - 1);

      // 2. Preparar orderItems
      const orderItems: any[] = [];
      
      // SI HAY customOrderDetails, crear pedido personalizado SIN buscar productos
      if (customOrderDetails) {
        logger.info(`[createOrderFromCalculator] Creando pedido personalizado: ${customOrderDetails.packName}`);
        
        // Usar el producto virtual "Evento Personalizado" que siempre existe
        const CUSTOM_EVENT_PRODUCT_ID = 'product-custom-event-virtual';
        const packSubtotal = Number(customOrderDetails.packPrice) || Number(estimatedTotal) || 0;
        
        // Verificar si el producto virtual existe, si no, usar el primero disponible
        let virtualProductId = CUSTOM_EVENT_PRODUCT_ID;
        const virtualProduct = await prisma.product.findUnique({ 
          where: { id: CUSTOM_EVENT_PRODUCT_ID } 
        });
        
        if (!virtualProduct) {
          logger.warn(`[createOrderFromCalculator] Producto virtual no encontrado, creando uno...`);
          // Como fallback, usar cualquier producto activo (temporalmente)
          const anyProduct = await prisma.product.findFirst({ where: { isActive: true } });
          if (anyProduct) {
            virtualProductId = anyProduct.id;
          } else {
            throw new AppError(500, 'No hay productos disponibles en el sistema', 'NO_PRODUCTS');
          }
        }
        
        // El precio por día para eventos personalizados es el precio total del evento
        // Usamos toda la duración del evento como 1 "día" conceptual
        const pricePerDayValue = packSubtotal / (days || 1);
        
        orderItems.push({
          productId: virtualProductId,
          quantity: 1,
          pricePerDay: pricePerDayValue,
          subtotal: packSubtotal,
          startDate,
          endDate,
        });
        
        logger.info(`[createOrderFromCalculator] Pedido personalizado creado:`);
        logger.info(`  - Total: €${packSubtotal}`);
        logger.info(`  - Precio por día: €${pricePerDayValue}`);
        logger.info(`  - Días: ${days}`);
      } else {
        // FLUJO ORIGINAL: Buscar productos existentes
        // Pack
        if (selectedPack) {
          const pack = await prisma.product.findUnique({ where: { id: selectedPack } });
          if (pack) {
            const packSubtotal = Number(pack.pricePerDay) * days;
            orderItems.push({
              productId: pack.id,
              quantity: 1,
              pricePerDay: Number(pack.pricePerDay),
              subtotal: packSubtotal,
              startDate,
              endDate,
            });
            logger.info(`[createOrderFromCalculator] Pack añadido: ${pack.name}`);
          }
        }
        
        // Extras
        if (selectedExtras && typeof selectedExtras === 'object') {
          for (const [productId, quantity] of Object.entries(selectedExtras)) {
            const product = await prisma.product.findUnique({ where: { id: productId } });
            if (product && Number(quantity) > 0) {
              const itemSubtotal = Number(product.pricePerDay) * days * Number(quantity);
              orderItems.push({
                productId: product.id,
                quantity: Number(quantity),
                pricePerDay: Number(product.pricePerDay),
                subtotal: itemSubtotal,
                startDate,
                endDate,
              });
              logger.info(`[createOrderFromCalculator] Extra añadido: ${product.name} x${quantity}`);
            }
          }
        }
      }

      if (orderItems.length === 0) {
        throw new AppError(400, 'No se seleccionaron productos', 'NO_ITEMS');
      }

      // 3. Calcular totales
      const subtotal = Number(estimatedTotal) || 0;
      const taxRate = 0.21; // 21% IVA
      const taxAmount = subtotal * taxRate;
      const total = subtotal + taxAmount;

      // 4. Obtener datos del usuario
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true, phone: true }
      });

      // 5. Generar orderNumber
      const year = new Date().getFullYear();
      const lastOrder = await prisma.order.findFirst({
        where: { orderNumber: { startsWith: `ORD-${year}` } },
        orderBy: { createdAt: 'desc' },
      });
      
      let orderCounter = 1;
      if (lastOrder?.orderNumber) {
        const lastNumber = parseInt(lastOrder.orderNumber.split('-')[2]);
        orderCounter = lastNumber + 1;
      }
      
      const orderNumber = `ORD-${year}-${orderCounter.toString().padStart(4, '0')}`;
      logger.info(`[createOrderFromCalculator] Order number: ${orderNumber}`);

      // 6. Crear Order
      const order = await prisma.order.create({
        data: {
          userId,
          orderNumber,
          startDate,
          endDate,
          deliveryDate,
          
          eventType: eventType || 'Evento',
          eventLocation: {
            address: eventLocation || 'Por confirmar'
          },
          attendees: attendees || null,
          contactPerson: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Cliente',
          contactPhone: user?.phone || 'Pendiente',
          notes: customOrderDetails 
            ? `📋 PEDIDO PERSONALIZADO DESDE CALCULADORA\n\n` +
              `📦 Pack: ${customOrderDetails.packName}\n` +
              `💰 Precio Pack: €${customOrderDetails.packPrice}\n\n` +
              `🎉 Evento: ${eventType || 'Evento personalizado'}\n` +
              `👥 Asistentes: ${attendees || 'N/A'}\n` +
              `📍 Ubicación: ${eventLocation || 'Por confirmar'}\n\n` +
              (customOrderDetails.parts && customOrderDetails.parts.length > 0 
                ? `📦 Partes del Evento:\n${customOrderDetails.parts.map((p: any) => `   • ${p.name} - €${p.price || 0}`).join('\n')}\n\n💰 Total Partes: €${customOrderDetails.partsTotal}\n\n`
                : '') +
              (customOrderDetails.extras && customOrderDetails.extras.length > 0 
                ? `✨ Extras:\n${customOrderDetails.extras.map((e: any) => `   • ${e.name} x${e.quantity} - €${e.total || 0}`).join('\n')}\n\n💰 Total Extras: €${customOrderDetails.extrasTotal}\n\n`
                : '') +
              `💵 Total Estimado: €${estimatedTotal}\n\n` +
              `✅ Pago completado directamente`
            : 'Pedido creado desde calculadora web - Pago directo',
          
          deliveryType: 'DELIVERY',
          deliveryAddress: {
            address: eventLocation || 'Por confirmar'
          },
          
          subtotal,
          totalBeforeAdjustment: subtotal,
          taxAmount,
          total,
          totalAmount: total,
          shippingCost: 0,
          deliveryFee: 0,
          tax: taxAmount,
          depositAmount: total * 0.2, // 20% fianza
          depositStatus: 'PENDING', // Estado inicial de la fianza
          
          status: 'PENDING', // Cambiará a CONFIRMED tras pago
          paymentStatus: 'PENDING',
          
          // Campos para pago a plazos
          eligibleForInstallments: total > 500, // Elegible si total > 500€
          isCalculatorEvent: true, // Viene de la calculadora
          
          // Vincular con el Payment Intent de Stripe
          stripePaymentIntentId: stripePaymentIntentId || null,
          
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      logger.info(`[createOrderFromCalculator] Pedido creado: ${order.id}`);

      // Crear plazos de pago si el pedido es elegible (calculadora + total > 500€)
      const isFromCalculator = true; // Este método solo se usa desde calculadora
      if (isFromCalculator && total > 500) {
        try {
          logger.info(`[createOrderFromCalculator] Creando plazos de pago para orden ${order.id} - Total: €${total}`);
          const installmentService = new InstallmentService(prisma);
          
          await installmentService.createInstallments(
            order.id,
            total,
            startDate
          );
          
          logger.info(`✅ [createOrderFromCalculator] Plazos creados exitosamente para orden ${order.id}`);
          
          // Marcar el primer plazo como PAGADO (el pago ya se realizó antes de crear la orden)
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
                logger.info(`✅ [createOrderFromCalculator] Primer plazo marcado como PAGADO para orden ${order.id}`);
              }
            } catch (markError) {
              logger.error('❌ [createOrderFromCalculator] Error marcando primer plazo como pagado:', markError);
            }
          }
        } catch (installmentError) {
          logger.error('❌ [createOrderFromCalculator] Error creando plazos:', installmentError);
          // No fallar la creación de la orden si falla la creación de plazos
        }
      }

      // Recargar la orden con installments incluidos
      const orderWithInstallments = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true
            }
          },
          payment: true,
          invoice: true,
          installments: {
            orderBy: {
              installmentNumber: 'asc'
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        message: 'Pedido creado correctamente',
        data: { order: orderWithInstallments },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Marcar pedido como devuelto
   */
  async markAsReturned(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { notes, condition } = req.body;

      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const order = await orderService.markAsReturned(id, {
        notes,
        condition,
        returnedBy: req.user.id,
      });

      res.json({
        success: true,
        message: 'Pedido marcado como devuelto',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cobrar fianza
   */
  async captureDeposit(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const order = await orderService.captureDeposit(id, notes);

      res.json({
        success: true,
        message: 'Fianza cobrada correctamente',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Devolver fianza
   */
  async releaseDeposit(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { retainedAmount, notes } = req.body;

      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const order = await orderService.releaseDeposit(id, retainedAmount, notes);

      res.json({
        success: true,
        message: retainedAmount > 0 
          ? 'Fianza devuelta parcialmente' 
          : 'Fianza devuelta completamente',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
