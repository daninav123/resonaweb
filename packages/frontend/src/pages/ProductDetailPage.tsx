import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { ShoppingCart, Heart, Share2, Package, Shield, Truck, Clock, Star, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { guestCart } from '../utils/guestCart';
import { useAuthStore } from '../stores/authStore';
import { getImageUrl, placeholderImage } from '../utils/imageUrl';
import { cartCountManager } from '../hooks/useCartCount';
import SEOHead from '../components/SEO/SEOHead';
import Breadcrumbs from '../components/SEO/Breadcrumbs';
import OptimizedImage from '../components/common/OptimizedImage';
import { generateProductSchema } from '../utils/seo/schemaGenerator';
import { getPriceDisplay } from '../utils/priceWithVAT';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const { user } = useAuthStore();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      try {
        const response: any = await api.get(`/products/slug/${slug}`);
        console.log('📦 Producto recibido:', response);
        console.log('🔗 Productos relacionados:', response?.data?.relatedProducts || response?.relatedProducts);
        return response.data || response;
      } catch (err: any) {
        if (err?.response?.status === 404) {
          throw new Error('PRODUCT_NOT_FOUND');
        }
        throw err;
      }
    },
    enabled: !!slug,
    retry: false, // No reintentar - si no existe, redirigir inmediatamente
  });

  // Redirigir automáticamente si el producto no existe
  useEffect(() => {
    if (error || (!isLoading && !product)) {
      // Establecer status 404 en el head
      document.title = '404 - Producto no encontrado | ReSona Events';
      
      const timer = setTimeout(() => {
        navigate('/productos');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, product, isLoading, navigate]);

  const handleAddToCart = async () => {
    try {
      // Permitir añadir incluso con stock 0
      // La validación de disponibilidad se hará al asignar fechas
      
      // SIEMPRE usar localStorage (tanto autenticado como guest)
      // Incrementar contador INMEDIATAMENTE
      cartCountManager.increment(quantity);
      
      // Añadir a localStorage
      guestCart.addItem(product, quantity);
      toast.success('Producto añadido al carrito. Selecciona las fechas en el carrito.');
    } catch (error: any) {
      toast.error('Error al añadir al carrito');
    }
  };

  const handleAddToFavorites = async () => {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Producto no encontrado</h1>
            <p className="text-gray-600 mb-4">El producto que buscas no existe o ha sido eliminado.</p>
            <p className="text-sm text-gray-500">Serás redirigido al catálogo en 3 segundos...</p>
          </div>
        </div>
      </>
    );
  }

  // SEO: Metadatos dinámicos
  const baseUrl = 'https://resonaevents.com';
  const canonicalUrl = `${baseUrl}/productos/${product.slug}`;
  const imageUrl = product.mainImageUrl || product.images?.[0];
  const fullImageUrl = imageUrl?.startsWith('http') 
    ? imageUrl 
    : `${baseUrl}${imageUrl || '/og-image.jpg'}`;

  const seoTitle = `Alquiler ${product.name} | Equipos Profesionales para Eventos`;
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
    brand: 'Resona Events',
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

  return (
    <>
      {/* SEO Head con todos los metatags */}
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        ogImage={fullImageUrl}
        ogType="product"
        canonicalUrl={canonicalUrl}
        schema={productSchema}
        product={{
          price: product.pricePerDay,
          currency: 'EUR',
          availability: product.stock > 0 ? 'InStock' : 'OutOfStock',
        }}
      />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs con Schema integrado */}
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {product.mainImageUrl ? (
                <OptimizedImage
                  src={getImageUrl(product.mainImageUrl)}
                  alt={`Alquiler ${product.name} - ${product.category?.name || 'Equipos audiovisuales'} para eventos Valencia | ReSona Events`}
                  className="w-full h-96 object-contain bg-white"
                  height={384}
                  priority={true}
                  objectFit="contain"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                  <Package className="w-24 h-24 text-gray-400" />
                </div>
              )}
            </div>
            {product.images && product.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {product.images.map((img: string, idx: number) => (
                  <OptimizedImage
                    key={idx}
                    src={getImageUrl(img)}
                    alt={`${product.name} vista ${idx + 1} - Detalle del equipo`}
                    className="w-full h-24 object-contain bg-white rounded-lg cursor-pointer hover:opacity-75"
                    height={96}
                    loading="lazy"
                    objectFit="contain"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            {/* Price */}
            <div className="mb-6">
              {(() => {
                const priceWithVAT = Number(product.pricePerDay) * 1.21;
                const priceDisplay = getPriceDisplay(priceWithVAT, ' por día');
                return (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-blue-600">{priceDisplay.main}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">{priceDisplay.sub}</p>
                  </>
                );
              })()}
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Cantidad</h3>
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
                    // Simplemente establecer el valor sin validaciones estrictas
                    // La validación real se hará en el carrito al seleccionar fechas
                    if (isNaN(value) || value < 1) {
                      setQuantity(1);
                    } else {
                      setQuantity(value);
                    }
                  }}
                  onBlur={(e) => {
                    // Asegurar que al salir del campo siempre haya un valor válido
                    const value = parseInt(e.target.value);
                    if (!e.target.value || isNaN(value) || value < 1) {
                      setQuantity(1);
                    }
                  }}
                  className="w-20 text-xl font-medium text-center border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => {
                    setQuantity(prev => prev + 1);
                  }}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition font-semibold text-lg"
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>
              <div className="mt-2 space-y-1">
                {product.stock > 0 && product.stock <= 3 && (
                  <p className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded inline-block animate-pulse">
                    Solo quedan {product.stock} unidades disponibles
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  La disponibilidad se verificará al seleccionar fechas en el carrito
                </p>
              </div>
            </div>

            {/* Actions */}
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
                className={`p-3 border rounded-lg transition ${
                  isFavorite 
                    ? 'border-red-500 bg-red-50 text-red-600' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button
                className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-700 bg-green-50 rounded-lg p-3">
                <Truck className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Entrega e instalación incluida</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 bg-blue-50 rounded-lg p-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span>Garantía total del equipo</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 bg-purple-50 rounded-lg p-3">
                <Clock className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <span>Soporte técnico 24h</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 bg-yellow-50 rounded-lg p-3">
                <Star className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <span>+500 eventos realizados</span>
              </div>
            </div>

            {/* Social Proof */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex -space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-900">4.8/5</span>
                <span className="text-xs text-gray-500">(+120 valoraciones)</span>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600 italic border-l-2 border-yellow-400 pl-3">
                  "Excelente equipo y servicio impecable. Todo funcionó perfecto en nuestra boda."
                  <span className="block text-xs text-gray-400 mt-1 not-italic">— Ana G., Valencia</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                <span>15 personas alquilaron este producto esta semana</span>
              </div>
            </div>

            {/* Description */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-3">Descripción</h3>
              <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
            </div>

            {/* Specifications */}
            {product.specifications && (
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-3">Especificaciones</h3>
                <dl className="space-y-3">
                  {typeof product.specifications === 'string' ? (
                    // Si es un string, mostrar directamente
                    <dd className="text-gray-600 whitespace-pre-line">{product.specifications}</dd>
                  ) : typeof product.specifications === 'object' && !Array.isArray(product.specifications) ? (
                    // Si es un objeto, iterar sobre las propiedades
                    Object.entries(product.specifications).map(([key, value]: [string, any]) => (
                      <div key={key} className="grid grid-cols-3 gap-4 pb-2 border-b border-gray-100 last:border-b-0">
                        <dt className="font-medium text-gray-700 col-span-1">{key}:</dt>
                        <dd className="text-gray-600 col-span-2">{String(value)}</dd>
                      </div>
                    ))
                  ) : Array.isArray(product.specifications) ? (
                    // Si es un array, mostrar como lista
                    product.specifications.map((spec: any, idx: number) => (
                      <div key={idx} className="pb-2 border-b border-gray-100 last:border-b-0">
                        <dd className="text-gray-600">{String(spec)}</dd>
                      </div>
                    ))
                  ) : null}
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Mobile CTA Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-4px_12px_rgba(0,0,0,0.1)] p-3 z-30 lg:hidden">
          <div className="container mx-auto flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{product.name}</p>
              {(() => {
                const priceWithVAT = Number(product.pricePerDay) * 1.21;
                const priceDisplay = getPriceDisplay(priceWithVAT, '/día');
                return (
                  <p className="text-blue-600 font-bold text-lg">{priceDisplay.main}</p>
                );
              })()}
            </div>
            <button
              onClick={handleAddToCart}
              className="flex-shrink-0 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2 active:scale-95"
            >
              <ShoppingCart className="w-5 h-5" />
              Añadir
            </button>
          </div>
        </div>

        {/* Spacer for sticky bar on mobile */}
        <div className="h-20 lg:hidden"></div>

        {/* Related Products */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Productos relacionados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {product.relatedProducts.map((related: any) => (
                <div
                  key={related.id}
                  onClick={() => {
                    if (related.isPack) {
                      navigate(`/packs/${related.slug}`);
                    } else {
                      navigate(`/productos/${related.slug}`);
                    }
                  }}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                >
                  <div className="relative">
                    <img
                      src={getImageUrl(related.mainImageUrl) || placeholderImage}
                      alt={related.name}
                      className="w-full h-48 object-contain bg-gray-50 group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = placeholderImage;
                      }}
                    />
                    {related.isPack && (
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        Pack
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {related.name}
                    </h3>
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-xl font-bold text-blue-600">
                          €{Number(related.pricePerDay).toFixed(2)}
                          <span className="text-sm text-gray-500 font-normal">/día</span>
                        </p>
                        {related.isPack && (
                          <span className="text-xs text-purple-600 font-medium">
                            Ver pack →
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Precio por unidad y día. IVA no incluido</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;
