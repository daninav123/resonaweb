import { PrismaClient, DeliveryStatus } from '@prisma/client';
import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

interface DeliveryRoute {
  date: Date;
  orders: any[];
  totalStops: number;
  estimatedDistance: number;
  estimatedTime: number;
}

interface Vehicle {
  id: string;
  name: string;
  capacity: number;
  available: boolean;
}

interface DeliveryAssignment {
  orderId: string;
  vehicleId: string;
  driverId: string;
  plannedDate: Date;
  estimatedTime: string;
}

export class LogisticsService {
  /**
   * Plan delivery routes for a specific date
   */
  async planDeliveryRoutes(date: Date): Promise<DeliveryRoute[]> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Get all orders that need delivery on this date
      const orders = await prisma.order.findMany({
        where: {
          deliveryType: 'DELIVERY',
          deliveryDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: {
            in: ['CONFIRMED', 'PREPARING', 'READY'],
          },
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              phone: true,
              address: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  weight: true,
                  dimensions: true,
                },
              },
            },
          },
        },
      });

      // Group orders by delivery zones (simplified - by postal code prefix)
      const ordersByZone: Map<string, any[]> = new Map();

      orders.forEach(order => {
        // Extract zone from delivery address (simplified)
        const zone = this.extractZoneFromAddress(((order.deliveryAddress || {}) || {}));
        const zoneOrders = ordersByZone.get(zone) || [];
        zoneOrders.push(order);
        ordersByZone.set(zone, zoneOrders);
      });

      // Create routes for each zone
      const routes: DeliveryRoute[] = [];
      
      ordersByZone.forEach((zoneOrders, zone) => {
        // Split zone orders into vehicle capacity groups
        const vehicleCapacity = 10; // Max orders per vehicle
        
        for (let i = 0; i < zoneOrders.length; i += vehicleCapacity) {
          const routeOrders = zoneOrders.slice(i, i + vehicleCapacity);
          
          routes.push({
            date,
            orders: routeOrders,
            totalStops: routeOrders.length,
            estimatedDistance: this.calculateRouteDistance(routeOrders),
            estimatedTime: this.calculateRouteTime(routeOrders),
          });
        }
      });

      return routes;
    } catch (error) {
      logger.error('Error planning delivery routes:', error);
      throw error;
    }
  }

  /**
   * Assign vehicle to order
   */
  async assignVehicle(orderId: string, vehicleId: string): Promise<any> {
    try {
      // Check if delivery record exists
      let delivery = await prisma.delivery.findFirst({
        where: { orderId },
      });

      if (!delivery) {
        // Create new delivery record
        delivery = await prisma.delivery.create({
          data: {
            orderId,
            vehicleId,
            status: DeliveryStatus.SCHEDULED,
            plannedDate: new Date(),
          },
        });
      } else {
        // Update existing delivery
        delivery = await prisma.delivery.update({
          where: { id: delivery.id },
          data: { vehicleId },
        });
      }

      logger.info(`Vehicle ${vehicleId} assigned to order ${orderId}`);

      return delivery;
    } catch (error) {
      logger.error('Error assigning vehicle:', error);
      throw error;
    }
  }

  /**
   * Assign driver to delivery
   */
  async assignDriver(orderId: string, driverId: string): Promise<any> {
    try {
      let delivery = await prisma.delivery.findFirst({
        where: { orderId },
      });

      if (!delivery) {
        delivery = await prisma.delivery.create({
          data: {
            orderId,
            driverId,
            status: DeliveryStatus.SCHEDULED,
            plannedDate: new Date(),
          },
        });
      } else {
        delivery = await prisma.delivery.update({
          where: { id: delivery.id },
          data: { driverId },
        });
      }

      logger.info(`Driver ${driverId} assigned to order ${orderId}`);

      return delivery;
    } catch (error) {
      logger.error('Error assigning driver:', error);
      throw error;
    }
  }

  /**
   * Generate delivery note
   */
  async generateDeliveryNote(orderId: string): Promise<any> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: true,
          items: {
            include: {
              product: true,
            },
          },
          delivery: true,
        },
      });

      if (!order) {
        throw new AppError(404, 'Pedido no encontrado', 'ORDER_NOT_FOUND');
      }

      const deliveryNote = {
        orderNumber: order.orderNumber,
        deliveryDate: (order.deliveryDate || order.startDate) || order.startDate,
        customer: {
          name: `${((order as any).user?.firstName || '')} ${((order as any).user?.lastName || '')}`,
          phone: ((order as any).user?.phone || ''),
          address: ((order.deliveryAddress || {}) || {}),
        },
        items: ((order as any).items || []).map(item => ({
          name: item.product.name,
          sku: item.product.sku,
          quantity: item.quantity,
        })),
        specialInstructions: order.notes,
        signature: null,
      };

      return deliveryNote;
    } catch (error) {
      logger.error('Error generating delivery note:', error);
      throw error;
    }
  }

  /**
   * Track delivery status
   */
  async trackDelivery(deliveryId: string): Promise<any> {
    try {
      const delivery = await prisma.delivery.findUnique({
        where: { id: deliveryId },
        include: {
          order: {
            select: {
              orderNumber: true,
              deliveryAddress: true,
            },
          },
        },
      });

      if (!delivery) {
        throw new AppError(404, 'Entrega no encontrada', 'DELIVERY_NOT_FOUND');
      }

      // In a real system, this would integrate with GPS tracking
      const trackingInfo = {
        deliveryId: delivery.id,
        orderNumber: ((delivery as any).order?.orderNumber || ''),
        status: delivery.status,
        plannedDate: delivery.plannedDate,
        actualDate: delivery.actualDate,
        currentLocation: this.getCurrentLocation(delivery),
        estimatedArrival: this.getEstimatedArrival(delivery),
        deliveryAddress: ((order.deliveryAddress || {}) || {}),
        signature: delivery.signature,
      };

      return trackingInfo;
    } catch (error) {
      logger.error('Error tracking delivery:', error);
      throw error;
    }
  }

  /**
   * Confirm delivery with signature
   */
  async confirmDelivery(orderId: string, signature: string): Promise<any> {
    try {
      const delivery = await prisma.delivery.findFirst({
        where: { orderId },
      });

      if (!delivery) {
        throw new AppError(404, 'Entrega no encontrada', 'DELIVERY_NOT_FOUND');
      }

      const updatedDelivery = await prisma.delivery.update({
        where: { id: delivery.id },
        data: {
          status: DeliveryStatus.DELIVERED,
          actualDate: new Date(),
          signature,
        },
      });

      // Update order status
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'DELIVERED',
          deliveredAt: new Date(),
        },
      });

      logger.info(`Delivery confirmed for order ${orderId}`);

      return updatedDelivery;
    } catch (error) {
      logger.error('Error confirming delivery:', error);
      throw error;
    }
  }

  /**
   * Confirm pickup
   */
  async confirmPickup(orderId: string): Promise<any> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new AppError(404, 'Pedido no encontrado', 'ORDER_NOT_FOUND');
      }

      if (order.deliveryType !== 'PICKUP') {
        throw new AppError(400, 'Este pedido no es para recogida', 'NOT_PICKUP');
      }

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'DELIVERED',
          deliveredAt: new Date(),
        },
      });

      logger.info(`Pickup confirmed for order ${orderId}`);

      return updatedOrder;
    } catch (error) {
      logger.error('Error confirming pickup:', error);
      throw error;
    }
  }

  /**
   * Get delivery schedule for a date
   */
  async getDeliverySchedule(date: Date): Promise<any[]> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const deliveries = await prisma.delivery.findMany({
        where: {
          plannedDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          order: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  phone: true,
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
          },
        },
        orderBy: {
          plannedDate: 'asc',
        },
      });

      return deliveries.map(delivery => ({
        id: delivery.id,
        orderNumber: ((delivery as any).order?.orderNumber || ''),
        customer: `${((order as any).user?.firstName || '')} ${((order as any).user?.lastName || '')}`,
        phone: ((order as any).user?.phone || ''),
        address: ((order.deliveryAddress || {}) || {}),
        plannedTime: delivery.plannedDate,
        status: delivery.status,
        vehicleId: delivery.vehicleId,
        driverId: delivery.driverId,
        items: ((order as any).items || []).length,
        totalQuantity: ((order as any).items || []).reduce((sum, item) => sum + item.quantity, 0),
      }));
    } catch (error) {
      logger.error('Error getting delivery schedule:', error);
      throw error;
    }
  }

  /**
   * Get available vehicles
   */
  async getAvailableVehicles(date: Date): Promise<Vehicle[]> {
    try {
      // In a real system, this would query a vehicles table
      // For now, return mock data
      const vehicles: Vehicle[] = [
        { id: 'v1', name: 'Furgoneta 1', capacity: 100, available: true },
        { id: 'v2', name: 'Furgoneta 2', capacity: 150, available: true },
        { id: 'v3', name: 'Camión Pequeño', capacity: 300, available: false },
        { id: 'v4', name: 'Camión Grande', capacity: 500, available: true },
      ];

      return vehicles.filter(v => v.available);
    } catch (error) {
      logger.error('Error getting available vehicles:', error);
      throw error;
    }
  }

  /**
   * Optimize delivery route
   */
  async optimizeRoute(orderIds: string[]): Promise<string[]> {
    try {
      // In a real system, this would use a route optimization algorithm
      // For now, return the same order
      logger.info(`Route optimized for ${orderIds.length} orders`);
      return orderIds;
    } catch (error) {
      logger.error('Error optimizing route:', error);
      throw error;
    }
  }

  /**
   * Get return schedule
   */
  async getReturnSchedule(date: Date): Promise<any[]> {
    try {
      const orders = await prisma.order.findMany({
        where: {
          endDate: date,
          status: 'DELIVERED',
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  sku: true,
                },
              },
            },
          },
        },
      });

      return orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customer: `${((order as any).user?.firstName || '')} ${((order as any).user?.lastName || '')}`,
        phone: ((order as any).user?.phone || ''),
        returnDate: order.endDate,
        deliveryType: order.deliveryType,
        address: order.deliveryType === 'DELIVERY' ? ((order.deliveryAddress || {}) || {}) : 'Recogida en almacén',
        items: ((order as any).items || []).map(item => ({
          name: item.product.name,
          sku: item.product.sku,
          quantity: item.quantity,
        })),
      }));
    } catch (error) {
      logger.error('Error getting return schedule:', error);
      throw error;
    }
  }

  // Helper methods
  private extractZoneFromAddress(address: string | null): string {
    if (!address) return 'default';
    
    // Extract postal code or zone from address
    const postalMatch = address.match(/\d{5}/);
    if (postalMatch) {
      return postalMatch[0].substring(0, 2); // First 2 digits of postal code
    }
    
    return 'default';
  }

  private calculateRouteDistance(orders: any[]): number {
    // Simplified calculation - 5km per stop average
    return orders.length * 5;
  }

  private calculateRouteTime(orders: any[]): number {
    // 15 minutes per stop + 30 minutes driving time per 10km
    const stops = orders.length * 15;
    const driving = (orders.length * 5 / 10) * 30;
    return stops + driving;
  }

  private getCurrentLocation(delivery: any): string {
    // In a real system, this would get GPS location
    if (delivery.status === 'DELIVERED') {
      return 'Entregado';
    } else if (delivery.status === 'IN_TRANSIT') {
      return 'En camino';
    } else {
      return 'En almacén';
    }
  }

  private getEstimatedArrival(delivery: any): Date | null {
    if (delivery.status === 'DELIVERED') {
      return delivery.actualDate;
    } else if (delivery.plannedDate) {
      return delivery.plannedDate;
    }
    return null;
  }
}

export const logisticsService = new LogisticsService();
