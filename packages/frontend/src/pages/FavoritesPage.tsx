import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const FavoritesPage = () => {
  // TODO: Implementar sistema de favoritos con localStorage o backend
  const favorites: any[] = [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Favoritos</h1>
        
        {favorites.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No tienes favoritos todavía
            </h2>
            <p className="text-gray-600 mb-6">
              Explora nuestro catálogo y añade productos a tus favoritos
            </p>
            <Link
              to="/productos"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <ShoppingCart className="w-5 h-5" />
              Ver Productos
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map((product: any) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-blue-600 font-bold mb-4">€{product.price}/día</p>
                  <div className="flex gap-2">
                    <Link
                      to={`/productos/${product.slug}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </Link>
                    <button
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Añadir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
