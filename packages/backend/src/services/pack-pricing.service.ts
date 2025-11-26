import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface PackPricing {
  basePrice: number;
  priceExtra: number;
  discount: number;
  finalPrice: number;
  breakdown: {
    itemsTotal: number;
    extra: number;
    discountAmount: number;
  };
}

/**
 * Calcula el precio de un pack automáticamente
 * Fórmula: (basePrice + priceExtra) * (1 - discount/100)
 */
export async function calculatePackPrice(packId: string): Promise<PackPricing> {
  // Obtener el pack con sus items y productos
  const pack = await prisma.pack.findUnique({
    where: { id: packId },
    include: {
      items: {
        include: {
          product: {
            select: {
              pricePerDay: true
            }
          }
        }
      }
    }
  });

  if (!pack) {
    throw new Error('Pack no encontrado');
  }

  // Calcular precio base (suma de todos los productos)
  const basePrice = pack.items.reduce((sum, item) => {
    const productPrice = Number(item.product.pricePerDay);
    return sum + (productPrice * item.quantity);
  }, 0);

  const priceExtra = Number(pack.priceExtra);
  const discount = Number(pack.discount);

  // Calcular precio antes de descuento
  const priceBeforeDiscount = basePrice + priceExtra;

  // Calcular descuento en euros
  const discountAmount = priceBeforeDiscount * (discount / 100);

  // Precio final
  const finalPrice = priceBeforeDiscount - discountAmount;

  return {
    basePrice,
    priceExtra,
    discount,
    finalPrice,
    breakdown: {
      itemsTotal: basePrice,
      extra: priceExtra,
      discountAmount
    }
  };
}

/**
 * Actualiza el precio de un pack automáticamente
 */
export async function updatePackPrice(packId: string): Promise<void> {
  const pack = await prisma.pack.findUnique({
    where: { id: packId },
    select: { autoCalculate: true }
  });

  if (!pack) {
    throw new Error('Pack no encontrado');
  }

  // Solo actualizar si autoCalculate está activado
  if (!pack.autoCalculate) {
    return;
  }

  const pricing = await calculatePackPrice(packId);

  await prisma.pack.update({
    where: { id: packId },
    data: {
      basePrice: new Prisma.Decimal(pricing.basePrice),
      pricePerDay: new Prisma.Decimal(pricing.finalPrice)
    }
  });
}

/**
 * Actualiza los precios de todos los packs con autoCalculate = true
 */
export async function updateAllPackPrices(): Promise<number> {
  const packs = await prisma.pack.findMany({
    where: { autoCalculate: true },
    select: { id: true }
  });

  let updated = 0;

  for (const pack of packs) {
    try {
      await updatePackPrice(pack.id);
      updated++;
    } catch (error) {
      console.error(`Error actualizando pack ${pack.id}:`, error);
    }
  }

  return updated;
}

export const packPricingService = {
  calculatePackPrice,
  updatePackPrice,
  updateAllPackPrices
};
