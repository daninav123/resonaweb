import { PrismaClient } from '@prisma/client';
import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

interface AvailabilityCheck {
  productId: string;
  startDate: Date;
  endDate: Date;
  quantity: number;
}

interface DailyAvailability {
  date: Date;
  available: number;
  reserved: number;
  maintenance: boolean;
}

export class AvailabilityService {
  /**
   * Check product availability for a date range
   */
  async checkProductAvailability(
    productId: string,
    startDate: Date,
    endDate: Date,
    requestedQuantity: number = 1
  ): Promise<boolean> {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new AppError(404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND');
      }

      // Check lead time for ON_DEMAND products
      if (product.stockStatus === 'ON_DEMAND' && product.leadTimeDays) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const leadTimeDays = product.leadTimeDays;
        const minimumDate = new Date(today);
        minimumDate.setDate(minimumDate.getDate() + leadTimeDays);
        
        if (startDate < minimumDate) {
          logger.info(`Product ${productId} requires ${leadTimeDays} days lead time. Minimum date: ${minimumDate.toISOString().split('T')[0]}`);
          throw new AppError(
            400,
            `Este producto requiere reserva con ${leadTimeDays} días de antelación. Fecha mínima disponible: ${minimumDate.toLocaleDateString('es-ES')}`,
            'LEAD_TIME_REQUIRED'
          );
        }
      }

      // Get all orders that overlap with the requested dates
      const overlappingOrders = await prisma.item.findMany({
        where: {
          productId,
          order: {
            status: {
              notIn: ['CANCELLED', 'RETURNED'],
            },
          },
          OR: [
            {
              // Order starts within our range
              startDate: {
                gte: startDate,
                lte: endDate,
              },
            },
            {
              // Order ends within our range
              endDate: {
                gte: startDate,
                lte: endDate,
              },
            },
            {
              // Order completely contains our range
              AND: [
                { startDate: { lte: startDate } },
                { endDate: { gte: endDate } },
              ],
            },
          ],
        },
        include: {
          order: true,
        },
      });

      // Calculate reserved quantity for each day
      const dates = this.getDatesBetween(startDate, endDate);
      
