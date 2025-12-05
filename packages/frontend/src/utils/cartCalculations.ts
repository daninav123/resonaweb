/**
 * Cálculos centralizados del carrito
 * TODAS las páginas deben usar estas funciones para garantizar consistencia
 */

import { GuestCartItem } from './guestCart';

export interface CartTotals {
  subtotal: number;
  shippingCost: number;
  installationCost: number;
  vipDiscount: number;
  couponDiscount: number;
  totalBeforeTax: number;
  tax: number;
  total: number;
}

export interface CartCalculationParams {
  items: GuestCartItem[];
  deliveryOption: 'pickup' | 'delivery';
  distance?: number;
  includeInstallation?: boolean;
  shippingIncludedInPrice?: boolean;
  userLevel?: 'STANDARD' | 'VIP' | 'VIP_PLUS';
  appliedCoupon?: {
    discountAmount: number;
    freeShipping?: boolean;
  } | null;
}

/**
 * FUNCIÓN PRINCIPAL - Calcular todos los totales del carrito
 * Esta es la ÚNICA función que debe usarse para calcular totales
 */
export function calculateCartTotals(params: CartCalculationParams): CartTotals {
  const {
    items,
    deliveryOption,
    distance = 0,
    includeInstallation = false,
    shippingIncludedInPrice = false,
    userLevel = 'STANDARD',
    appliedCoupon = null,
  } = params;

  // 1. CALCULAR SUBTOTAL
  const subtotal = items.reduce((sum, item) => {
    let itemTotal = 0;
    
    // IMPORTANTE: SIEMPRE recalcular para items de calculadora (eventMetadata)
    if ((item as any).eventMetadata) {
      const metadata = (item as any).eventMetadata;
      const partsTotal = Number(metadata.partsTotal || 0);
      const extrasTotal = Number(metadata.extrasTotal || 0);
      const packBasePrice = Number(metadata.packBasePrice || 0);
      
      // El total incluye: partes + extras + precio base del pack
      itemTotal = partsTotal + extrasTotal + packBasePrice;
    } else {
      // Para productos normales, usar totalPrice si está disponible
      itemTotal = (item as any).totalPrice;
      
      if (!itemTotal) {
        // Calcular basado en fechas y precio por día
        if (item.startDate && item.endDate) {
          const start = new Date(item.startDate);
          const end = new Date(item.endDate);
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;
          itemTotal = Number(item.product.pricePerDay) * days * item.quantity;
        } else {
          // Si no hay fechas, usar precio por día × cantidad
          itemTotal = Number(item.product.pricePerDay) * item.quantity;
        }
      }
    }
    
    return sum + (Number(itemTotal) || 0);
  }, 0);

  // 2. CALCULAR ENVÍO
  let shippingCost = 0;
  if (!shippingIncludedInPrice && deliveryOption === 'delivery' && distance > 0) {
    // Costo de envío: €1.5 por km
    shippingCost = distance * 1.5;
    
    // Si el cupón incluye envío gratis
    if (appliedCoupon?.freeShipping) {
      shippingCost = 0;
    }
  }

  // 3. CALCULAR INSTALACIÓN
  let installationCost = 0;
  if (!shippingIncludedInPrice && includeInstallation) {
    // Sumar costos de instalación de cada producto
    installationCost = items.reduce((sum, item) => {
      const installCost = Number((item as any).installationCost) || 0;
      return sum + (installCost * item.quantity);
    }, 0);
  }

  // 4. CALCULAR DESCUENTO VIP (EXCLUIR CALCULADORA COMPLETA)
  let vipDiscount = 0;
  if (userLevel === 'VIP' || userLevel === 'VIP_PLUS') {
    // Calcular subtotal SOLO de productos normales (NO de calculadora)
    const subtotalWithoutMontajes = items.reduce((sum, item) => {
      let itemTotal = 0;
      
      // IMPORTANTE: Items de calculadora NO tienen descuento VIP (ni equipos ni montajes)
      if ((item as any).eventMetadata) {
        // NO incluir NADA de la calculadora en el descuento VIP
        itemTotal = 0;
      } else {
        // Para productos normales (NO de calculadora), SÍ aplicar descuento VIP
        itemTotal = (item as any).totalPrice;
        
        if (!itemTotal) {
          if (item.startDate && item.endDate) {
            const start = new Date(item.startDate);
            const end = new Date(item.endDate);
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;
            itemTotal = Number(item.product.pricePerDay) * days * item.quantity;
          } else {
            itemTotal = Number(item.product.pricePerDay) * item.quantity;
          }
        }
      }
      
      return sum + (Number(itemTotal) || 0);
    }, 0);
    
    // Aplicar descuento SOLO sobre productos normales (NO sobre calculadora)
    if (userLevel === 'VIP') {
      vipDiscount = subtotalWithoutMontajes * 0.50; // 50%
    } else if (userLevel === 'VIP_PLUS') {
      vipDiscount = subtotalWithoutMontajes * 0.70; // 70%
    }
  }

  // 5. CALCULAR DESCUENTO DE CUPÓN
  const couponDiscount = appliedCoupon?.discountAmount || 0;

  // 6. APLICAR EL MAYOR DESCUENTO (NO SE SUMAN)
  const totalDiscount = Math.max(vipDiscount, couponDiscount);

  // 7. CALCULAR TOTAL ANTES DE IVA
  const totalBeforeTax = subtotal + shippingCost + installationCost - totalDiscount;

  // 8. CALCULAR IVA (21% sobre el total después de descuentos)
  const tax = Math.max(0, totalBeforeTax * 0.21);

  // 9. CALCULAR TOTAL FINAL
  const total = totalBeforeTax + tax;

  return {
    subtotal: Math.max(0, subtotal),
    shippingCost: Math.max(0, shippingCost),
    installationCost: Math.max(0, installationCost),
    vipDiscount: Math.max(0, vipDiscount),
    couponDiscount: Math.max(0, couponDiscount),
    totalBeforeTax: Math.max(0, totalBeforeTax),
    tax: Math.max(0, tax),
    total: Math.max(0, total),
  };
}

/**
 * Helper: Formatear precio a string con símbolo de euro
 */
export function formatPrice(amount: number): string {
  return `€${amount.toFixed(2)}`;
}

/**
 * Helper: Calcular porcentaje de descuento
 */
export function calculateDiscountPercentage(discount: number, subtotal: number): number {
  if (subtotal === 0) return 0;
  return (discount / subtotal) * 100;
}

/**
 * Helper: Verificar si hay descuento aplicado
 */
export function hasDiscount(totals: CartTotals): boolean {
  return totals.vipDiscount > 0 || totals.couponDiscount > 0;
}

/**
 * Helper: Obtener el tipo de descuento aplicado
 */
export function getAppliedDiscountType(totals: CartTotals): 'vip' | 'coupon' | 'none' {
  if (totals.vipDiscount > 0 && totals.vipDiscount >= totals.couponDiscount) {
    return 'vip';
  }
  if (totals.couponDiscount > 0) {
    return 'coupon';
  }
  return 'none';
}

/**
 * Helper: Obtener el descuento total aplicado (el mayor)
 */
export function getTotalDiscount(totals: CartTotals): number {
  return Math.max(totals.vipDiscount, totals.couponDiscount);
}
