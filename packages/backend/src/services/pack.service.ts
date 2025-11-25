import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

class PackService {
  /**
   * Verificar disponibilidad de un pack
   * Verifica que TODOS los productos del pack estén disponibles
   */
  async checkAvailability(packId: string, startDate: Date, endDate: Date, quantity: number = 1) {
    const pack = await prisma.pack.findUnique({
      where: { id: packId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!pack) {
      throw new AppError(404, 'Pack no encontrado', 'PACK_NOT_FOUND');
    }

    if (!pack.isActive) {
      return {
        available: false,
        reason: 'Pack no disponible',
        packName: pack.name,
      };
    }

    // Verificar cada producto del pack
    const unavailableProducts = [];
    
    for (const item of pack.items) {
      const product = item.product;
      const requiredQuantity = item.quantity * quantity; // Si piden 2 packs, necesitan 2x cantidad de cada producto

      // Verificar stock físico
      if (product.realStock < requiredQuantity) {
        unavailableProducts.push({
          productName: product.name,
          required: requiredQuantity,
          available: product.realStock,
          reason: 'Stock insuficiente',
        });
        continue;
      }

      // Verificar disponibilidad en las fechas
      const reservedQuantity = await this.getReservedQuantity(
        product.id,
        startDate,
        endDate
      );

      const availableForDates = product.realStock - reservedQuantity;

      if (availableForDates < requiredQuantity) {
        unavailableProducts.push({
          productName: product.name,
          required: requiredQuantity,
          available: availableForDates,
          reason: 'No disponible en esas fechas',
        });
      }
    }

    if (unavailableProducts.length > 0) {
      return {
        available: false,
        packName: pack.name,
        unavailableProducts,
        message: `El pack no está completamente disponible. ${unavailableProducts.length} producto(s) no disponible(s).`,
      };
    }

    return {
      available: true,
      packName: pack.name,
      totalProducts: pack.items.length,
      message: 'Pack completamente disponible',
    };
  }

  /**
   * Obtener cantidad reservada de un producto en un rango de fechas
   */
  private async getReservedQuantity(productId: string, startDate: Date, endDate: Date): Promise<number> {
    const overlappingOrders = await prisma.orderItem.findMany({
      where: {
        productId,
        order: {
          status: {
            notIn: ['CANCELLED', 'COMPLETED'],
          },
        },
        AND: [
          { startDate: { lte: endDate } },
          { endDate: { gte: startDate } },
        ],
      },
      select: {
        quantity: true,
      },
    });

    return overlappingOrders.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Obtener todos los packs activos con su disponibilidad
   */
  async getActivePacks(startDate?: Date, endDate?: Date) {
    const packs = await prisma.pack.findMany({
      where: { isActive: true },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                mainImageUrl: true,
                realStock: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: {
        featured: 'desc',
      },
    });

    // Si se proporcionan fechas, verificar disponibilidad
    if (startDate && endDate) {
      const packsWithAvailability = await Promise.all(
        packs.map(async (pack) => {
          const availability = await this.checkAvailability(
            pack.id,
            startDate,
            endDate,
            1
          );

          return {
            ...pack,
            available: availability.available,
            availabilityDetails: availability,
          };
        })
      );

      return packsWithAvailability;
    }

    return packs;
  }

  /**
   * Obtener pack por ID con información detallada
   */
  async getPackById(packId: string) {
    const pack = await prisma.pack.findUnique({
      where: { id: packId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                mainImageUrl: true,
                pricePerDay: true,
                realStock: true,
                status: true,
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!pack) {
      throw new AppError(404, 'Pack no encontrado', 'PACK_NOT_FOUND');
    }

    // Calcular precio total de productos individuales
    const individualPrice = pack.items.reduce((total, item) => {
      return total + (Number(item.product.pricePerDay) * item.quantity);
    }, 0);

    const packPrice = Number(pack.pricePerDay);
    const savings = individualPrice - packPrice;
    const savingsPercentage = (savings / individualPrice) * 100;

    return {
      ...pack,
      pricing: {
        packPrice,
        individualPrice,
        savings,
        savingsPercentage: Math.round(savingsPercentage),
      },
    };
  }

  /**
   * Calcular el stock mínimo disponible de un pack
   * basado en el producto con menos stock
   */
  async getPackMaxAvailability(packId: string, startDate: Date, endDate: Date) {
    const pack = await prisma.pack.findUnique({
      where: { id: packId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!pack) {
      throw new AppError(404, 'Pack no encontrado', 'PACK_NOT_FOUND');
    }

    let maxPackQuantity = Infinity;

    for (const item of pack.items) {
      const product = item.product;
      const reservedQuantity = await this.getReservedQuantity(
        product.id,
        startDate,
        endDate
      );

      const availableQuantity = product.realStock - reservedQuantity;
      
      // Cuántos packs se pueden hacer con este producto
      const packsFromThisProduct = Math.floor(availableQuantity / item.quantity);
      
      maxPackQuantity = Math.min(maxPackQuantity, packsFromThisProduct);
    }

    return {
      packId,
      packName: pack.name,
      maxAvailableQuantity: maxPackQuantity === Infinity ? 0 : maxPackQuantity,
      products: pack.items.map(item => ({
        name: item.product.name,
        requiredPerPack: item.quantity,
        available: item.product.realStock,
      })),
    };
  }

  /**
   * Crear un nuevo pack
   */
  async createPack(data: {
    name: string;
    description: string;
    pricePerDay: number;
    discount: number;
    items: Array<{ productId: string; quantity: number }>;
    imageUrl?: string;
    featured?: boolean;
  }) {
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const pack = await prisma.pack.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        pricePerDay: data.pricePerDay,
        discount: data.discount,
        imageUrl: data.imageUrl,
        featured: data.featured || false,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
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

    logger.info(`Pack created: ${pack.name} with ${pack.items.length} products`);
    return pack;
  }

  /**
   * Actualizar pack
   */
  async updatePack(
    packId: string,
    data: {
      name?: string;
      description?: string;
      pricePerDay?: number;
      discount?: number;
      imageUrl?: string;
      featured?: boolean;
      isActive?: boolean;
      items?: Array<{ productId: string; quantity: number }>;
    }
  ) {
    // Si se actualizan los items, eliminar los existentes y crear los nuevos
    if (data.items) {
      await prisma.packItem.deleteMany({
        where: { packId },
      });
    }

    const pack = await prisma.pack.update({
      where: { id: packId },
      data: {
        ...(data.name && {
          name: data.name,
          slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        }),
        ...(data.description && { description: data.description }),
        ...(data.pricePerDay !== undefined && { pricePerDay: data.pricePerDay }),
        ...(data.discount !== undefined && { discount: data.discount }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.featured !== undefined && { featured: data.featured }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.items && {
          items: {
            create: data.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          },
        }),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    logger.info(`Pack updated: ${pack.name}`);
    return pack;
  }
}

export const packService = new PackService();
