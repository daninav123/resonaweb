/**
 * Calcula la fianza según las reglas del negocio:
 * - 2 veces el precio del alquiler
 * - Mínimo €50
 * - Máximo €400
 * - Redondeado a bloques de 50€
 */
export const calculateDeposit = (rentalTotal: number): number => {
  // 2 veces el precio del alquiler
  let deposit = rentalTotal * 2;
  
  // Mínimo de 50€
  deposit = Math.max(deposit, 50);
  
  // Redondear a bloques de 50€ (hacia arriba)
  deposit = Math.ceil(deposit / 50) * 50;
  
  // Máximo 400€
  deposit = Math.min(deposit, 400);
  
  return deposit;
};

/**
 * Opción de pago que elige el cliente en el checkout:
 * - 'full':    paga el 100% online y obtiene un 10% de descuento (pronto pago).
 * - 'reserve': paga el 25% online y el 75% restante al recoger en tienda.
 */
export type PaymentOption = 'full' | 'reserve';

/** Descuento por pronto pago (pagar el 100% online) sobre la base antes de IVA. */
export const PRONTO_PAGO_DISCOUNT = 0.10;

/**
 * Calcula los montos de pago según la opción elegida por el cliente.
 */
export interface PaymentBreakdown {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  deposit: number;
  payNow: number;
  payLater: number;
  requiresDeposit: boolean;
  paymentOption: PaymentOption;
  /** Descuento aplicado por pagar el 100% (0 si no aplica o si otro descuento era mayor). */
  prontoPagoDiscount: number;
}

export const calculatePaymentBreakdown = (
  subtotal: number,
  shipping: number,
  _deliveryOption: 'pickup' | 'delivery',
  userLevel?: 'STANDARD' | 'VIP' | 'VIP_PLUS' | null,
  vipDiscount: number = 0,
  hasShippingInstallation: boolean = false, // Indica si productos incluyen transporte/montaje
  paymentOption: PaymentOption = 'reserve',
  couponDiscount: number = 0
): PaymentBreakdown => {
  // VIP users: No deposit
  const isVIP = userLevel === 'VIP' || userLevel === 'VIP_PLUS';

  // Productos con transporte/montaje incluido: No deposit
  const requiresDeposit = !isVIP && !hasShippingInstallation;

  // Descuentos: no se apilan, se aplica el mayor (coherente con calculateCartTotals).
  const baseDiscount = Math.max(vipDiscount, couponDiscount);
  // En pago completo, el 10% de pronto pago compite con el resto (gana el mayor).
  const effectiveDiscount =
    paymentOption === 'full'
      ? Math.max(baseDiscount, subtotal * PRONTO_PAGO_DISCOUNT)
      : baseDiscount;
  const prontoPagoDiscount = Math.max(0, effectiveDiscount - baseDiscount);

  const beforeTax = Math.max(0, subtotal + shipping - effectiveDiscount);
  const tax = beforeTax * 0.21; // IVA 21%
  const total = beforeTax + tax;

  let payNow: number;
  let payLater: number;
  if (paymentOption === 'full') {
    payNow = total; // 100% online (ya con el 10% aplicado)
    payLater = 0;
  } else {
    payNow = total * 0.25; // 25% de reserva online
    payLater = total * 0.75; // 75% restante al recoger
  }

  // La fianza se cobra en tienda (no online), aparte del alquiler
  const deposit = requiresDeposit ? calculateDeposit(subtotal) : 0;

  return {
    subtotal,
    shipping,
    tax,
    total,
    deposit,
    payNow,
    payLater,
    requiresDeposit,
    paymentOption,
    prontoPagoDiscount,
  };
};
