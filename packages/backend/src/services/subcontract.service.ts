import { prisma } from '../index';

export class SubcontractService {
  async list(filters: { status?: string; search?: string; eventId?: string; page?: number; limit?: number }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.eventId) where.eventId = filters.eventId;
    if (filters.search) {
      where.OR = [
        { supplierName: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      prisma.subcontract.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.subcontract.count({ where }),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getById(id: string) { return prisma.subcontract.findUnique({ where: { id } }); }

  async create(data: any) {
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    return prisma.subcontract.create({ data });
  }

  async update(id: string, data: any) {
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    return prisma.subcontract.update({ where: { id }, data });
  }

  async delete(id: string) { return prisma.subcontract.delete({ where: { id } }); }

  async getStats() {
    const [total, byStatus, totalAgreed, totalPaid] = await Promise.all([
      prisma.subcontract.count(),
      prisma.subcontract.groupBy({ by: ['status'], _count: true }),
      prisma.subcontract.aggregate({ _sum: { agreedAmount: true } }),
      prisma.subcontract.aggregate({ _sum: { paidAmount: true } }),
    ]);
    return {
      total,
      byStatus: Object.fromEntries(byStatus.map(s => [s.status, s._count])),
      totalAgreed: Number(totalAgreed._sum.agreedAmount || 0),
      totalPaid: Number(totalPaid._sum.paidAmount || 0),
    };
  }
}

export const subcontractService = new SubcontractService();
