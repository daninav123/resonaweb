import { PrismaClient, PaymentStatus } from '@prisma/client';
import { addDays, addMonths } from 'date-fns';
import { emailService } from './email.service';
import { logger } from '../utils/logger';

/**
 * Servicio para gestionar pagos en 3 plazos
 * SOLO para eventos de calculadora > 500€
 * 
 * Distribución:
 * - 25% al hacer la reserva
 * - 50% un mes antes del evento
 * - 25% un día antes del evento
 */
export class InstallmentService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Verificar si un pedido califica para pagos en plazos
   */
  isEligibleForInstallments(total: number, isCalculatorEvent: boolean): boolean {
    return total > 500 && isCalculatorEvent;
  }

  /**
   * Crear los 3 plazos de pago para un pedido
   */
  async createInstallments(orderId: string, total: number, eventStartDate: Date) {
    // Calcular fechas de vencimiento
    const now = new Date();
    const oneMonthBefore = addMonths(eventStartDate, -1);
    const oneDayBefore = addDays(eventStartDate, -1);
    
    // Calcular montos (25% + 50% + 25%)
    const firstInstallment = total * 0.25;
    const secondInstallment = total * 0.50;
    const thirdInstallment = total * 0.25;
    
    const installments = [
      {
        orderId,
        installmentNumber: 1,
        percentage: 25.00,
        amount: firstInstallment,
        dueDate: now, // Pagar ahora (en la reserva)
        status: PaymentStatus.PENDING as PaymentStatus
      },
      {
        orderId,
        installmentNumber: 2,
        percentage: 50.00,
        amount: secondInstallment,
        dueDate: oneMonthBefore, // 1 mes antes del evento
        status: PaymentStatus.PENDING as PaymentStatus
      },
      {
        orderId,
        installmentNumber: 3,
        percentage: 25.00,
        amount: thirdInstallment,
        dueDate: oneDayBefore, // 1 día antes del evento
        status: PaymentStatus.PENDING as PaymentStatus
      }
    ];
    
    // Crear todos los plazos
    await this.prisma.paymentInstallment.createMany({
      data: installments
    });
    
    // Actualizar el pedido
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        eligibleForInstallments: true,
        paymentTerm: 'THREE_INSTALLMENTS'
      }
    });
    
    return installments;
  }

  /**
   * Obtener todos los plazos de un pedido
   */
  async getInstallmentsByOrder(orderId: string) {
    return await this.prisma.paymentInstallment.findMany({
      where: { orderId },
      orderBy: { installmentNumber: 'asc' }
    });
  }

  /**
   * Obtener plazos pendientes de un pedido
   */
  async getPendingInstallments(orderId: string) {
    return await this.prisma.paymentInstallment.findMany({
      where: {
        orderId,
        status: PaymentStatus.PENDING
      },
      orderBy: { installmentNumber: 'asc' }
    });
  }

  /**
   * Obtener el siguiente plazo pendiente
   */
  async getNextPendingInstallment(orderId: string) {
    const pending = await this.getPendingInstallments(orderId);
    return pending[0] || null;
  }

  /**
   * Marcar un plazo como pagado
   */
  async markInstallmentAsPaid(
    installmentId: string, 
    paymentIntentId: string,
    chargeId?: string
  ) {
    const installment = await this.prisma.paymentInstallment.update({
      where: { id: installmentId },
      data: {
        status: PaymentStatus.COMPLETED,
        paidDate: new Date(),
        stripePaymentIntentId: paymentIntentId,
        stripeChargeId: chargeId
      },
      include: {
        order: {
          include: {
            user: true,
            items: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    // Enviar email de confirmación
    try {
      // Obtener todos los plazos para mostrar en el email
      const allInstallments = await this.getInstallmentsByOrder(installment.orderId);
      const orderWithInstallments = {
        ...installment.order,
        installments: allInstallments
      };
      
      await emailService.sendInstallmentPaidEmail(installment, orderWithInstallments);
      logger.info(`✅ Installment paid email sent for installment ${installmentId}`);
    } catch (emailError) {
      logger.error('❌ Error sending installment paid email:', emailError);
      // No fallar la operación si falla el email
    }

    return installment;
  }

  /**
   * Marcar un plazo como fallido
   */
  async markInstallmentAsFailed(installmentId: string, errorMessage: string) {
    return await this.prisma.paymentInstallment.update({
      where: { id: installmentId },
      data: {
        status: PaymentStatus.FAILED,
        errorMessage
      }
    });
  }

  /**
   * Obtener todos los plazos que vencen pronto (para recordatorios)
   * @param daysAhead Días de anticipación (ej: 3 días)
   */
  async getUpcomingInstallments(daysAhead: number = 3) {
    const now = new Date();
    const futureDate = addDays(now, daysAhead);
    
    return await this.prisma.paymentInstallment.findMany({
      where: {
        status: PaymentStatus.PENDING,
        dueDate: {
          gte: now,
          lte: futureDate
        }
      },
      include: {
        order: {
          include: {
            user: true
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    });
  }

  /**
   * Verificar si todos los plazos de un pedido están pagados
   */
  async areAllInstallmentsPaid(orderId: string): Promise<boolean> {
    const pending = await this.getPendingInstallments(orderId);
    return pending.length === 0;
  }

  /**
   * Obtener resumen de plazos de un pedido
   */
  async getInstallmentsSummary(orderId: string) {
    const installments = await this.getInstallmentsByOrder(orderId);
    
    const total = installments.reduce((sum, inst) => sum + Number(inst.amount), 0);
    const paid = installments
      .filter(inst => inst.status === PaymentStatus.COMPLETED)
      .reduce((sum, inst) => sum + Number(inst.amount), 0);
    const pending = total - paid;
    
    return {
      total,
      paid,
      pending,
      installments,
      allPaid: pending === 0,
      nextDue: installments.find(inst => inst.status === PaymentStatus.PENDING)
    };
  }
}
