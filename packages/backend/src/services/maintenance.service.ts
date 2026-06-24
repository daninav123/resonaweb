import { prisma } from '../index';
import { logger } from '../utils/logger';

export class MaintenanceService {
  async list(filters: { status?: string; type?: string; search?: string; page?: number; limit?: number }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;
    if (filters.search) {
      where.OR = [
        { productName: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { supplierName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      prisma.maintenanceRecord.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.maintenanceRecord.count({ where }),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getById(id: string) {
    return prisma.maintenanceRecord.findUnique({ where: { id } });
  }

  async create(data: any) {
    if (data.scheduledDate) data.scheduledDate = new Date(data.scheduledDate);
    if (data.completedDate) data.completedDate = new Date(data.completedDate);
    return prisma.maintenanceRecord.create({ data });
  }

  async update(id: string, data: any) {
    if (data.scheduledDate) data.scheduledDate = new Date(data.scheduledDate);
    if (data.completedDate) data.completedDate = new Date(data.completedDate);
    return prisma.maintenanceRecord.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.maintenanceRecord.delete({ where: { id } });
  }

  async getStats() {
    const [total, pending, inProgress, byType] = await Promise.all([
      prisma.maintenanceRecord.count(),
      prisma.maintenanceRecord.count({ where: { status: 'pending' } }),
      prisma.maintenanceRecord.count({ where: { status: 'in_progress' } }),
      prisma.maintenanceRecord.groupBy({ by: ['type'], _count: true }),
    ]);
    return {
      total,
      pending,
      inProgress,
      byType: Object.fromEntries(byType.map(t => [t.type, t._count])),
    };
  }
}

export const maintenanceService = new MaintenanceService();
