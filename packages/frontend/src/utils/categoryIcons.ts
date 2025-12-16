/**
 * Mapeo de slugs de categorías a emojis/iconos
 * Cada icono está relacionado con la categoría específica
 */
export const categoryIcons: Record<string, string> = {
  'fotografia-video': '📹',
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
  'pantallas-y-proyeccion': '📺',
  'efectos-especiales': '🎆',
  'comunicaciones': '📡',
  'energia-distribucion': '⚡',
  'cables-conectores': '🔌',
  'packs': '📦',
  'estructuras': '🏗️',
  'control-sonido': '🎚️',
  'control-iluminacion': '🕯️',
  'generacion-y-distribucion': '🔌',
  'pantallas-y-proteccion': '🛡️',
  'cableado': '🔗',
};

/**
 * Obtiene el icono de una categoría por su slug
 */
export const getCategoryIcon = (slug: string): string => {
  const normalized = (slug || '').toLowerCase().trim();
  return categoryIcons[normalized] || '🎉';
};
