import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Phone, MapPin, CheckCircle, ArrowRight } from 'lucide-react';
import SEOHead from '../components/SEO/SEOHead';
import { getLocalBusinessSchema, getFAQSchema } from '../components/SEO/schemas';

const AlquilerSonidoTorrentPage = () => {
  const faqData = [
    {
      question: '¿Cuánto cuesta alquilar sonido en Torrent?',
      answer: 'Los precios son los mismos que en Valencia capital: altavoces desde 35€/día, paquetes completos desde 150€/día. El transporte a Torrent está incluido sin coste adicional. Ofrecemos presupuestos personalizados según el tipo de evento y necesidades específicas.',
    },
    {
      question: '¿Hacéis entregas en todos los barrios de Torrent?',
      answer: 'Sí, realizamos entregas en todo Torrent: El Vedat, Sector Albuixarres, L\'Alter, Monte Vedat, Parc Central, y todas las zonas residenciales. También cubrimos pedanías cercanas. El servicio de transporte e instalación está incluido en nuestras tarifas.',
    },
    {
      question: '¿Trabajáis en salones de eventos de Torrent?',
      answer: 'Sí, hemos trabajado en los principales salones y espacios de eventos de Torrent: Centro Cultural La Estación, Casa de la Cultura, Polideportivo Municipal, salones de celebraciones privados, y locales para eventos corporativos. Conocemos las características técnicas de cada espacio.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="Alquiler de Sonido en Torrent | Equipos Profesionales ReSona Events"
        description="Alquiler de sonido profesional en Torrent, Valencia. Altavoces, microfonía y equipos de audio para eventos, bodas y fiestas. Entrega en Torrent y pedanías. Presupuesto gratis. ☎️ 613881414"
        keywords="alquiler sonido torrent, alquiler altavoces torrent, equipos audio torrent, sonido eventos torrent, sonido profesional torrent valencia"
        canonicalUrl="https://resonaevents.com/alquiler-sonido-torrent"
        schema={[getLocalBusinessSchema(), getFAQSchema(faqData)]}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <nav className="text-sm mb-6 opacity-90">
            <Link to="/" className="hover:underline">Inicio</Link>
            <span className="mx-2">›</span>
            <span>Alquiler Sonido Torrent</span>
          </nav>
          
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Alquiler de Sonido Profesional en Torrent
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Equipos de audio de alta calidad para tu evento en Torrent. Entrega y recogida incluidas en todo el municipio.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span>Entrega en Torrent</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span>Técnicos especializados</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span>Desde 35€/día</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/productos"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
              >
                Ver Equipos Disponibles
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="tel:+34613881414"
                className="bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition-colors inline-flex items-center gap-2"
              >
                <Phone className="w-5 h-5" />
                613 88 14 14
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido Principal */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Alquiler de Equipos de Sonido en Torrent, Valencia
            </h2>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-4">
                <strong>ReSona Events</strong> ofrece servicio de <strong>alquiler de equipos de sonido profesional en Torrent</strong>, 
                uno de los municipios más importantes del área metropolitana de Valencia. Con más de 10 años de experiencia en el sector 
                audiovisual, ponemos a tu disposición altavoces, subwoofers, mesas de mezclas, microfonía inalámbrica y equipos completos 
                para todo tipo de eventos en Torrent y sus barrios: El Vedat, Sector Albuixarres, L'Alter, Monte Vedat y Parc Central.
              </p>

              <p className="text-gray-700 mb-4">
                Torrent cuenta con numerosos espacios para eventos, tanto públicos como privados, y en <strong>ReSona Events</strong> 
                conocemos perfectamente las características técnicas de cada uno. Hemos realizado montajes de sonido en el 
                <strong>Centro Cultural La Estación</strong>, la <strong>Casa de la Cultura de Torrent</strong>, 
                el <strong>Polideportivo Municipal</strong>, y en decenas de salones de celebraciones y locales de eventos privados 
                en todo el municipio.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                Cobertura en Todos los Barrios de Torrent
              </h3>

              <p className="text-gray-700 mb-4">
                Realizamos entregas e instalaciones en todas las zonas de Torrent, incluyendo:
              </p>

              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>El Vedat:</strong> Zona residencial con numerosos chalets y jardines. Ideales para bodas y eventos privados 
                    al aire libre. Equipos con protección IP65 para exterior.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>Sector Albuixarres:</strong> Urbanizaciones modernas con amplios espacios comunes. 
                    Perfecto para eventos vecinales y fiestas de comunidad.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>L'Alter y Centro:</strong> Salones de eventos, locales comerciales, y espacios culturales. 
                    Equipos compactos para interiores con excelente acústica.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>Monte Vedat:</strong> Zona alta con vistas panorámicas. Eventos al aire libre con equipos potentes 
                    para compensar acústica abierta.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>Parc Central:</strong> Zona verde con instalaciones deportivas y culturales. 
                    Eventos públicos, conciertos y festivales locales.
                  </span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                Tipos de Eventos que Cubrimos en Torrent
              </h3>

              <div className="grid md:grid-cols-2 gap-4 my-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-600 mb-2">🎉 Fiestas y Celebraciones</h4>
                  <p className="text-sm text-gray-700">
                    Cumpleaños, comuniones, bautizos, aniversarios. Equipos compactos para viviendas unifamiliares 
                    y chalets en El Vedat. Sonido potente sin molestar a vecinos.
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-bold text-purple-600 mb-2">💒 Bodas</h4>
                  <p className="text-sm text-gray-700">
                    Ceremonias civiles en jardines de El Vedat, banquetes en salones de Torrent. 
                    Microfonía inalámbrica para votos y lecturas. Música ambiental personalizada.
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-bold text-green-600 mb-2">🏢 Eventos Corporativos</h4>
                  <p className="text-sm text-gray-700">
                    Presentaciones empresariales, ferias comerciales, inauguraciones. Sonido profesional 
                    para polígono industrial de Torrent. Compatible con videoconferencias.
                  </p>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-bold text-orange-600 mb-2">🎸 Conciertos y Festivales</h4>
                  <p className="text-sm text-gray-700">
                    Fiestas patronales de Torrent, conciertos en Parc Central, eventos culturales 
                    en La Estación. Sistemas line array para grandes audiencias.
                  </p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                Por Qué Elegir ReSona Events en Torrent
              </h3>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>Proximidad y Rapidez:</strong> Desde Valencia capital, llegamos a Torrent en menos de 20 minutos. 
                    Aceptamos reservas de última hora. Servicio de emergencia disponible.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>Transporte Incluido:</strong> No cobramos extra por desplazamiento a Torrent. 
                    Recogida y entrega en tu domicilio, salón, o ubicación del evento.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>Conocimiento Local:</strong> Hemos trabajado en más de 100 eventos en Torrent. 
                    Conocemos las mejores ubicaciones para equipos en cada espacio.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>Equipos de Última Generación:</strong> Altavoces JBL EON, Mackie Thump, QSC K Series. 
                    Tecnología LED y bajo consumo. Todo revisado antes de cada evento.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>Servicio Técnico Profesional:</strong> Técnicos especializados disponibles para instalación, 
                    configuración y operación durante el evento. Formación en eventos de 50 a 500 personas.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>Precios Competitivos:</strong> Tarifas ajustadas para particulares y empresas de Torrent. 
                    Descuentos para eventos recurrentes. Presupuesto online gratis en nuestra calculadora.
                  </span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                Equipos Disponibles para Alquiler en Torrent
              </h3>

              <p className="text-gray-700 mb-4">
                Nuestro catálogo completo incluye <strong>altavoces activos</strong> desde 300W hasta 2000W (JBL EON 615, 
                Mackie Thump 15A, QSC K12.2), <strong>subwoofers</strong> de 15" y 18" para graves potentes, 
                <strong>mesas de mezclas</strong> analógicas (Yamaha MG) y digitales (Behringer X32, Soundcraft Ui24R), 
                <strong>microfonía inalámbrica</strong> profesional (Shure SM58, Sennheiser EW), y todos los 
                <strong>cables y accesorios</strong> necesarios (XLR, jack, alimentación).
              </p>

              <p className="text-gray-700 mb-4">
                Para eventos en jardines y exteriores de El Vedat o Monte Vedat, disponemos de equipos con 
                <strong>protección IP65 contra lluvia y humedad</strong>. Para eventos corporativos en polígonos industriales, 
                ofrecemos <strong>sistemas modulares escalables</strong> desde 100 hasta 500 personas. Todo nuestro material 
                cumple normativas CE y pasa revisión técnica mensual.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                Solicita tu Presupuesto para Eventos en Torrent
              </h3>

              <p className="text-gray-700 mb-4">
                El proceso es simple: llámanos al <strong>613 88 14 14</strong> o usa nuestra 
                <Link to="/calculadora-evento" className="text-blue-600 font-semibold hover:underline"> calculadora online </Link> 
                para obtener un presupuesto instantáneo. Nos cuentas qué tipo de evento tienes (boda, cumpleaños, concierto, evento corporativo), 
                cuántos asistentes esperás, y la ubicación en Torrent. En menos de 24 horas recibirás un presupuesto detallado sin compromiso.
              </p>

              <p className="text-gray-700 mb-4">
                Si tu evento es en una ubicación que no conocemos (chalet privado, finca rural en pedanías de Torrent), 
                podemos realizar una <strong>visita técnica previa sin coste</strong> para evaluar necesidades de sonido, 
                puntos de corriente eléctrica, y mejores ubicaciones para altavoces. También coordinamos con otros proveedores 
                (catering, decoración, DJ) para asegurar que todo funcione perfectamente.
              </p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Preguntas Frecuentes - Alquiler Sonido Torrent
            </h2>
            
            <div className="space-y-6">
              {faqData.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-6 last:border-0">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-700">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Final */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              ¿Necesitas Sonido para tu Evento en Torrent?
            </h2>
            <p className="text-xl mb-6 text-blue-100">
              Presupuesto gratis en 24h. Entrega incluida en todo Torrent.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/calculadora-evento"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
              >
                <Music className="w-5 h-5" />
                Calcular Presupuesto
              </Link>
              <a
                href="tel:+34613881414"
                className="bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition-colors inline-flex items-center gap-2 border-2 border-white"
              >
                <Phone className="w-5 h-5" />
                613 88 14 14
              </a>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-blue-100">
              <MapPin className="w-5 h-5" />
              <span>Servicio en todo Torrent: El Vedat, Albuixarres, L'Alter, Monte Vedat y Parc Central</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AlquilerSonidoTorrentPage;