      for (const date of dates) {
        const reservedOnDate = overlappingOrders
          .filter(item => {
            const itemStart = new Date(item.startDate);
            const itemEnd = new Date(item.endDate);
            return date >= itemStart && date <= itemEnd;
          })
          .reduce((sum, item) => sum + item.quantity, 0);

        const availableOnDate = product.stock - reservedOnDate;

        if (availableOnDate < requestedQuantity) {
          logger.info(`Product ${productId} not available on ${date.toISOString().split('T')[0]}. Available: ${availableOnDate}, Requested: ${requestedQuantity}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      logger.error('Error checking product availability:', error);
      throw error;
    }
  }

  /**
   * Get available quantity for a product on specific dates
   */
  async getAvailableQuantity(productId: string, startDate: Date, endDate: Date): Promise<number> {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new AppError(404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND');
      }

      const overlappingOrders = await prisma.item.findMany({
        where: {
          productId,
          order: {
            status: {
              notIn: ['CANCELLED', 'RETURNED'],
            },
          },
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
            {
              AND: [
                { startDate: { lte: startDate } },
                { endDate: { gte: endDate } },
              ],
            },
          ],
        },
      });

      // Find the minimum available quantity across all dates
      const dates = this.getDatesBetween(startDate, endDate);
      let minAvailable = product.stock;

      for (const date of dates) {
        const reservedOnDate = overlappingOrders
          .filter(item => {
            const itemStart = new Date(item.startDate);
            const itemEnd = new Date(item.endDate);
            return date >= itemStart && date <= itemEnd;
          })
          .reduce((sum, item) => sum + item.quantity, 0);

        const availableOnDate = product.stock - reservedOnDate;
        minAvailable = Math.min(minAvailable, availableOnDate);
      }

      return Math.max(0, minAvailable);
    } catch (error) {
      logger.error('Error getting available quantity:', error);
      throw error;
    }
  }

  /**
   * Get booked dates for a product
   */
  async getBookedDates(productId: string, startDate?: Date, endDate?: Date): Promise<Date[]> {
    try {
      const where: any = {
        productId,
        order: {
          status: {
            notIn: ['CANCELLED', 'RETURNED'],
          },
        },
      };

      if (startDate && endDate) {
        where.OR = [
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
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: endDate } },
            ],
          },
        ];
      }

      const bookings = await prisma.item.findMany({ where });

      const bookedDates: Set<string> = new Set();

      for (const booking of bookings) {
        const dates = this.getDatesBetween(booking.startDate, booking.endDate);
        dates.forEach(date => {
          bookedDates.add(date.toISOString().split('T')[0]);
        });
      }

      return Array.from(bookedDates).map(dateStr => new Date(dateStr));
    } catch (error) {
      logger.error('Error getting booked dates:', error);
      throw error;
    }
  }

  /**
   * Get availability calendar for a product
   */
  async getAvailabilityCalendar(
    productId: string,
    year: number,
    month: number
  ): Promise<DailyAvailability[]> {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new AppError(404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND');
      }

      // Get first and last day of the month
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);

      // Get all bookings for the month
      const bookings = await prisma.item.findMany({
        where: {
          productId,
          order: {
            status: {
              notIn: ['CANCELLED', 'RETURNED'],
            },
          },
          OR: [
            {
              startDate: {
                gte: firstDay,
                lte: lastDay,
              },
            },
            {
              endDate: {
                gte: firstDay,
                lte: lastDay,
              },
            },
            {
              AND: [
                { startDate: { lte: firstDay } },
                { endDate: { gte: lastDay } },
              ],
            },
          ],
        },
      });

      // Build daily availability
      const calendar: DailyAvailability[] = [];
      const dates = this.getDatesBetween(firstDay, lastDay);

      for (const date of dates) {
        const reservedOnDate = bookings
          .filter(booking => {
            const bookingStart = new Date(booking.startDate);
            const bookingEnd = new Date(booking.endDate);
            return date >= bookingStart && date <= bookingEnd;
          })
          .reduce((sum, booking) => sum + booking.quantity, 0);

        calendar.push({
          date,
          available: Math.max(0, product.stock - reservedOnDate),
          reserved: reservedOnDate,
          maintenance: false, // Could be extended to check maintenance schedules
        });
      }

      return calendar;
    } catch (error) {
      logger.error('Error getting availability calendar:', error);
      throw error;
    }
  }

  /**
   * Block dates for maintenance or other reasons
   */
  async blockDates(productId: string, dates: Date[], reason: string = 'maintenance') {
    try {
      // This would ideally use a ProductAvailability table
      // For now, we'll just log it
      logger.info(`Blocking dates for product ${productId}: ${dates.map(d => d.toISOString()).join(', ')}`);
      
      return {
        success: true,
        message: `Fechas bloqueadas para ${reason}`,
      };
    } catch (error) {
      logger.error('Error blocking dates:', error);
      throw error;
    }
  }

  /**
   * Check availability for multiple products
   */
  async checkMultipleProductsAvailability(
    items: AvailabilityCheck[]
  ): Promise<{ available: boolean; unavailableProducts: string[] }> {
    try {
      const unavailableProducts: string[] = [];

      for (const item of items) {
        const isAvailable = await this.checkProductAvailability(
          item.productId,
          item.startDate,
          item.endDate,
          item.quantity
        );

        if (!isAvailable) {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: { name: true },
          });
          
          if (product) {
            unavailableProducts.push(product.name);
          }
        }
      }

      return {
        available: unavailableProducts.length === 0,
        unavailableProducts,
      };
    } catch (error) {
      logger.error('Error checking multiple products availability:', error);
      throw error;
    }
  }

  /**
   * Get popular booking dates
   */
  async getPopularDates(limit: number = 10): Promise<{ date: Date; bookings: number }[]> {
    try {
      const upcomingOrders = await prisma.order.findMany({
        where: {
          startDate: {
            gte: new Date(),
          },
          status: {
            notIn: ['CANCELLED', 'RETURNED'],
          },
        },
        select: {
          startDate: true,
        },
      });

      // Count bookings by date
      const dateCount: Map<string, number> = new Map();

      upcomingOrders.forEach(order => {
        const dateStr = order.startDate.toISOString().split('T')[0];
        dateCount.set(dateStr, (dateCount.get(dateStr) || 0) + 1);
      });

      // Sort and return top dates
      const sortedDates = Array.from(dateCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([dateStr, count]) => ({
          date: new Date(dateStr),
          bookings: count,
        }));

      return sortedDates;
    } catch (error) {
      logger.error('Error getting popular dates:', error);
      throw error;
    }
  }

  /**
   * Get product availability summary
   */
  async getProductAvailabilitySummary(productId: string, days: number = 30) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          items: {
            where: {
              order: {
                status: {
                  notIn: ['CANCELLED', 'RETURNED'],
                },
              },
              startDate: {
                gte: new Date(),
                lte: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
              },
            },
            include: {
              order: true,
            },
          },
        },
      });

      if (!product) {
        throw new AppError(404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND');
      }

      const totalBookings = ((product as any).items || []).length;
      const totalQuantityBooked = ((product as any).items || []).reduce((sum, item) => sum + item.quantity, 0);
      const averageBookingDuration = ((product as any).items || []).reduce((sum, item) => {
        const days = Math.ceil(
          (new Date(item.endDate).getTime() - new Date(item.startDate).getTime()) / 
          (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }, 0) / (totalBookings || 1);

      return {
        productId,
        productName: product.name,
        totalStock: product.stock,
        nextDays: days,
        totalBookings,
        totalQuantityBooked,
        averageBookingDuration: Math.round(averageBookingDuration),
        utilizationRate: ((totalQuantityBooked / (product.stock * days)) * 100).toFixed(2),
      };
    } catch (error) {
      logger.error('Error getting product availability summary:', error);
      throw error;
    }
  }

  /**
   * Helper: Get all dates between two dates
   */
  private getDatesBetween(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }
}

export const availabilityService = new AvailabilityService();
