import { prisma } from '../index';
import { logger } from '../utils/logger';

interface StockAlert {
  productId: string;
  productName: string;
  sku: string;
  orderId: string;
  orderNumber: string;
  startDate: Date;
  endDate: Date;
  quantityRequested: number;
  availableStock: number;
  deficit: number;
  priority: 'high' | 'medium' | 'low';
  affectedOrders?: string[];
}

class StockAlertService {
  /**
   * Obtener todas las alertas de stock
   * Considera:
   * - Productos individuales en pedidos
   * - Componentes de packs en pedidos
   * - Stock actual vs reservado
   */
  async getStockAlerts(): Promise<{ alerts: StockAlert[]; summary: any }> {
    try {
      logger.info('🔍 Generando alertas de stock...');

      // Obtener todos los pedidos activos (incluyendo en curso)
      const activeOrders = await prisma.order.findMany({
        where: {
          status: { in: ['PENDING', 'IN_PROGRESS', 'COMPLETED'] },
          // Incluir pedidos en curso (que terminan después de hoy)
          endDate: { gte: new Date() },
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  components: {
                    include: {
                      component: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { startDate: 'asc' },
      });

    logger.info(`📋 Pedidos activos: ${activeOrders.length}`);

    // Mapa para acumular demanda por producto
    const productDemand = new Map<string, {
      product: any;
      totalDemand: number;
      orders: Array<{ orderId: string; orderNumber: string; quantity: number; startDate: Date; endDate: Date }>;
    }>();

    // Procesar cada pedido
    for (const order of activeOrders) {
      for (const item of order.items) {
        const product = item.product;

        // Si el producto es un pack, descomponer en componentes
        if (product.isPack && product.components.length > 0) {
          for (const comp of product.components) {
            const componentId = comp.component.id;
            const quantityNeeded = comp.quantity * item.quantity; // cantidad del componente * cantidad del pack pedida

            if (!productDemand.has(componentId)) {
              productDemand.set(componentId, {
                product: comp.component,
                totalDemand: 0,
                orders: [],
              });
            }

            const demand = productDemand.get(componentId)!;
            demand.totalDemand += quantityNeeded;
            demand.orders.push({
              orderId: order.id,
              orderNumber: order.orderNumber,
              quantity: quantityNeeded,
              startDate: order.startDate,
              endDate: order.endDate,
            });
          }
        } else {
          // Producto individual
          const productId = product.id;

          if (!productDemand.has(productId)) {
            productDemand.set(productId, {
              product: product,
              totalDemand: 0,
              orders: [],
            });
          }

          const demand = productDemand.get(productId)!;
          demand.totalDemand += item.quantity;
          demand.orders.push({
            orderId: order.id,
            orderNumber: order.orderNumber,
            quantity: item.quantity,
            startDate: order.startDate,
            endDate: order.endDate,
          });
        }
      }
    }

    logger.info(`📦 Productos con demanda: ${productDemand.size}`);

    // Generar alertas para productos con déficit
    const alerts: StockAlert[] = [];

    for (const [productId, demand] of productDemand.entries()) {
      const product = demand.product;
      const currentStock = product.realStock ?? product.stock ?? 0;

      // Calcular stock máximo necesario en cualquier momento
      // Para simplificar, usamos el total (en el futuro se puede mejorar por rangos de fechas)
      const deficit = demand.totalDemand - currentStock;

      if (deficit > 0) {
        // Hay déficit - crear alerta
        const sortedOrders = demand.orders.sort((a, b) => 
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );

        // Alerta por el primer pedido afectado
        const firstOrder = sortedOrders[0];

        alerts.push({
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          orderId: firstOrder.orderId,
          orderNumber: firstOrder.orderNumber,
          startDate: firstOrder.startDate,
          endDate: firstOrder.endDate,
          quantityRequested: demand.totalDemand,
          availableStock: currentStock,
          deficit: deficit,
          priority: deficit > 5 ? 'high' : deficit > 2 ? 'medium' : 'low',
          affectedOrders: sortedOrders.map(o => o.orderNumber),
        });

        logger.warn(`⚠️ ALERTA: ${product.name} - Stock: ${currentStock}, Necesario: ${demand.totalDemand}, Falta: ${deficit}`);
      }
    }

    // Ordenar alertas por prioridad y fecha
    alerts.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (a.priority !== b.priority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    const summary = {
      totalAlerts: alerts.length,
      highPriority: alerts.filter(a => a.priority === 'high').length,
      mediumPriority: alerts.filter(a => a.priority === 'medium').length,
      lowPriority: alerts.filter(a => a.priority === 'low').length,
      totalDeficit: alerts.reduce((sum, a) => sum + a.deficit, 0),
    };

    logger.info(`✅ Alertas generadas: ${alerts.length} (${summary.highPriority} alta, ${summary.mediumPriority} media, ${summary.lowPriority} baja)`);

    return { alerts, summary };
    } catch (error: any) {
      logger.error('❌ Error generando alertas de stock:', error);
      return { alerts: [], summary: { totalAlerts: 0, highPriority: 0, mediumPriority: 0, lowPriority: 0, totalDeficit: 0 } };
    }
  }

  /**
   * Obtener alertas por producto específico
   */
  async getAlertsByProduct(productId: string) {
    try {
      const { alerts } = await this.getStockAlerts();
      return alerts.filter(a => a.productId === productId);
    } catch (error: any) {
      logger.error('❌ Error obteniendo alertas por producto:', error);
      return [];
    }
  }

  /**
   * Marcar productos para compra basado en alertas
   */
  async markProductsForPurchase() {
    try {
      const { alerts } = await this.getStockAlerts();

      const productIds = [...new Set(alerts.map(a => a.productId))];

      // Marcar productos con déficit para compra
      await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: {
          markedForPurchase: true,
          purchaseNotes: 'Marcado automáticamente por alerta de stock',
        },
      });

      logger.info(`🛒 ${productIds.length} productos marcados para compra`);

      return productIds.length;
    } catch (error: any) {
      logger.error('❌ Error marcando productos para compra:', error);
      return 0;
    }
  }
}

export const stockAlertService = new StockAlertService();
