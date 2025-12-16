import { PrismaClient, QuoteStatus, CommissionStatus, LeadStatus } from '@prisma/client';
import { commissionService } from './commission.service';
import { leadService } from './lead.service';

const prisma = new PrismaClient();

export class CommercialService {
  /**
   * Obtener dashboard completo del comercial
   */
  async getDashboard(userId: string) {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Estadísticas de presupuestos del mes
    const quotesThisMonth = await prisma.quoteRequest.count({
      where: {
        userId,
        createdAt: { gte: firstDayOfMonth },
      },
    });

    const quotesLastMonth = await prisma.quoteRequest.count({
      where: {
        userId,
        createdAt: {
          gte: firstDayOfLastMonth,
          lte: lastDayOfLastMonth,
        },
      },
    });

    // Presupuestos ganados (convertidos)
    const quotesWonThisMonth = await prisma.quoteRequest.count({
      where: {
        userId,
        status: QuoteStatus.CONVERTED,
        updatedAt: { gte: firstDayOfMonth },
      },
    });

    const quotesWonLastMonth = await prisma.quoteRequest.count({
      where: {
        userId,
        status: QuoteStatus.CONVERTED,
        updatedAt: {
          gte: firstDayOfLastMonth,
          lte: lastDayOfLastMonth,
        },
      },
    });

    // Tasa de conversión
    const conversionRate = quotesThisMonth > 0 
      ? Math.round((quotesWonThisMonth / quotesThisMonth) * 100 * 100) / 100
      : 0;

    const lastMonthConversionRate = quotesLastMonth > 0
      ? Math.round((quotesWonLastMonth / quotesLastMonth) * 100 * 100) / 100
      : 0;

    // Valor total de presupuestos enviados
    const quotesValueResult = await prisma.quoteRequest.aggregate({
      where: {
        userId,
        createdAt: { gte: firstDayOfMonth },
      },
      _sum: {
        estimatedTotal: true,
      },
    });

    const totalQuotesValue = Number(quotesValueResult._sum.estimatedTotal || 0);

    // Comisiones
    const commissionsSummary = await commissionService.getCommissionsSummary(userId);

    // Leads
    const leadsStats = await leadService.getLeadsStats(userId);

    // Actividad reciente
    const recentQuotes = await prisma.quoteRequest.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        customerName: true,
        customerEmail: true,
        eventType: true,
        eventDate: true,
        estimatedTotal: true,
        status: true,
        createdAt: true,
      },
    });

    const recentLeads = await prisma.lead.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        eventType: true,
        nextFollowUpDate: true,
        createdAt: true,
      },
    });

    // Seguimientos pendientes
    const pendingFollowUps = await leadService.getPendingFollowUps(userId);

    // Presupuestos por estado
    const quotesByStatus = await prisma.quoteRequest.groupBy({
      by: ['status'],
      where: { userId },
      _count: true,
    });

    return {
      stats: {
        quotes: {
          thisMonth: quotesThisMonth,
          lastMonth: quotesLastMonth,
          change: quotesLastMonth > 0 
            ? Math.round(((quotesThisMonth - quotesLastMonth) / quotesLastMonth) * 100)
            : 0,
        },
        quotesWon: {
          thisMonth: quotesWonThisMonth,
          lastMonth: quotesWonLastMonth,
          change: quotesWonLastMonth > 0
            ? Math.round(((quotesWonThisMonth - quotesWonLastMonth) / quotesWonLastMonth) * 100)
            : 0,
        },
        conversionRate: {
          current: conversionRate,
          lastMonth: lastMonthConversionRate,
          change: lastMonthConversionRate > 0
            ? Math.round(((conversionRate - lastMonthConversionRate) / lastMonthConversionRate) * 100)
            : 0,
        },
        totalQuotesValue,
      },
      commissions: commissionsSummary,
      leads: leadsStats,
      recentActivity: {
        quotes: recentQuotes,
        leads: recentLeads,
      },
      pendingFollowUps: pendingFollowUps.length,
      quotesByStatus: quotesByStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  /**
   * Obtener presupuestos del comercial
   */
  async getQuotes(userId: string, filters?: {
    status?: QuoteStatus;
    search?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = { userId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { customerName: { contains: filters.search, mode: 'insensitive' } },
        { customerEmail: { contains: filters.search, mode: 'insensitive' } },
        { eventType: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    return await prisma.quoteRequest.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        commissions: true,
      },
    });
  }

  /**
   * Asignar comercial a un presupuesto
   */
  async assignQuoteToCommercial(quoteRequestId: string, userId: string) {
    return await prisma.quoteRequest.update({
      where: { id: quoteRequestId },
      data: { userId },
    });
  }

  /**
   * Obtener estadísticas generales (solo admin)
   */
  async getAllCommercialsStats() {
    const commercials = await prisma.user.findMany({
      where: {
        role: 'COMMERCIAL',
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    const stats = await Promise.all(
      commercials.map(async (commercial) => {
        const dashboard = await this.getDashboard(commercial.id);
        return {
          commercial: {
            id: commercial.id,
            name: `${commercial.firstName} ${commercial.lastName}`,
            email: commercial.email,
          },
          stats: dashboard.stats,
          commissions: dashboard.commissions,
        };
      })
    );

    return stats;
  }
}

export const commercialService = new CommercialService();
