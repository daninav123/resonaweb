import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { productService } from '../services/product.service';
import { ChevronDown, Grid, List, Package, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { guestCart } from '../utils/guestCart';
import { cartCountManager } from '../hooks/useCartCount';
import { SearchBar } from '../components/search/SearchBar';
import { CategorySidebar } from '../components/CategorySidebar';
import { CategoryChips } from '../components/CategoryChips';
import type { Product, Category } from '../types';
import SEOHead from '../components/SEO/SEOHead';
import { breadcrumbSchema } from '../utils/schemas';
import { getImageUrl, placeholderImage } from '../utils/imageUrl';
import { getPriceDisplay } from '../utils/priceWithVAT';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  // Fechas que viene del buscador del hero (si las hay) — se propagan al catálogo y a las fichas.
  const startDate = searchParams.get('start') || '';
  const endDate = searchParams.get('end') || '';
  const rentalDays = (() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;
    const diffMs = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1);
  })();
  const hasDates = rentalDays > 0;

  // Query string a preservar al navegar a la ficha (solo fechas — los filtros se pierden voluntariamente).
  const detailQuery = hasDates ? `?start=${startDate}&end=${endDate}` : '';

  // Initialize and sync filters with searchParams
  const sortParam = searchParams.get('sort');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    inStock: searchParams.get('inStock') === 'true',
    sort: sortParam || 'price_asc',
    search: searchParams.get('q') || '',
  });

  // Set default sort in URL and sync filters
  useEffect(() => {
    const currentSort = searchParams.get('sort');
    
    // If no sort param, set default in URL
    if (!currentSort) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('sort', 'price_asc');
      setSearchParams(newParams, { replace: true });
      return; // Don't update filters yet, wait for URL update
    }
    
    // Sync filters with URL params
    const newFilters = {
      category: searchParams.get('category') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      inStock: searchParams.get('inStock') === 'true',
      sort: currentSort,
      search: searchParams.get('q') || '',
    };
    setFilters(newFilters);
  }, [searchParams, setSearchParams]);

  // Fetch products
  const { data: productsData, isLoading } = useQuery<any>({
    queryKey: ['products', page, filters],
    queryFn: async () => {
      if (filters.search) {
        const result = await productService.searchProducts(filters.search, page, 12);
        return { data: result || [], pagination: { page, limit: 12, total: result?.length || 0 } };
      }
      
      const params = {
        category: filters.category,
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        sort: filters.sort as any,
        page,
        limit: 12,
      };
      const result = await productService.getProducts(params);
      // El servicio ahora devuelve { data: [...], pagination: { total, ... } }
      return result;
    },
  });

  // Fetch categories
  const { data: categories } = useQuery<any>({
    queryKey: ['categories'],
    queryFn: async () => {
      const result = await productService.getCategories();
      return result || [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutos - las categorías cambian poco
    gcTime: 60 * 60 * 1000, // 1 hora
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== '' && typeof v !== 'boolean') {
        params.set(k === 'search' ? 'q' : k, String(v));
      } else if (typeof v === 'boolean' && v === true) {
        params.set(k, 'true');
      }
    });
    setSearchParams(params);
    setPage(1);
  };

  // En Rent solo mostramos productos individuales.
  // Los packs (experiencias de evento completo) viven en resonarent.com.
  const combinedData = (() => {
    if (!productsData?.data) return { data: [], pagination: productsData?.pagination || { total: 0 } };

    const products = productsData.data || [];

    // Ordenar productos por precio (menor a mayor)
    const sortedProducts = [...products].sort((a, b) => {
      const priceA = Number(a.pricePerDay) || 0;
      const priceB = Number(b.pricePerDay) || 0;
      return priceA - priceB;
    });
    
    return {
      data: sortedProducts,
      pagination: productsData.pagination,
    };
  })();

  // Categorías a mostrar en sidebar/chips: excluir packs, montajes y categorías irrelevantes.
  const visibleCategories = (categories || []).filter((c: any) => {
    const name = (c.name || '').toLowerCase();
    const slug = (c.slug || '').toLowerCase();
    if (c.isHidden) return false;
    if (name === 'packs' || slug === 'packs') return false;
    if (name.includes('montaje')) return false;
    if (name.includes('eventos personalizados')) return false;
    if (name.includes('personal')) return false;
    return true;
  });

  const categoryName = visibleCategories.find((c: Category) => c.slug === filters.category)?.name;
  const pageTitle = categoryName
    ? `Alquiler de ${categoryName} en Valencia | ReSona Rent`
    : 'Catálogo de alquiler audiovisual en Valencia | ReSona Rent';

  const pageDescription = categoryName
    ? `Alquiler de ${categoryName.toLowerCase()} en Valencia. Precio por día claro, entrega y recogida, técnico opcional y depósito reembolsable.`
    : 'Alquiler de sonido, iluminación, vídeo y estructuras en Valencia. Precio por día, entrega y recogida, técnico opcional.';

  // Canonical siempre a /productos sin params: los filtros (?category, ?search, ?sort)
  // son UX, no contenido distinto. Evita canibalización con las landings /alquiler-*-valencia.
  const canonicalUrl = 'https://resonarent.com/productos';

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        keywords="alquiler equipos eventos valencia, sonido profesional valencia, iluminación eventos valencia, alquiler altavoces valencia, equipos audiovisuales valencia"
        canonicalUrl={canonicalUrl}
        schema={breadcrumbSchema([
          { name: 'Inicio', url: 'https://resonarent.com' },
          { name: 'Catálogo', url: 'https://resonarent.com/productos' }
        ])}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar at top */}
        <div className="mb-6 max-w-2xl mx-auto">
          <SearchBar
            onSearch={(query) => handleFilterChange('search', query)}
            placeholder="Buscar sonido, iluminación, fotografía..."
            className="w-full"
          />
        </div>

        {/* Banner de fechas: el usuario viene con fechas del hero → mostramos precios totales */}
        {hasDates && (
          <div className="mb-6 max-w-2xl mx-auto flex items-center justify-between gap-3 rounded-lg border border-resona/30 bg-resona/5 px-4 py-3">
            <div className="text-sm text-gray-800">
              <span className="font-semibold">Alquilando</span>{' '}
              <span>
                del {new Date(startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                {' al '}
                {new Date(endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              </span>{' '}
              <span className="text-gray-500">· {rentalDays} {rentalDays === 1 ? 'día' : 'días'}</span>
            </div>
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.delete('start');
                params.delete('end');
                setSearchParams(params);
              }}
              className="text-xs text-resona hover:text-resona-dark font-medium underline-offset-2 hover:underline"
            >
              Quitar fechas
            </button>
          </div>
        )}

        {/* Category Chips - Only visible on mobile (< 768px) */}
        <div className="md:hidden">
          <CategoryChips
            categories={visibleCategories}
            selectedCategory={filters.category}
            onCategoryChange={(slug) => handleFilterChange('category', slug)}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Category Sidebar - Hidden on mobile */}
          <aside className="hidden lg:block lg:w-64">
            <CategorySidebar
              categories={visibleCategories}
              selectedCategory={filters.category}
              onCategoryChange={(slug) => handleFilterChange('category', slug)}
            />
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold">Catálogo de alquiler</h1>
                  {combinedData && combinedData.pagination && (
                    <p className="text-gray-600 mt-1">
                      {combinedData.pagination.total} productos disponibles
                      {combinedData.data.length < combinedData.pagination.total && (
                        <span className="text-sm"> · Mostrando {combinedData.data.length}</span>
                      )}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Sort */}
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="newest">Más recientes</option>
                    <option value="price_asc">Precio: menor a mayor</option>
                    <option value="price_desc">Precio: mayor a menor</option>
                    <option value="name">Alfabético</option>
                  </select>

                  {/* View Mode */}
                  <div className="flex gap-1 border border-gray-300 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded ${
                        viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600'
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded ${
                        viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : combinedData?.data.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No se encontraron productos</h3>
                <p className="text-gray-600 mb-4">
                  Intenta ajustar los filtros o realizar una nueva búsqueda
                </p>
                <button
                  onClick={() => {
                    setFilters({
                      category: '',
                      minPrice: '',
                      maxPrice: '',
                      inStock: false,
                      sort: 'newest',
                      search: ''
                    });
                    setSearchParams({});
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {combinedData.data.map((product: Product) => (
                  <div
                    key={(product as any).isPack ? `pack-${product.id}` : `product-${product.id}`}
                    className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow relative group ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    {/* Badge de Pack - Solo en la imagen */}
                    {(product as any).isPack && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
                          <Package className="w-3 h-3" />
                          PACK
                        </span>
                      </div>
                    )}
                    
                    {/* Imagen - Clickable para ir al detalle */}
                    <Link to={(product as any).isPack ? `/packs/${product.slug}` : `/productos/${product.slug}${detailQuery}`}>
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={getImageUrl(product.images[0] as any)}
                          alt={`Alquiler ${product.name} - ${product.category?.name || 'Equipos audiovisuales'} en alquiler en Valencia | ReSona Rent`}
                          width={viewMode === 'grid' ? 400 : 192}
                          height={viewMode === 'grid' ? 192 : 128}
                          loading="lazy"
                          decoding="async"
                          className={`object-contain bg-white ${
                            viewMode === 'grid' ? 'w-full h-48 rounded-t-lg' : 'w-48 h-32 rounded-l-lg'
                          }`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = placeholderImage;
                          }}
                        />
                      ) : (
                        <div className={`bg-gray-200 flex items-center justify-center ${
                          viewMode === 'grid' ? 'w-full h-48 rounded-t-lg' : 'w-48 h-32 rounded-l-lg'
                        }`}>
                          <Package className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </Link>
                    
                    {/* Contenido */}
                    <div className="p-4 flex-1">
                      <Link to={(product as any).isPack ? `/packs/${product.slug}` : `/productos/${product.slug}${detailQuery}`}>
                        <h3 className="font-semibold mb-2 line-clamp-2 hover:text-blue-600 transition-colors">{product.name}</h3>
                      </Link>
                      {viewMode === 'list' && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <div className="flex justify-between items-center">
                        <div>
                          {product.isConsumable ? (
                            <div>
                              <p className="text-2xl font-bold text-green-600">
                                €{product.pricePerUnit}
                              </p>
                              <p className="text-xs text-gray-500">Precio de venta por unidad</p>
                              <p className="text-xs text-gray-400">IVA no incluido</p>
                            </div>
                          ) : (
                            <div>
                              {(() => {
                                const dayPriceWithVAT = Number(product.pricePerDay) * 1.21;
                                const dayDisplay = getPriceDisplay(dayPriceWithVAT, '/día');
                                if (hasDates) {
                                  const totalWithVAT = dayPriceWithVAT * rentalDays;
                                  return (
                                    <>
                                      <p className="text-2xl font-bold text-resona">
                                        €{totalWithVAT.toFixed(2)}
                                      </p>
                                      <p className="text-xs text-gray-600 font-medium">
                                        {rentalDays} {rentalDays === 1 ? 'día' : 'días'} · {dayDisplay.main}
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        IVA incluido
                                      </p>
                                    </>
                                  );
                                }
                                return (
                                  <>
                                    <p className="text-2xl font-bold text-resona">
                                      desde {dayDisplay.main}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {dayDisplay.sub}
                                    </p>
                                  </>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                        {product.realStock > 0 && product.realStock <= 3 ? (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded font-semibold animate-pulse">
                            Quedan {product.realStock}
                          </span>
                        ) : product.realStock > 3 ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            Disponible
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                            Consultar
                          </span>
                        )}
                      </div>

                      {/* Quick Add to Cart Button */}
                      {!(product as any).isPack && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            cartCountManager.increment(1);
                            guestCart.addItem(product, 1);
                            toast.success(`${product.name} añadido al carrito`);
                          }}
                          className="mt-3 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-all active:scale-95"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Añadir al carrito
                        </button>
                      )}
                      {(product as any).isPack && (
                        <Link
                          to={`/packs/${product.slug}`}
                          className="mt-3 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-all"
                        >
                          <Package className="w-4 h-4" />
                          Ver pack completo
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {combinedData && combinedData.data.length > 0 && (
              <div className="mt-8 flex justify-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  
                  <span className="px-4 py-2">
                    Página {page}
                  </span>
                  
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={combinedData.data.length < 12}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
