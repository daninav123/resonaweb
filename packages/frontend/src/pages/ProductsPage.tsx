import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { productService } from '../services/product.service';
import { api } from '../services/api';
import { ChevronDown, Grid, List, Package } from 'lucide-react';
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
  
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    inStock: searchParams.get('inStock') === 'true',
    sort: searchParams.get('sort') || 'newest',
    search: searchParams.get('q') || '',
  });

  // Sync filters with searchParams
  useEffect(() => {
    const newFilters = {
      category: searchParams.get('category') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      inStock: searchParams.get('inStock') === 'true',
      sort: searchParams.get('sort') || 'newest',
      search: searchParams.get('q') || '',
    };
    setFilters(newFilters);
  }, [searchParams]);

  // Fetch packs (solo activos)
  const { data: packsData } = useQuery<any>({
    queryKey: ['packs-public'],
    queryFn: async () => {
      try {
        const response: any = await api.get('/products/packs');
        return response?.packs || response || [];
      } catch (error) {
        console.error('Error loading packs:', error);
        return [];
      }
    },
    staleTime: 15 * 60 * 1000, // 15 minutos - los packs cambian poco
    gcTime: 30 * 60 * 1000, // 30 minutos
  });

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

  // Combinar packs y productos (packs primero)
  const combinedData = (() => {
    if (!productsData?.data) return { data: [], pagination: productsData?.pagination || { total: 0 } };
    
    const products = productsData.data || [];
    const packs = packsData || [];
    
    // FILTRO IMPORTANTE: Excluir montajes de la vista de packs públicos
    // Los montajes se identifican por categoryRef.name = "Montaje" (tabla Category oculta)
    const packsWithoutMontajes = packs.filter((pack: any) => {
      // Verificar categoryRef (FK a tabla Category)
      const categoryRefName = pack.categoryRef?.name || '';
      
      // Excluir montajes (categoryRef.name = "Montaje")
      // Y solo mostrar packs activos
      return categoryRefName !== 'Montaje' && pack.isActive !== false;
    });
    
    // Si hay filtro de categoría, filtrar packs por esa categoría
    let filteredPacks = packsWithoutMontajes;
    if (filters.category) {
      const categoryObj = categories?.find((c: Category) => c.slug === filters.category);
      if (categoryObj) {
        // Filtrar packs que:
        // 1. Tengan categoryId coincidente con la categoría seleccionada
        // 2. O tengan items de productos de esta categoría
        filteredPacks = packsWithoutMontajes.filter((pack: any) => {
          // Verificar si el pack pertenece directamente a esta categoría
          if (pack.categoryId === categoryObj.id) {
            return true;
          }
          
          // O si el pack tiene categoryRef que coincide
          if (pack.categoryRef?.id === categoryObj.id || pack.categoryRef?.slug === categoryObj.slug) {
            return true;
          }
          
          // O si el pack tiene items de productos de esta categoría
          if (pack.items && pack.items.length > 0) {
            return pack.items.some((item: any) => 
              item.product?.categoryId === categoryObj.id ||
              item.product?.category?.name === categoryObj.name ||
              item.product?.category?.slug === categoryObj.slug
            );
          }
          
          return false;
        });
      }
    }
    
    // Combinar: primero packs, luego productos
    // Marcar packs con isPack: true
    const packsWithFlag = filteredPacks.map((pack: any) => ({
      ...pack,
      isPack: true,
      pricePerDay: pack.finalPrice || pack.pricePerDay || 0,
      realStock: 1, // Los packs siempre están "disponibles"
    }));
    
    // Ordenar packs por precio (menor a mayor)
    const sortedPacks = [...packsWithFlag].sort((a, b) => {
      const priceA = Number(a.pricePerDay) || 0;
      const priceB = Number(b.pricePerDay) || 0;
      return priceA - priceB;
    });
    
    // Ordenar productos por precio (menor a mayor)
    const sortedProducts = [...products].sort((a, b) => {
      const priceA = Number(a.pricePerDay) || 0;
      const priceB = Number(b.pricePerDay) || 0;
      return priceA - priceB;
    });
    
    // Combinar: primero packs ordenados, luego productos ordenados
    // Eliminar duplicados por ID
    const combined = [...sortedPacks, ...sortedProducts];
    const uniqueCombined = combined.filter((item, index, self) => 
      index === self.findIndex((t) => t.id === item.id)
    );
    
    return {
      data: uniqueCombined,
      pagination: {
        ...productsData.pagination,
        total: productsData.pagination.total + sortedPacks.length,
      },
    };
  })();

  const categoryName = categories?.find((c: Category) => c.slug === filters.category)?.name;
  const pageTitle = categoryName 
    ? `Alquiler de ${categoryName} Valencia - Equipos Profesionales | ReSona Events` 
    : 'Alquiler de Equipos para Eventos en Valencia - Catálogo Completo | ReSona Events';

  const pageDescription = categoryName
    ? `Alquiler de ${categoryName.toLowerCase()} en Valencia para eventos. Equipos profesionales con disponibilidad en tiempo real. Servicio técnico incluido y entrega en 24h.`
    : 'Catálogo completo de alquiler de equipos para eventos en Valencia: sonido profesional, iluminación LED, fotografía y video. Disponibilidad en tiempo real y reserva online.';

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        keywords="alquiler equipos eventos valencia, sonido profesional valencia, iluminación eventos valencia, alquiler altavoces valencia, equipos audiovisuales valencia"
        canonicalUrl="https://resonaevents.com/productos"
        schema={breadcrumbSchema([
          { name: 'Inicio', url: 'https://resonaevents.com' },
          { name: 'Catálogo', url: 'https://resonaevents.com/productos' }
        ])}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar at top */}
        <div className="mb-8 max-w-2xl mx-auto">
          <SearchBar
            onSearch={(query) => handleFilterChange('search', query)}
            placeholder="Buscar sonido, iluminación, fotografía..."
            className="w-full"
          />
        </div>

        {/* Category Chips - Only visible on mobile (< 768px) */}
        <div className="md:hidden">
          <CategoryChips
            categories={categories || []}
            selectedCategory={filters.category}
            onCategoryChange={(slug) => handleFilterChange('category', slug)}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Category Sidebar - Hidden on mobile */}
          <aside className="hidden lg:block lg:w-64">
            <CategorySidebar
              categories={categories || []}
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
                  <h1 className="text-2xl font-bold">Catálogo de Productos</h1>
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
                  <Link
                    key={(product as any).isPack ? `pack-${product.id}` : `product-${product.id}`}
                    to={(product as any).isPack ? `/packs/${product.slug}` : `/productos/${product.slug}`}
                    className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow relative ${
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
                    
                    {/* Imagen - Mismo estilo para todos */}
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={getImageUrl(product.images[0] as any)}
                        alt={`Alquiler ${product.name} - ${product.category?.name || 'Equipos audiovisuales'} para eventos Valencia | ReSona Events`}
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
                    
                    {/* Contenido - Mismo estilo para todos */}
                    <div className="p-4 flex-1">
                      <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
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
                                const priceWithVAT = Number(product.pricePerDay) * 1.21;
                                const priceDisplay = getPriceDisplay(priceWithVAT, '/día');
                                return (
                                  <>
                                    <p className="text-2xl font-bold text-blue-600">
                                      {priceDisplay.main}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {priceDisplay.sub}
                                    </p>
                                  </>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                        {product.realStock > 0 ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            Disponible
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                            Sin stock
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
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
