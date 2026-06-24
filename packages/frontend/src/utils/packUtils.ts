import { api } from '../services/api';

/**
 * Parsea la respuesta de la API de categorías
 */
export function parseCategories(response: any): any[] {
  if (Array.isArray(response)) return response;
  if (response?.categories && Array.isArray(response.categories)) return response.categories;
  if (response?.data && Array.isArray(response.data)) return response.data;
  return [];
}

/**
 * Parsea la respuesta de la API de productos
 */
export function parseProducts(response: any): any[] {
  if (Array.isArray(response)) return response;
  if (response?.products && Array.isArray(response.products)) return response.products;
  if (response?.data && Array.isArray(response.data)) return response.data;
  return [];
}

/**
 * Parsea la respuesta de la API de packs
 */
export function parsePacks(response: any): any[] {
  const data = response?.packs || response || [];
  return Array.isArray(data) ? data : [];
}

/**
 * Carga categorías desde la API
 */
export async function fetchCategories(): Promise<any[]> {
  const response: any = await api.get('/products/categories');
  return parseCategories(response);
}

/**
 * Carga productos desde la API
 */
export async function fetchProducts(includeHidden = false): Promise<any[]> {
  const url = `/products?limit=1000${includeHidden ? '&includeHidden=true' : ''}`;
  const response: any = await api.get(url);
  return parseProducts(response);
}

/**
 * Carga packs desde la API
 */
export async function fetchPacks(options: { includeInactive?: boolean; includeMontajes?: boolean } = {}): Promise<any[]> {
  const params = new URLSearchParams();
  if (options.includeInactive) params.set('includeInactive', 'true');
  if (options.includeMontajes) params.set('includeMontajes', 'true');
  const response: any = await api.get(`/packs?${params.toString()}`);
  return parsePacks(response);
}

/**
 * Filtra productos excluyendo packs, opcionalmente por categoría y búsqueda
 */
export function filterAvailableProducts(
  products: any[],
  options: { categoryId?: string; search?: string; excludeCategoryIds?: string[] } = {}
): any[] {
  let filtered = products.filter(p => !p.isPack);

  if (options.excludeCategoryIds?.length) {
    filtered = filtered.filter(p => !options.excludeCategoryIds!.includes(p.categoryId));
  }

  if (options.categoryId) {
    filtered = filtered.filter(p => p.categoryId === options.categoryId);
  }

  if (options.search?.trim()) {
    const s = options.search.toLowerCase();
    filtered = filtered.filter(p =>
      p.name?.toLowerCase().includes(s) || p.sku?.toLowerCase().includes(s)
    );
  }

  return filtered;
}

/**
 * Construye URL completa de imagen
 */
export function getFullImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const apiPath = baseUrl.replace('/api/v1', '');
  return `${apiPath}${imagePath}`;
}

/**
 * Convierte URL completa a ruta relativa
 */
export function getRelativeImagePath(fullUrl: string | null | undefined): string | undefined {
  if (!fullUrl) return undefined;
  if (fullUrl.startsWith('/uploads/')) return fullUrl;
  const match = fullUrl.match(/\/uploads\/products\/.+$/);
  return match ? match[0] : undefined;
}
