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
 * Calcula los montos de pago según el método de entrega
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
}

export const calculatePaymentBreakdown = (
  subtotal: number,
  shipping: number,
  deliveryOption: 'pickup' | 'delivery',
  userLevel?: 'STANDARD' | 'VIP' | 'VIP_PLUS' | null,
  vipDiscount: number = 0,
  hasShippingInstallation: boolean = false, // Indica si productos incluyen transporte/montaje
  isFromCalculator: boolean = false // 💳 DEPRECADO: ya no se usa, plazos aplican a todos >€500
): PaymentBreakdown => {
  // VIP users: No deposit
  const isVIP = userLevel === 'VIP' || userLevel === 'VIP_PLUS';
  
  // Productos con transporte/montaje incluido: No deposit
  const requiresDeposit = !isVIP && !hasShippingInstallation;
  
  // Calcular total después del descuento VIP
  const beforeTax = subtotal + shipping - vipDiscount;
  const tax = beforeTax * 0.21; // IVA 21%
  const total = beforeTax + tax;
  
  // 💳 PAGO A PLAZOS: Si total > 500€ → Solo pagar 25% (TODOS los pedidos)
  const isEligibleForInstallments = total > 500;
  
  let payNow = total; // Por defecto: pagar todo
  let payLater = 0;
  
  // Si es elegible para plazos: Solo pagar 25% (sin importar si viene de calculadora)
  if (isEligibleForInstallments) {
    payNow = total * 0.25; // 25% de reserva
    payLater = total * 0.75; // 75% restante
  }
  
  // La fianza se cobra en tienda (no online)
  const deposit = requiresDeposit ? calculateDeposit(subtotal) : 0;
  
  return {
    subtotal,
    shipping,
    tax,
    total,
    deposit, // Fianza que se cobrará en tienda
    payNow, // 25% si es de calculadora y > 500€, sino 100%
    payLater, // 75% si es de calculadora y > 500€, sino 0
    requiresDeposit, // VIP o productos con transporte/montaje no requieren fianza
  };
};
