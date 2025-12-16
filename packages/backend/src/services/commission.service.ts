import { PrismaClient, CommissionStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class CommissionService {
  /**
   * Crear comisión cuando se envía un presupuesto
   */
  async createCommission(userId: string, quoteRequestId: string, quoteValue: number) {
    const commissionRate = 10; // 10%
    const commissionValue = (quoteValue * commissionRate) / 100;

    return await prisma.commission.create({
      data: {
        userId,
        quoteRequestId,
        quoteValue,
        commissionValue,
        commissionRate,
        status: CommissionStatus.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        quoteRequest: {
          select: {
            id: true,
            customerName: true,
            customerEmail: true,
            eventType: true,
            eventDate: true,
            status: true,
          },
        },
      },
    });
  }

  /**
   * Actualizar estado de comisión a GENERATED cuando se convierte el presupuesto
   */
  async markAsGenerated(quoteRequestId: string) {
    return await prisma.commission.updateMany({
      where: {
        quoteRequestId,
        status: CommissionStatus.PENDING,
      },
      data: {
        status: CommissionStatus.GENERATED,
      },
    });
  }

  /**
   * Marcar comisión como perdida cuando se rechaza el presupuesto
   */
  async markAsLost(quoteRequestId: string) {
    return await prisma.commission.updateMany({
      where: {
        quoteRequestId,
        status: CommissionStatus.PENDING,
      },
      data: {
        status: CommissionStatus.LOST,
      },
    });
  }

  /**
   * Marcar comisión como pagada
   */
  async markAsPaid(commissionId: string, paidBy: string, paymentMethod: string, paymentNotes?: string) {
    return await prisma.commission.update({
      where: { id: commissionId },
      data: {
        status: CommissionStatus.PAID,
        paidAt: new Date(),
        paidBy,
        paymentMethod,
        paymentNotes,
      },
    });
  }

  /**
   * Obtener comisiones de un comercial
   */
  async getCommissionsByUser(userId: string, filters?: {
    status?: CommissionStatus;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = { userId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    return await prisma.commission.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        quoteRequest: {
          select: {
            id: true,
            customerName: true,
            customerEmail: true,
            eventType: true,
            eventDate: true,
            status: true,
            estimatedTotal: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Obtener resumen de comisiones de un comercial
   */
  async getCommissionsSummary(userId: string) {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);

    // Comisiones del mes
    const monthCommissions = await prisma.commission.findMany({
      where: {
        userId,
        status: { in: [CommissionStatus.GENERATED, CommissionStatus.PAID] },
        createdAt: { gte: firstDayOfMonth },
      },
    });

    // Comisiones del trimestre
    const quarterCommissions = await prisma.commission.findMany({
      where: {
        userId,
        status: { in: [CommissionStatus.GENERATED, CommissionStatus.PAID] },
        createdAt: { gte: firstDayOfQuarter },
      },
    });

    // Comisiones del año
    const yearCommissions = await prisma.commission.findMany({
      where: {
        userId,
        status: { in: [CommissionStatus.GENERATED, CommissionStatus.PAID] },
        createdAt: { gte: firstDayOfYear },
      },
    });

    // Comisiones pendientes de pago
    const pendingPayment = await prisma.commission.findMany({
      where: {
        userId,
        status: CommissionStatus.GENERATED,
      },
    });

    const calculateTotal = (commissions: any[]) =>
      commissions.reduce((sum, c) => sum + Number(c.commissionValue), 0);

    return {
      month: {
        total: calculateTotal(monthCommissions),
        count: monthCommissions.length,
      },
      quarter: {
        total: calculateTotal(quarterCommissions),
        count: quarterCommissions.length,
      },
      year: {
        total: calculateTotal(yearCommissions),
        count: yearCommissions.length,
      },
      pending: {
        total: calculateTotal(pendingPayment),
        count: pendingPayment.length,
      },
    };
  }

  /**
   * Obtener todas las comisiones (solo admin)
   */
  async getAllCommissions(filters?: {
    status?: CommissionStatus;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    return await prisma.commission.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        quoteRequest: {
          select: {
            id: true,
            customerName: true,
            customerEmail: true,
            eventType: true,
            eventDate: true,
            status: true,
            estimatedTotal: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

export const commissionService = new CommissionService();
