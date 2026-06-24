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
    const [active, monthlyTotal, quarterlyTotal, yearlyTotal, overdue, allActive] = await Promise.all([
      prisma.recurringExpense.count({ where: { isActive: true } }),
      prisma.recurringExpense.aggregate({ where: { isActive: true, frequency: 'monthly' }, _sum: { amount: true } }),
      prisma.recurringExpense.aggregate({ where: { isActive: true, frequency: 'quarterly' }, _sum: { amount: true } }),
      prisma.recurringExpense.aggregate({ where: { isActive: true, frequency: 'yearly' }, _sum: { amount: true } }),
      prisma.recurringExpense.count({ where: { isActive: true, nextDueDate: { lt: new Date() } } }),
      prisma.recurringExpense.findMany({ where: { isActive: true } }),
    ]);

    const monthlyEstimate = Number(monthlyTotal._sum.amount || 0) +
      Number(quarterlyTotal._sum.amount || 0) / 3 +
      Number(yearlyTotal._sum.amount || 0) / 12;

    const totalPaidAllTime = allActive.reduce((s, e) => s + Number(e.totalPaid || 0), 0);

    return { active, monthlyEstimate, overdue, totalPaidAllTime,
      byFrequency: {
        monthly: Number(monthlyTotal._sum.amount || 0),
        quarterly: Number(quarterlyTotal._sum.amount || 0),
        yearly: Number(yearlyTotal._sum.amount || 0),
      }
    };
  }

  async getProjections(months: number = 12) {
    const expenses = await prisma.recurringExpense.findMany({ where: { isActive: true } });
    const projections: { month: string; amount: number }[] = [];
    const now = new Date();

    for (let m = 0; m < months; m++) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() + m, 1);
      const monthLabel = targetDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });
      let monthTotal = 0;

      for (const e of expenses) {
        const amt = Number(e.amount);
        if (e.frequency === 'monthly') { monthTotal += amt; }
        else if (e.frequency === 'quarterly' && targetDate.getMonth() % 3 === 0) { monthTotal += amt; }
        else if (e.frequency === 'yearly' && targetDate.getMonth() === (e.nextDueDate ? new Date(e.nextDueDate).getMonth() : 0)) { monthTotal += amt; }
      }
      projections.push({ month: monthLabel, amount: monthTotal });
    }
    return projections;
  }

  async getPaymentHistory() {
    const expenses = await prisma.recurringExpense.findMany({
      where: { lastPaidAt: { not: null } },
      orderBy: { lastPaidAt: 'desc' },
      take: 50,
    });
    return expenses.map(e => ({
      id: e.id, name: e.name, category: e.category, amount: Number(e.amount),
      frequency: e.frequency, lastPaidAt: e.lastPaidAt, totalPaid: Number(e.totalPaid || 0),
    }));
  }
}

export const recurringExpenseService = new RecurringExpenseService();
