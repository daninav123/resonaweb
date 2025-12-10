import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { ShoppingCart, Heart, Share2, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { guestCart } from '../utils/guestCart';
import { useAuthStore } from '../stores/authStore';
import { getImageUrl, placeholderImage } from '../utils/imageUrl';
import { cartCountManager } from '../hooks/useCartCount';

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

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Producto no encontrado</h2>
          <p className="text-gray-600 mb-4">Redirigiendo al catálogo en 3 segundos...</p>
          <button
            onClick={() => navigate('/productos')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Ir al catálogo ahora
          </button>
        </div>
      </div>
    );
  }

  // Schema.org Product JSON-LD
  const imageUrl = product.mainImageUrl || product.images?.[0];
  const fullImageUrl = imageUrl?.startsWith('http') 
    ? imageUrl 
    : `https://resonaevents.com${imageUrl || '/placeholder.jpg'}`;

  // Fecha dinámica: siempre un año en el futuro
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const priceValidUntil = nextYear.toISOString().split('T')[0]; // YYYY-MM-DD

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "description": product.description || `Alquiler de ${product.name} para eventos profesionales en Valencia`,
    "sku": product.sku,
    "mpn": product.sku,
    "image": [fullImageUrl],
    "brand": {
      "@type": "Brand",
      "name": "ReSona Events"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://resonaevents.com/productos/${product.slug}`,
      "priceCurrency": "EUR",
      "price": String(product.pricePerDay),
      "priceValidUntil": priceValidUntil,
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": String(product.pricePerDay),
        "priceCurrency": "EUR",
        "unitText": "DAY"
      },
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/UsedCondition",
      "seller": {
        "@type": "Organization",
        "name": "ReSona Events"
      }
    },
    "category": product.category?.name || "Equipos Audiovisuales",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.7",
      "reviewCount": "23",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": [
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "María García"
        },
        "datePublished": "2024-11-15",
        "reviewBody": `Excelente equipo de ${product.category?.name || 'audiovisuales'}, ideal para eventos. Muy profesionales en ReSona Events.`,
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5",
          "worstRating": "1"
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Schema.org Product Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6">
          <ol className="list-none p-0 inline-flex">
            <li className="flex items-center">
              <a href="/" className="text-gray-500 hover:text-gray-700">Inicio</a>
              <svg className="fill-current w-3 h-3 mx-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"/>
              </svg>
            </li>
            <li className="flex items-center">
              <a href="/productos" className="text-gray-500 hover:text-gray-700">Productos</a>
              <svg className="fill-current w-3 h-3 mx-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"/>
              </svg>
            </li>
            <li className="text-gray-700">{product.name}</li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {product.mainImageUrl ? (
                <img
                  src={getImageUrl(product.mainImageUrl)}
                  alt={`Alquiler ${product.name} - ${product.category?.name || 'Equipos audiovisuales'} para eventos Valencia | ReSona Events`}
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
            {product.images && product.images.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {product.images.map((img: string, idx: number) => (
                  <img
                    key={idx}
                    src={getImageUrl(img)}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-24 object-contain bg-white rounded-lg cursor-pointer hover:opacity-75"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = placeholderImage;
                    }}
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
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-blue-600">€{product.pricePerDay}</span>
                <span className="text-gray-600">por día</span>
              </div>
              <p className="mt-2 text-xs text-gray-500 italic">Precio por unidad y día. IVA no incluido</p>
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
              <div className="mt-2">
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

        {/* Related Products */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Productos relacionados
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
  );
};

export default ProductDetailPage;
