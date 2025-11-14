/**
 * Mapeo de slugs de categorías a emojis/iconos
 */
export const categoryIcons: Record<string, string> = {
  'fotografia-video': '📷',
  'iluminacion': '💡',
  'sonido': '🔊',
  'microfonia': '🎤',
  'mesas-mezcla-directo': '🎛️',
  'equipamiento-dj': '🎧',
  'elementos-escenario': '🎪',
  'elementos-decorativos': '✨',
  'mobiliario': '🪑',
  'backline': '🎸',
  'pantallas-proyeccion': '📺',
  'efectos-especiales': '🎆',
  'comunicaciones': '📡',
  'energia-distribucion': '⚡',
  'cables-conectores': '🔌',
};

/**
 * Obtiene el icono de una categoría por su slug
 */
export const getCategoryIcon = (slug: string): string => {
  return categoryIcons[slug] || '📦';
};
