import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/product.service';
import { Product, Category } from '../types';
import { Calendar, Users, Package, Shield, Music, Lightbulb, Video, Calculator, CheckCircle, MapPin, ArrowRight } from 'lucide-react';
import SEOHead from '../components/SEO/SEOHead';
import { getLocalBusinessSchema, getOrganizationSchema, getWebSiteSchema } from '../components/SEO/schemas';
import { getImageUrl, placeholderImage } from '../utils/imageUrl';

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
        title="ReSona Events Valencia - Alquiler Profesional de Equipos Audiovisuales"
        description="Alquiler de equipos audiovisuales profesionales para eventos en Valencia. Sonido, iluminación, pantallas LED, equipos DJ. Servicio técnico completo con montaje e instalación. Presupuesto online gratis."
        keywords="alquiler sonido valencia, alquiler iluminación valencia, alquiler material eventos valencia, equipos audiovisuales valencia, sonido profesional valencia, iluminación eventos valencia, pantallas LED valencia, equipos DJ valencia, bodas valencia, conciertos valencia, eventos corporativos valencia"
        ogImage="https://resonaevents.com/og-image.jpg"
        canonicalUrl="https://resonaevents.com/"
        schema={[
          getLocalBusinessSchema(),
          getOrganizationSchema(),
          getWebSiteSchema(),
        ]}
      />
      {/* Hero Section */}
      <section className="relative bg-resona text-white overflow-hidden">
        {/* Overlay oscuro para mejor contraste y suavizar el color */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/15 to-black/20"></div>
        
        {/* Pattern overlay sutil */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
              Equipos Audiovisuales Profesionales para tu Evento en Valencia
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/90 mb-6">
              Con montaje incluido o solo alquiler, tú decides
            </p>
            
            {/* Services Icons */}
            <div className="flex items-center justify-center gap-6 mb-8 text-white/90">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                <span className="text-lg font-medium">Sonido</span>
              </div>
              <span className="text-2xl">·</span>
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                <span className="text-lg font-medium">Iluminación</span>
              </div>
              <span className="text-2xl">·</span>
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                <span className="text-lg font-medium">Vídeo</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Link
                to="/calculadora"
                className="group bg-white text-resona px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2"
              >
                <Calculator className="w-5 h-5" />
                Calcula tu Presupuesto
              </Link>
              <Link
                to="/productos"
                className="group bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/20 transition-all border-2 border-white/30 hover:border-white/50 flex items-center justify-center gap-2"
              >
                <Package className="w-5 h-5" />
                Ver Catálogo Completo
              </Link>
            </div>

            {/* Benefits */}
            <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto text-sm md:text-base">
              <div className="flex items-center justify-center gap-2 text-white/90">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>Montaje e instalación incluidos</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-white/90">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>+500 eventos realizados</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-white/90">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>Equipos profesionales</span>
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
                  to={`/productos?category=${category.slug}`}
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
                        src={getImageUrl(product.mainImageUrl)}
                        alt={`Alquiler ${product.name} - ${product.category?.name || 'Equipos profesionales'} para eventos | ReSona Events Valencia`}
                        loading="lazy"
                        className="w-full h-48 object-contain bg-white group-hover:scale-105 transition"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = placeholderImage;
                        }}
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
                          <p className="text-xs text-gray-400 mt-1">Precio por unidad y día. IVA no incluido</p>
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

      {/* Servicios Locales Valencia */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
              <MapPin className="text-resona" size={32} />
              Alquiler de Equipos en Valencia
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Servicio profesional de alquiler de sonido, iluminación y audiovisuales en Valencia y área metropolitana. Entrega e instalación GRATIS.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Alquiler Altavoces */}
            <Link 
              to="/alquiler-altavoces-valencia"
              className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100 hover:border-purple-300"
            >
              <div className="flex items-start justify-between mb-3">
                <Music className="text-purple-600" size={28} />
                <ArrowRight className="text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" size={20} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">Alquiler Altavoces Valencia</h3>
              <p className="text-gray-600 text-sm mb-3">JBL, QSC, Yamaha. Desde 35€/día</p>
              <span className="text-purple-600 text-sm font-semibold">Ver más →</span>
            </Link>

            {/* Alquiler Sonido */}
            <Link 
              to="/alquiler-sonido-valencia"
              className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100 hover:border-blue-300"
            >
              <div className="flex items-start justify-between mb-3">
                <Music className="text-blue-600" size={28} />
                <ArrowRight className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={20} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">Alquiler Sonido Valencia</h3>
              <p className="text-gray-600 text-sm mb-3">Equipos completos para eventos, bodas, fiestas</p>
              <span className="text-blue-600 text-sm font-semibold">Ver más →</span>
            </Link>

            {/* Alquiler Iluminación */}
            <Link 
              to="/alquiler-iluminacion-valencia"
              className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100 hover:border-orange-300"
            >
              <div className="flex items-start justify-between mb-3">
                <Lightbulb className="text-orange-600" size={28} />
                <ArrowRight className="text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" size={20} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">Alquiler Iluminación Valencia</h3>
              <p className="text-gray-600 text-sm mb-3">Focos LED, cabezas móviles, láseres. Desde 25€/día</p>
              <span className="text-orange-600 text-sm font-semibold">Ver más →</span>
            </Link>

            {/* Sonido Bodas */}
            <Link 
              to="/sonido-bodas-valencia"
              className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100 hover:border-pink-300"
            >
              <div className="flex items-start justify-between mb-3">
                <Music className="text-pink-600" size={28} />
                <ArrowRight className="text-gray-400 group-hover:text-pink-600 group-hover:translate-x-1 transition-all" size={20} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">Sonido para Bodas Valencia</h3>
              <p className="text-gray-600 text-sm mb-3">Ceremonia, banquete y disco. Packs completos</p>
              <span className="text-pink-600 text-sm font-semibold">Ver más →</span>
            </Link>

            {/* Alquiler Sonido Torrent */}
            <Link 
              to="/alquiler-sonido-torrent"
              className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100 hover:border-green-300"
            >
              <div className="flex items-start justify-between mb-3">
                <MapPin className="text-green-600" size={28} />
                <ArrowRight className="text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" size={20} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">Alquiler Sonido Torrent</h3>
              <p className="text-gray-600 text-sm mb-3">Servicio en Torrent y comarca. Entrega gratis</p>
              <span className="text-green-600 text-sm font-semibold">Ver más →</span>
            </Link>

            {/* Calculadora */}
            <Link 
              to="/calculadora-evento"
              className="group bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-xl shadow-md hover:shadow-xl transition-all p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <Calculator className="text-white" size={28} />
                <ArrowRight className="text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" size={20} />
              </div>
              <h3 className="font-bold text-lg mb-2">Calcula tu Presupuesto</h3>
              <p className="text-white/90 text-sm mb-3">Presupuesto online en 2 minutos. GRATIS</p>
              <span className="text-white font-semibold">Calcular ahora →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 bg-resona text-white overflow-hidden">
        {/* Overlay para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/15 to-black/20"></div>
        
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Necesitas ayuda con tu evento?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Nuestro equipo de expertos está aquí para asesorarte
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/contacto"
              className="bg-white text-resona px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Contactar Ahora
            </Link>
            <Link
              to="/productos"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-resona transition"
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
