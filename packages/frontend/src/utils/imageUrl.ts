/**
 * Construye la URL completa de una imagen
 * @param imagePath - Ruta relativa de la imagen (ej: /uploads/products/imagen.webp)
 * @returns URL completa (ej: http://localhost:3001/uploads/products/imagen.webp)
 */
export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) {
    return '';
  }

  // Si ya es una URL completa, devolverla tal cual
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Obtener la URL base del backend
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
  const baseUrl = apiUrl.replace('/api/v1', '');

  // Asegurar que imagePath empiece con /
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

  return `${baseUrl}${normalizedPath}`;
};

/**
 * Placeholder SVG para imágenes que fallan al cargar
 */
export const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="24" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ESin imagen%3C/text%3E%3C/svg%3E';
