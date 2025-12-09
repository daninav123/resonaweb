/**
 * Decodifica entidades HTML
 */
const decodeHtmlEntities = (text: string): string => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

/**
 * Construye la URL completa de una imagen
 * @param imagePath - Ruta relativa de la imagen (ej: /uploads/products/imagen.webp)
 * @returns URL completa (ej: http://localhost:3001/uploads/products/imagen.webp)
 */
export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) {
    return '';
  }

  // SIEMPRE decodificar entidades HTML primero
  const cleanPath = decodeHtmlEntities(imagePath);

  // Detectar automáticamente el entorno
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isProduction = hostname !== 'localhost' && hostname !== '127.0.0.1' && hostname !== '';

  // Si ya es una URL completa
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    // En producción, reemplazar localhost por el dominio de producción
    if (isProduction && cleanPath.includes('localhost')) {
      // Extraer la ruta después de localhost:3001
      const path = cleanPath.replace(/https?:\/\/localhost:\d+/, '');
      return `https://resona-backend.onrender.com${path}`;
    }
    // Si no es localhost, devolverla tal cual
    return cleanPath;
  }

  // Obtener la URL base del backend
  let baseUrl: string;
  
  if (isProduction) {
    // En producción, las imágenes están en el backend de Render
    baseUrl = 'https://resona-backend.onrender.com';
  } else {
    // En desarrollo, usar localhost:3001
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
    baseUrl = apiUrl.replace('/api/v1', '');
  }

  // Asegurar que cleanPath empiece con /
  const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

  return `${baseUrl}${normalizedPath}`;
};

/**
 * Convierte una URL completa a ruta relativa
 * @param imageUrl - URL completa (ej: http://localhost:3001/uploads/products/imagen.webp)
 * @returns Ruta relativa (ej: /uploads/products/imagen.webp)
 */
export const getRelativePath = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) {
    return '';
  }

  // SIEMPRE decodificar entidades HTML
  let cleanUrl = decodeHtmlEntities(imageUrl);

  // Si ya es una ruta relativa, devolverla
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    return cleanUrl;
  }

  // Extraer la parte después del dominio
  try {
    const url = new URL(cleanUrl);
    return url.pathname;
  } catch {
    // Si falla el parsing, intentar extraer manualmente
    const match = cleanUrl.match(/https?:\/\/[^/]+(\/.*)/);
    return match ? match[1] : cleanUrl;
  }
};

/**
 * Placeholder SVG para imágenes que fallan al cargar
 */
export const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="24" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ESin imagen%3C/text%3E%3C/svg%3E';
