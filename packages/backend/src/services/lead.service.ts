import { PrismaClient, LeadStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class LeadService {
  /**
   * Crear un nuevo lead
   */
  async createLead(userId: string, data: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    origin?: string;
    eventType?: string;
    estimatedBudget?: number;
    eventDate?: Date;
    notes?: string;
    nextFollowUpDate?: Date;
  }) {
    return await prisma.lead.create({
      data: {
        userId,
        ...data,
        status: LeadStatus.NEW,
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
      },
    });
  }

  /**
   * Obtener leads de un comercial
   */
  async getLeadsByUser(userId: string, filters?: {
    status?: LeadStatus;
    search?: string;
  }) {
    const where: any = { userId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { company: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return await prisma.lead.findMany({
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
      },
      orderBy: [
        { status: 'asc' },
        { nextFollowUpDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Obtener un lead por ID
   */
  async getLeadById(id: string, userId?: string) {
    const where: any = { id };
    if (userId) {
      where.userId = userId;
    }

    return await prisma.lead.findFirst({
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
      },
    });
  }

  /**
   * Actualizar un lead
   */
  async updateLead(id: string, userId: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    origin?: string;
    eventType?: string;
    estimatedBudget?: number;
    eventDate?: Date;
    status?: LeadStatus;
    notes?: string;
    lastContactDate?: Date;
    nextFollowUpDate?: Date;
  }) {
    return await prisma.lead.update({
      where: {
        id,
        userId, // Asegurar que solo actualiza sus propios leads
      },
      data,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Marcar lead como convertido
   */
  async markAsConverted(id: string, userId: string, quoteRequestId: string) {
    return await prisma.lead.update({
      where: {
        id,
        userId,
      },
      data: {
        status: LeadStatus.CONVERTED,
        convertedAt: new Date(),
        convertedToQuoteId: quoteRequestId,
      },
    });
  }

  /**
   * Eliminar un lead
   */
  async deleteLead(id: string, userId: string) {
    return await prisma.lead.delete({
      where: {
        id,
        userId, // Asegurar que solo elimina sus propios leads
      },
    });
  }

  /**
   * Obtener leads con seguimiento pendiente
   */
  async getPendingFollowUps(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await prisma.lead.findMany({
      where: {
        userId,
        status: { in: [LeadStatus.CONTACTED, LeadStatus.INTERESTED, LeadStatus.NEGOTIATING] },
        nextFollowUpDate: {
          lte: new Date(), // Seguimientos vencidos o de hoy
        },
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
      },
      orderBy: {
        nextFollowUpDate: 'asc',
      },
    });
  }

  /**
   * Obtener estadísticas de leads de un comercial
   */
  async getLeadsStats(userId: string) {
    const total = await prisma.lead.count({ where: { userId } });

    const byStatus = await prisma.lead.groupBy({
      by: ['status'],
      where: { userId },
      _count: true,
    });

    const converted = await prisma.lead.count({
      where: {
        userId,
        status: LeadStatus.CONVERTED,
      },
    });

    const conversionRate = total > 0 ? (converted / total) * 100 : 0;

    const pendingFollowUps = await this.getPendingFollowUps(userId);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      converted,
      conversionRate: Math.round(conversionRate * 100) / 100,
      pendingFollowUps: pendingFollowUps.length,
    };
  }

  /**
   * Obtener todos los leads (solo admin)
   */
  async getAllLeads(filters?: {
    status?: LeadStatus;
    userId?: string;
    search?: string;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { company: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return await prisma.lead.findMany({
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
      },
      orderBy: [
        { status: 'asc' },
        { nextFollowUpDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }
}

export const leadService = new LeadService();
