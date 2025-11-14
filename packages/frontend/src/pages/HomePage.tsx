import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/product.service';
import { Product, Category } from '../types';
import { Calendar, Users, Package, Shield } from 'lucide-react';
import SEOHead from '../components/SEO/SEOHead';
import { organizationSchema, websiteSchema, localBusinessSchema } from '../utils/schemas';

const HomePage = () => {
  const [searchDates, setSearchDates] = useState({
    start: '',
    end: '',
  });

  // Fetch featured products
  const { data: featuredProducts, isLoading: loadingProducts } = useQuery<any>({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const result = await productService.getFeaturedProducts();
      return result || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch categories
  const { data: categories, isLoading: loadingCategories } = useQuery<any>({
    queryKey: ['categories'],
    queryFn: async () => {
      const result = await productService.getCategories();
      return result || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleSearch = () => {
    if (searchDates.start && searchDates.end) {
      window.location.href = `/productos?start=${searchDates.start}&end=${searchDates.end}`;
    }
  };

  return (
    <div className="min-h-screen">
      <SEOHead
        title="Resona Events - Alquiler de Material para Eventos | Sonido, Iluminación, Foto y Video"
        description="Alquiler profesional de equipos de sonido, iluminación, fotografía y video para eventos. Bodas, conciertos, conferencias. Calculadora de presupuesto online. Mejores precios garantizados."
        keywords="alquiler material eventos, alquiler sonido, alquiler iluminación, alquiler equipos audiovisuales, bodas, conciertos, calculadora presupuesto eventos"
        schema={[organizationSchema, websiteSchema, localBusinessSchema]}
      />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-resona-dark to-resona text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Alquiler de Material para Eventos
            </h1>
            <p className="text-xl mb-8">
              Todo lo que necesitas para hacer de tu evento algo inolvidable
            </p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-xl p-6 text-gray-900">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Fecha inicio</label>
                  <input
                    type="date"
                    value={searchDates.start}
                    onChange={(e) => setSearchDates({ ...searchDates, start: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Fecha fin</label>
                  <input
                    type="date"
                    value={searchDates.end}
                    onChange={(e) => setSearchDates({ ...searchDates, end: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleSearch}
                    className="w-full bg-resona text-white py-2 px-6 rounded-lg hover:bg-resona-dark transition font-medium shadow-lg hover:shadow-xl"
                  >
                    Buscar Disponibilidad
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-resona/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-resona" />
              </div>
              <h3 className="font-semibold mb-2">Amplio Catálogo</h3>
              <p className="text-gray-600 text-sm">
                Más de 500 productos para todo tipo de eventos
              </p>
            </div>
            <div className="text-center">
              <div className="bg-resona/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-resona" />
              </div>
              <h3 className="font-semibold mb-2">Reserva Flexible</h3>
              <p className="text-gray-600 text-sm">
                Alquila por días, fines de semana o semanas completas
              </p>
            </div>
            <div className="text-center">
              <div className="bg-resona/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-resona" />
              </div>
              <h3 className="font-semibold mb-2">Asesoramiento</h3>
              <p className="text-gray-600 text-sm">
                Te ayudamos a planificar tu evento perfecto
              </p>
            </div>
            <div className="text-center">
              <div className="bg-resona/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-resona" />
              </div>
              <h3 className="font-semibold mb-2">Garantía Total</h3>
              <p className="text-gray-600 text-sm">
                Productos de calidad con servicio garantizado
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Explora por Categorías
          </h2>
          {loadingCategories ? (
            <div className="text-center">Cargando categorías...</div>
          ) : (
            <div className="grid md:grid-cols-4 lg:grid-cols-6 gap-6">
              {categories?.slice(0, 12).map((category: Category) => (
                <Link
                  key={category.id}
                  to={`/productos?categoria=${category.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="w-full h-32 object-cover group-hover:scale-105 transition"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-center">{category.name}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Productos Destacados
          </h2>
          {loadingProducts ? (
            <div className="text-center">Cargando productos...</div>
          ) : (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
              {featuredProducts?.map((product: Product) => (
                <Link
                  key={product.id}
                  to={`/productos/${product.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
                    {product.mainImageUrl ? (
                      <img
                        src={product.mainImageUrl}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
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
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Necesitas ayuda con tu evento?
          </h2>
          <p className="text-xl mb-8">
            Nuestro equipo de expertos está aquí para asesorarte
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/contacto"
              className="bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Contactar Ahora
            </Link>
            <Link
              to="/productos"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition"
            >
              Ver Catálogo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
