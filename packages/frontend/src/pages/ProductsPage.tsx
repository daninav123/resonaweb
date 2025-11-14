import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/product.service';
import { Product, Category } from '../types';
import { Package, Filter, Grid, List, RefreshCw } from 'lucide-react';
import SEOHead from '../components/SEO/SEOHead';
import { breadcrumbSchema } from '../utils/schemas';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    category: searchParams.get('categoria') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    inStock: searchParams.get('inStock') === 'true',
    sort: searchParams.get('sort') || 'newest',
    search: searchParams.get('q') || '',
  });

  const page = Number(searchParams.get('page')) || 1;

  // Fetch products
  const { data: productsData, isLoading } = useQuery<any>({
    queryKey: ['products', page, filters],
    queryFn: async () => {
      // Si hay búsqueda, usa searchProducts
      if (filters.search) {
        const result = await productService.searchProducts(filters.search, page, 12);
        return { data: result || [], pagination: { page, limit: 12 } };
      }
      
      // Si no, usa getProducts con filtros
      const result = await productService.getProducts({
        category: filters.category,
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        sort: filters.sort as any,
        page,
        limit: 12,
      });
      return { data: result || [], pagination: { page, limit: 12 } };
    },
  });

  // Fetch categories for filter
  const { data: categories } = useQuery<any>({
    queryKey: ['categories'],
    queryFn: async () => {
      const result = await productService.getCategories();
      console.log('📦 Categorías cargadas:', result);
      return result || [];
    },
    staleTime: 0, // Sin caché
    refetchOnMount: 'always', // Siempre refetch al montar
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL params
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1'); // Reset to page 1
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  const getCategoryName = () => {
    const categorySlug = searchParams.get('category');
    if (!categorySlug) return null;
    const category = categories?.find((c: any) => c.slug === categorySlug);
    return category?.name || null;
  };

  const categoryName = getCategoryName();
  const pageTitle = categoryName 
    ? `${categoryName} - Catálogo de Alquiler | Resona Events`
    : 'Catálogo de Alquiler de Material para Eventos | Resona';
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
        schema={breadcrumbSchema([{ name: 'Inicio', url: 'https://resona.com' }, { name: 'Catálogo', url: 'https://resona.com/productos' }])}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="flex items-center mb-4">
                <Filter className="w-5 h-5 mr-2" />
                <h2 className="text-lg font-semibold">Filtros</h2>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Buscar</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Buscar productos..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Categoría</label>
                  <button
                    onClick={() => {
                      queryClient.invalidateQueries({ queryKey: ['categories'] });
                      console.log('🔄 Categorías refrescadas');
                    }}
                    className="text-blue-600 hover:text-blue-700 p-1"
                    title="Refrescar categorías"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas las categorías</option>
                  {categories?.map((cat: Category) => {
                    console.log('🏷️ Categoría en dropdown:', cat.name, cat.id);
                    return (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    );
                  })}
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  {categories?.length || 0} categorías disponibles
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Precio por día</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    placeholder="Min"
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    placeholder="Max"
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Stock Filter */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm">Solo productos disponibles</span>
                </label>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setFilters({
                    category: '',
                    minPrice: '',
                    maxPrice: '',
                    inStock: false,
                    sort: 'newest',
                    search: '',
                  });
                  setSearchParams(new URLSearchParams());
                }}
                className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Limpiar filtros
              </button>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold">Catálogo de Productos</h1>
                  {productsData?.pagination && (
                    <p className="text-gray-600 mt-1">
                      {productsData.pagination.total} productos encontrados
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {/* Sort */}
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="newest">Más recientes</option>
                    <option value="price_asc">Precio: menor a mayor</option>
                    <option value="price_desc">Precio: mayor a menor</option>
                    <option value="name">Nombre: A-Z</option>
                    <option value="popular">Más populares</option>
                  </select>

                  {/* View Mode */}
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100' : ''}`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-blue-100' : ''}`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Cargando productos...</p>
              </div>
            ) : productsData?.data?.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No se encontraron productos</h3>
                <p className="text-gray-600">Intenta ajustar los filtros</p>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid' 
                  ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
                }>
                  {productsData?.data?.map((product: Product) => (
                    <Link
                      key={product.id}
                      to={`/productos/${product.slug}`}
                      className="group"
                    >
                      <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition ${
                        viewMode === 'list' ? 'flex' : ''
                      }`}>
                        {product.mainImageUrl ? (
                          <img
                            src={product.mainImageUrl}
                            alt={product.name}
                            className={`object-cover group-hover:scale-105 transition ${
                              viewMode === 'grid' ? 'w-full h-48' : 'w-48 h-32'
                            }`}
                          />
                        ) : (
                          <div className={`bg-gray-200 flex items-center justify-center ${
                            viewMode === 'grid' ? 'w-full h-48' : 'w-48 h-32'
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
                                €{product.pricePerDay}
                              </p>
                              <p className="text-sm text-gray-600">por día</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {productsData?.pagination && productsData.pagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={!productsData.pagination.hasPrev}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      
                      {[...Array(Math.min(5, productsData.pagination.totalPages))].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-4 py-2 rounded-lg ${
                              page === pageNum 
                                ? 'bg-blue-600 text-white' 
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      {productsData.pagination.totalPages > 5 && (
                        <span className="px-2">...</span>
                      )}
                      
                      <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={!productsData.pagination.hasNext}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Siguiente
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
