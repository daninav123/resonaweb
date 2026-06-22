import { useEffect, useState } from 'react';
import { Heart, ShoppingCart, Eye, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api, useAuthStore } from '@resona/api-client';
import { getImageUrl, placeholderImage } from '@resona/utils';
import { getPriceDisplay } from '../utils/priceWithVAT';
import { guestCart } from '../utils/guestCart';
import { cartCountManager } from '../hooks/useCartCount';

interface FavoriteEntry {
  id: string;
  productId: string;
  product: any;
  createdAt?: string;
}

const FavoritesPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        const res: any = await api.get(`/users/${user.id}/favorites`);
        const list = res?.data || res?.favorites || res || [];
        setFavorites(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Error cargando favoritos:', err);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated, user?.id]);

  const handleRemove = async (productId: string) => {
    try {
      await api.delete(`/users/favorites/${productId}`);
      setFavorites((prev) => prev.filter((f) => (f.productId || f.product?.id) !== productId));
      toast.success('Eliminado de favoritos');
    } catch {
      toast.error('No se pudo eliminar');
    }
  };

  const handleAddToCart = (product: any) => {
    guestCart.addItem(product, 1);
    cartCountManager.increment(1);
    toast.success('Añadido al carrito');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-md">
          <div className="bg-white rounded-lg shadow-md p-10 text-center">
            <Heart className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Inicia sesión para ver tus favoritos</h2>
            <p className="text-gray-600 mb-6">Guarda los equipos que te interesan y accede a ellos desde cualquier dispositivo.</p>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-resona text-white rounded-lg hover:bg-resona-dark transition font-medium"
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-resona"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Favoritos</h1>

        {favorites.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center max-w-md mx-auto">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No tienes favoritos todavía</h2>
            <p className="text-gray-600 mb-6">
              Explora el catálogo y pulsa el corazón en los equipos que quieras guardar.
            </p>
            <Link
              to="/productos"
              className="inline-flex items-center gap-2 px-6 py-3 bg-resona text-white rounded-lg hover:bg-resona-dark transition font-medium"
            >
              <ShoppingCart className="w-5 h-5" />
              Ver catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {favorites.map((fav) => {
              const product = fav.product || fav;
              const productId = fav.productId || product.id;
              const img = getImageUrl(product.mainImageUrl || product.images?.[0]) || placeholderImage;
              const priceDisplay = getPriceDisplay(Number(product.pricePerDay) * 1.21, '/día');
              return (
                <div
                  key={fav.id || productId}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition flex flex-col"
                >
                  <Link to={`/productos/${product.slug || productId}`}>
                    <img
                      src={img}
                      alt={product.name}
                      className="w-full h-48 object-contain bg-gray-50"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = placeholderImage;
                      }}
                    />
                  </Link>
                  <div className="p-4 flex-1 flex flex-col">
                    <Link to={`/productos/${product.slug || productId}`}>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-resona transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-resona font-bold mb-4">{priceDisplay.main}</p>
                    <div className="flex gap-2 mt-auto">
                      <Link
                        to={`/productos/${product.slug || productId}`}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </Link>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-resona text-white rounded-lg hover:bg-resona-dark transition text-sm font-medium"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Añadir
                      </button>
                      <button
                        onClick={() => handleRemove(productId)}
                        className="p-2 border border-gray-200 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
                        title="Eliminar de favoritos"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
