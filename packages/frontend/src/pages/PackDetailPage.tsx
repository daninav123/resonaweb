import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { ShoppingCart, Package, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { guestCart } from '../utils/guestCart';
import { useAuthStore } from '../stores/authStore';
import { getImageUrl, placeholderImage } from '../utils/imageUrl';
import { cartCountManager } from '../hooks/useCartCount';

const PackDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Ir al catálogo ahora
          </button>
        </div>
      </div>
    );
  }

  const price = Number(pack.pricePerDay || pack.finalPrice || 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/productos"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al catálogo
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Imagen */}
            <div>
              <div className="relative">
                <span className="absolute top-4 left-4 z-10 inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
                  <Package className="w-3 h-3" />
                  PACK
                </span>
                {pack.mainImageUrl || pack.imageUrl || (pack.images && pack.images.length > 0) ? (
                  <img
                    src={getImageUrl(pack.mainImageUrl || pack.imageUrl || pack.images[0])}
                    alt={pack.name}
                    className="w-full h-96 object-contain bg-white rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = placeholderImage;
                    }}
                  />
                ) : (
                  <div className="w-full h-96 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-32 h-32 text-purple-300" />
                  </div>
                )}
              </div>
            </div>

            {/* Detalles */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{pack.name}</h1>
              
              {pack.description && (
                <p className="text-gray-600 mb-6 whitespace-pre-wrap">{pack.description}</p>
              )}

              {/* Precio */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-purple-600">
                    €{price.toFixed(2)}
                  </span>
                  <span className="text-lg text-gray-600">/día</span>
                </div>
                <p className="text-sm text-gray-600">Precio incluye todos los componentes del pack</p>
              </div>

              {/* Componentes del pack */}
              {pack.components && pack.components.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                    Incluye:
                  </h3>
                  <ul className="space-y-2">
                    {pack.components.map((item: any, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                        <span>
                          {item.quantity || 1}x {item.product?.name || item.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Items del pack (si están disponibles) */}
              {pack.items && pack.items.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                    Incluye:
                  </h3>
                  <ul className="space-y-2">
                    {pack.items.map((item: any, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                        <span>
                          {item.quantity || 1}x {item.product?.name || item.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cantidad y añadir al carrito */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Añadir al carrito
                </button>

                <p className="text-sm text-gray-500 text-center">
                  Selecciona las fechas en el carrito para verificar disponibilidad
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackDetailPage;
