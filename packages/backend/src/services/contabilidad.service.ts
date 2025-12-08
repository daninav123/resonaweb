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
      if (order.shippingCost) {
        costTransporte += Number(order.shippingCost);
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

        if (order.shippingCost) {
          costTransporte += Number(order.shippingCost);
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

  /**
   * Obtener lista de alquileres con gastos reales
   */
  async getAlquileres(status?: string) {
    try {
      const where: any = {
        status: { not: 'CANCELLED' },
      };

      if (status) {
        where.status = status;
      }

      const orders = await prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return orders.map((order) => {
        const totalAmount = Number(order.total || 0);
        const realCost = Number(order.realCost || 0);
        const profit = totalAmount - realCost;
        const margin = totalAmount > 0 ? (profit / totalAmount) * 100 : 0;

        return {
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: `${order.user.firstName} ${order.user.lastName}`,
          startDate: order.startDate,
          endDate: order.endDate,
          totalAmount,
          realCost,
          profit,
          margin,
          status: order.status,
        };
      });
    } catch (error) {
      logger.error('Error getting alquileres:', error);
      throw error;
    }
  }

  /**
   * Actualizar gastos reales de un pedido
   */
  async updateAlquilerGastos(orderId: string, realCost: number) {
    try {
      const updated = await prisma.order.update({
        where: { id: orderId },
        data: { realCost },
      });

      return updated;
    } catch (error) {
      logger.error('Error updating alquiler gastos:', error);
      throw error;
    }
  }

  /**
   * Obtener lista de montajes con costes
   */
  async getMontajes() {
    try {
      // Obtener todos los packs de tipo montaje
      const packs = await prisma.pack.findMany({
        where: {
          categoryRef: {
            name: {
              equals: 'Montaje',
              mode: 'insensitive',
            },
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Buscar órdenes que incluyan estos montajes
      const results = [];

      for (const pack of packs) {
        // Buscar items de pedido que referencien este pack
        const orderItems = await prisma.orderItem.findMany({
          where: {
            productId: pack.id, // Los packs se guardan como productos
          },
          include: {
            order: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        });

        for (const item of orderItems) {
          const estimatedCost = pack.items.reduce((sum, packItem) => {
            return sum + (Number(packItem.estimatedCost || packItem.product.purchasePrice || 0) * (packItem.quantity || 1));
          }, 0);

          const realCost = pack.items.reduce((sum, packItem) => {
            return sum + (Number(packItem.realCost || packItem.estimatedCost || packItem.product.purchasePrice || 0) * (packItem.quantity || 1));
          }, 0);

          const price = Number(pack.finalPrice || 0);
          const profit = price - realCost;
          const margin = price > 0 ? (profit / price) * 100 : 0;

          results.push({
            id: pack.id,
            name: pack.name,
            orderId: item.order.id,
            orderNumber: item.order.orderNumber,
            customerName: `${item.order.user.firstName} ${item.order.user.lastName}`,
            date: item.order.startDate,
            estimatedCost,
            realCost,
            price,
            profit,
            margin,
          });
        }
      }

      return results;
    } catch (error) {
      logger.error('Error getting montajes:', error);
      throw error;
    }
  }

  /**
   * Actualizar costes reales de un montaje
   */
  async updateMontajeGastos(montajeId: string, realCost: number) {
    try {
      // Actualizar el coste real en los PackItems
      const pack = await prisma.pack.findUnique({
        where: { id: montajeId },
        include: { items: true },
      });

      if (!pack) {
        throw new Error('Montaje no encontrado');
      }

      // Distribuir el coste real proporcionalmente entre los items
      const totalEstimated = pack.items.reduce((sum, item) => sum + Number(item.estimatedCost || 0), 0);

      for (const item of pack.items) {
        const proportion = totalEstimated > 0 ? Number(item.estimatedCost || 0) / totalEstimated : 1 / pack.items.length;
        const itemRealCost = realCost * proportion;

        await prisma.packItem.update({
          where: { id: item.id },
          data: { realCost: itemRealCost },
        });
      }

      return { success: true };
    } catch (error) {
      logger.error('Error updating montaje gastos:', error);
      throw error;
    }
  }

  /**
   * Obtener gastos operativos
   */
  async getGastos(category?: string) {
    try {
      const where: any = {};

      if (category) {
        where.category = category;
      }

      const gastos = await prisma.operationalExpense.findMany({
        where,
        orderBy: {
          date: 'desc',
        },
      });

      return gastos.map((gasto) => ({
        id: gasto.id,
        concept: gasto.concept,
        amount: Number(gasto.amount),
        category: gasto.category,
        date: gasto.date,
        notes: gasto.notes,
      }));
    } catch (error) {
      logger.error('Error getting gastos:', error);
      throw error;
    }
  }

  /**
   * Crear gasto operativo
   */
  async createGasto(data: {
    concept: string;
    amount: number;
    category: string;
    date: Date;
    notes?: string;
  }) {
    try {
      const gasto = await prisma.operationalExpense.create({
        data: {
          concept: data.concept,
          amount: data.amount,
          category: data.category,
          date: data.date,
          notes: data.notes,
        },
      });

      return gasto;
    } catch (error) {
      logger.error('Error creating gasto:', error);
      throw error;
    }
  }

  /**
   * Actualizar gasto operativo
   */
  async updateGasto(
    id: string,
    data: {
      concept?: string;
      amount?: number;
      category?: string;
      date?: Date;
      notes?: string;
    }
  ) {
    try {
      const gasto = await prisma.operationalExpense.update({
        where: { id },
        data,
      });

      return gasto;
    } catch (error) {
      logger.error('Error updating gasto:', error);
      throw error;
    }
  }

  /**
   * Eliminar gasto operativo
   */
  async deleteGasto(id: string) {
    try {
      await prisma.operationalExpense.delete({
        where: { id },
      });

      return { success: true };
    } catch (error) {
      logger.error('Error deleting gasto:', error);
      throw error;
    }
  }
}

export const contabilidadService = new ContabilidadService();
