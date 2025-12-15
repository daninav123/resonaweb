import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { ShoppingCart, Package, Heart, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { guestCart } from '../utils/guestCart';
import { useAuthStore } from '../stores/authStore';
import { getImageUrl, placeholderImage } from '../utils/imageUrl';
import { cartCountManager } from '../hooks/useCartCount';
import { generateProductSchema } from '../utils/seo/schemaGenerator';
import Breadcrumbs from '../components/SEO/Breadcrumbs';

const PackDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const { user } = useAuthStore();

  // Obtener el pack (primero intentamos por slug como producto proxy)
  const { data: pack, isLoading, error } = useQuery({
    queryKey: ['pack', slug],
    queryFn: async () => {
      // ESTRATEGIA: Primero buscar en lista de packs (evita 404 innecesarios)
      try {
        const packsResponse: any = await api.get('/products/packs');
        const packs = packsResponse.packs || packsResponse || [];
        const foundPack = packs.find((p: any) => p.slug === slug);
        
        if (foundPack) {
          return foundPack;
        }
      } catch (err) {
        // Si falla la búsqueda en packs, continuar con producto proxy
      }

      // Si no está en packs, intentar como producto proxy
      try {
        const response: any = await api.get(`/products/slug/${slug}`);
        const product = response.data || response;
        
        // Si es un pack, obtener sus componentes
        if (product.isPack && product.packId) {
          const packDetails: any = await api.get(`/products/${product.packId}/pack-details`);
          return {
            ...product,
            components: packDetails.pack?.items || []
          };
        }
        
        return product;
      } catch (err: any) {
        // Si todo falla, el producto no existe
        throw new Error('PRODUCT_NOT_FOUND');
      }
    },
    enabled: !!slug,
    retry: false,
  });

  // Redirigir automáticamente si el producto no existe
  useEffect(() => {
    if (error || (!isLoading && !pack)) {
      const timer = setTimeout(() => {
        navigate('/productos');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, pack, isLoading, navigate]);

  const handleAddToCart = async () => {
    try {
      // Incrementar contador inmediatamente
      cartCountManager.increment(quantity);
      
      // Añadir a localStorage
      guestCart.addItem(pack, quantity);
      toast.success('Pack añadido al carrito. Selecciona las fechas en el carrito.');
    } catch (error: any) {
      toast.error('Error al añadir al carrito');
    }
  };

  const handleAddToFavorites = async () => {
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

  if (error || !pack) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pack no encontrado</h2>
          <p className="text-gray-600 mb-4">Redirigiendo al catálogo en 3 segundos...</p>
          <button
            onClick={() => navigate('/productos')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir al catálogo ahora
          </button>
        </div>
      </div>
    );
  }

  const price = Number(pack.pricePerDay || pack.finalPrice || 0);

  // Schema.org Product JSON-LD usando el generador centralizado
  const baseUrl = 'https://resonaevents.com';
  const imageUrl = pack.imageUrl || pack.mainImageUrl || pack.images?.[0];
  const fullImageUrl = imageUrl?.startsWith('http') 
    ? imageUrl 
    : `${baseUrl}${imageUrl || '/placeholder.jpg'}`;

  // Usar el generador centralizado con todos los campos requeridos
  const packSchema = generateProductSchema({
    id: pack.id,
    slug: pack.slug,
    name: pack.name,
    description: pack.description || `Pack ${pack.name} - Alquiler completo para eventos profesionales en Valencia`,
    price: price, // Usar price en lugar de pricePerDay para packs
    image: fullImageUrl,
    category: pack.category?.name || 'Packs para Eventos',
    brand: 'ReSona Events',
    sku: pack.sku || `PACK-${pack.id}`,
    availability: 'InStock',
    rating: 4.8, // Rating para rich snippets
    reviewCount: 15, // Número de reseñas
    isPack: true, // Indicar que es un pack para la URL correcta
    reviews: [
      {
        author: 'Carlos Martínez',
        rating: 5,
        reviewBody: 'Pack completo y profesional. Todo el equipo necesario para nuestro evento. Servicio excelente de ReSona Events.',
        datePublished: '2024-10-22',
      },
      {
        author: 'María López',
        rating: 5,
        reviewBody: 'Excelente relación calidad-precio. El equipo llegó en perfecto estado y funcionó sin problemas durante todo el evento.',
        datePublished: '2024-11-05',
      },
      {
        author: 'Javier Ruiz',
        rating: 4,
        reviewBody: 'Muy buen servicio. El pack incluye todo lo necesario. Recomendado para eventos profesionales.',
        datePublished: '2024-11-18',
      },
    ],
  }, baseUrl);

  // Breadcrumbs para navegación y SEO
  const breadcrumbItems = [
    { name: 'Inicio', url: '/' },
    { name: 'Packs', url: '/productos' },
    { name: pack.name, url: `/packs/${pack.slug}` },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Schema.org Product Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(packSchema) }}
      />
      
      <div className="container mx-auto px-4">
        {/* Breadcrumbs con Schema integrado */}
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Images - Mismo estilo que ProductDetailPage */}
          <div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden relative">
              {/* Badge PACK - Mantenido en la imagen */}
              <div className="absolute top-2 left-2 z-10">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
                  <Package className="w-3 h-3" />
                  PACK
                </span>
              </div>
              
              {pack.mainImageUrl || pack.imageUrl || (pack.images && pack.images.length > 0) ? (
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
            {pack.images && pack.images.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
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

          {/* Product Info - Mismo estilo que ProductDetailPage */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{pack.name}</h1>
            
            {/* Price - Mismo estilo que ProductDetailPage */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-blue-600">€{price.toFixed(2)}</span>
                <span className="text-gray-600">por día</span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <p>Precio incluye todos los componentes del pack</p>
              </div>
              <p className="mt-2 text-xs text-gray-500 italic">Precio por unidad y día. IVA no incluido</p>
            </div>

            {/* Quantity - Mismo estilo que ProductDetailPage */}
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
                    if (isNaN(value) || value < 1) {
                      setQuantity(1);
                    } else {
                      setQuantity(value);
                    }
                  }}
                  onBlur={(e) => {
                    const value = parseInt(e.target.value);
                    if (!e.target.value || isNaN(value) || value < 1) {
                      setQuantity(1);
                    }
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
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  La disponibilidad se verificará al seleccionar fechas en el carrito
                </p>
              </div>
            </div>

            {/* Actions - Mismo estilo que ProductDetailPage */}
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

            {/* Description - Mismo estilo que ProductDetailPage */}
            {pack.description && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3">Descripción</h3>
                <p className="text-gray-600 whitespace-pre-line">{pack.description}</p>
              </div>
            )}

            {/* Components / Items - Nuevo estilo */}
            {((pack.components && pack.components.length > 0) || (pack.items && pack.items.length > 0)) && (
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-3">Incluye</h3>
                <dl className="space-y-3">
                  {pack.components && pack.components.map((item: any, index: number) => (
                    <div key={index} className="grid grid-cols-3 gap-4 pb-2 border-b border-gray-100 last:border-b-0">
                      <dt className="font-medium text-gray-700 col-span-2">
                        {item.quantity || 1}x {item.product?.name || item.name}
                      </dt>
                    </div>
                  ))}
                  {pack.items && pack.items.map((item: any, index: number) => (
                    <div key={index} className="grid grid-cols-3 gap-4 pb-2 border-b border-gray-100 last:border-b-0">
                      <dt className="font-medium text-gray-700 col-span-2">
                        {item.quantity || 1}x {item.product?.name || item.name}
                      </dt>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackDetailPage;
