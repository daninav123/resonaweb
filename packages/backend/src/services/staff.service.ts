import { prisma } from '../index';
import { logger } from '../utils/logger';

export class StaffService {
  async list(filters: { search?: string; type?: string; status?: string; page?: number; limit?: number }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const where: any = {};
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;

    const [data, total] = await Promise.all([
      prisma.staffMember.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { name: 'asc' }, include: { _count: { select: { workLogs: true } } } }),
      prisma.staffMember.count({ where }),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getById(id: string) {
    return prisma.staffMember.findUnique({ where: { id }, include: { availability: { orderBy: { date: 'desc' }, take: 30 }, workLogs: { orderBy: { date: 'desc' }, take: 20 } } });
  }

  async create(data: any) { return prisma.staffMember.create({ data }); }
  async update(id: string, data: any) { return prisma.staffMember.update({ where: { id }, data }); }
  async delete(id: string) { return prisma.staffMember.delete({ where: { id } }); }

  // Disponibilidad
  async addAvailability(staffId: string, data: any) {
    return prisma.staffAvailability.create({ data: { staffId, date: new Date(data.date), type: data.type, eventRef: data.eventRef, notes: data.notes } });
  }
  async deleteAvailability(id: string) { return prisma.staffAvailability.delete({ where: { id } }); }

  // Work Logs
  async addWorkLog(staffId: string, data: any) {
    const hoursWorked = parseFloat(data.hoursWorked);
    const hourlyRate = parseFloat(data.hourlyRate);
    return prisma.staffWorkLog.create({ data: { staffId, eventRef: data.eventRef, description: data.description, date: new Date(data.date), hoursWorked, hourlyRate, totalAmount: hoursWorked * hourlyRate } });
  }
  async toggleWorkLogPaid(id: string) {
    const log = await prisma.staffWorkLog.findUnique({ where: { id } });
    if (!log) throw new Error('Work log no encontrado');
    return prisma.staffWorkLog.update({ where: { id }, data: { paid: !log.paid, paidAt: !log.paid ? new Date() : null } });
  }

  // Stats
  async getStats() {
    const [total, byType, byStatus, unpaidLogs] = await Promise.all([
      prisma.staffMember.count(),
      prisma.staffMember.groupBy({ by: ['type'], _count: true }),
      prisma.staffMember.groupBy({ by: ['status'], _count: true }),
      prisma.staffWorkLog.aggregate({ where: { paid: false }, _sum: { totalAmount: true }, _count: true }),
    ]);
    return { total, byType: Object.fromEntries(byType.map(t => [t.type, t._count])), byStatus: Object.fromEntries(byStatus.map(s => [s.status, s._count])), unpaid: { count: unpaidLogs._count, total: Number(unpaidLogs._sum.totalAmount || 0) } };
  }

  async getMonthlyReport(staffId: string, year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    const logs = await prisma.staffWorkLog.findMany({ where: { staffId, date: { gte: start, lte: end } }, orderBy: { date: 'asc' } });
    const totalHours = logs.reduce((s, l) => s + Number(l.hoursWorked), 0);
    const totalAmount = logs.reduce((s, l) => s + Number(l.totalAmount), 0);
    const totalPaid = logs.filter(l => l.paid).reduce((s, l) => s + Number(l.totalAmount), 0);
    return { logs, totalHours, totalAmount, totalPaid, pending: totalAmount - totalPaid };
  }

  // Calendario de disponibilidad mensual
  async getAvailabilityCalendar(year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    const entries = await prisma.staffAvailability.findMany({
      where: { date: { gte: start, lte: end } },
      include: { staff: { select: { id: true, name: true, specialty: true } } },
      orderBy: { date: 'asc' },
    });
    return entries;
  }

  // Bloquear rango de fechas para un miembro
  async bulkAddAvailability(staffId: string, startDate: string, endDate: string, type: string, notes?: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days: { staffId: string; date: Date; type: string; notes?: string }[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push({ staffId, date: new Date(d), type, notes });
    }
    return prisma.staffAvailability.createMany({ data: days });
  }

  // Buscar personal disponible para una fecha y especialidad
  async getAvailableForEvent(date: string, specialty?: string) {
    const d = new Date(date);
    const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

    const where: any = { status: 'active' };
    if (specialty) where.specialty = specialty;

    const allStaff = await prisma.staffMember.findMany({ where, orderBy: { name: 'asc' } });
    const unavailable = await prisma.staffAvailability.findMany({
      where: { date: { gte: startOfDay, lte: endOfDay }, type: { in: ['unavailable', 'vacation', 'sick'] } },
      select: { staffId: true },
    });
    const unavailableIds = new Set(unavailable.map(u => u.staffId));
    return allStaff.filter(s => !unavailableIds.has(s.id));
  }

  // Alertas de documentos que expiran pronto
  async getExpiringDocuments(daysAhead: number = 30) {
    const limit = new Date();
    limit.setDate(limit.getDate() + daysAhead);
    const staff = await prisma.staffMember.findMany({
      where: {
        status: 'active',
        OR: [
          { contractExpiry: { lte: limit } },
          { insuranceExpiry: { lte: limit } },
        ],
      },
      orderBy: { name: 'asc' },
    });
    return staff.map(s => ({
      id: s.id, name: s.name,
      contractExpiring: s.contractExpiry && s.contractExpiry <= limit,
      contractExpiry: s.contractExpiry,
      insuranceExpiring: s.insuranceExpiry && s.insuranceExpiry <= limit,
      insuranceExpiry: s.insuranceExpiry,
    }));
  }
}

export const staffService = new StaffService();
