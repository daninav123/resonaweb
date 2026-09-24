import SEOHead from '../components/SEO/SEOHead';
import { Users, Award, Target, Heart, Zap, Shield, TrendingUp, CheckCircle } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-ink">
      <SEOHead
        title="Sobre ReSona Rent | Alquiler Audiovisual en Valencia"
        description="ReSona Rent, empresa líder en Valencia especializada en alquiler de equipos profesionales para eventos: sonido, iluminación y audiovisuales. Más de experiencia desde 2011."
        keywords="resona rent valencia, empresa alquiler equipos valencia, alquiler sonido valencia, producción eventos valencia, alquiler iluminación valencia"
        canonicalUrl="https://resonarent.com/sobre-nosotros"
      />

      {/* Hero Section */}
      <section className="relative bg-resona text-white py-20 overflow-hidden">
        {/* Overlay para mejor legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/15 to-black/20"></div>
        
        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Sobre Resona Rent</h1>
            <p className="text-xl text-white/90">
              Transformando eventos en experiencias inolvidables desde hace experiencia desde 2011
            </p>
          </div>
        </div>
      </section>

      {/* Nuestra Historia */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-cream mb-4">Nuestra Historia</h2>
              <div className="w-20 h-1 bg-resona mx-auto"></div>
            </div>
            
            <div className="bg-ink-800 rounded-lg shadow-md p-8 mb-8">
              <p className="text-lg text-cream/75 mb-6 leading-relaxed">
                Resona Rent nació en 2014 con una visión clara: <strong>democratizar el acceso a equipos audiovisuales profesionales</strong> 
                para todo tipo de eventos. Lo que comenzó como una pequeña empresa familiar en Valencia, ha crecido hasta convertirse 
                en uno de los proveedores de referencia en el sector.
              </p>
              <p className="text-lg text-cream/75 mb-6 leading-relaxed">
                Nuestro fundador, con experiencia desde 2011 en el sector audiovisual, identificó la necesidad de ofrecer un 
                servicio de alquiler que combinara <strong>calidad profesional, precios competitivos y atención personalizada</strong>. 
                Desde entonces, hemos equipado más de <strong>5,000 eventos exitosos</strong>, desde bodas íntimas hasta grandes festivales.
              </p>
              <p className="text-lg text-cream/75 leading-relaxed">
                Hoy, contamos con un amplio catálogo de equipos de última generación, un equipo de profesionales apasionados y 
                la confianza de miles de clientes que repiten año tras año.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Nuestros Valores */}
      <section className="py-16 bg-ink-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-cream mb-4">Nuestros Valores</h2>
            <div className="w-20 h-1 bg-resona mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="bg-resona/15 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-resona-light" />
              </div>
              <h3 className="text-xl font-bold text-cream mb-2">Calidad</h3>
              <p className="text-cream/65">
                Equipos profesionales de última generación, mantenidos y actualizados constantemente
              </p>
            </div>

            <div className="text-center">
              <div className="bg-emerald-500/15 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-cream mb-2">Cercanía</h3>
              <p className="text-cream/65">
                Atención personalizada y asesoramiento experto en cada proyecto
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-resona to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-resona-light" />
              </div>
              <h3 className="text-xl font-bold text-cream mb-2">Confianza</h3>
              <p className="text-cream/65">
                Transparencia en precios, contratos claros y servicio garantizado
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-cream mb-2">Innovación</h3>
              <p className="text-cream/65">
                Tecnología de vanguardia y procesos optimizados para tu comodidad
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Nuestra Misión y Visión */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-ink-800 rounded-lg shadow-md p-8">
              <div className="flex items-center mb-4">
                <Target className="w-8 h-8 text-resona-light mr-3" />
                <h3 className="text-2xl font-bold text-cream">Nuestra Misión</h3>
              </div>
              <p className="text-cream/75 leading-relaxed">
                Hacer accesible la tecnología audiovisual profesional a organizadores de eventos de todos los tamaños, 
                proporcionando equipos de alta calidad, servicio excepcional y asesoramiento experto que garantice 
                el éxito de cada celebración.
              </p>
            </div>

            <div className="bg-ink-800 rounded-lg shadow-md p-8">
              <div className="flex items-center mb-4">
                <TrendingUp className="w-8 h-8 text-resona-light mr-3" />
                <h3 className="text-2xl font-bold text-cream">Nuestra Visión</h3>
              </div>
              <p className="text-cream/75 leading-relaxed">
                Ser la empresa de referencia en alquiler de material audiovisual en España, reconocida por nuestra 
                innovación tecnológica, excelencia en el servicio y compromiso con el éxito de nuestros clientes 
                en cada evento que realizan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Por Qué Elegirnos */}
      <section className="py-16 bg-ink-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-cream mb-4">¿Por Qué Elegir Resona?</h2>
              <div className="w-20 h-1 bg-resona mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <CheckCircle className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-cream mb-1">Equipos Premium</h4>
                  <p className="text-cream/65">Material profesional de marcas líderes como Sony, Shure, JBL y Canon</p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-cream mb-1">Disponibilidad 24/7</h4>
                  <p className="text-cream/65">Reserva online en cualquier momento y consulta disponibilidad en tiempo real</p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-cream mb-1">Entrega e Instalación</h4>
                  <p className="text-cream/65">Servicio completo de transporte, montaje y recogida</p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-cream mb-1">Soporte Técnico</h4>
                  <p className="text-cream/65">Asistencia técnica durante todo tu evento</p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-cream mb-1">Precios Transparentes</h4>
                  <p className="text-cream/65">Sin costes ocultos ni sorpresas, calculadora online incluida</p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-cream mb-1">Garantía Total</h4>
                  <p className="text-cream/65">Todos nuestros equipos están asegurados y respaldados</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="py-16 bg-gradient-to-r from-resona to-resona-dark text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
            <div>
              <div className="text-5xl font-bold mb-2">10+</div>
              <div className="text-blue-100">Años de Experiencia</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">5,000+</div>
              <div className="text-blue-100">Eventos Realizados</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Equipos Disponibles</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">98%</div>
              <div className="text-blue-100">Clientes Satisfechos</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center bg-ink-800 rounded-lg shadow-md p-8">
            <Users className="w-16 h-16 text-resona-light mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-cream mb-4">¿Listo para tu próximo evento?</h2>
            <p className="text-lg text-cream/65 mb-6">
              Únete a miles de clientes satisfechos que confían en Resona Rent para sus celebraciones más importantes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/productos"
                className="inline-block bg-resona text-white px-8 py-3 rounded-lg font-semibold hover:bg-resona-dark transition"
              >
                Ver Catálogo
              </a>
              <a
                href="/contacto"
                className="inline-block bg-ink-800 text-resona-light border-2 border-resona px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Contactar
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
