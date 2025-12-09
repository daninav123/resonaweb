import { Request, Response } from 'express';
import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

class QuoteRequestController {
  /**
   * Crear una nueva solicitud de presupuesto
   */
  async createQuoteRequest(req: Request, res: Response) {
    try {
      const {
        customerName,
        customerEmail,
        customerPhone,
        eventType,
        attendees,
        duration,
        durationType,
        eventDate,
        eventLocation,
        selectedPack,
        selectedExtras,
        estimatedTotal,
        notes,
      } = req.body;

      // Validaciones básicas - Al menos email O teléfono
      if (!customerEmail && !customerPhone) {
        throw new AppError(400, 'Se requiere al menos email o teléfono del cliente', 'VALIDATION_ERROR');
      }

      if (!eventType || !attendees || !duration) {
        throw new AppError(400, 'Información del evento incompleta', 'VALIDATION_ERROR');
      }

      // Crear solicitud
      const quoteRequest = await prisma.quoteRequest.create({
        data: {
          customerName: customerName || null,
          customerEmail,
          customerPhone: customerPhone || null,
          eventType,
          attendees: parseInt(attendees),
          duration: parseInt(duration),
          durationType,
          eventDate: eventDate || null,
          eventLocation: eventLocation || null,
          selectedPack: selectedPack || null,
          selectedExtras: selectedExtras || {},
          estimatedTotal: estimatedTotal ? parseFloat(estimatedTotal) : null,
          notes: notes || null,
        },
      });

      logger.info(`Nueva solicitud de presupuesto creada: ${quoteRequest.id} - ${customerEmail}`);

      res.status(201).json({
        success: true,
        message: 'Solicitud de presupuesto recibida correctamente',
        data: quoteRequest,
      });
    } catch (error) {
      logger.error('Error creating quote request:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las solicitudes (Admin)
   */
  async getAllQuoteRequests(req: Request, res: Response) {
    try {
      const { status, limit = 50, offset = 0 } = req.query;

      const where: any = {};
      if (status) {
        where.status = status;
      }

      const [quoteRequests, total] = await Promise.all([
        prisma.quoteRequest.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: parseInt(limit as string),
          skip: parseInt(offset as string),
        }),
        prisma.quoteRequest.count({ where }),
      ]);

      res.json({
        success: true,
        data: quoteRequests,
        pagination: {
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
        },
      });
    } catch (error) {
      logger.error('Error fetching quote requests:', error);
      throw error;
    }
  }

  /**
   * Obtener una solicitud por ID (Admin)
   */
  async getQuoteRequestById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const quoteRequest = await prisma.quoteRequest.findUnique({
        where: { id },
      });

      if (!quoteRequest) {
        throw new AppError(404, 'Solicitud no encontrada', 'NOT_FOUND');
      }

      res.json({
        success: true,
        data: quoteRequest,
      });
    } catch (error) {
      logger.error('Error fetching quote request:', error);
      throw error;
    }
  }

  /**
   * Actualizar estado de solicitud (Admin)
   */
  async updateQuoteRequest(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;

      console.log('🔍 Actualizando quote request:', { id, status, adminNotes });

      // Obtener presupuesto actual
      const currentQuote = await prisma.quoteRequest.findUnique({
        where: { id },
      });

      console.log('📋 Quote actual encontrado:', currentQuote ? 'SÍ' : 'NO');

      if (!currentQuote) {
        throw new AppError(404, 'Presupuesto no encontrado', 'NOT_FOUND');
      }

      const updateData: any = {
        ...(status && { status }),
        ...(adminNotes !== undefined && { adminNotes }),
      };

      console.log('💾 Data a actualizar (antes de payment):', updateData);

      // Si el estado cambia a CONVERTED (aceptado), generar token de pago y calcular pagos
      if (status === 'CONVERTED' && !currentQuote.paymentToken) {
        const paymentToken = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        const total = Number(currentQuote.estimatedTotal) || 0;
        
        updateData.paymentToken = paymentToken;
        updateData.firstPayment = total * 0.25;  // 25%
        updateData.secondPayment = total * 0.50; // 50%
        updateData.thirdPayment = total * 0.25;  // 25%

        console.log('💰 Generando pagos:', {
          paymentToken,
          total,
          firstPayment: updateData.firstPayment,
          secondPayment: updateData.secondPayment,
          thirdPayment: updateData.thirdPayment
        });

        logger.info(`Generando enlace de pago para presupuesto ${id}: ${paymentToken}`);
      }

      console.log('📝 Data final a actualizar:', updateData);

      const quoteRequest = await prisma.quoteRequest.update({
        where: { id },
        data: updateData,
      });

      console.log('✅ Quote request actualizado exitosamente');

      logger.info(`Quote request ${id} actualizada: ${status || 'notes'}`);

      res.json({
        success: true,
        message: 'Solicitud actualizada correctamente',
        data: quoteRequest,
      });
    } catch (error) {
      console.error('❌ ERROR COMPLETO en updateQuoteRequest:', error);
      logger.error('Error updating quote request:', error);
      throw error;
    }
  }

  /**
   * Eliminar solicitud (Admin)
   */
  async deleteQuoteRequest(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.quoteRequest.delete({
        where: { id },
      });

      logger.info(`Quote request ${id} eliminada`);

      res.json({
        success: true,
        message: 'Solicitud eliminada correctamente',
      });
    } catch (error) {
      logger.error('Error deleting quote request:', error);
      throw error;
    }
  }

  /**
   * Convertir solicitud a pedido
   */
  async convertToOrder(req: Request, res: Response) {
    const { id } = req.params;
    
    try {
      logger.info(`[convertToOrder] Iniciando conversión de solicitud ${id}`);

      // Obtener la solicitud
      const quoteRequest = await prisma.quoteRequest.findUnique({
        where: { id },
      });

      if (!quoteRequest) {
        logger.warn(`[convertToOrder] Solicitud ${id} no encontrada`);
        throw new AppError(404, 'Solicitud no encontrada', 'NOT_FOUND');
      }

      logger.info(`[convertToOrder] Solicitud encontrada: ${quoteRequest.customerEmail}, status: ${quoteRequest.status}`);

      // Verificar que no esté ya convertida
      if (quoteRequest.status === 'CONVERTED') {
        logger.warn(`[convertToOrder] Solicitud ${id} ya está convertida`);
        throw new AppError(400, 'Solicitud ya convertida a pedido', 'ALREADY_CONVERTED');
      }

      // Obtener información del usuario si existe
      let userId = null;
      if (quoteRequest.customerEmail) {
        try {
          const user = await prisma.user.findUnique({
            where: { email: quoteRequest.customerEmail },
          });
          if (user) {
            userId = user.id;
            logger.info(`[convertToOrder] Usuario encontrado: ${user.id}`);
          } else {
            logger.info(`[convertToOrder] Usuario no encontrado, se creará pedido sin usuario`);
          }
        } catch (userError) {
          logger.error(`[convertToOrder] Error buscando usuario:`, userError);
          // Continuar sin usuario
        }
      }

      // Calcular fecha de entrega (fecha del evento - 1 día)
      let deliveryDate = new Date();
      if (quoteRequest.eventDate) {
        const eventDate = new Date(quoteRequest.eventDate);
        deliveryDate = new Date(eventDate);
        deliveryDate.setDate(deliveryDate.getDate() - 1);
      } else {
        // Si no hay fecha de evento, +7 días desde ahora
        deliveryDate.setDate(deliveryDate.getDate() + 7);
      }

      // Preparar items del pedido
      const orderItems: any[] = [];
      
      logger.info(`[convertToOrder] Preparando items. Pack: ${quoteRequest.selectedPack}, Extras: ${JSON.stringify(quoteRequest.selectedExtras)}`);
      
      // Añadir pack si existe
      if (quoteRequest.selectedPack) {
        try {
          const pack = await prisma.product.findUnique({
            where: { id: quoteRequest.selectedPack },
          });
          
          if (pack) {
            const days = quoteRequest.durationType === 'hours' 
              ? Math.ceil(quoteRequest.duration / 8) 
              : quoteRequest.duration;
              
            const packSubtotal = Number(pack.pricePerDay) * days;
            orderItems.push({
              productId: pack.id,
              quantity: 1,
              pricePerDay: Number(pack.pricePerDay),
              subtotal: packSubtotal,
              startDate: quoteRequest.eventDate ? new Date(quoteRequest.eventDate) : deliveryDate,
              endDate: quoteRequest.eventDate ? new Date(quoteRequest.eventDate) : deliveryDate,
            });
            logger.info(`[convertToOrder] Pack añadido: ${pack.name}, €${pack.pricePerDay}/día x ${days} días`);
          } else {
            logger.warn(`[convertToOrder] Pack ${quoteRequest.selectedPack} no encontrado`);
          }
        } catch (packError) {
          logger.error(`[convertToOrder] Error obteniendo pack:`, packError);
        }
      }

      // Añadir extras
      try {
        const extrasEntries = Object.entries(quoteRequest.selectedExtras as Record<string, number>);
        logger.info(`[convertToOrder] Procesando ${extrasEntries.length} extras`);
        
        for (const [productId, quantity] of extrasEntries) {
          try {
            const product = await prisma.product.findUnique({
              where: { id: productId },
            });
            
            if (product) {
              const days = quoteRequest.durationType === 'hours' 
                ? Math.ceil(quoteRequest.duration / 8) 
                : quoteRequest.duration;
                
              const itemSubtotal = Number(product.pricePerDay) * days * Number(quantity);
              orderItems.push({
                productId: product.id,
                quantity: Number(quantity),
                pricePerDay: Number(product.pricePerDay),
                subtotal: itemSubtotal,
                startDate: quoteRequest.eventDate ? new Date(quoteRequest.eventDate) : deliveryDate,
                endDate: quoteRequest.eventDate ? new Date(quoteRequest.eventDate) : deliveryDate,
              });
              logger.info(`[convertToOrder] Extra añadido: ${product.name} x${quantity}`);
            } else {
              logger.warn(`[convertToOrder] Producto ${productId} no encontrado`);
            }
          } catch (productError) {
            logger.error(`[convertToOrder] Error obteniendo producto ${productId}:`, productError);
          }
        }
      } catch (extrasError) {
        logger.error(`[convertToOrder] Error procesando extras:`, extrasError);
      }

      // Calcular fecha de recogida (fecha del evento + 1 día)
      const pickupDate = new Date(deliveryDate);
      pickupDate.setDate(pickupDate.getDate() + (quoteRequest.durationType === 'hours' 
        ? Math.ceil(quoteRequest.duration / 8) 
        : quoteRequest.duration) + 2);

      // Si no hay items, no crear pedido
      if (orderItems.length === 0) {
        logger.error(`[convertToOrder] No se encontraron productos válidos`);
        throw new AppError(400, 'No se encontraron productos válidos para crear el pedido', 'NO_ITEMS');
      }

      logger.info(`[convertToOrder] Total items a crear: ${orderItems.length}`);
      logger.info(`[convertToOrder] Items:`, JSON.stringify(orderItems, null, 2));

      // Generar número de pedido único
      const year = new Date().getFullYear();
      const lastOrder = await prisma.order.findFirst({
        where: {
          orderNumber: {
            startsWith: `ORD-${year}`,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      let orderCounter = 1;
      if (lastOrder && lastOrder.orderNumber) {
        const lastNumber = parseInt(lastOrder.orderNumber.split('-')[2]);
        orderCounter = lastNumber + 1;
      }

      const orderNumber = `ORD-${year}-${orderCounter.toString().padStart(4, '0')}`;
      logger.info(`[convertToOrder] Order number generado: ${orderNumber}`);

      // Calcular totales
      const subtotal = Number(quoteRequest.estimatedTotal) || 0;
      const taxRate = 0.21; // 21% IVA
      const taxAmount = subtotal * taxRate;
      const totalAmount = subtotal + taxAmount;
      
      // Fechas del evento
      const startDate = quoteRequest.eventDate ? new Date(quoteRequest.eventDate) : new Date(deliveryDate);
      startDate.setHours(10, 0, 0, 0); // 10:00 AM por defecto
      
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + (quoteRequest.durationType === 'hours' ? quoteRequest.duration : quoteRequest.duration * 8));

      // Crear el pedido
      logger.info(`[convertToOrder] Creando pedido en BD...`);
      const order = await prisma.order.create({
        data: {
          userId: userId!,
          orderNumber: orderNumber,
          
          // Fechas
          startDate: startDate,
          endDate: endDate,
          deliveryDate: deliveryDate,
          
          // Información del evento
          eventType: quoteRequest.eventType || 'Evento',
          eventLocation: {
            address: quoteRequest.eventLocation || 'Dirección pendiente',
            city: '',
            postalCode: '',
            country: 'España'
          },
          attendees: quoteRequest.attendees || null,
          contactPerson: quoteRequest.customerName || 'Cliente',
          contactPhone: quoteRequest.customerPhone || 'Pendiente',
          notes: `Creado desde solicitud de presupuesto. ${quoteRequest.notes || ''}`,
          
          // Entrega
          deliveryType: 'DELIVERY',
          deliveryAddress: {
            address: quoteRequest.eventLocation || 'Dirección pendiente',
            city: '',
            postalCode: '',
            country: 'España'
          },
          
          // Totales
          subtotal,
          totalBeforeAdjustment: subtotal,
          taxAmount,
          total: totalAmount,
          totalAmount,
          
          // Costes adicionales
          shippingCost: 0,
          deliveryFee: 0,
          tax: taxAmount,
          
          // Fianza
          depositAmount: totalAmount * 0.2, // 20% de fianza
          depositStatus: 'PENDING', // Estado inicial de la fianza
          
          // Estado
          status: 'CONFIRMED',
          paymentStatus: 'PENDING',
          
          // Items
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

      // Actualizar solicitud a CONVERTED
      await prisma.quoteRequest.update({
        where: { id },
        data: { 
          status: 'CONVERTED',
          adminNotes: `Convertido a pedido ${order.id} el ${new Date().toLocaleDateString('es-ES')}`,
        },
      });

      logger.info(`Solicitud ${id} convertida a pedido ${order.id}`);

      res.status(200).json({
        success: true,
        message: 'Solicitud convertida a pedido exitosamente',
        data: {
          order,
          quoteRequestId: id,
        },
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        logger.error(`[convertToOrder] AppError: ${error.message}`);
        throw error;
      }
      
      logger.error(`[convertToOrder] Error crítico convirtiendo solicitud ${id}:`, {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code,
      });
      
      // Dar más información del error
      const errorMessage = error.message || 'Error desconocido';
      const errorDetails = {
        type: error.name,
        message: errorMessage,
        code: error.code,
      };
      
      throw new AppError(
        500, 
        `Error al convertir solicitud a pedido: ${errorMessage}`, 
        'INTERNAL_ERROR',
        errorDetails
      );
    }
  }

  /**
   * Obtener estadísticas de solicitudes (Admin)
   */
  async getQuoteStats(req: Request, res: Response) {
    try {
      const [
        total,
        pending,
        contacted,
        quoted,
        converted,
        rejected,
      ] = await Promise.all([
        prisma.quoteRequest.count(),
        prisma.quoteRequest.count({ where: { status: 'PENDING' } }),
        prisma.quoteRequest.count({ where: { status: 'CONTACTED' } }),
        prisma.quoteRequest.count({ where: { status: 'QUOTED' } }),
        prisma.quoteRequest.count({ where: { status: 'CONVERTED' } }),
        prisma.quoteRequest.count({ where: { status: 'REJECTED' } }),
      ]);

      res.json({
        success: true,
        data: {
          total,
          byStatus: {
            pending,
            contacted,
            quoted,
            converted,
            rejected,
          },
          conversionRate: total > 0 ? ((converted / total) * 100).toFixed(2) : 0,
        },
      });
    } catch (error) {
      logger.error('Error fetching quote stats:', error);
      throw error;
    }
  }
}

export const quoteRequestController = new QuoteRequestController();
