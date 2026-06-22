/**
 * Helpers para construir URLs de imágenes del backend.
 *
 * En dev: deja rutas relativas (el proxy Vite /uploads las sirve desde el backend local).
 * En prod: prepende VITE_BACKEND_URL (ej. https://resona-backend.onrender.com).
 * Para URLs absolutas con localhost en BDD (legacy): reemplaza por VITE_BACKEND_URL si está configurada.
 */

const BACKEND_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_BACKEND_URL) || '';

const decodeHtmlEntities = (text: string): string => {
  if (typeof document === 'undefined') return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

/**
 * Construye la URL completa de una imagen a partir de una ruta o URL.
 * @param imagePath - Ruta relativa (/uploads/...) o URL absoluta.
 */
export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';

  const cleanPath = decodeHtmlEntities(imagePath);

  // URLs absolutas con localhost viejas en BDD → reemplazar por backend real si hay env
  if (BACKEND_URL && /^https?:\/\/localhost:\d+/.test(cleanPath)) {
    return cleanPath.replace(/^https?:\/\/localhost:\d+/, BACKEND_URL);
  }

  // URLs absolutas con cualquier otro dominio → dejar como están
  if (/^https?:\/\//.test(cleanPath)) return cleanPath;

  // Ruta relativa: prepender BACKEND_URL (vacío en dev → relativo → Vite proxy)
  const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  return `${BACKEND_URL}${normalizedPath}`;
};

/**
 * Convierte una URL absoluta en ruta relativa (útil para guardar en BDD).
 */
export const getRelativePath = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return '';

  const cleanUrl = decodeHtmlEntities(imageUrl);

  if (!/^https?:\/\//.test(cleanUrl)) return cleanUrl;

  try {
    return new URL(cleanUrl).pathname;
  } catch {
    const match = cleanUrl.match(/https?:\/\/[^/]+(\/.*)/);
    return match ? match[1] : cleanUrl;
  }
};

/**
 * Placeholder SVG para imágenes que fallan al cargar.
 */
export const placeholderImage =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="24" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ESin imagen%3C/text%3E%3C/svg%3E';
