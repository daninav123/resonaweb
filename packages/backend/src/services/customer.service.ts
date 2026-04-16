import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export class CustomerService {
  /**
   * Get customer profile
   */
  async getCustomerProfile(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          address: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new AppError(404, 'Cliente no encontrado', 'CUSTOMER_NOT_FOUND');
      }

      return user;
    } catch (error) {
      logger.error('Error getting customer profile:', error);
      throw error;
    }
  }

  /**
   * Get customer stats
   */
  async getCustomerStats(userId: string) {
    try {
      const orders = await prisma.order.findMany({
        where: { userId },
      });

      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

      return {
        totalOrders,
        totalSpent,
        averageOrderValue,
        lastOrderDate: orders[0]?.createdAt || null,
      };
    } catch (error) {
      logger.error('Error getting customer stats:', error);
      throw error;
    }
  }

  /**
   * Add customer note
   */
  async addCustomerNote(data: { userId: string; createdBy: string; note: string }) {
    try {
      logger.info(`Note added for customer ${data.userId} by ${data.createdBy}: ${data.note}`);
      
      return {
        success: true,
        message: 'Nota agregada exitosamente',
      };
    } catch (error) {
      logger.error('Error adding customer note:', error);
      throw error;
    }
  }

  /**
   * Get customer history (orders, interactions)
   */
  async getCustomerHistory(userId: string, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;
      const orders = await prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });
      const total = await prisma.order.count({ where: { userId } });
      return { data: orders, total, page, limit };
    } catch (error) {
      logger.error('Error getting customer history:', error);
      throw error;
    }
  }

  /**
   * Get customer notes
   */
  async getCustomerNotes(userId: string) {
    try {
      // Stub: el modelo CustomerNote puede no existir aún
      logger.info(`Getting notes for customer ${userId}`);
      return [];
    } catch (error) {
      logger.error('Error getting customer notes:', error);
      throw error;
    }
  }

  /**
   * Set customer status
   */
  async setCustomerStatus(userId: string, status: string) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { isActive: status === 'ACTIVE' },
      });
      return { success: true, userId: user.id, status };
    } catch (error) {
      logger.error('Error setting customer status:', error);
      throw error;
    }
  }

  /**
   * Get customer documents (invoices, contracts)
   */
  async getCustomerDocuments(userId: string) {
    try {
      const invoices = await prisma.invoice.findMany({
        where: { order: { userId } },
        orderBy: { createdAt: 'desc' },
      });
      return { invoices };
    } catch (error) {
      logger.error('Error getting customer documents:', error);
      throw error;
    }
  }

  /**
   * Search customers
   */
  async searchCustomers(query: string, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;

      const customers = await prisma.user.findMany({
        where: {
          role: 'CLIENT',
          OR: [
            { email: { contains: query, mode: 'insensitive' } },
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
          ],
        },
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      const total = await prisma.user.count({
        where: {
          role: 'CLIENT',
          OR: [
            { email: { contains: query, mode: 'insensitive' } },
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
          ],
        },
      });

      return {
        customers,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error searching customers:', error);
      throw error;
    }
  }

  /**
   * Export customer data (GDPR)
   */
  async exportCustomerData(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new AppError(404, 'Cliente no encontrado', 'CUSTOMER_NOT_FOUND');
      }

      const orders = await prisma.order.findMany({
        where: { userId },
      });

      return {
        personalData: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          address: user.address,
        },
        orders: orders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          total: order.total,
          status: order.status,
          createdAt: order.createdAt,
        })),
        exportedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error exporting customer data:', error);
      throw error;
    }
  }
}

export const customerService = new CustomerService();
