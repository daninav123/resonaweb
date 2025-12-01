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
      // Get all active products with purchase info
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          isPack: false,
          purchasePrice: {
            not: null,
          },
        },
        include: {
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
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });

      // Calculate amortization for each product
      const amortizationData = products.map(product => {
        const purchasePrice = Number(product.purchasePrice || 0);
        const totalGenerated = product.orderItems.reduce(
          (sum, item) => sum + Number(item.totalPrice || 0),
          0
        );
        
        const amortizationPercentage = purchasePrice > 0 
          ? Math.min((totalGenerated / purchasePrice) * 100, 100)
          : 0;
        
        const remaining = Math.max(purchasePrice - totalGenerated, 0);
        const isAmortized = totalGenerated >= purchasePrice;
        const profit = isAmortized ? totalGenerated - purchasePrice : 0;

        return {
          id: product.id,
          name: product.name,
          sku: product.sku,
          purchasePrice,
          totalGenerated,
          amortizationPercentage: Math.round(amortizationPercentage * 100) / 100,
          remaining,
          isAmortized,
          profit,
          timesRented: product.orderItems.length,
          purchaseDate: product.purchaseDate,
        };
      });

      // Sort by amortization percentage (ascending - less amortized first)
      return amortizationData.sort((a, b) => a.amortizationPercentage - b.amortizationPercentage);
    } catch (error) {
      logger.error('Error getting product amortization:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
