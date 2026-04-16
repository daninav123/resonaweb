import { prisma } from '../index';

export class RecurringExpenseService {
  async list(filters: { category?: string; isActive?: boolean; page?: number; limit?: number }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const where: any = {};
    if (filters.category) where.category = filters.category;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    const [data, total] = await Promise.all([
      prisma.recurringExpense.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { nextDueDate: 'asc' } }),
      prisma.recurringExpense.count({ where }),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async create(data: any) {
    return prisma.recurringExpense.create({ data: { ...data, amount: parseFloat(data.amount), nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : null } });
  }
  async update(id: string, data: any) {
    const update: any = { ...data };
    if (data.amount) update.amount = parseFloat(data.amount);
    if (data.nextDueDate) update.nextDueDate = new Date(data.nextDueDate);
    return prisma.recurringExpense.update({ where: { id }, data: update });
  }
  async delete(id: string) { return prisma.recurringExpense.delete({ where: { id } }); }
  async markPaid(id: string) {
    const expense = await prisma.recurringExpense.findUnique({ where: { id } });
    if (!expense) throw new Error('Gasto no encontrado');
    const nextDate = new Date(expense.nextDueDate || new Date());
    if (expense.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
    else if (expense.frequency === 'quarterly') nextDate.setMonth(nextDate.getMonth() + 3);
    else nextDate.setFullYear(nextDate.getFullYear() + 1);
    return prisma.recurringExpense.update({ where: { id }, data: { lastPaidAt: new Date(), nextDueDate: nextDate, totalPaid: { increment: expense.amount } } });
  }

  async getStats() {
    const [active, monthlyTotal, overdue] = await Promise.all([
      prisma.recurringExpense.count({ where: { isActive: true } }),
      prisma.recurringExpense.aggregate({ where: { isActive: true, frequency: 'monthly' }, _sum: { amount: true } }),
      prisma.recurringExpense.count({ where: { isActive: true, nextDueDate: { lt: new Date() } } }),
    ]);
    return { active, monthlyTotal: Number(monthlyTotal._sum.amount || 0), overdue };
  }
}

export const recurringExpenseService = new RecurringExpenseService();
