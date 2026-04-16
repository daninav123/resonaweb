import { prisma } from '../index';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger';

// ============= TYPES =============
interface CRMFilters {
  search?: string;
  customerType?: string;
  tag?: string;
  scoringMin?: number;
  scoringMax?: number;
  hasNextFollowUp?: boolean;
  assignedTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface UpdateCRMInput {
  customerType?: string;
  tags?: string[];
  source?: string;
  nextFollowUp?: string | null;
  assignedTo?: string | null;
  crmNotes?: string | null;
}

// ============= SERVICE =============
export class CRMService {
  /**
   * Listar clientes con datos CRM enriquecidos
   */
  async listCustomers(filters: CRMFilters) {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      const where: Prisma.UserWhereInput = {
        role: 'CLIENT',
      };

      if (filters.search) {
        where.OR = [
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { phone: { contains: filters.search, mode: 'insensitive' } },
        ];
      }
      if (filters.customerType) where.customerType = filters.customerType;
      if (filters.tag) where.tags = { has: filters.tag };
      if (filters.scoringMin !== undefined || filters.scoringMax !== undefined) {
        where.scoring = {};
        if (filters.scoringMin !== undefined) where.scoring.gte = filters.scoringMin;
        if (filters.scoringMax !== undefined) where.scoring.lte = filters.scoringMax;
      }
      if (filters.hasNextFollowUp) where.nextFollowUp = { not: null };
      if (filters.assignedTo) where.assignedTo = filters.assignedTo;

      // Determinar orden
      let orderBy: any = { createdAt: 'desc' };
      if (filters.sortBy === 'scoring') orderBy = { scoring: filters.sortOrder || 'desc' };
      else if (filters.sortBy === 'lastContact') orderBy = { lastContactDate: filters.sortOrder || 'desc' };
      else if (filters.sortBy === 'name') orderBy = { firstName: filters.sortOrder || 'asc' };
      else if (filters.sortBy === 'nextFollowUp') orderBy = { nextFollowUp: filters.sortOrder || 'asc' };

      const [customers, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            customerType: true,
            tags: true,
            scoring: true,
            source: true,
            lastContactDate: true,
            nextFollowUp: true,
            assignedTo: true,
            crmNotes: true,
            createdAt: true,
            lastLoginAt: true,
            billingData: {
              select: { companyName: true, taxId: true, city: true },
            },
            _count: {
              select: { orders: true, customerCommunications: true, customerTasks: true },
            },
          },
        }),
        prisma.user.count({ where }),
      ]);

      // Enriquecer con stats de pedidos
      const enriched = await Promise.all(
        customers.map(async (customer) => {
          const orderStats = await prisma.order.aggregate({
            where: { userId: customer.id, status: { not: 'CANCELLED' } },
            _sum: { total: true },
            _count: true,
          });

          return {
            ...customer,
            totalSpent: Number(orderStats._sum.total || 0),
            orderCount: orderStats._count || 0,
            avgTicket: orderStats._count > 0 ? Number(orderStats._sum.total || 0) / orderStats._count : 0,
          };
        })
      );

      return {
        data: enriched,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      logger.error('Error listing CRM customers:', error);
      throw error;
    }
  }

  /**
   * Obtener ficha completa de un cliente
   */
  async getCustomerProfile(userId: string) {
    try {
      const customer = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          billingData: true,
          orders: {
            take: 10,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true, orderNumber: true, total: true, status: true, createdAt: true,
              eventType: true, startDate: true, endDate: true,
            },
          },
          customerNotes: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
          customerCommunications: {
            take: 20,
            orderBy: { createdAt: 'desc' },
          },
          customerTasks: {
            orderBy: [{ completed: 'asc' }, { dueDate: 'asc' }],
          },
          quoteRequests: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true, status: true, estimatedTotal: true, createdAt: true, eventType: true,
            },
          },
          budgets: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true, budgetNumber: true, total: true, status: true, createdAt: true,
            },
          },
        },
      });

      if (!customer) throw new Error('Cliente no encontrado');

      const pendingTasksCount = customer.customerTasks?.filter((t: any) => !t.completed).length || 0;

      // Calcular stats
      const orderStats = await prisma.order.aggregate({
        where: { userId, status: { not: 'CANCELLED' } },
        _sum: { total: true },
        _count: true,
      });

      const firstOrder = await prisma.order.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      });

      return {
        ...customer,
        stats: {
          totalSpent: Number(orderStats._sum.total || 0),
          orderCount: orderStats._count || 0,
          avgTicket: orderStats._count > 0 ? Number(orderStats._sum.total || 0) / orderStats._count : 0,
          firstOrderDate: firstOrder?.createdAt || null,
          daysSinceRegistration: Math.floor((Date.now() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
          pendingTasks: pendingTasksCount,
        },
      };
    } catch (error) {
      logger.error('Error getting customer profile:', error);
      throw error;
    }
  }

  /**
   * Actualizar datos CRM de un cliente
   */
  async updateCRM(userId: string, data: UpdateCRMInput) {
    try {
      const updateData: any = {};
      if (data.customerType !== undefined) updateData.customerType = data.customerType;
      if (data.tags !== undefined) updateData.tags = data.tags;
      if (data.source !== undefined) updateData.source = data.source;
      if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;
      if (data.crmNotes !== undefined) updateData.crmNotes = data.crmNotes;
      if (data.nextFollowUp !== undefined) {
        updateData.nextFollowUp = data.nextFollowUp ? new Date(data.nextFollowUp) : null;
      }

      return await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true, customerType: true, tags: true, scoring: true,
          source: true, nextFollowUp: true, assignedTo: true, crmNotes: true,
        },
      });
    } catch (error) {
      logger.error('Error updating CRM data:', error);
      throw error;
    }
  }

  /**
   * Recalcular scoring de un cliente
   */
  async recalculateScoring(userId: string) {
    try {
      const [orderStats, lastOrder, communications] = await Promise.all([
        prisma.order.aggregate({
          where: { userId, status: { not: 'CANCELLED' } },
          _sum: { total: true },
          _count: true,
        }),
        prisma.order.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true },
        }),
        prisma.customerCommunication.count({ where: { userId } }),
      ]);

      let score = 0;
      const totalSpent = Number(orderStats._sum.total || 0);
      const orderCount = orderStats._count || 0;

      // Puntos por gasto total (max 30)
      if (totalSpent > 10000) score += 30;
      else if (totalSpent > 5000) score += 25;
      else if (totalSpent > 2000) score += 20;
      else if (totalSpent > 1000) score += 15;
      else if (totalSpent > 500) score += 10;
      else if (totalSpent > 0) score += 5;

      // Puntos por numero de pedidos (max 25)
      if (orderCount >= 10) score += 25;
      else if (orderCount >= 5) score += 20;
      else if (orderCount >= 3) score += 15;
      else if (orderCount >= 2) score += 10;
      else if (orderCount >= 1) score += 5;

      // Puntos por recencia (max 25)
      if (lastOrder) {
        const daysSince = Math.floor((Date.now() - new Date(lastOrder.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSince <= 30) score += 25;
        else if (daysSince <= 90) score += 20;
        else if (daysSince <= 180) score += 15;
        else if (daysSince <= 365) score += 10;
        else score += 5;
      }

      // Puntos por interaccion (max 20)
      if (communications >= 10) score += 20;
      else if (communications >= 5) score += 15;
      else if (communications >= 3) score += 10;
      else if (communications >= 1) score += 5;

      const finalScore = Math.min(score, 100);

      await prisma.user.update({
        where: { id: userId },
        data: { scoring: finalScore },
      });

      return { scoring: finalScore };
    } catch (error) {
      logger.error('Error recalculating scoring:', error);
      throw error;
    }
  }

  // ============= COMUNICACIONES =============
  async addCommunication(userId: string, data: {
    type: string; direction?: string; subject?: string; content: string;
    outcome?: string; duration?: number; authorName: string;
  }) {
    try {
      const comm = await prisma.customerCommunication.create({
        data: { userId, ...data },
      });
      // Actualizar lastContactDate
      await prisma.user.update({
        where: { id: userId },
        data: { lastContactDate: new Date() },
      });
      return comm;
    } catch (error) {
      logger.error('Error adding communication:', error);
      throw error;
    }
  }

  async getCommunications(userId: string, limit = 20) {
    return prisma.customerCommunication.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  // ============= TAREAS =============
  async addTask(userId: string, data: {
    title: string; description?: string; dueDate?: string;
    priority?: string; assignedTo?: string; authorName: string;
  }) {
    return prisma.customerTask.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        priority: data.priority || 'medium',
        assignedTo: data.assignedTo,
        authorName: data.authorName,
      },
    });
  }

  async toggleTask(taskId: string, completedBy?: string) {
    const task = await prisma.customerTask.findUnique({ where: { id: taskId } });
    if (!task) throw new Error('Tarea no encontrada');
    return prisma.customerTask.update({
      where: { id: taskId },
      data: {
        completed: !task.completed,
        completedAt: !task.completed ? new Date() : null,
        completedBy: !task.completed ? completedBy : null,
      },
    });
  }

  async deleteTask(taskId: string) {
    return prisma.customerTask.delete({ where: { id: taskId } });
  }

  // ============= STATS GLOBALES =============
  async getGlobalStats() {
    try {
      const [totalClients, byType, followUpsToday, pendingTasks] = await Promise.all([
        prisma.user.count({ where: { role: 'CLIENT' } }),
        prisma.user.groupBy({ by: ['customerType'], where: { role: 'CLIENT' }, _count: true }),
        prisma.user.count({
          where: {
            role: 'CLIENT',
            nextFollowUp: { lte: new Date(new Date().setHours(23, 59, 59)) },
          },
        }),
        prisma.customerTask.count({ where: { completed: false } }),
      ]);

      // Top customers
      const topCustomers = await prisma.user.findMany({
        where: { role: 'CLIENT' },
        orderBy: { scoring: 'desc' },
        take: 5,
        select: { id: true, firstName: true, lastName: true, email: true, scoring: true, customerType: true },
      });

      return {
        totalClients,
        byType: Object.fromEntries(byType.map(t => [t.customerType || 'sin_tipo', t._count])),
        followUpsToday,
        pendingTasks,
        topCustomers,
      };
    } catch (error) {
      logger.error('Error getting CRM stats:', error);
      throw error;
    }
  }

  // ============= TAGS =============
  async getAllTags() {
    try {
      const users = await prisma.user.findMany({
        where: { role: 'CLIENT', tags: { isEmpty: false } },
        select: { tags: true },
      });
      const allTags = users.flatMap(u => u.tags);
      const tagCounts: Record<string, number> = {};
      allTags.forEach(tag => { tagCounts[tag] = (tagCounts[tag] || 0) + 1; });
      return Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      logger.error('Error getting tags:', error);
      throw error;
    }
  }
}

export const crmService = new CRMService();
