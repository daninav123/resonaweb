import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface PackPricing {
  // Precios base calculados automáticamente
  basePricePerDay: number;           // Suma de pricePerDay de todos los productos
  calculatedTotalPrice: number;      // basePricePerDay
  
  // Descuento aplicado
  discountPercentage: number;        // Porcentaje de descuento (0-100)
  discountAmount: number;            // Cantidad en euros del descuento
  
  // Precio final
  finalPrice: number;                // Precio que paga el cliente
  customPriceEnabled: boolean;       // Si el admin estableció un precio personalizado
  
  // Ahorro para el cliente
  savingsAmount: number;             // calculatedTotalPrice - finalPrice
  savingsPercentage: number;         // (savingsAmount / calculatedTotalPrice) * 100
  
  // Desglose detallado
  breakdown: {
    basePricePerDay: number;
    subtotal: number;
    discountAmount: number;
    finalPrice: number;
  };
}

/**
 * Calcula el precio de un pack automáticamente
 * Incluye precio por día + coste de envío + coste de instalación
 * Aplica descuentos y calcula ahorros para el cliente
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

  // Calcular suma de precios por día de todos los productos
  const basePricePerDay = pack.items.reduce((sum, item) => {
    const productPrice = Number(item.product.pricePerDay) || 0;
    return sum + (productPrice * item.quantity);
  }, 0);

  // Precio total calculado (sin descuento) - solo basePricePerDay
  const calculatedTotalPrice = basePricePerDay;

  // Obtener descuento: si hay discountAmount en euros, usarlo; si no, calcular desde porcentaje
  let discountAmount = Number(pack.discountAmount) || 0;
  let discountPercentage = Number(pack.discountPercentage) || 0;
  
  // Si hay descuento en euros pero no porcentaje, calcular el porcentaje
  if (discountAmount > 0 && discountPercentage === 0 && calculatedTotalPrice > 0) {
    discountPercentage = (discountAmount / calculatedTotalPrice) * 100;
  }
  // Si hay porcentaje pero no descuento en euros, calcular el descuento
  else if (discountPercentage > 0 && discountAmount === 0) {
    discountAmount = calculatedTotalPrice * (discountPercentage / 100);
  }

  // Precio después de descuento
  const priceAfterDiscount = Math.max(0, calculatedTotalPrice - discountAmount);

  // Determinar precio final
  let finalPrice: number;
  let customPriceEnabled: boolean = false;
  
  if (Number(pack.finalPrice) > 0 && pack.customPriceEnabled) {
    // Si el admin estableció un precio personalizado, usarlo
    finalPrice = Number(pack.finalPrice);
    customPriceEnabled = true;
  } else {
    // Usar el precio calculado con descuento
    finalPrice = priceAfterDiscount;
  }

  // Calcular ahorro para el cliente
  const savingsAmount = Math.max(0, calculatedTotalPrice - finalPrice);
  const savingsPercentage = calculatedTotalPrice > 0 
    ? (savingsAmount / calculatedTotalPrice) * 100 
    : 0;

  return {
    basePricePerDay,
    calculatedTotalPrice,
    discountPercentage,
    discountAmount,
    finalPrice,
    customPriceEnabled,
    savingsAmount,
    savingsPercentage,
    breakdown: {
      basePricePerDay,
      subtotal: calculatedTotalPrice,
      discountAmount,
      finalPrice
    }
  };
}

/**
 * Actualiza el precio de un pack automáticamente
 * Calcula todos los campos: precios base, descuentos, precio final y ahorros
 */
export async function updatePackPrice(packId: string): Promise<void> {
  const pack = await prisma.pack.findUnique({
    where: { id: packId },
    select: { autoCalculate: true, customPriceEnabled: true }
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
      basePricePerDay: new Prisma.Decimal(pricing.basePricePerDay),
      calculatedTotalPrice: new Prisma.Decimal(pricing.calculatedTotalPrice),
      discountAmount: new Prisma.Decimal(pricing.discountAmount),
      savingsAmount: new Prisma.Decimal(pricing.savingsAmount),
      savingsPercentage: new Prisma.Decimal(pricing.savingsPercentage),
      // Solo actualizar finalPrice si no hay precio personalizado
      ...(!pack.customPriceEnabled && {
        finalPrice: new Prisma.Decimal(pricing.finalPrice)
      })
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
