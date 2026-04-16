import { PrismaClient } from '@prisma/client';
import { prisma } from '../index';
import { logger } from '../utils/logger';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  pendingOrders: number;
  inProgressOrders: number; // Pedidos entregados (alquilados)
  completedOrders: number; // Pedidos devueltos (finalizados)
  todayOrders: number;
  monthRevenue: number;
}

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  id: string;
  name: string;
  sku: string;
  totalOrders: number;
  totalRevenue: number;
}

interface TopCustomer {
  id: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
}

export class AnalyticsService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get various counts
      const [
        totalOrders,
        totalProducts,
        totalUsers,
        pendingOrders,
        inProgressOrders,
        completedOrders,
        todayOrders,
      ] = await Promise.all([
        prisma.order.count(),
        prisma.product.count({ where: { isActive: true, isPack: false } }), // Excluir packs
        prisma.user.count({ where: { role: 'CLIENT' } }),
        prisma.order.count({ where: { status: 'PENDING' } }),
        prisma.order.count({ where: { status: 'IN_PROGRESS' } }), // Entregados (alquilados)
        prisma.order.count({ where: { status: 'COMPLETED' } }), // Devueltos
        prisma.order.count({
          where: {
            createdAt: {
              gte: startOfDay,
            },
          },
        }),
      ]);

      // Get revenue stats (se paga en PENDING, luego pasa a IN_PROGRESS y COMPLETED)
      const totalRevenueResult = await prisma.order.aggregate({
        where: {
          status: {
            not: 'CANCELLED', // Todos generan ingresos excepto cancelados
          },
        },
        _sum: {
          total: true,
        },
      });

      const monthRevenueResult = await prisma.order.aggregate({
        where: {
          createdAt: {
            gte: startOfMonth,
          },
          status: {
            not: 'CANCELLED',
          },
        },
        _sum: {
          total: true,
        },
      });

      return {
        totalOrders,
        totalRevenue: Number(totalRevenueResult._sum.total || 0),
        totalProducts,
        totalUsers,
        pendingOrders,
        inProgressOrders, // Pedidos entregados (alquilados actualmente)
        completedOrders, // Pedidos devueltos (finalizados)
        todayOrders,
        monthRevenue: Number(monthRevenueResult._sum.total || 0),
      };
    } catch (error) {
      logger.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get revenue over time
   */
  async getRevenueChart(days: number = 30): Promise<RevenueData[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const orders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: startDate,
          },
          status: {
            not: 'CANCELLED', // Todos menos cancelados
          },
        },
        select: {
          createdAt: true,
          total: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      // Group by date
      const revenueByDate: Map<string, { revenue: number; orders: number }> = new Map();

      orders.forEach(order => {
        const date = order.createdAt.toISOString().split('T')[0];
        const existing = revenueByDate.get(date) || { revenue: 0, orders: 0 };
        
        revenueByDate.set(date, {
          revenue: existing.revenue + Number(order.total),
          orders: existing.orders + 1,
        });
      });

      // Convert to array and fill missing dates
      const result: RevenueData[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= new Date()) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const data = revenueByDate.get(dateStr) || { revenue: 0, orders: 0 };
        
        result.push({
          date: dateStr,
          revenue: data.revenue,
          orders: data.orders,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return result;
    } catch (error) {
      logger.error('Error getting revenue chart:', error);
      throw error;
    }
  }

  /**
   * Get top products
   */
  async getTopProducts(limit: number = 10): Promise<TopProduct[]> {
    try {
      const items = await prisma.orderItem.groupBy({
        by: ['productId'],
        _count: {
          _all: true,
        },
        _sum: {
          totalPrice: true,
        },
        orderBy: {
          _count: {
            productId: 'desc',
          },
        },
        take: limit,
      });

      // Get product details
      const productIds = items.map(item => item.productId);
      const products = await prisma.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
      });

      const productMap = new Map(products.map(p => [p.id, p]));

      return items.map(item => {
        const product = productMap.get(item.productId);
        return {
          id: item.productId,
          name: product?.name || 'Unknown',
          sku: product?.sku || '',
          totalOrders: item._count._all,
          totalRevenue: Number(item._sum.totalPrice || 0),
        };
      });
    } catch (error) {
      logger.error('Error getting top products:', error);
      throw error;
    }
  }

  /**
   * Get top customers
   */
  async getTopCustomers(limit: number = 10): Promise<TopCustomer[]> {
    try {
      const orders = await prisma.order.groupBy({
        by: ['userId'],
        _count: {
          _all: true,
        },
        _sum: {
          total: true,
        },
        where: {
          status: {
            not: 'CANCELLED', // Todos menos cancelados
          },
        },
        orderBy: {
          _sum: {
            total: 'desc',
          },
        },
        take: limit,
      });

      // Get user details
      const userIds = orders.map(order => order.userId);
      const users = await prisma.user.findMany({
        where: {
          id: {
            in: userIds,
          },
        },
      });

      const userMap = new Map(users.map(u => [u.id, u]));

      return orders.map(order => {
        const user = userMap.get(order.userId);
        return {
          id: order.userId,
          name: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
          email: user?.email || '',
          totalOrders: order._count._all,
          totalSpent: Number(order._sum.total || 0),
        };
      });
    } catch (error) {
      logger.error('Error getting top customers:', error);
      throw error;
    }
  }

  /**
   * Get order status distribution
   */
  async getOrderStatusDistribution() {
    try {
      const statusCounts = await prisma.order.groupBy({
        by: ['status'],
        _count: {
          _all: true,
        },
      });

      return statusCounts.map(item => ({
        status: item.status,
        count: item._count._all,
        percentage: 0, // Will be calculated on frontend
      }));
    } catch (error) {
      logger.error('Error getting order status distribution:', error);
      throw error;
    }
  }

  /**
   * Get upcoming events for calendar
   */
  async getUpcomingEventsCalendar(days: number = 30) {
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      const orders = await prisma.order.findMany({
        where: {
          startDate: {
            gte: new Date(),
            lte: endDate,
          },
          status: {
            notIn: ['CANCELLED'],
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
            select: {
              quantity: true,
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

      return orders.map(order => ({
        id: order.id,
        title: `#${order.orderNumber}`,
        start: order.startDate,
        end: order.endDate,
        customer: `${(order as any).user?.firstName} ${(order as any).user?.lastName}`,
        email: (order as any).user?.email,
        status: order.status,
        total: Number(order.total),
        items: order.items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
        })),
      }));
    } catch (error) {
      logger.error('Error getting upcoming events calendar:', error);
      throw error;
    }
  }

  /**
   * Get inventory utilization
   */
  async getInventoryUtilization() {
    try {
      const products = await prisma.product.findMany({
        where: { 
          isActive: true,
          isPack: false, // Excluir packs de estadísticas de inventario
        },
        include: {
          orderItems: {
            where: {
              order: {
                status: {
                  notIn: ['CANCELLED'],
                },
                startDate: {
                  lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                  gte: new Date(),
                },
              },
            },
          },
        },
      });

      return products.map(product => {
        const reserved = product.orderItems.reduce((sum, item) => sum + item.quantity, 0);
        const utilization = product.stock > 0 ? (reserved / product.stock) * 100 : 0;

        return {
          id: product.id,
          name: product.name,
          sku: product.sku,
          totalStock: product.stock,
          reserved,
          available: product.stock - reserved,
          utilization: Math.round(utilization),
        };
      });
    } catch (error) {
      logger.error('Error getting inventory utilization:', error);
      throw error;
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics() {
    try {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get this month vs last month
      const [thisMonthOrders, lastMonthOrders, thisMonthRevenue, lastMonthRevenue] = await Promise.all([
        prisma.order.count({
          where: {
            createdAt: { gte: thisMonth },
          },
        }),
        prisma.order.count({
          where: {
            createdAt: { gte: lastMonth, lt: thisMonth },
          },
        }),
        prisma.order.aggregate({
          where: {
            createdAt: { gte: thisMonth },
            status: {
              not: 'CANCELLED',
            },
          },
          _sum: { total: true },
        }),
        prisma.order.aggregate({
          where: {
            createdAt: { gte: lastMonth, lt: thisMonth },
            status: {
              not: 'CANCELLED',
            },
          },
          _sum: { total: true },
        }),
      ]);

      const orderGrowth = lastMonthOrders > 0 
        ? ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100 
        : 100;

      const revenueGrowth = Number(lastMonthRevenue._sum.total) > 0
        ? ((Number(thisMonthRevenue._sum.total) - Number(lastMonthRevenue._sum.total)) / 
           Number(lastMonthRevenue._sum.total)) * 100
        : 100;

      // Average order value
      const avgOrderValue = thisMonthOrders > 0
        ? Number(thisMonthRevenue._sum.total) / thisMonthOrders
        : 0;

      // Conversion rate (simplified - orders vs unique users)
      const uniqueUsers = await prisma.order.groupBy({
        by: ['userId'],
        where: {
          createdAt: { gte: thisMonth },
        },
      });

      const conversionRate = uniqueUsers.length > 0
        ? (thisMonthOrders / uniqueUsers.length) * 100
        : 0;

      return {
        orderGrowth: Math.round(orderGrowth),
        revenueGrowth: Math.round(revenueGrowth),
        avgOrderValue: Math.round(avgOrderValue),
        conversionRate: Math.round(conversionRate),
        thisMonthOrders,
        lastMonthOrders,
        thisMonthRevenue: Number(thisMonthRevenue._sum.total || 0),
        lastMonthRevenue: Number(lastMonthRevenue._sum.total || 0),
      };
    } catch (error) {
      logger.error('Error getting performance metrics:', error);
      throw error;
    }
  }

  /**
   * Get popular rental periods
   */
  async getPopularRentalPeriods() {
    try {
      const orders = await prisma.orderItem.findMany({
        where: {
          order: {
            status: {
              notIn: ['CANCELLED'],
            },
          },
        },
        select: {
          startDate: true,
          endDate: true,
        },
      });

      // Calculate rental durations
      const durations: Map<number, number> = new Map();

      orders.forEach(item => {
        const days = Math.ceil(
          (new Date(item.endDate).getTime() - new Date(item.startDate).getTime()) / 
          (1000 * 60 * 60 * 24)
        );
        
        durations.set(days, (durations.get(days) || 0) + 1);
      });

      // Convert to array and sort
      const result = Array.from(durations.entries())
        .map(([days, count]) => ({
          days,
          count,
          label: days === 1 ? '1 día' : 
                 days === 2 || days === 3 ? 'Fin de semana' : 
                 days === 7 ? '1 semana' : 
                 days > 7 && days <= 14 ? '2 semanas' : 
                 `${days} días`,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return result;
    } catch (error) {
      logger.error('Error getting popular rental periods:', error);
      throw error;
    }
  }

  /**
   * Get recent orders
   */
  async getRecentOrders(limit: number = 10) {
    try {
      const orders = await prisma.order.findMany({
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return orders;
    } catch (error) {
      logger.error('Error getting recent orders:', error);
      throw error;
    }
  }

  /**
   * Get product amortization data
   */
  async getProductAmortization() {
    try {
      // Get all active products with purchase lots
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          isPack: false,
        },
        include: {
          purchases: {
            orderBy: {
              purchaseDate: 'asc', // FIFO: Los más antiguos primero
            },
          },
          orderItems: {
            where: {
              order: {
                status: {
                  not: 'CANCELLED',
                },
              },
            },
            select: {
              totalPrice: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });

      // Filtrar solo productos que tengan lotes
      const productsWithLots = products.filter(p => p.purchases.length > 0);

      // Calculate amortization for each product
      const amortizationData = productsWithLots.map(product => {
        // Calcular totales globales del producto
        const totalInvestment = product.purchases.reduce(
          (sum, lot) => sum + Number(lot.totalCost),
          0
        );
        
        const totalGenerated = product.orderItems.reduce(
          (sum, item) => sum + Number(item.totalPrice || 0),
          0
        );

        // Calcular amortización por lote usando FIFO
        const lots = product.purchases.map(lot => {
          const lotCost = Number(lot.totalCost);
          let lotGenerated = Number(lot.totalGenerated || 0);
          
          const lotAmortizationPercentage = lotCost > 0 
            ? Math.min((lotGenerated / lotCost) * 100, 100)
            : 0;
          
          const lotRemaining = Math.max(lotCost - lotGenerated, 0);
          const lotIsAmortized = lotGenerated >= lotCost;
          const lotProfit = lotIsAmortized ? lotGenerated - lotCost : 0;

          return {
            id: lot.id,
            purchaseDate: lot.purchaseDate,
            quantity: lot.quantity,
            unitPrice: Number(lot.unitPrice),
            totalCost: lotCost,
            totalGenerated: lotGenerated,
            amortizationPercentage: Math.round(lotAmortizationPercentage * 100) / 100,
            remaining: lotRemaining,
            isAmortized: lotIsAmortized,
            profit: lotProfit,
            supplier: lot.supplier,
            invoiceNumber: lot.invoiceNumber,
            notes: lot.notes,
          };
        });

        // Calcular métricas globales del producto
        const globalAmortizationPercentage = totalInvestment > 0 
          ? Math.min((totalGenerated / totalInvestment) * 100, 100)
          : 0;
        
        const globalRemaining = Math.max(totalInvestment - totalGenerated, 0);
        const globalIsAmortized = totalGenerated >= totalInvestment;
        const globalProfit = globalIsAmortized ? totalGenerated - totalInvestment : 0;

        return {
          id: product.id,
          name: product.name,
          sku: product.sku,
          // Métricas globales
          totalInvestment,
          totalGenerated,
          amortizationPercentage: Math.round(globalAmortizationPercentage * 100) / 100,
          remaining: globalRemaining,
          isAmortized: globalIsAmortized,
          profit: globalProfit,
          timesRented: product.orderItems.length,
          // Información de lotes
          lots,
          totalLots: lots.length,
          lotsAmortized: lots.filter(l => l.isAmortized).length,
          // Mantener compatibilidad con vista antigua
          purchasePrice: lots[0]?.unitPrice || 0, // Mostrar precio del primer lote
          purchaseDate: lots[0]?.purchaseDate,
        };
      });

      // Sort by amortization percentage (ascending - less amortized first)
      return amortizationData.sort((a, b) => a.amortizationPercentage - b.amortizationPercentage);
    } catch (error) {
      logger.error('Error getting product amortization:', error);
      throw error;
    }
  }

  /**
   * Smart Dashboard - All data for the intelligent dashboard in a single call
   */
  async getSmartDashboard() {
    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Lunes
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      // ============= 1. EVENTOS HOY / ESTA SEMANA =============
      const [todayEvents, weekEvents] = await Promise.all([
        prisma.order.findMany({
          where: {
            status: { notIn: ['CANCELLED'] },
            OR: [
              { startDate: { gte: startOfToday, lte: endOfToday } },
              { endDate: { gte: startOfToday, lte: endOfToday } },
              { AND: [{ startDate: { lte: startOfToday } }, { endDate: { gte: endOfToday } }] },
            ],
          },
          include: {
            user: { select: { firstName: true, lastName: true, email: true, phone: true } },
            items: { include: { product: { select: { name: true, sku: true } } } },
          },
          orderBy: { startDate: 'asc' },
        }),
        prisma.order.findMany({
          where: {
            status: { notIn: ['CANCELLED'] },
            OR: [
              { startDate: { gte: startOfWeek, lte: endOfWeek } },
              { endDate: { gte: startOfWeek, lte: endOfWeek } },
              { AND: [{ startDate: { lte: startOfWeek } }, { endDate: { gte: endOfWeek } }] },
            ],
          },
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
            items: { select: { quantity: true, product: { select: { name: true } } } },
          },
          orderBy: { startDate: 'asc' },
        }),
      ]);

      // Clasificar eventos de hoy
      const todayEventsClassified = todayEvents.map(order => {
        const startIsToday = order.startDate >= startOfToday && order.startDate <= endOfToday;
        const endIsToday = order.endDate >= startOfToday && order.endDate <= endOfToday;
        let phase = 'en_curso';
        if (startIsToday) phase = 'montaje';
        if (endIsToday) phase = 'desmontaje';
        if (startIsToday && endIsToday) phase = 'dia_completo';

        return {
          id: order.id,
          orderNumber: order.orderNumber,
          customer: `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim(),
          customerPhone: order.user?.phone || order.contactPhone,
          startDate: order.startDate,
          endDate: order.endDate,
          status: order.status,
          phase,
          total: Number(order.total),
          eventType: order.eventType,
          location: order.eventLocation,
          deliveryType: order.deliveryType,
          itemCount: order.items.length,
          items: order.items.map(i => ({ name: i.product.name, sku: i.product.sku, qty: i.quantity })),
        };
      });

      // Carga de trabajo
      const workload = todayEventsClassified.length === 0 ? 'libre' :
                        todayEventsClassified.length <= 2 ? 'bajo' :
                        todayEventsClassified.length <= 4 ? 'medio' : 'alto';

      // ============= 2. ALERTAS ACTIVAS =============
      const [
        unpaidOrders,
        lowStockProducts,
        overdueReturns,
        unansweredQuotes,
        brokenUnits,
      ] = await Promise.all([
        // Pagos pendientes
        prisma.order.findMany({
          where: {
            status: { in: ['PENDING', 'IN_PROGRESS'] },
            paymentStatus: { in: ['PENDING', 'PROCESSING'] },
          },
          select: {
            id: true, orderNumber: true, total: true, createdAt: true,
            user: { select: { firstName: true, lastName: true } },
          },
          orderBy: { createdAt: 'asc' },
          take: 10,
        }),
        // Stock bajo
        prisma.product.findMany({
          where: {
            isActive: true, isPack: false,
            stock: { lte: 2 }, // Threshold
            stockStatus: { not: 'ON_DEMAND' },
          },
          select: { id: true, name: true, sku: true, stock: true },
          orderBy: { stock: 'asc' },
          take: 10,
        }),
        // Devoluciones atrasadas (pedidos cuyo endDate ya pasó y siguen IN_PROGRESS)
        prisma.order.findMany({
          where: {
            status: 'IN_PROGRESS',
            endDate: { lt: startOfToday },
          },
          select: {
            id: true, orderNumber: true, endDate: true, total: true,
            user: { select: { firstName: true, lastName: true } },
          },
          orderBy: { endDate: 'asc' },
          take: 10,
        }),
        // Presupuestos sin responder (>48h)
        prisma.quoteRequest.findMany({
          where: {
            status: 'PENDING',
            createdAt: { lt: new Date(now.getTime() - 48 * 60 * 60 * 1000) },
          },
          select: {
            id: true, customerName: true, customerEmail: true,
            estimatedTotal: true, createdAt: true, eventType: true,
          },
          orderBy: { createdAt: 'asc' },
          take: 10,
        }),
        // Equipos rotos o en reparación
        prisma.productUnit.count({
          where: { status: { in: ['BROKEN', 'UNDER_REPAIR'] } },
        }),
      ]);

      const alerts = {
        unpaidOrders: unpaidOrders.map(o => ({
          ...o,
          total: Number(o.total),
          daysOverdue: Math.floor((now.getTime() - o.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
          customer: `${o.user?.firstName || ''} ${o.user?.lastName || ''}`.trim(),
        })),
        lowStockProducts,
        overdueReturns: overdueReturns.map(o => ({
          ...o,
          total: Number(o.total),
          daysOverdue: Math.floor((now.getTime() - o.endDate.getTime()) / (1000 * 60 * 60 * 24)),
          customer: `${o.user?.firstName || ''} ${o.user?.lastName || ''}`.trim(),
        })),
        unansweredQuotes: unansweredQuotes.map(q => ({
          ...q,
          estimatedTotal: Number(q.estimatedTotal || 0),
          hoursWaiting: Math.floor((now.getTime() - q.createdAt.getTime()) / (1000 * 60 * 60)),
        })),
        brokenUnits,
        totalAlerts: unpaidOrders.length + lowStockProducts.length + overdueReturns.length + unansweredQuotes.length + (brokenUnits > 0 ? 1 : 0),
      };

      // ============= 3. PIPELINE DE VENTAS =============
      const [
        pipelineLeadsNew,
        pipelineLeadsContacted,
        pipelineQuotesPending,
        pipelineQuotesQuoted,
        pipelineQuotesConverted,
        pipelineQuotesRejected,
        pipelineBudgetsDraft,
        pipelineBudgetsSent,
        pipelineBudgetsAccepted,
      ] = await Promise.all([
        prisma.lead.count({ where: { status: 'NEW' } }),
        prisma.lead.count({ where: { status: { in: ['CONTACTED', 'INTERESTED', 'NEGOTIATING'] } } }),
        prisma.quoteRequest.count({ where: { status: 'PENDING' } }),
        prisma.quoteRequest.count({ where: { status: 'QUOTED' } }),
        prisma.quoteRequest.count({ where: { status: 'CONVERTED' } }),
        prisma.quoteRequest.count({ where: { status: 'REJECTED' } }),
        prisma.budget.count({ where: { status: 'DRAFT' } }),
        prisma.budget.count({ where: { status: 'SENT' } }),
        prisma.budget.count({ where: { status: 'ACCEPTED' } }),
      ]);

      // Valor en cada fase
      const [quotePendingValue, quoteQuotedValue, budgetSentValue] = await Promise.all([
        prisma.quoteRequest.aggregate({
          where: { status: 'PENDING' },
          _sum: { estimatedTotal: true },
        }),
        prisma.quoteRequest.aggregate({
          where: { status: 'QUOTED' },
          _sum: { estimatedTotal: true },
        }),
        prisma.budget.aggregate({
          where: { status: 'SENT' },
          _sum: { total: true },
        }),
      ]);

      const totalQuotes = pipelineQuotesPending + pipelineQuotesQuoted + pipelineQuotesConverted + pipelineQuotesRejected;
      const conversionRate = totalQuotes > 0 ? (pipelineQuotesConverted / totalQuotes) * 100 : 0;

      const pipeline = {
        leads: { new: pipelineLeadsNew, inProgress: pipelineLeadsContacted },
        quotes: {
          pending: pipelineQuotesPending,
          quoted: pipelineQuotesQuoted,
          converted: pipelineQuotesConverted,
          rejected: pipelineQuotesRejected,
          pendingValue: Number(quotePendingValue._sum.estimatedTotal || 0),
          quotedValue: Number(quoteQuotedValue._sum.estimatedTotal || 0),
        },
        budgets: {
          draft: pipelineBudgetsDraft,
          sent: pipelineBudgetsSent,
          accepted: pipelineBudgetsAccepted,
          sentValue: Number(budgetSentValue._sum.total || 0),
        },
        conversionRate: Math.round(conversionRate * 10) / 10,
      };

      // ============= 4. KPIs DEL MES =============
      const [
        thisMonthRevenue,
        lastMonthRevenue,
        thisMonthOrders,
        lastMonthOrders,
        thisMonthCompleted,
        totalActiveProducts,
        stockInUse,
      ] = await Promise.all([
        prisma.order.aggregate({
          where: { createdAt: { gte: startOfMonth }, status: { not: 'CANCELLED' } },
          _sum: { total: true },
        }),
        prisma.order.aggregate({
          where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }, status: { not: 'CANCELLED' } },
          _sum: { total: true },
        }),
        prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
        prisma.order.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
        prisma.order.count({ where: { createdAt: { gte: startOfMonth }, status: 'COMPLETED' } }),
        prisma.product.count({ where: { isActive: true, isPack: false } }),
        prisma.productUnit.count({ where: { status: 'IN_USE' } }),
      ]);

      const thisMonthRev = Number(thisMonthRevenue._sum.total || 0);
      const lastMonthRev = Number(lastMonthRevenue._sum.total || 0);
      const revenueChange = lastMonthRev > 0 ? ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100 : 0;
      const avgTicket = thisMonthOrders > 0 ? thisMonthRev / thisMonthOrders : 0;
      const totalUnits = await prisma.productUnit.count();
      const stockOccupancy = totalUnits > 0 ? (stockInUse / totalUnits) * 100 : 0;

      const kpis = {
        revenue: { current: thisMonthRev, previous: lastMonthRev, change: Math.round(revenueChange * 10) / 10 },
        orders: { current: thisMonthOrders, previous: lastMonthOrders, completed: thisMonthCompleted },
        avgTicket: Math.round(avgTicket * 100) / 100,
        stockOccupancy: Math.round(stockOccupancy * 10) / 10,
        totalProducts: totalActiveProducts,
        eventsThisMonth: thisMonthCompleted + (await prisma.order.count({
          where: { startDate: { gte: startOfMonth }, status: { in: ['PENDING', 'IN_PROGRESS'] } },
        })),
      };

      // ============= 5. FACTURACION PENDIENTE =============
      const [pendingInvoices, overdueInvoices, next7DaysInvoices] = await Promise.all([
        prisma.invoice.aggregate({
          where: { status: { in: ['PENDING', 'SENT'] } },
          _sum: { total: true },
          _count: true,
        }),
        prisma.invoice.aggregate({
          where: { status: 'OVERDUE' },
          _sum: { total: true },
          _count: true,
        }),
        prisma.invoice.findMany({
          where: {
            status: { in: ['PENDING', 'SENT'] },
            dueDate: { gte: startOfToday, lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
          },
          select: { id: true, invoiceNumber: true, total: true, dueDate: true },
          orderBy: { dueDate: 'asc' },
          take: 5,
        }),
      ]);

      // También contar plazos (installments) pendientes
      const pendingInstallments = await prisma.paymentInstallment.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true },
        _count: true,
      });

      const billing = {
        totalPending: Number(pendingInvoices._sum.total || 0) + Number(pendingInstallments._sum.amount || 0),
        invoicesPending: { count: (pendingInvoices._count as unknown as number) || 0, total: Number(pendingInvoices._sum.total || 0) },
        invoicesOverdue: { count: (overdueInvoices._count as unknown as number) || 0, total: Number(overdueInvoices._sum.total || 0) },
        installmentsPending: { count: (pendingInstallments._count as unknown as number) || 0, total: Number(pendingInstallments._sum.amount || 0) },
        next7Days: next7DaysInvoices.map(inv => ({
          ...inv, total: Number(inv.total),
        })),
      };

      // ============= 6. PEDIDOS RECIENTES =============
      const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      });

      return {
        todayEvents: todayEventsClassified,
        weekEvents: weekEvents.map(o => ({
          id: o.id,
          orderNumber: o.orderNumber,
          customer: `${o.user?.firstName || ''} ${o.user?.lastName || ''}`.trim(),
          startDate: o.startDate,
          endDate: o.endDate,
          status: o.status,
          total: Number(o.total),
          eventType: o.eventType,
          itemCount: o.items.length,
        })),
        workload,
        alerts,
        pipeline,
        kpis,
        billing,
        recentOrders: recentOrders.map(o => ({
          id: o.id,
          orderNumber: o.orderNumber,
          customer: `${o.user?.firstName || ''} ${o.user?.lastName || ''}`.trim(),
          email: o.user?.email,
          total: Number(o.total),
          status: o.status,
          createdAt: o.createdAt,
        })),
      };
    } catch (error) {
      logger.error('Error getting smart dashboard:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
