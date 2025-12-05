import { prisma } from '../index';
import { logger } from '../utils/logger';

export class ContabilidadService {
  /**
   * Obtener resumen financiero del período
   */
  async getFinancialSummary(period: 'month' | 'quarter' | 'year') {
    try {
      const now = new Date();
      let startDate: Date;
      let previousStartDate: Date;
      let previousEndDate: Date;

      // Calcular fechas según el período
      if (period === 'month') {
        // Mes actual
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        // Mes anterior
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      } else if (period === 'quarter') {
        // Trimestre actual
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        // Trimestre anterior
        previousStartDate = new Date(now.getFullYear(), (quarter - 1) * 3, 1);
        previousEndDate = new Date(now.getFullYear(), quarter * 3, 0, 23, 59, 59);
      } else {
        // Año actual
        startDate = new Date(now.getFullYear(), 0, 1);
        // Año anterior
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
        previousEndDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
      }

      // PERÍODO ACTUAL
      const currentOrders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: startDate,
          },
          status: {
            not: 'CANCELLED',
          },
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });

      // PERÍODO ANTERIOR
      const previousOrders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: previousStartDate,
            lte: previousEndDate,
          },
          status: {
            not: 'CANCELLED',
          },
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });

      // Calcular totales
      const currentMetrics = this.calculateMetrics(currentOrders);
      const previousMetrics = this.calculateMetrics(previousOrders);

      // Calcular cambios porcentuales
      const ingresosChange = previousMetrics.ingresos > 0
        ? ((currentMetrics.ingresos - previousMetrics.ingresos) / previousMetrics.ingresos) * 100
        : 0;

      const gastosChange = previousMetrics.gastos > 0
        ? ((currentMetrics.gastos - previousMetrics.gastos) / previousMetrics.gastos) * 100
        : 0;

      const beneficioChange = previousMetrics.beneficio > 0
        ? ((currentMetrics.beneficio - previousMetrics.beneficio) / previousMetrics.beneficio) * 100
        : currentMetrics.beneficio > 0 ? 100 : 0;

      return {
        currentMonth: currentMetrics,
        previousMonth: previousMetrics,
        changes: {
          ingresosChange,
          gastosChange,
          beneficioChange,
        },
      };
    } catch (error) {
      logger.error('Error calculating financial summary:', error);
      throw error;
    }
  }

  /**
   * Calcular métricas financieras de un conjunto de pedidos
   */
  private calculateMetrics(orders: any[]) {
    let ingresos = 0;
    let costPersonal = 0;
    let costDepreciacion = 0;
    let costTransporte = 0;

    orders.forEach((order) => {
      // Ingresos = Total del pedido
      ingresos += Number(order.total || 0);

      // Costes por cada item
      order.items?.forEach((item: any) => {
        const product = item.product;
        const quantity = item.quantity || 1;
        const isPersonal = product?.category?.name?.toLowerCase() === 'personal';
        const isConsumable = product?.isConsumable || false;

        if (isPersonal) {
          // Personal: coste por hora × horas trabajadas
          const hours = (item.numberOfPeople || 1) * (item.hoursPerPerson || 1);
          costPersonal += Number(product.purchasePrice || 0) * hours;
        } else if (isConsumable) {
          // Consumible: coste total (se pierde el producto)
          costDepreciacion += Number(product.purchasePrice || 0) * quantity;
        } else {
          // Material: depreciación 5% por alquiler
          costDepreciacion += Number(product.purchasePrice || 0) * quantity * 0.05;
        }
      });

      // Costes de transporte (si aplica)
      if (order.transportCost) {
        costTransporte += Number(order.transportCost);
      }
    });

    const gastos = costPersonal + costDepreciacion + costTransporte;
    const beneficio = ingresos - gastos;

    return {
      ingresos,
      gastos,
      beneficio,
      costPersonal,
      costDepreciacion,
      costTransporte,
    };
  }

  /**
   * Análisis de rentabilidad por producto/pack/montaje
   */
  async getAnalysisRentabilidad() {
    try {
      // Obtener todos los productos que han sido alquilados
      const orderItems = await prisma.orderItem.findMany({
        include: {
          product: {
            include: {
              category: true,
            },
          },
          order: {
            select: {
              status: true,
              total: true,
              createdAt: true,
            },
          },
        },
        where: {
          order: {
            status: {
              not: 'CANCELLED',
            },
          },
        },
      });

      // Agrupar por producto
      const productStats = new Map<string, any>();

      orderItems.forEach((item) => {
        const productId = item.productId;
        const product = item.product;

        if (!product) return;

        const isPersonal = product.category?.name?.toLowerCase() === 'personal';
        const isConsumable = product.isConsumable || false;
        const quantity = item.quantity || 1;

        // Calcular ingresos de este item
        const itemIngresos = Number((item as any).unitPrice || item.pricePerDay || 0) * quantity;

        // Calcular costes de este item
        let itemCostes = 0;
        if (isPersonal) {
          const hours = ((item as any).numberOfPeople || 1) * ((item as any).hoursPerPerson || 1);
          itemCostes = Number(product.purchasePrice || 0) * hours;
        } else if (isConsumable) {
          itemCostes = Number(product.purchasePrice || 0) * quantity;
        } else {
          itemCostes = Number(product.purchasePrice || 0) * quantity * 0.05;
        }

        if (!productStats.has(productId)) {
          productStats.set(productId, {
            id: productId,
            name: product.name,
            type: product.isPack ? 'pack' : 'product',
            vecesAlquilado: 0,
            ingresosGenerados: 0,
            costesAsociados: 0,
          });
        }

        const stats = productStats.get(productId);
        stats.vecesAlquilado += 1;
        stats.ingresosGenerados += itemIngresos;
        stats.costesAsociados += itemCostes;
      });

      // Convertir a array y calcular métricas
      const results = Array.from(productStats.values()).map((stat) => {
        const beneficio = stat.ingresosGenerados - stat.costesAsociados;
        const margen = stat.ingresosGenerados > 0
          ? (beneficio / stat.ingresosGenerados) * 100
          : 0;
        const roi = stat.costesAsociados > 0
          ? (beneficio / stat.costesAsociados) * 100
          : 0;

        return {
          ...stat,
          beneficio,
          margen,
          roi,
        };
      });

      return results;
    } catch (error) {
      logger.error('Error calculating rentabilidad analysis:', error);
      throw error;
    }
  }

  /**
   * Obtener evolución mensual (últimos N meses)
   */
  async getMonthlyEvolution(months: number = 12) {
    try {
      const now = new Date();
      const results = [];

      for (let i = months - 1; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

        const orders = await prisma.order.findMany({
          where: {
            createdAt: {
              gte: monthDate,
              lt: nextMonthDate,
            },
            status: {
              not: 'CANCELLED',
            },
          },
          include: {
            items: {
              include: {
                product: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        });

        const metrics = this.calculateMetrics(orders);

        results.push({
          month: monthDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
          ingresos: metrics.ingresos,
          gastos: metrics.gastos,
          beneficio: metrics.beneficio,
        });
      }

      return results;
    } catch (error) {
      logger.error('Error calculating monthly evolution:', error);
      throw error;
    }
  }

  /**
   * Obtener desglose de costes del período
   */
  async getCostBreakdown(period: 'month' | 'quarter' | 'year') {
    try {
      const now = new Date();
      let startDate: Date;

      if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (period === 'quarter') {
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
      } else {
        startDate = new Date(now.getFullYear(), 0, 1);
      }

      const orders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: startDate,
          },
          status: {
            not: 'CANCELLED',
          },
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });

      let costPersonal = 0;
      let costDepreciacion = 0;
      let costConsumibles = 0;
      let costTransporte = 0;

      orders.forEach((order) => {
        order.items?.forEach((item: any) => {
          const product = item.product;
          const quantity = item.quantity || 1;
          const isPersonal = product?.category?.name?.toLowerCase() === 'personal';
          const isConsumable = product?.isConsumable || false;

          if (isPersonal) {
            const hours = ((item as any).numberOfPeople || 1) * ((item as any).hoursPerPerson || 1);
            costPersonal += Number(product.purchasePrice || 0) * hours;
          } else if (isConsumable) {
            costConsumibles += Number(product.purchasePrice || 0) * quantity;
          } else {
            costDepreciacion += Number(product.purchasePrice || 0) * quantity * 0.05;
          }
        });

        if (order.transportCost) {
          costTransporte += Number(order.transportCost);
        }
      });

      const total = costPersonal + costDepreciacion + costConsumibles + costTransporte;

      return {
        costPersonal,
        costDepreciacion,
        costTransporte,
        costConsumibles,
        total,
      };
    } catch (error) {
      logger.error('Error calculating cost breakdown:', error);
      throw error;
    }
  }
}

export const contabilidadService = new ContabilidadService();
