import { prisma } from '../index';
import { logger } from '../utils/logger';

export class SupplierService {
  async list(filters: { category?: string; search?: string; page?: number; limit?: number }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const where: any = { isActive: true };
    if (filters.category) where.category = filters.category;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { contactName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { taxId: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      prisma.supplier.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { name: 'asc' }, include: { _count: { select: { purchases: true } } } }),
      prisma.supplier.count({ where }),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getById(id: string) {
    return prisma.supplier.findUnique({ where: { id }, include: { purchases: { orderBy: { date: 'desc' }, take: 20 } } });
  }

  async create(data: any) {
    return prisma.supplier.create({ data });
  }

  async update(id: string, data: any) {
    return prisma.supplier.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.supplier.update({ where: { id }, data: { isActive: false } });
  }

  async getPurchases(supplierId: string) {
    return prisma.supplierPurchase.findMany({ where: { supplierId }, orderBy: { date: 'desc' } });
  }

  async addPurchase(supplierId: string, data: any) {
    return prisma.supplierPurchase.create({
      data: { ...data, supplierId, date: new Date(data.date || Date.now()) },
    });
  }

  async getStats() {
    const [total, byCategory, totalSpent] = await Promise.all([
      prisma.supplier.count({ where: { isActive: true } }),
      prisma.supplier.groupBy({ by: ['category'], _count: true, where: { isActive: true } }),
      prisma.supplierPurchase.aggregate({ _sum: { amount: true } }),
    ]);
    return {
      total,
      byCategory: Object.fromEntries(byCategory.map(c => [c.category || 'sin categoría', c._count])),
      totalSpent: Number(totalSpent._sum.amount || 0),
    };
  }
}

export const supplierService = new SupplierService();
