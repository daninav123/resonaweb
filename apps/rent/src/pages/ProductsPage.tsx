import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { productService } from '../services/product.service';
import { ChevronDown } from 'lucide-react';
import type { Product, Category } from '../types';
import SEOHead from '../components/SEO/SEOHead';
import { breadcrumbSchema } from '../utils/schemas';
import { formatEuro } from '../utils/priceWithVAT';
import { esAccesorio } from '../utils/productKind';
import { ProductTile } from '../components/catalog/ProductTile';
import QuoteCta from '../components/QuoteCta';

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
        return await productService.searchProducts(filters.search, page, 12);
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

    // El orden lo aplica el backend segun filters.sort. Reordenar aqui por
    // precio ascendente dejaba el desplegable de orden sin efecto.
    return {
      data: productsData.data || [],
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

  const accesorios = combinedData.data.filter((p: any) => esAccesorio(p.name));
  const destacados = combinedData.data.filter((p: any) => !esAccesorio(p.name));

  return (
    <div className="min-h-screen bg-ink">
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

      <div className="mx-auto max-w-[1400px] px-5 py-14 md:px-10 md:py-20">
        <header className="mb-14 max-w-3xl">
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-cream/45">
            Alquiler · Valencia
          </p>
          <h1 className="text-[34px] font-semibold leading-[1.05] tracking-[-0.03em] md:text-[56px]">
            {categoryName ?? 'Equipo de sonido e iluminación'}
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-cream/65">
            Precio por día, depósito reembolsable y recogida en almacén. El técnico y el montaje
            son opcionales.
          </p>
        </header>

        <QuoteCta
          section="catalogo"
          message={`Hola, quería presupuesto de alquiler${categoryName ? ` de ${categoryName.toLowerCase()}` : ''} para un evento.`}
          subtitle="Cuéntanos qué evento tienes y te decimos qué equipo necesitas y cuánto cuesta. Sin pagar nada online."
          className="mb-14 max-w-3xl"
        />

        {hasDates && (
          <div className="mb-10 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-resona-light/40 bg-resona/10 px-4 py-3">
            <p className="text-[14px] text-cream/85">
              <span className="font-medium">Alquilando</span>{' '}
              del {new Date(startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              {' al '}
              {new Date(endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              <span className="text-cream/50"> · {rentalDays} {rentalDays === 1 ? 'día' : 'días'}</span>
            </p>
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.delete('start');
                params.delete('end');
                setSearchParams(params);
              }}
              className="text-[13px] text-cream/60 underline-offset-4 transition-colors hover:text-cream hover:underline"
            >
              Quitar fechas
            </button>
          </div>
        )}

        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          <aside className="lg:w-56 lg:shrink-0">
            <div className="lg:sticky lg:top-28">
              <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-cream/45">
                Categorías
              </p>
              <ul className="flex flex-wrap gap-x-4 gap-y-1 lg:block">
                <li>
                  <button
                    onClick={() => handleFilterChange('category', '')}
                    className={`block py-1.5 text-left text-[14px] transition-colors ${
                      !filters.category ? 'text-cream' : 'text-cream/55 hover:text-cream'
                    }`}
                  >
                    Todo el catálogo
                  </button>
                </li>
                {visibleCategories.map((cat: any) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => handleFilterChange('category', cat.slug)}
                      className={`block py-1.5 text-left text-[14px] transition-colors ${
                        filters.category === cat.slug ? 'text-cream' : 'text-cream/55 hover:text-cream'
                      }`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-cream/10 pb-5">
              <p className="text-[13px] text-cream/50">
                {isLoading
                  ? 'Cargando…'
                  : `${combinedData.pagination?.total ?? combinedData.data.length} referencias`}
              </p>
              <div className="flex items-center gap-3">
                <label htmlFor="orden" className="text-[13px] text-cream/50">
                  Ordenar
                </label>
                <div className="relative">
                  <select
                    id="orden"
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="h-10 appearance-none rounded-sm border border-cream/15 bg-transparent pl-3 pr-9 text-[14px] text-cream focus:border-resona-light focus:outline-none"
                  >
                    <option value="price_asc" className="bg-ink-800">Precio: menor a mayor</option>
                    <option value="price_desc" className="bg-ink-800">Precio: mayor a menor</option>
                    <option value="name_asc" className="bg-ink-800">Nombre A-Z</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/45" />
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-3 md:gap-x-8 md:gap-y-20">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square w-full bg-ink-800" />
                    <div className="mt-5 h-4 w-2/3 bg-ink-800" />
                  </div>
                ))}
              </div>
            ) : combinedData.data.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-[18px] text-cream/80">No hay equipos que encajen</p>
                <p className="mt-2 text-[14px] text-cream/50">Prueba a quitar filtros o buscar otra cosa.</p>
                <button
                  onClick={() => {
                    setFilters({ category: '', minPrice: '', maxPrice: '', inStock: false, sort: 'price_asc', search: '' });
                    setSearchParams(new URLSearchParams());
                    setPage(1);
                  }}
                  className="mt-6 rounded-sm bg-resona px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-resona-dark"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <>
                {destacados.length > 0 && (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-3 md:gap-x-8 md:gap-y-20">
                    {destacados.map((product: Product) => (
                      <ProductTile
                        key={product.id}
                        product={product}
                        detailQuery={detailQuery}
                        hasDates={hasDates}
                        rentalDays={rentalDays}
                      />
                    ))}
                  </div>
                )}

                {accesorios.length > 0 && (
                  <section className={destacados.length > 0 ? 'mt-24' : ''}>
                    <div className="mb-6 flex items-baseline justify-between border-b border-cream/10 pb-5">
                      <h2 className="text-[13px] font-semibold uppercase tracking-[0.2em]">
                        Accesorios y cableado
                      </h2>
                      <span className="text-[13px] text-cream/45">{accesorios.length}</span>
                    </div>
                    <ul>
                      {accesorios.map((product: Product) => (
                        <li key={product.id}>
                          <Link
                            to={`/productos/${product.slug}${detailQuery}`}
                            className="flex items-baseline justify-between gap-6 border-b border-cream/[0.07] py-4 transition-colors hover:bg-white/[0.03]"
                          >
                            <span className="text-[15px] text-cream/90">{product.name}</span>
                            <span className="shrink-0 text-[14px] tabular-nums text-cream/55">
                              {formatEuro(Number(product.pricePerDay) * 1.21)}/día
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </>
            )}

            {combinedData.data.length > 0 && (
              <div className="mt-20 flex items-center justify-center gap-6 border-t border-cream/10 pt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="text-[14px] text-cream/70 transition-colors hover:text-cream disabled:cursor-not-allowed disabled:text-cream/25"
                >
                  Anterior
                </button>
                <span className="text-[13px] text-cream/45">Página {page}</span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={combinedData.data.length < 12}
                  className="text-[14px] text-cream/70 transition-colors hover:text-cream disabled:cursor-not-allowed disabled:text-cream/25"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
