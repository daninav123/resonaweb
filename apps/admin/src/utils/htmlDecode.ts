/**
 * Decodifica entidades HTML comunes en una cadena de texto
 * @param text - Texto con entidades HTML codificadas
 * @returns Texto decodificado
 */
export const decodeHTMLEntities = (text: string): string => {
  if (!text) return '';
  
  return text
    .replace(/&#x2F;/g, '/')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
};
