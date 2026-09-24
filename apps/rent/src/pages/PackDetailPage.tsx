import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@resona/api-client';
import { ShoppingCart, Package, Heart, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { guestCart } from '../utils/guestCart';
import { useAuthStore } from '../stores/authStore';
import { getImageUrl, placeholderImage } from '../utils/imageUrl';
import { cartCountManager } from '../hooks/useCartCount';
import { generateProductSchema } from '../utils/seo/schemaGenerator';
import Breadcrumbs from '../components/SEO/Breadcrumbs';
import SEOHead from '../components/SEO/SEOHead';
import { getPriceDisplay } from '../utils/priceWithVAT';

const PackDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const { user } = useAuthStore();

  const { data: pack, isLoading, error } = useQuery({
    queryKey: ['pack', slug],
    queryFn: async () => {
      // Los packs viven en dos sitios: tabla Pack (endpoint /products/packs) y
      // productos con isPack=true. Se busca primero en la lista para evitar 404 inútiles.
      try {
        const packsResponse: any = await api.get('/products/packs');
        const packs = packsResponse.packs || packsResponse || [];
        const foundPack = packs.find((p: any) => p.slug === slug);
        if (foundPack) return foundPack;
      } catch {
        // Ignorado: se intenta la vía de producto proxy.
      }

      try {
        const response: any = await api.get(`/products/slug/${slug}`);
        const product = response.data || response;

        if (product.isPack && product.packId) {
          const packDetails: any = await api.get(`/products/${product.packId}/pack-details`);
          return {
            ...product,
            components: packDetails.pack?.items || [],
          };
        }

        return product;
      } catch {
        throw new Error('PACK_NOT_FOUND');
      }
    },
    enabled: !!slug,
    retry: false,
  });

  useEffect(() => {
    if (error || (!isLoading && !pack)) {
      const timer = setTimeout(() => navigate('/productos'), 3000);
      return () => clearTimeout(timer);
    }
  }, [error, pack, isLoading, navigate]);

  const handleAddToCart = async () => {
    try {
      cartCountManager.increment(quantity);
      guestCart.addItem(pack, quantity);
      toast.success('Pack añadido al carrito. Podrás elegir las fechas en el siguiente paso.');
    } catch {
      toast.error('Error al añadir al carrito');
    }
  };

  const handleAddToFavorites = async () => {
    if (!user?.id) {
      toast('Inicia sesión para guardar favoritos', { icon: '🔒' });
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    try {
      if (isFavorite) {
        await api.delete(`/users/favorites/${pack.id}`);
        setIsFavorite(false);
        toast.success('Eliminado de favoritos');
      } else {
        await api.post('/users/favorites', { productId: pack.id });
        setIsFavorite(true);
        toast.success('Añadido a favoritos');
      }
    } catch {
      toast.error('Error al gestionar favoritos');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || (!isLoading && !pack)) {
    return (
      <>
        <SEOHead
          title="404 - Pack no encontrado"
          description="El pack que buscas no está disponible. Explora nuestro catálogo completo."
          noindex={true}
        />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Pack no encontrado</h1>
            <p className="text-gray-600 mb-4">El pack que buscas no existe o ha sido eliminado.</p>
            <p className="text-sm text-gray-500">Serás redirigido al catálogo en 3 segundos...</p>
          </div>
        </div>
      </>
    );
  }

  const price = Number(pack.pricePerDay || pack.finalPrice || 0);

  const baseUrl = 'https://resonarent.com';
  const canonicalUrl = `${baseUrl}/packs/${pack.slug}`;
  const imageUrl = pack.imageUrl || pack.mainImageUrl || pack.images?.[0];
  const fullImageUrl = imageUrl?.startsWith('http')
    ? imageUrl
    : `${baseUrl}${imageUrl || '/og-image.png'}`;

  const seoTitle = `Alquiler ${pack.name} | Pack completo | ReSona Rent`;
  const seoDescription = pack.description
    ? `${pack.description.substring(0, 150)}... Pack desde ${price}€/día. Alquiler audiovisual en Valencia.`
    : `Pack ${pack.name}: equipo completo de alquiler desde ${price}€/día. Disponibilidad inmediata en Valencia.`;
  const seoKeywords = `pack ${pack.name.toLowerCase()}, alquiler pack audiovisual valencia, equipos completos alquiler, ${pack.name.toLowerCase()} valencia`;

  const packSchema = generateProductSchema({
    id: pack.id,
    slug: pack.slug,
    name: pack.name,
    description: pack.description || `Pack ${pack.name} - Alquiler completo de equipo audiovisual en Valencia`,
    price,
    image: fullImageUrl,
    category: pack.category?.name || 'Packs de alquiler',
    brand: 'ReSona Rent',
    sku: pack.sku || `PACK-${pack.id}`,
    availability: 'InStock',
    isPack: true,
  }, baseUrl);

  const breadcrumbItems = [
    { name: 'Inicio', url: '/' },
    { name: 'Catálogo', url: '/productos' },
    { name: pack.name, url: `/packs/${pack.slug}` },
  ];

  const packItems = pack.components?.length ? pack.components : (pack.items || []);

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        ogImage={fullImageUrl}
        ogType="product"
        canonicalUrl={canonicalUrl}
        schema={packSchema}
        product={{
          price,
          currency: 'EUR',
          availability: 'InStock',
        }}
      />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />

          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <div className="bg-white rounded-lg shadow-md overflow-hidden relative">
                <div className="absolute top-2 left-2 z-10">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
                    <Package className="w-3 h-3" />
                    PACK
                  </span>
                </div>

                {pack.mainImageUrl || pack.imageUrl || pack.images?.length ? (
                  <img
                    src={getImageUrl(pack.mainImageUrl || pack.imageUrl || pack.images[0])}
                    alt={pack.name}
                    className="w-full h-96 object-contain bg-white"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = placeholderImage;
                    }}
                  />
                ) : (
                  <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                    <Package className="w-24 h-24 text-gray-400" />
                  </div>
                )}
              </div>

              {pack.images?.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {pack.images.map((img: string, idx: number) => (
                    <img
                      key={idx}
                      src={getImageUrl(img)}
                      alt={`${pack.name} ${idx + 1}`}
                      className="w-full h-24 object-contain bg-white rounded-lg cursor-pointer hover:opacity-75"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = placeholderImage;
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{pack.name}</h1>

              <div className="mb-6">
                {(() => {
                  const priceDisplay = getPriceDisplay(price * 1.21, ' por día');
                  return (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-blue-600">{priceDisplay.main}</span>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Precio incluye todos los componentes del pack</p>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">{priceDisplay.sub}</p>
                    </>
                  );
                })()}
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Cantidad</h2>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition font-semibold text-lg"
                    aria-label="Disminuir cantidad"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setQuantity(isNaN(value) || value < 1 ? 1 : value);
                    }}
                    onBlur={(e) => {
                      const value = parseInt(e.target.value);
                      if (!e.target.value || isNaN(value) || value < 1) setQuantity(1);
                    }}
                    className="w-20 text-xl font-medium text-center border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition font-semibold text-lg"
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  La disponibilidad se verificará al seleccionar fechas en el carrito
                </p>
              </div>

              <div className="flex gap-4 mb-8">
                <button
                  data-testid="add-to-cart"
                  onClick={handleAddToCart}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Añadir al carrito
                </button>
                <button
                  data-testid="favorite-button"
                  data-favorited={isFavorite}
                  onClick={handleAddToFavorites}
                  aria-label="Guardar en favoritos"
                  className={`p-3 border rounded-lg transition ${
                    isFavorite
                      ? 'border-red-500 bg-red-50 text-red-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(canonicalUrl);
                    toast.success('Enlace copiado');
                  }}
                  aria-label="Compartir"
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {pack.description && (
                <div className="border-t pt-6">
                  <h2 className="text-lg font-semibold mb-3">Descripción</h2>
                  <p className="text-gray-600 whitespace-pre-line">{pack.description}</p>
                </div>
              )}

              {packItems.length > 0 && (
                <div className="border-t pt-6 mt-6">
                  <h2 className="text-lg font-semibold mb-3">Incluye</h2>
                  <ul className="space-y-3">
                    {packItems.map((item: any, index: number) => (
                      <li key={index} className="pb-2 border-b border-gray-100 last:border-b-0 font-medium text-gray-700">
                        {item.quantity || 1}x {item.product?.name || item.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PackDetailPage;
