/**
 * Utilidades para mostrar precios con y sin IVA
 * IVA estándar en España: 21%
 */

const VAT_RATE = 0.21; // 21%

/**
 * Calcula el precio sin IVA a partir del precio con IVA
 */
export function getPriceWithoutVAT(priceWithVAT: number): number {
  return priceWithVAT / (1 + VAT_RATE);
}

/**
 * Calcula el precio con IVA a partir del precio sin IVA
 */
export function getPriceWithVAT(priceWithoutVAT: number): number {
  return priceWithoutVAT * (1 + VAT_RATE);
}

/**
 * Formatea un precio con 2 decimales
 */
export function formatPrice(price: number): string {
  return price.toFixed(2);
}

const eurFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formatea un importe en euros con la convención española: "1,21 €"
 */
export function formatEuro(amount: number): string {
  return eurFormatter.format(amount);
}

/**
 * Componente de texto para mostrar precio con IVA (grande) y sin IVA (pequeño)
 * Retorna JSX como objeto para usar en React
 */
export function getPriceDisplay(priceWithVAT: number, suffix: string = '/día') {
  const withoutVAT = getPriceWithoutVAT(priceWithVAT);
  
  return {
    main: `${formatEuro(priceWithVAT)}${suffix}`,
    sub: `(${formatEuro(withoutVAT)} + IVA)`
  };
}
