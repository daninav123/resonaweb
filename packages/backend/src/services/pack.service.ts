import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { packPricingService } from './pack-pricing.service';
import { Prisma } from '@prisma/client';

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

    // Los precios y ahorros ya están calculados en el pack
    return {
      ...pack,
      pricing: {
        // Precio total calculado (suma de todo sin descuento)
        calculatedTotalPrice: Number(pack.calculatedTotalPrice),
        // Precio final que paga el cliente
        finalPrice: Number(pack.finalPrice),
        // Ahorro del cliente
        savingsAmount: Number(pack.savingsAmount),
        savingsPercentage: Math.round(Number(pack.savingsPercentage)),
        // Desglose
        breakdown: {
          basePricePerDay: Number(pack.basePricePerDay),
          baseShippingCost: Number(pack.baseShippingCost),
          baseInstallationCost: Number(pack.baseInstallationCost),
          discountPercentage: Number(pack.discountPercentage),
          discountAmount: Number(pack.discountAmount),
        },
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
    discountPercentage?: number;
    customFinalPrice?: number;
    autoCalculate?: boolean;
    items: Array<{ productId: string; quantity: number }>;
    imageUrl?: string;
    featured?: boolean;
  }) {
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Crear pack temporalmente para calcular precio
    const pack = await prisma.pack.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        discountPercentage: new Prisma.Decimal(data.discountPercentage || 0),
        autoCalculate: data.autoCalculate !== false, // Por defecto true
        customPriceEnabled: !!data.customFinalPrice,
        finalPrice: data.customFinalPrice ? new Prisma.Decimal(data.customFinalPrice) : 0, // Se calculará después
        basePricePerDay: 0,
        baseShippingCost: 0,
        baseInstallationCost: 0,
        calculatedTotalPrice: 0,
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

    // Calcular y actualizar precio automáticamente
    if (pack.autoCalculate) {
      await packPricingService.updatePackPrice(pack.id);
    }

    // Obtener pack actualizado
    const updatedPack = await prisma.pack.findUnique({
      where: { id: pack.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    logger.info(`Pack created: ${updatedPack!.name} with ${updatedPack!.items.length} products`);
    return updatedPack;
  }

  /**
   * Actualizar pack
   */
  async updatePack(
    packId: string,
    data: {
      name?: string;
      description?: string;
      discountPercentage?: number;
      customFinalPrice?: number;
      autoCalculate?: boolean;
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
        ...(data.discountPercentage !== undefined && { discountPercentage: new Prisma.Decimal(data.discountPercentage) }),
        ...(data.customFinalPrice !== undefined && { 
          customPriceEnabled: true,
          finalPrice: new Prisma.Decimal(data.customFinalPrice) 
        }),
        ...(data.autoCalculate !== undefined && { autoCalculate: data.autoCalculate }),
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

    // Recalcular precio si autoCalculate está activado
    const currentPack = await prisma.pack.findUnique({
      where: { id: packId },
      select: { autoCalculate: true }
    });

    if (currentPack?.autoCalculate) {
      await packPricingService.updatePackPrice(packId);
    }

    // Obtener pack actualizado
    const updatedPack = await prisma.pack.findUnique({
      where: { id: packId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    logger.info(`Pack updated: ${updatedPack!.name}`);
    return updatedPack;
  }

  /**
   * Eliminar pack
   */
  async deletePack(packId: string) {
    const pack = await prisma.pack.findUnique({
      where: { id: packId },
      select: { name: true }
    });

    if (!pack) {
      throw new AppError(404, 'Pack no encontrado', 'PACK_NOT_FOUND');
    }

    await prisma.pack.delete({
      where: { id: packId }
    });

    logger.info(`Pack deleted: ${pack.name}`);
  }
}

export const packService = new PackService();
