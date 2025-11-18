import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { productService } from '../services/product.service';
import { ChevronDown, Grid, List, Package } from 'lucide-react';
import { SearchBar } from '../components/search/SearchBar';
import { CategorySidebar } from '../components/CategorySidebar';
import type { Product, Category } from '../types';
import SEOHead from '../components/SEO/SEOHead';
import { breadcrumbSchema } from '../utils/schemas';

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
      return { data: result || [], pagination: { page, limit: 12, total: result?.length || 0 } };
    },
  });

  // Fetch categories
  const { data: categories } = useQuery<any>({
    queryKey: ['categories'],
    queryFn: async () => {
      const result = await productService.getCategories();
      return result || [];
    },
    staleTime: 0,
    refetchOnMount: 'always',
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

  const categoryName = categories?.find((c: Category) => c.slug === filters.category)?.name;
  const pageTitle = categoryName 
    ? `${categoryName} - Catálogo de Alquiler | ReSona` 
    : 'Catálogo de Productos - Alquiler de Equipos | ReSona';

  const pageDescription = categoryName
    ? `Alquiler de ${categoryName.toLowerCase()} para eventos. Equipos profesionales con disponibilidad en tiempo real. Reserva online.`
    : 'Explora nuestro catálogo completo de equipos profesionales: sonido, iluminación, fotografía y video. Reserva online con disponibilidad en tiempo real.';

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        keywords="catálogo alquiler, equipos eventos, sonido profesional, iluminación, fotografía, video"
        canonicalUrl="https://resona.com/productos"
        schema={breadcrumbSchema([
          { name: 'Inicio', url: 'https://resona.com' },
          { name: 'Catálogo', url: 'https://resona.com/productos' }
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

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Category Sidebar */}
          <aside className="lg:w-64">
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
                  {productsData && (
                    <p className="text-gray-600 mt-1">
                      {productsData.data.length} productos encontrados
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
            ) : productsData?.data.length === 0 ? (
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
                {productsData.data.map((product: Product) => (
                  <Link
                    key={product.id}
                    to={`/producto/${product.slug}`}
                    className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0] as any}
                        alt={product.name}
                        className={`object-cover ${
                          viewMode === 'grid' ? 'w-full h-48 rounded-t-lg' : 'w-48 h-32 rounded-l-lg'
                        }`}
                      />
                    ) : (
                      <div className={`bg-gray-200 flex items-center justify-center ${
                        viewMode === 'grid' ? 'w-full h-48 rounded-t-lg' : 'w-48 h-32 rounded-l-lg'
                      }`}>
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="p-4 flex-1">
                      <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                      {viewMode === 'list' && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">
                            €{product.pricePerDay}/día
                          </p>
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
            {productsData && productsData.data.length > 0 && (
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
                    disabled={productsData.data.length < 12}
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
