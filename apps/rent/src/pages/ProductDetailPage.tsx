import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@resona/api-client';
import { ShoppingCart, Heart, Shield, Truck, CheckCircle, Wrench, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { guestCart } from '../utils/guestCart';
import { useAuthStore } from '../stores/authStore';
import { getImageUrl } from '../utils/imageUrl';
import { cartCountManager } from '../hooks/useCartCount';
import SEOHead from '../components/SEO/SEOHead';
import Breadcrumbs from '../components/SEO/Breadcrumbs';
import OptimizedImage from '../components/common/OptimizedImage';
import { generateProductSchema } from '../utils/seo/schemaGenerator';
import { getPriceDisplay, formatEuro } from '../utils/priceWithVAT';
import { ProductTile } from '../components/catalog/ProductTile';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activa, setActiva] = useState(0);
  const { user } = useAuthStore();

  // Selector de fechas inline (prellenado desde URL si vino de /productos con fechas)
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlStart = urlParams.get('start');
    const urlEnd = urlParams.get('end');
    if (urlStart) setStartDate(urlStart);
    if (urlEnd) setEndDate(urlEnd);
  }, []);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      try {
        const response: any = await api.get(`/products/slug/${slug}`);
        return response.data || response;
      } catch (err: any) {
        if (err?.response?.status === 404) {
          throw new Error('PRODUCT_NOT_FOUND');
        }
        throw err;
      }
    },
    enabled: !!slug,
    retry: false,
  });

  // Disponibilidad en vivo: cuando hay fechas válidas, consulta el backend.
  const datesValid = Boolean(
    startDate && endDate && new Date(startDate) <= new Date(endDate)
  );
  const { data: availability, isFetching: checkingAvailability } = useQuery<any>({
    queryKey: ['availability', product?.id, startDate, endDate, quantity],
    queryFn: async () => {
      const res: any = await api.post('/products/check-availability', {
        productId: product.id,
        startDate,
        endDate,
        quantity,
      });
      return res?.data || res;
    },
    enabled: Boolean(product?.id && datesValid && quantity > 0),
    staleTime: 60 * 1000,
  });

  // Redirigir automáticamente si el producto no existe
  useEffect(() => {
    if (error || (!isLoading && !product)) {
      document.title = '404 - Producto no encontrado | ReSona Rent';

      const timer = setTimeout(() => {
        navigate('/productos');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, product, isLoading, navigate]);

  // Al cargar: si el usuario está logueado, ver si este producto ya está en sus favoritos.
  useEffect(() => {
    if (!user?.id || !product?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const res: any = await api.get(`/users/${user.id}/favorites`);
        const list = res?.data || res?.favorites || res || [];
        const ids = Array.isArray(list)
          ? list.map((f: any) => f.productId || f.product?.id).filter(Boolean)
          : [];
        if (!cancelled) setIsFavorite(ids.includes(product.id));
      } catch {
        // Silencio: si falla, el corazón queda en su estado por defecto (no favorito).
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, product?.id]);

  const handleAddToCart = async () => {
    try {
      cartCountManager.increment(quantity);
      const added = guestCart.addItem(product, quantity);

      // Si el usuario seleccionó fechas en la ficha, guardarlas en el item.
      if (added?.id && datesValid) {
        guestCart.updateDates(added.id, startDate, endDate);
        toast.success(`Añadido al carrito del ${formatDateShort(startDate)} al ${formatDateShort(endDate)}`);
      } else {
        toast.success('Añadido al carrito. Podrás elegir las fechas en el siguiente paso.');
      }
    } catch (error: any) {
      toast.error('Error al añadir al carrito');
    }
  };

  const formatDateShort = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    } catch {
      return iso;
    }
  };

  const handleAddToFavorites = async () => {
    // Favoritos requieren cuenta (están en BDD, no localStorage).
    if (!user?.id) {
      toast('Inicia sesión para guardar favoritos', { icon: '🔒' });
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    try {
      if (isFavorite) {
        await api.delete(`/users/favorites/${product.id}`);
        setIsFavorite(false);
        toast.success('Eliminado de favoritos');
      } else {
        await api.post('/users/favorites', { productId: product.id });
        setIsFavorite(true);
        toast.success('Añadido a favoritos');
      }
    } catch (error) {
      toast.error('Error al gestionar favoritos');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <Loader2 className="h-6 w-6 animate-spin text-cream/40" />
      </div>
    );
  }

  if (error || (!isLoading && !product)) {
    return (
      <>
        <SEOHead
          title="404 - Producto no encontrado"
          description="El producto que buscas no está disponible. Explora nuestro catálogo completo."
          noindex={true}
        />
        <div className="flex min-h-screen items-center justify-center bg-ink px-5">
          <div className="text-center">
            <h1 className="text-[28px] font-semibold tracking-tight text-cream">Producto no encontrado</h1>
            <p className="mt-3 text-[15px] text-cream/60">Ese equipo no existe o ya no está en catálogo.</p>
            <p className="mt-6 text-[13px] text-cream/40">Te llevamos al catálogo en 3 segundos…</p>
          </div>
        </div>
      </>
    );
  }

  const baseUrl = 'https://resonarent.com';
  const canonicalUrl = `${baseUrl}/productos/${product.slug}`;
  const imageUrl = product.mainImageUrl || product.images?.[0];
  const fullImageUrl = imageUrl?.startsWith('http') 
    ? imageUrl 
    : `${baseUrl}${imageUrl || '/og-image.jpg'}`;

  const seoTitle = `Alquiler ${product.name} | ReSona Rent`;
  const seoDescription = product.description 
    ? `${product.description.substring(0, 150)}... Desde €${product.pricePerDay}/día. Alquiler profesional en Valencia.`
    : `Alquiler de ${product.name} para eventos. ${product.category?.name || 'Equipo profesional'}. Desde €${product.pricePerDay}/día. Disponibilidad inmediata.`;
  const seoKeywords = `alquiler ${product.name.toLowerCase()}, ${product.category?.name?.toLowerCase() || 'equipos eventos'}, alquiler material eventos valencia, ${product.name.toLowerCase()} profesional, equipos audiovisuales alquiler`;

  // Schema.org usando el generador
  const productSchema = generateProductSchema({
    id: product.id,
    slug: product.slug, // Pasar slug para URLs correctas
    name: product.name,
    description: product.description || `Alquiler de ${product.name} para eventos profesionales`,
    pricePerDay: product.pricePerDay,
    image: fullImageUrl,
    category: product.category?.name,
    brand: 'Resona Rent',
    sku: product.sku,
    availability: product.stock > 0 ? 'InStock' : 'OutOfStock',
    // Reviews y rating solo cuando existan datos reales vinculados al producto
  }, baseUrl);

  // Breadcrumbs para navegación y SEO
  const breadcrumbItems = [
    { name: 'Inicio', url: '/' },
    { name: 'Productos', url: '/productos' },
    ...(product.category ? [{ name: product.category.name, url: `/productos?category=${product.category.slug}` }] : []),
    { name: product.name, url: canonicalUrl },
  ];

  const conIVA = Number(product.pricePerDay) * 1.21;
  const precio = getPriceDisplay(conIVA, '');
  const consumible = Boolean(product.isConsumable);
  const galeria: string[] = [...new Set([product.mainImageUrl, ...(product.images || [])].filter(Boolean))] as string[];
  const dias = (() => {
    if (!datesValid) return 0;
    const ms = new Date(endDate).getTime() - new Date(startDate).getTime();
    return Math.max(1, Math.ceil(ms / 86400000) + 1);
  })();

  const campoFecha =
    'h-11 w-full rounded-sm border border-cream/15 bg-transparent px-3 text-[14px] text-cream focus:border-resona-light focus:outline-none [color-scheme:dark]';

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonicalUrl={canonicalUrl}
        ogImage={fullImageUrl}
        schema={productSchema}
        product={{
          price: product.pricePerDay,
          availability: product.stock > 0 ? 'InStock' : 'OutOfStock',
        }}
      />

      <div className="min-h-screen bg-ink">
        <div className="mx-auto max-w-[1400px] px-5 py-8 md:px-10 md:py-12">
          <Breadcrumbs items={breadcrumbItems} className="mb-10 text-cream/45" />

          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
            {/* Galería */}
            <div>
              <div className="aspect-square w-full overflow-hidden bg-panel">
                {galeria[activa] ? (
                  <OptimizedImage
                    src={getImageUrl(galeria[activa])}
                    alt={product.name}
                    objectFit="contain"
                    priority
                    className="h-full w-full object-contain p-8 md:p-12"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-ink-800">
                    <span className="text-[11px] uppercase tracking-[0.18em] text-cream/25">Sin fotografía</span>
                  </div>
                )}
              </div>

              {galeria.length > 1 && (
                <div className="mt-4 flex gap-3">
                  {galeria.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiva(idx)}
                      aria-label={`Ver imagen ${idx + 1} de ${galeria.length}`}
                      className={`h-20 w-20 overflow-hidden bg-panel transition-opacity ${
                        idx === activa ? 'ring-2 ring-resona' : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <OptimizedImage src={getImageUrl(img)} alt="" objectFit="contain" className="h-full w-full object-contain p-2" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Compra */}
            <div className="lg:pt-4">
              {product.category?.name && (
                <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-cream/45">
                  {product.category.name}
                </p>
              )}

              <h1 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] text-cream md:text-[42px]">
                {product.name}
              </h1>

              <div className="mt-7 flex items-baseline gap-3">
                <span className="text-[32px] font-semibold tabular-nums tracking-tight text-cream">
                  {consumible ? formatEuro(Number(product.pricePerUnit) || 0) : precio.main}
                </span>
                <span className="text-[15px] text-cream/50">
                  {consumible ? 'por unidad' : 'por día, IVA incluido'}
                </span>
              </div>
              {!consumible && <p className="mt-1 text-[13px] text-cream/40">{precio.sub}</p>}

              {!consumible && (
                <div className="mt-10 border-t border-cream/10 pt-8">
                  <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-cream/45">
                    Fechas de alquiler
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="fecha-inicio" className="mb-1.5 block text-[12px] text-cream/50">
                        Desde
                      </label>
                      <input
                        id="fecha-inicio"
                        type="date"
                        min={today}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className={campoFecha}
                      />
                    </div>
                    <div>
                      <label htmlFor="fecha-fin" className="mb-1.5 block text-[12px] text-cream/50">
                        Hasta
                      </label>
                      <input
                        id="fecha-fin"
                        type="date"
                        min={startDate || today}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className={campoFecha}
                      />
                    </div>
                  </div>

                  <div aria-live="polite" className="mt-4 min-h-[22px]">
                    {checkingAvailability && (
                      <p className="flex items-center gap-2 text-[13px] text-cream/50">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Comprobando disponibilidad…
                      </p>
                    )}
                    {datesValid && !checkingAvailability && availability?.available && (
                      <p className="flex items-center gap-2 text-[13px] text-emerald-400">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Disponible · {dias} {dias === 1 ? 'día' : 'días'} ·{' '}
                        <span className="tabular-nums text-cream/70">{formatEuro(conIVA * dias)}</span>
                        {typeof availability.availableQuantity === 'number' && availability.availableQuantity < 10 && (
                          <span className="text-cream/45">· quedan {availability.availableQuantity}</span>
                        )}
                      </p>
                    )}
                    {datesValid && !checkingAvailability && availability && !availability.available && (
                      <p className="flex items-center gap-2 text-[13px] text-amber-400">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {availability.message || 'No disponible en esas fechas. Prueba otras.'}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <div className="flex h-12 items-center rounded-sm border border-cream/15">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Quitar una unidad"
                    className="flex h-12 w-11 items-center justify-center text-cream/60 transition-colors hover:text-cream"
                  >
                    −
                  </button>
                  <span aria-live="polite" className="w-8 text-center text-[15px] tabular-nums text-cream">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Añadir una unidad"
                    className="flex h-12 w-11 items-center justify-center text-cream/60 transition-colors hover:text-cream"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={datesValid && availability && !availability.available}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-sm bg-resona px-8 text-[15px] font-medium text-white transition-colors hover:bg-resona-dark disabled:cursor-not-allowed disabled:bg-cream/15 disabled:text-cream/40"
                >
                  <ShoppingCart className="h-[18px] w-[18px]" />
                  Añadir al carrito
                </button>

                <button
                  onClick={handleAddToFavorites}
                  aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                  aria-pressed={isFavorite}
                  className="flex h-12 w-12 items-center justify-center rounded-sm border border-cream/15 text-cream/60 transition-colors hover:text-cream"
                >
                  <Heart className={`h-[18px] w-[18px] ${isFavorite ? 'fill-resona text-resona' : ''}`} />
                </button>
              </div>

              <ul className="mt-10 space-y-3 border-t border-cream/10 pt-8 text-[14px] text-cream/65">
                <li className="flex items-center gap-3">
                  <Shield className="h-4 w-4 shrink-0 text-cream/40" strokeWidth={1.75} />
                  Depósito reembolsable al devolver en buen estado
                </li>
                <li className="flex items-center gap-3">
                  <Truck className="h-4 w-4 shrink-0 text-cream/40" strokeWidth={1.75} />
                  Recogida en almacén. Entrega y montaje opcionales
                </li>
                <li className="flex items-center gap-3">
                  <Wrench className="h-4 w-4 shrink-0 text-cream/40" strokeWidth={1.75} />
                  Técnico opcional, se presupuesta aparte
                </li>
              </ul>
            </div>
          </div>

          {(product.description || product.specifications) && (
            <div className="mt-24 grid gap-14 border-t border-cream/10 pt-14 md:grid-cols-2 md:gap-20">
              {product.description && (
                <section>
                  <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-cream/45">
                    Descripción
                  </h2>
                  <p className="whitespace-pre-line text-[15px] leading-relaxed text-cream/75">
                    {product.description}
                  </p>
                </section>
              )}

              {product.specifications && (
                <section>
                  <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-cream/45">
                    Características
                  </h2>
                  {typeof product.specifications === 'string' ? (
                    <p className="whitespace-pre-line text-[15px] leading-relaxed text-cream/75">
                      {product.specifications}
                    </p>
                  ) : Array.isArray(product.specifications) ? (
                    <ul className="space-y-2 text-[15px] text-cream/75">
                      {product.specifications.map((spec: any, idx: number) => (
                        <li key={idx} className="border-b border-cream/[0.07] pb-2">
                          {typeof spec === 'string' ? spec : JSON.stringify(spec)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <dl className="text-[15px]">
                      {Object.entries(product.specifications).map(([clave, valor]: [string, any]) => (
                        <div key={clave} className="flex justify-between gap-6 border-b border-cream/[0.07] py-2.5">
                          <dt className="text-cream/50">{clave}</dt>
                          <dd className="text-right text-cream/85">{String(valor)}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </section>
              )}
            </div>
          )}

          {product.relatedProducts && product.relatedProducts.length > 0 && (
            <section className="mt-24 border-t border-cream/10 pt-14">
              <h2 className="mb-12 text-[11px] font-semibold uppercase tracking-[0.2em] text-cream/45">
                También te puede servir
              </h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-4 md:gap-x-8">
                {product.relatedProducts.map((rel: any) => (
                  <ProductTile key={rel.id} product={rel} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Barra fija en móvil: el precio y el botón no deben perderse al bajar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-cream/10 bg-ink/95 px-5 py-3 backdrop-blur lg:hidden">
        <div>
          <p className="text-[17px] font-semibold tabular-nums text-cream">
            {consumible ? formatEuro(Number(product.pricePerUnit) || 0) : precio.main}
          </p>
          <p className="text-[12px] text-cream/45">{consumible ? 'por unidad' : 'por día'}</p>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={datesValid && availability && !availability.available}
          className="flex h-11 items-center gap-2 rounded-sm bg-resona px-6 text-[14px] font-medium text-white disabled:bg-cream/15 disabled:text-cream/40"
        >
          <ShoppingCart className="h-4 w-4" />
          Añadir
        </button>
      </div>
    </>
  );
};

export default ProductDetailPage;
