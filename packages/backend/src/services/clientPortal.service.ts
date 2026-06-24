import { prisma } from '../index';

export class ClientPortalService {
  async getClientDataByEmail(email: string) {
    const user = await prisma.user.findFirst({
      where: { email },
      select: { id: true, firstName: true, lastName: true, email: true, phone: true },
    });

    const [quotes, orders, events, contracts] = await Promise.all([
      prisma.quoteRequest.findMany({
        where: { customerEmail: email },
        orderBy: { createdAt: 'desc' }, take: 20,
        select: { id: true, eventType: true, eventDate: true, status: true, estimatedTotal: true, createdAt: true, customerName: true },
      }),
      user ? prisma.order.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }, take: 20,
        select: { id: true, orderNumber: true, status: true, total: true, createdAt: true, startDate: true, endDate: true },
      }) : [],
      prisma.event.findMany({
        where: { clientEmail: email },
        orderBy: { eventDate: 'desc' }, take: 20,
        select: { id: true, name: true, eventType: true, eventDate: true, phase: true, venueName: true },
      }),
      prisma.contract.findMany({
        where: { clientEmail: email },
        orderBy: { createdAt: 'desc' }, take: 10,
        select: { id: true, title: true, status: true, totalAmount: true, signedAt: true, createdAt: true },
      }),
    ]);

    // Get invoices from orders
    const orderIds = (orders as any[]).map((o: any) => o.id);
    const invoices = orderIds.length > 0 ? await prisma.invoice.findMany({
      where: { orderId: { in: orderIds } },
      orderBy: { createdAt: 'desc' }, take: 20,
      select: { id: true, invoiceNumber: true, status: true, total: true, taxAmount: true, createdAt: true, dueDate: true },
    }) : [];

    return {
      customer: user || { email, firstName: email.split('@')[0], lastName: '' },
      quotes, orders, invoices, events, contracts,
    };
  }
}

export const clientPortalService = new ClientPortalService();
