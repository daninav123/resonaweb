import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

class ProductPackService {
  /**
   * Verificar si un producto-pack tiene todos sus componentes disponibles
   */
  async checkPackAvailability(
    productId: string,
    startDate: Date,
    endDate: Date,
    quantity: number = 1
  ) {
    // Obtener el producto y verificar que sea un pack
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        components: {
          include: {
            component: true,
          },
        },
      },
    });

    if (!product) {
      throw new AppError(404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND');
    }

    if (!product.isPack) {
      throw new AppError(400, 'Este producto no es un pack', 'NOT_A_PACK');
    }

    if (product.components.length === 0) {
      return {
        available: false,
        reason: 'El pack no tiene componentes configurados',
        productName: product.name,
      };
    }

    // Verificar cada componente del pack
    const unavailableComponents = [];

    for (const comp of product.components) {
      const component = comp.component;
      const requiredQuantity = comp.quantity * quantity;

      // Verificar stock físico
      if (component.realStock < requiredQuantity) {
        unavailableComponents.push({
          componentName: component.name,
          required: requiredQuantity,
          available: component.realStock,
          reason: 'Stock insuficiente',
        });
        continue;
      }

      // Verificar disponibilidad en las fechas
      const reservedQuantity = await this.getReservedQuantity(
        component.id,
        startDate,
        endDate
      );

      const availableForDates = component.realStock - reservedQuantity;

      if (availableForDates < requiredQuantity) {
        unavailableComponents.push({
          componentName: component.name,
          required: requiredQuantity,
          available: availableForDates,
          reason: 'No disponible en esas fechas',
        });
      }
    }

    if (unavailableComponents.length > 0) {
      return {
        available: false,
        productName: product.name,
        unavailableComponents,
        message: `El pack no está completamente disponible. ${unavailableComponents.length} componente(s) no disponible(s).`,
      };
    }

    return {
      available: true,
      productName: product.name,
      totalComponents: product.components.length,
      message: 'Pack completamente disponible',
    };
  }

  /**
   * Calcular el máximo de packs disponibles según el componente más limitante
   */
  async getPackMaxAvailability(
    productId: string,
    startDate: Date,
    endDate: Date
  ) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        components: {
          include: {
            component: true,
          },
        },
      },
    });

    if (!product || !product.isPack) {
      throw new AppError(400, 'Producto no es un pack', 'NOT_A_PACK');
    }

    let maxPackQuantity = Infinity;

    for (const comp of product.components) {
      const component = comp.component;
      const reservedQuantity = await this.getReservedQuantity(
        component.id,
        startDate,
        endDate
      );

      const availableQuantity = component.realStock - reservedQuantity;

      // Cuántos packs se pueden hacer con este componente
      const packsFromThisComponent = Math.floor(
        availableQuantity / comp.quantity
      );

      maxPackQuantity = Math.min(maxPackQuantity, packsFromThisComponent);
    }

    return {
      productId,
      productName: product.name,
      maxAvailableQuantity: maxPackQuantity === Infinity ? 0 : maxPackQuantity,
      components: product.components.map((comp) => ({
        name: comp.component.name,
        requiredPerPack: comp.quantity,
        available: comp.component.realStock,
      })),
    };
  }

  /**
   * Añadir componentes a un pack
   */
  async addComponentsToPack(
    packId: string,
    components: Array<{ componentId: string; quantity: number }>
  ) {
    // Verificar que el producto existe y es un pack
    const product = await prisma.product.findUnique({
      where: { id: packId },
    });

    if (!product) {
      throw new AppError(404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND');
    }

    if (!product.isPack) {
      throw new AppError(
        400,
        'Este producto no es un pack. Marca isPack=true primero',
        'NOT_A_PACK'
      );
    }

    // Eliminar componentes existentes
    await prisma.productComponent.deleteMany({
      where: { packId },
    });

    // Crear nuevos componentes
    const createdComponents = await prisma.productComponent.createMany({
      data: components.map((comp) => ({
        packId,
        componentId: comp.componentId,
        quantity: comp.quantity,
      })),
    });

    logger.info(
      `Components added to pack ${product.name}: ${createdComponents.count} items`
    );

    // Retornar pack actualizado con componentes
    return await prisma.product.findUnique({
      where: { id: packId },
      include: {
        components: {
          include: {
            component: {
              select: {
                id: true,
                name: true,
                mainImageUrl: true,
                pricePerDay: true,
                realStock: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Obtener producto pack con sus componentes
   */
  async getPackWithComponents(packId: string) {
    const product = await prisma.product.findUnique({
      where: { id: packId },
      include: {
        components: {
          include: {
            component: {
              include: {
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!product) {
      throw new AppError(404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND');
    }

    if (!product.isPack) {
      throw new AppError(400, 'Este producto no es un pack', 'NOT_A_PACK');
    }

    // Calcular precio total de componentes individuales
    const individualPrice = product.components.reduce((total, comp) => {
      return (
        total + Number(comp.component.pricePerDay) * comp.quantity
      );
    }, 0);

    const packPrice = Number(product.pricePerDay);
    const savings = individualPrice - packPrice;
    const savingsPercentage = individualPrice > 0 
      ? (savings / individualPrice) * 100 
      : 0;

    return {
      ...product,
      pricing: {
        packPrice,
        individualPrice,
        savings,
        savingsPercentage: Math.round(savingsPercentage),
      },
    };
  }

  /**
   * Obtener cantidad reservada de un producto en un rango de fechas
   */
  private async getReservedQuantity(
    productId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const overlappingOrders = await prisma.orderItem.findMany({
      where: {
        productId,
        order: {
          status: {
            notIn: ['CANCELLED', 'COMPLETED'],
          },
        },
        AND: [{ startDate: { lte: endDate } }, { endDate: { gte: startDate } }],
      },
      select: {
        quantity: true,
      },
    });

    return overlappingOrders.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }

  /**
   * Listar todos los packs (productos con isPack=true)
   */
  async getAllPacks(includeComponents: boolean = false) {
    return await prisma.product.findMany({
      where: {
        isPack: true,
        isActive: true,
      },
      include: includeComponents
        ? {
            components: {
              include: {
                component: {
                  select: {
                    id: true,
                    name: true,
                    mainImageUrl: true,
                    realStock: true,
                  },
                },
              },
            },
            category: true,
          }
        : { category: true },
      orderBy: {
        featured: 'desc',
      },
    });
  }
}

export const productPackService = new ProductPackService();
