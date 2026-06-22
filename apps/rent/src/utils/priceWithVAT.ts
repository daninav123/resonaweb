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

/**
 * Componente de texto para mostrar precio con IVA (grande) y sin IVA (pequeño)
 * Retorna JSX como objeto para usar en React
 */
export function getPriceDisplay(priceWithVAT: number, suffix: string = '/día') {
  const withoutVAT = getPriceWithoutVAT(priceWithVAT);
  
  return {
    main: `€${formatPrice(priceWithVAT)}${suffix}`,
    sub: `(€${formatPrice(withoutVAT)} + IVA)`
  };
}
