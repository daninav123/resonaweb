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
   * Obtener TODOS los packs (incluyendo inactivos) - para admin
   */
  async getAllPacks(startDate?: Date, endDate?: Date) {
    const packs = await prisma.pack.findMany({
      // No filtramos por isActive, mostramos todos
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
    discountAmount?: number;
    customFinalPrice?: number;
    autoCalculate?: boolean;
    includeShipping?: boolean;
    includeInstallation?: boolean;
    items: Array<{ productId: string; quantity: number; numberOfPeople?: number; hoursPerPerson?: number }>;
    imageUrl?: string;
    featured?: boolean;
  }) {
    console.log('🆕 Creando nuevo pack:', { name: data.name, discountAmount: data.discountAmount });
    console.log('📦 Items recibidos para crear:', data.items);

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
        discountAmount: new Prisma.Decimal(data.discountAmount || 0),
        autoCalculate: data.autoCalculate !== false, // Por defecto true
        customPriceEnabled: !!data.customFinalPrice,
        finalPrice: data.customFinalPrice ? new Prisma.Decimal(data.customFinalPrice) : 0, // Se calculará después
        basePricePerDay: 0,
        baseShippingCost: 0,
        baseInstallationCost: 0,
        calculatedTotalPrice: 0,
        imageUrl: data.imageUrl,
        featured: data.featured || false,
        includeShipping: data.includeShipping !== false, // Por defecto true
        includeInstallation: data.includeInstallation !== false, // Por defecto true
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            ...(item.numberOfPeople !== undefined && { numberOfPeople: item.numberOfPeople }),
            ...(item.hoursPerPerson !== undefined && { hoursPerPerson: item.hoursPerPerson }),
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

    console.log('✅ Pack creado en BD:', pack.id);

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

    // Crear un producto "proxy" para que el pack sea visible en el catálogo público
    console.log('📦 Creando producto proxy para el pack...');
    const packsCategoryId = (await prisma.category.findFirst({
      where: { name: 'PACKS' }
    }))?.id;

    if (packsCategoryId) {
      const finalPrice = updatedPack!.finalPrice || new Prisma.Decimal(0);
      const finalPriceNum = Number(finalPrice);
      await prisma.product.create({
        data: {
          name: data.name,
          sku: `PACK-${pack.id.substring(0, 8).toUpperCase()}`,
          slug: `pack-${slug}`,
          description: data.description,
          categoryId: packsCategoryId,
          isPack: true,
          pricePerDay: new Prisma.Decimal(finalPriceNum),
          pricePerWeekend: new Prisma.Decimal(finalPriceNum),
          pricePerWeek: new Prisma.Decimal(finalPriceNum * 5),
          mainImageUrl: data.imageUrl,
          featured: data.featured || false,
          isActive: true,
          stock: 999,
          realStock: 999,
        }
      });
      console.log('✅ Producto proxy creado para el pack');
    }

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
      discountAmount?: number;
      customFinalPrice?: number;
      autoCalculate?: boolean;
      imageUrl?: string;
      featured?: boolean;
      isActive?: boolean;
      includeShipping?: boolean;
      includeInstallation?: boolean;
      items?: Array<{ productId: string; quantity: number; numberOfPeople?: number; hoursPerPerson?: number }>;
    }
  ) {
    try {
      console.log('🔄 Actualizando pack:', { packId, name: data.name });
      console.log('📦 Items recibidos para actualizar:', data.items);

      // Si se actualizan los items, eliminar los existentes y crear los nuevos
      if (data.items) {
        await prisma.packItem.deleteMany({
          where: { packId },
        });
      }

      // Construir objeto de actualización de forma segura
      const updateData: any = {};
      
      if (data.name) {
        updateData.name = data.name;
        updateData.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      if (data.description) updateData.description = data.description;
      if (data.discountPercentage !== undefined) updateData.discountPercentage = new Prisma.Decimal(data.discountPercentage);
      if (data.discountAmount !== undefined) {
        console.log(`💰 Guardando descuento: ${data.discountAmount} (tipo: ${typeof data.discountAmount})`);
        updateData.discountAmount = new Prisma.Decimal(data.discountAmount);
      }
      if (data.customFinalPrice !== undefined) {
        updateData.customPriceEnabled = true;
        updateData.finalPrice = new Prisma.Decimal(data.customFinalPrice);
      }
      if (data.autoCalculate !== undefined) updateData.autoCalculate = data.autoCalculate;
      if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
      if (data.featured !== undefined) updateData.featured = data.featured;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      if (data.includeShipping !== undefined) updateData.includeShipping = data.includeShipping;
      if (data.includeInstallation !== undefined) updateData.includeInstallation = data.includeInstallation;
      
      if (data.items) {
        updateData.items = {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            ...(item.numberOfPeople !== undefined && { numberOfPeople: item.numberOfPeople }),
            ...(item.hoursPerPerson !== undefined && { hoursPerPerson: item.hoursPerPerson }),
          })),
        };
      }

      console.log('📝 Datos a actualizar:', updateData);

      const pack = await prisma.pack.update({
        where: { id: packId },
        data: updateData,
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      console.log('✅ Pack actualizado en BD:', pack.id);

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

      // Actualizar el producto proxy si existe
      if (updatedPack && (data.name || data.description || data.imageUrl || data.featured)) {
        const slug = data.name 
          ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
          : undefined;

        await prisma.product.updateMany({
          where: { 
            slug: `pack-${updatedPack.slug}`,
            isPack: true
          },
          data: {
            ...(data.name && { name: data.name }),
            ...(data.description && { description: data.description }),
            ...(data.imageUrl && { mainImageUrl: data.imageUrl }),
            ...(data.featured !== undefined && { featured: data.featured }),
            ...(slug && { slug: `pack-${slug}` }),
          }
        });
      }

      logger.info(`Pack updated: ${updatedPack!.name}`);
      return updatedPack;
    } catch (error) {
      console.error('❌ Error actualizando pack:', error);
      throw error;
    }
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
