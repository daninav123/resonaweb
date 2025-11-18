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
  deliveryOption: 'pickup' | 'delivery'
): PaymentBreakdown => {
  const beforeTax = subtotal + shipping;
  const tax = beforeTax * 0.21; // IVA 21%
  const total = beforeTax + tax;
  
  if (deliveryOption === 'pickup') {
    // Recogida en tienda: 50% señal + fianza en tienda
    const deposit = calculateDeposit(subtotal);
    const payNow = total * 0.5; // 50% ahora
    const payLater = total * 0.5; // 50% en tienda
    
    return {
      subtotal,
      shipping,
      tax,
      total,
      deposit,
      payNow,
      payLater,
      requiresDeposit: true,
    };
  } else {
    // Envío a domicilio: 100% online, sin fianza
    return {
      subtotal,
      shipping,
      tax,
      total,
      deposit: 0,
      payNow: total, // 100% ahora
      payLater: 0,
      requiresDeposit: false,
    };
  }
};
