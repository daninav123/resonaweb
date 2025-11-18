import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';
import ical from 'ical-generator';

interface AuthRequest extends Request {
  user?: any;
}

export class CalendarController {
  /**
   * Obtener eventos del calendario (pedidos)
   */
  async getCalendarEvents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { startDate, endDate } = req.query;

      // Construir filtro de fechas
      const dateFilter: any = {};
      
      if (startDate) {
        dateFilter.gte = new Date(startDate as string);
      }
      
      if (endDate) {
        dateFilter.lte = new Date(endDate as string);
      }

      // Obtener pedidos que caen en el rango de fechas
      const orders = await prisma.order.findMany({
        where: {
          OR: [
            {
              startDate: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
            },
            {
              endDate: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
            },
          ],
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
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  category: true,
                },
              },
            },
          },
        },
        orderBy: {
          startDate: 'asc',
        },
      });

      // Transformar pedidos a eventos de calendario
      const events = orders.map((order) => {
        const clientName = order.user.firstName && order.user.lastName
          ? `${order.user.firstName} ${order.user.lastName}`
          : order.user.email;

        const productNames = order.items
          .map((item) => item.product.name)
          .join(', ');

        const statusColor = {
          PENDING: '#FCD34D',
          CONFIRMED: '#10B981',
          IN_PROGRESS: '#3B82F6',
          COMPLETED: '#6B7280',
          CANCELLED: '#EF4444',
        }[order.status] || '#6B7280';

        return {
          id: order.id,
          title: `${order.orderNumber} - ${order.eventType || 'Evento'}`,
          start: order.startDate,
          end: order.endDate,
          allDay: false,
          resource: {
            orderNumber: order.orderNumber,
            client: clientName,
            clientEmail: order.user.email,
            contactPerson: order.contactPerson,
            contactPhone: order.contactPhone,
            status: order.status,
            paymentStatus: order.paymentStatus,
            total: Number(order.total),
            eventType: order.eventType,
            eventLocation: order.eventLocation,
            deliveryType: order.deliveryType,
            products: productNames,
            itemCount: order.items.length,
            notes: order.notes,
            color: statusColor,
          },
        };
      });

      res.json({
        events,
        total: events.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener estadísticas del calendario
   */
  async getCalendarStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { month, year } = req.query;
      
      const startDate = month && year 
        ? new Date(Number(year), Number(month) - 1, 1)
        : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59);

      // Contar pedidos por estado en el mes (con manejo de errores)
      let ordersByStatus = [];
      try {
        ordersByStatus = await prisma.order.groupBy({
          by: ['status'],
          where: {
            OR: [
              {
                startDate: {
                  gte: startDate,
                  lte: endDate,
                },
              },
              {
                endDate: {
                  gte: startDate,
                  lte: endDate,
                },
              },
            ],
          },
          _count: {
            id: true,
          },
        });
      } catch (error) {
        console.error('Error en groupBy:', error);
        ordersByStatus = [];
      }

      // Ingresos del mes (con manejo de errores)
      let monthRevenue: any = { _sum: { total: null } };
      try {
        monthRevenue = await prisma.order.aggregate({
          where: {
            OR: [
              {
                startDate: {
                  gte: startDate,
                  lte: endDate,
                },
              },
              {
                endDate: {
                  gte: startDate,
                  lte: endDate,
                },
              },
            ],
            paymentStatus: 'PAID',
          },
          _sum: {
            total: true,
          },
        });
      } catch (error) {
        console.error('Error en aggregate:', error);
      }

      // Próximos eventos (siguientes 7 días) (con manejo de errores)
      let upcomingEvents: any[] = [];
      try {
        upcomingEvents = await prisma.order.findMany({
          where: {
            startDate: {
              gte: new Date(),
              lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
            status: {
              in: ['CONFIRMED', 'PENDING'],
            },
          },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            startDate: 'asc',
          },
          take: 5,
        });
      } catch (error) {
        console.error('Error en upcomingEvents:', error);
      }

      res.json({
        ordersByStatus: ordersByStatus.reduce((acc, item) => {
          acc[item.status] = item._count.id;
          return acc;
        }, {} as Record<string, number>),
        monthRevenue: Number(monthRevenue._sum.total || 0),
        upcomingEvents: upcomingEvents.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          eventType: order.eventType,
          startDate: order.startDate,
          endDate: order.endDate,
          client: order.user.firstName && order.user.lastName
            ? `${order.user.firstName} ${order.user.lastName}`
            : order.user.email,
          status: order.status,
          total: Number(order.total),
          products: order.items.map((item) => item.product.name).join(', '),
        })),
      });
    } catch (error) {
      console.error('Error general en getCalendarStats:', error);
      next(error);
    }
  }

  /**
   * Obtener disponibilidad de fechas
   */
  async getDateAvailability(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw new AppError(400, 'Fechas requeridas', 'MISSING_DATES');
      }

      // Contar pedidos en conflicto
      const conflictingOrders = await prisma.order.count({
        where: {
          OR: [
            {
              AND: [
                { startDate: { lte: new Date(endDate as string) } },
                { endDate: { gte: new Date(startDate as string) } },
              ],
            },
          ],
          status: {
            notIn: ['CANCELLED', 'COMPLETED'],
          },
        },
      });

      res.json({
        available: conflictingOrders === 0,
        conflictingOrders,
        message: conflictingOrders > 0
          ? `Hay ${conflictingOrders} evento(s) en estas fechas`
          : 'Fechas disponibles',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Exportar calendario a formato iCalendar (.ics)
   */
  async exportCalendar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { startDate, endDate } = req.query;

      // Construir filtro de fechas
      const dateFilter: any = {};
      
      if (startDate) {
        dateFilter.gte = new Date(startDate as string);
      }
      
      if (endDate) {
        dateFilter.lte = new Date(endDate as string);
      }

      // Obtener pedidos
      const orders = await prisma.order.findMany({
        where: {
          OR: [
            {
              startDate: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
            },
            {
              endDate: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
            },
          ],
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          startDate: 'asc',
        },
      });

      // Crear calendario
      const calendar = ical({
        name: 'ReSona Events - Calendario',
        description: 'Calendario de eventos de ReSona',
        timezone: 'Europe/Madrid',
        prodId: {
          company: 'ReSona Events',
          product: 'Calendar',
        },
      });

      // Añadir eventos al calendario
      orders.forEach((order) => {
        const clientName = order.user.firstName && order.user.lastName
          ? `${order.user.firstName} ${order.user.lastName}`
          : order.user.email;

        const productNames = order.items
          .map((item) => item.product.name)
          .join(', ');

        const eventLocation = typeof order.eventLocation === 'object' && order.eventLocation !== null
          ? `${(order.eventLocation as any).address || ''}, ${(order.eventLocation as any).city || ''}`.trim()
          : 'Sin ubicación';

        const description = `
Pedido: ${order.orderNumber}
Cliente: ${clientName}
Email: ${order.user.email}
Contacto: ${order.contactPerson}
Teléfono: ${order.contactPhone}
Tipo de Evento: ${order.eventType || 'N/A'}
Productos: ${productNames}
Total: €${Number(order.total).toFixed(2)}
Estado: ${order.status}
Estado de Pago: ${order.paymentStatus}
${order.notes ? `\nNotas: ${order.notes}` : ''}
        `.trim();

        calendar.createEvent({
          start: order.startDate,
          end: order.endDate,
          summary: `${order.orderNumber} - ${order.eventType || 'Evento'} - ${clientName}`,
          description,
          location: eventLocation,
          url: `${process.env.FRONTEND_URL}/admin/orders/${order.id}`,
          organizer: {
            name: 'ReSona Events',
            email: process.env.BUSINESS_EMAIL || 'info@resona.com',
          },
          attendees: [
            {
              name: clientName,
              email: order.user.email,
            },
          ],
        });
      });

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="resona-calendar.ics"');

      // Enviar archivo .ics
      res.send(calendar.toString());
    } catch (error) {
      next(error);
    }
  }
}

export const calendarController = new CalendarController();
