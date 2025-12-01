import { ModificationType, RefundStatus, PaymentStatus, OrderStatus } from '@prisma/client';
import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { stripeService } from './stripe.service';

class OrderModificationService {
  /**
   * Verificar si un pedido puede ser modificado (24h antes)
   */
  async canModifyOrder(orderId: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError(404, 'Pedido no encontrado', 'ORDER_NOT_FOUND');

    if ([OrderStatus.CANCELLED, OrderStatus.COMPLETED].includes(order.status as any)) {
      return { canModify: false, reason: 'Pedido ya completado o cancelado' };
    }

    const hoursUntil = (new Date(order.startDate).getTime() - Date.now()) / (1000 * 60 * 60);
    
    if (hoursUntil < 24) {
      return { canModify: false, reason: 'Solo se puede editar hasta 24h antes del pedido' };
    }

    return { canModify: true, hoursUntil, daysUntil: hoursUntil / 24 };
  }

  /**
   * Añadir items a pedido
   */
  async addItems(orderId: string, newItems: any[], userId: string, reason?: string) {
    const check = await this.canModifyOrder(orderId);
    if (!check.canModify) throw new AppError(400, check.reason!, 'CANNOT_MODIFY');

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    const additionalCost = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const newTotal = Number(order!.total) + additionalCost;

    // Crear modificación
    const mod = await prisma.orderModification.create({
      data: {
        orderId,
        modifiedBy: userId,
        type: ModificationType.ADD_ITEMS,
        reason,
        oldTotal: order!.total,
        newTotal,
        difference: additionalCost,
        itemsAdded: newItems,
      },
    });

    // Añadir items
    for (const item of newItems) {
      await prisma.orderItem.create({
        data: {
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          pricePerDay: item.pricePerUnit,
          pricePerUnit: item.pricePerUnit,
          subtotal: item.totalPrice,
          totalPrice: item.totalPrice,
          startDate: new Date(item.startDate),
          endDate: new Date(item.endDate),
        },
      });
    }

    // Actualizar pedido
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        total: newTotal,
        isModified: true,
        originalTotal: order!.originalTotal || order!.total,
        modificationCount: { increment: 1 },
        lastModifiedAt: new Date(),
      },
      include: { items: { include: { product: true } }, modifications: true },
    });

    // Crear cargo Stripe si hay costo adicional
    if (additionalCost > 0) {
      try {
        const pi = await stripeService.createAdditionalPayment(
          orderId, 
          userId, 
          additionalCost,
          `Cargo adicional por productos añadidos`
        );
        await prisma.orderModification.update({
          where: { id: mod.id },
          data: { stripePaymentId: pi.id },
        });
      } catch (error) {
        logger.error('Error creating Stripe payment for additional items:', error);
        // Continuar sin el payment intent, se puede pagar manualmente
      }
    }

    logger.info(`Items added to order ${orderId}. Cost: €${additionalCost}`);
    return updated;
  }

  /**
   * Eliminar items
   */
  async removeItems(orderId: string, itemIds: string[], userId: string, reason?: string) {
    const check = await this.canModifyOrder(orderId);
    if (!check.canModify) throw new AppError(400, check.reason!, 'CANNOT_MODIFY');

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (itemIds.length === order!.items.length) {
      throw new AppError(400, 'No puedes eliminar todos. Cancela el pedido.', 'CANNOT_REMOVE_ALL');
    }

    const toRemove = order!.items.filter(i => itemIds.includes(i.id));
    const refundAmt = toRemove.reduce((s, i) => s + Number(i.totalPrice), 0);
    const newTotal = Number(order!.total) - refundAmt;

    await prisma.orderModification.create({
      data: {
        orderId,
        modifiedBy: userId,
        type: ModificationType.REMOVE_ITEMS,
        reason,
        oldTotal: order!.total,
        newTotal,
        difference: -refundAmt,
        itemsRemoved: toRemove,
      },
    });

    await prisma.orderItem.deleteMany({ where: { id: { in: itemIds } } });

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        total: newTotal,
        isModified: true,
        modificationCount: { increment: 1 },
        lastModifiedAt: new Date(),
      },
      include: { items: { include: { product: true } } },
    });

    // NO procesar reembolso automáticamente - requiere aprobación admin
    // Marcar modificación como pendiente de reembolso
    if (refundAmt > 0) {
      logger.info(`Refund pending approval for removed items: €${refundAmt}`);
      // El admin debe aprobar el reembolso desde el panel
    }

    return updated;
  }

  /**
   * Cancelar con política de reembolso
   */
  async cancelWithRefund(orderId: string, userId: string, reason?: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError(404, 'Pedido no encontrado', 'NOT_FOUND');
    if (order.status === OrderStatus.CANCELLED) throw new AppError(400, 'Ya cancelado', 'ALREADY_CANCELLED');

    const daysUntil = (new Date(order.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);

    // Política de reembolso
    let refundPct = 0;
    if (daysUntil >= 7) refundPct = 100;
    else if (daysUntil >= 1) refundPct = 50;
    else refundPct = 0;

    const totalPaid = Number(order.total);
    const refundAmt = (totalPaid * refundPct) / 100;

    await prisma.orderModification.create({
      data: {
        orderId,
        modifiedBy: userId,
        type: ModificationType.CANCEL,
        reason: reason || `Cancelación (${daysUntil.toFixed(1)} días antes)`,
        oldTotal: order.total,
        newTotal: 0,
        difference: -refundAmt,
      },
    });

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelReason: reason,
        refundAmount: refundAmt,
        refundStatus: refundPct === 100 ? RefundStatus.FULL : refundPct === 50 ? RefundStatus.PARTIAL : RefundStatus.NONE,
      },
    });

    // NO procesar reembolso automáticamente - requiere aprobación admin
    if (refundAmt > 0) {
      logger.info(`Order ${orderId} cancelled. Refund pending approval: ${refundPct}% (€${refundAmt})`);
      // El admin debe aprobar el reembolso desde el panel
    } else {
      logger.info(`Order ${orderId} cancelled. No refund (< 24h before event)`);
    }

    return updated;
  }

  /**
   * Obtener payment intent de una modificación
   */
  async getPaymentIntent(orderId: string, modificationId: string) {
    const modification = await prisma.orderModification.findUnique({
      where: { id: modificationId },
    });

    if (!modification) {
      throw new AppError(404, 'Modificación no encontrada', 'NOT_FOUND');
    }

    if (!modification.stripePaymentId) {
      throw new AppError(400, 'No hay payment intent asociado', 'NO_PAYMENT');
    }

    // Obtener el payment intent de Stripe
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.retrieve(modification.stripePaymentId);

    return paymentIntent;
  }

  /**
   * Aprobar reembolso (ADMIN ONLY)
   */
  async approveRefund(modificationId: string, adminId: string) {
    const modification = await prisma.orderModification.findUnique({
      where: { id: modificationId },
      include: { order: true },
    });

    if (!modification) {
      throw new AppError(404, 'Modificación no encontrada', 'NOT_FOUND');
    }

    if (Number(modification.difference) >= 0) {
      throw new AppError(400, 'Esta modificación no tiene reembolso pendiente', 'NO_REFUND');
    }

    if (modification.paymentStatus === PaymentStatus.REFUNDED) {
      throw new AppError(400, 'El reembolso ya fue procesado', 'ALREADY_REFUNDED');
    }

    const refundAmount = Math.abs(Number(modification.difference));
    const order = modification.order;

    if (!order.stripePaymentIntentId) {
      throw new AppError(400, 'No hay payment intent para reembolsar', 'NO_PAYMENT_INTENT');
    }

    // Procesar reembolso en Stripe
    try {
      const refund = await stripeService.createRefund(
        order.stripePaymentIntentId,
        refundAmount * 100,
        `Reembolso aprobado por admin - Modificación ${modification.type}`
      );

      // Actualizar modificación
      await prisma.orderModification.update({
        where: { id: modificationId },
        data: {
          stripeRefundId: refund.id,
          paymentStatus: PaymentStatus.REFUNDED,
          processedAt: new Date(),
        },
      });

      // Actualizar estado de reembolso del pedido si es cancelación
      if (modification.type === ModificationType.CANCEL) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            refundStatus: RefundStatus.COMPLETED,
            refundProcessedAt: new Date(),
          },
        });
      }

      logger.info(`Refund approved and processed: €${refundAmount} for modification ${modificationId}`);
      
      return {
        success: true,
        refund,
        amount: refundAmount,
      };
    } catch (error) {
      logger.error('Error processing approved refund:', error);
      throw new AppError(500, 'Error procesando el reembolso en Stripe', 'REFUND_ERROR');
    }
  }

  /**
   * Obtener reembolsos pendientes de aprobación
   */
  async getPendingRefunds() {
    const modifications = await prisma.orderModification.findMany({
      where: {
        difference: { lt: 0 }, // Solo modificaciones con reembolso
        paymentStatus: { not: PaymentStatus.REFUNDED }, // No procesadas
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            startDate: true,
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        modifiedByUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return modifications;
  }
}

export const orderModificationService = new OrderModificationService();
