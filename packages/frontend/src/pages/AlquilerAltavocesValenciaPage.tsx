import React from 'react';
import { Link } from 'react-router-dom';
import { Volume2, Phone, MapPin, Star, CheckCircle, ArrowRight, Shield, Clock, Truck } from 'lucide-react';
import SEOHead from '../components/SEO/SEOHead';
import { getLocalBusinessSchema, getFAQSchema } from '../components/SEO/schemas';

const AlquilerAltavocesValenciaPage = () => {
  const faqData = [
    {
      question: '¿Cuánto cuesta alquilar altavoces en Valencia?',
      answer: 'El alquiler de altavoces en Valencia desde 35€/día por pareja de altavoces activos de 400W. Para eventos medianos (100-200 personas) desde 120€/día, y para eventos grandes (300-500 personas) desde 250€/día. Todos los precios incluyen transporte en Valencia capital y área metropolitana. Ofrecemos descuentos para alquileres de fin de semana completo y eventos de varios días.',
    },
    {
      question: '¿Qué tipos de altavoces tienen disponibles para alquilar?',
      answer: 'Disponemos de altavoces activos profesionales de marcas como JBL (EON, PRX, SRX), QSC (K Series, CP Series), Mackie Thump, Yamaha DXR/DBR. Potencias desde 400W hasta 2000W por unidad. También tenemos subwoofers activos de 15" y 18" (1000W-2000W), altavoces de línea array para eventos grandes, monitores de escenario, y sistemas portátiles para presentaciones. Todo el equipo es profesional y certificado.',
    },
    {
      question: '¿Los altavoces incluyen cables y soportes?',
      answer: 'Sí, todos nuestros alquileres de altavoces incluyen: cables XLR profesionales de la longitud necesaria, soportes/trípodes regulables en altura (hasta 2.5m), protección de cables si es necesario, y manual de conexión rápida. También incluimos el transporte, montaje y desmontaje en Valencia capital sin coste adicional.',
    },
    {
      question: '¿Entregan los altavoces a domicilio en Valencia?',
      answer: 'Sí, realizamos entregas en toda Valencia capital (gratis), y en toda el área metropolitana: Mislata, Paterna, Torrent, Burjassot, Manises, Xirivella, Alboraya, Alfafar, Sedaví, Quart de Poblet, etc. Para zonas más alejadas consultanos disponibilidad. Horarios flexibles de entrega: días laborables 9:00-20:00h, sábados 10:00-14:00h y 17:00-20:00h.',
    },
    {
      question: '¿Necesito conocimientos técnicos para usar los altavoces?',
      answer: 'No necesariamente. Nuestros altavoces activos son plug-and-play: solo necesitas conectar la fuente de audio (móvil, portátil, mesa de mezclas) y encenderlos. Incluimos instrucciones simples. Si tu evento requiere montaje complejo (varios altavoces, micrófonos, mesa de mezclas), ofrecemos servicio técnico profesional desde 80€. También hacemos instalación gratuita si lo necesitas.',
    },
    {
      question: '¿Qué potencia de altavoces necesito para mi evento?',
      answer: 'Depende del tipo de evento y número de asistentes: Para eventos pequeños (hasta 50 personas): 2x 400W-600W. Para eventos medianos (50-150 personas): 2x 800W-1200W + subwoofer. Para eventos grandes (150-300 personas): 2x 1500W-2000W + 2 subwoofers. Para más de 300 personas: Sistema line array o múltiples torres. Te asesoramos gratis según tus necesidades.',
    },
    {
      question: '¿Alquiláis altavoces para bodas en Valencia?',
      answer: 'Sí, somos especialistas en alquiler de altavoces para bodas en Valencia. Ofrecemos sistemas completos que incluyen altavoces para ceremonia (discretos y potentes), equipos para cocktail/aperitivo, y sistema profesional para el banquete y fiesta. Trabajamos con más de 150 bodas al año en Valencia. Incluimos asesoramiento, montaje, técnico durante el evento si lo necesitas, y recogida. Paquetes desde 250€.',
    },
    {
      question: '¿Los altavoces están asegurados?',
      answer: 'Sí, todos nuestros equipos tienen seguro a todo riesgo. Solicitamos un depósito reembolsable (100-200€ según el equipo) que se devuelve íntegramente tras comprobar el estado del material. Para eventos en exteriores o con alto riesgo, recomendamos contratar seguro adicional. Nuestros altavoces profesionales son robustos y están diseñados para uso intensivo en eventos.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="Alquiler Altavoces Valencia 🔊 Desde 35€/día | JBL, QSC, Yamaha"
        description="✅ Altavoces profesionales Valencia: JBL, QSC, Yamaha 400W-2000W. Instalación GRATIS en Valencia y área metropolitana. ⭐ 4.9/5. Eventos, bodas, fiestas. Presupuesto 24h ☎️ 613881414"
        keywords="alquiler altavoces valencia, alquiler altavoces profesionales valencia, alquiler altavoces activos valencia, alquiler altavoces eventos valencia, alquiler PA valencia, alquiler altavoces JBL valencia, alquiler altavoces baratos valencia, alquiler sonido valencia"
        canonicalUrl="https://resonaevents.com/alquiler-altavoces-valencia"
        schema={[getLocalBusinessSchema(), getFAQSchema(faqData)]}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-blue-600 to-resona text-white py-16">
        <div className="container mx-auto px-4">
          <nav className="text-sm mb-6 opacity-90">
            <Link to="/" className="hover:underline">Inicio</Link>
            <span className="mx-2">›</span>
            <Link to="/productos" className="hover:underline">Productos</Link>
            <span className="mx-2">›</span>
            <span>Alquiler Altavoces Valencia</span>
          </nav>
          
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Alquiler de Altavoces Profesionales en Valencia
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Altavoces activos y pasivos de primera calidad: JBL, QSC, Yamaha, Mackie. 
              Desde 400W hasta 2000W. Ideal para bodas, eventos, conciertos y fiestas.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span>Desde 35€/día</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Truck className="w-5 h-5" />
                <span>Entrega gratis Valencia</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Shield className="w-5 h-5" />
                <span>Equipo certificado</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Clock className="w-5 h-5" />
                <span>Disponible 24/7</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/productos?category=sonido"
                className="bg-white text-resona px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
              >
                <Volume2 className="w-5 h-5" />
                Ver Altavoces Disponibles
              </Link>
              <a
                href="tel:+34613881414"
                className="bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition-colors inline-flex items-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Llamar: 613 88 14 14
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
              Alquiler de Altavoces en Valencia: Calidad Profesional al Mejor Precio
            </h2>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                En <strong>ReSona Events</strong> somos especialistas en <strong>alquiler de altavoces profesionales en Valencia</strong> desde hace más de 10 años. Contamos con el equipamiento más avanzado del mercado: <strong>altavoces activos JBL</strong> (serie EON, PRX, SRX), <strong>QSC K-Series y CP-Series</strong>, <strong>Yamaha DXR y DBR</strong>, y <strong>Mackie Thump</strong>, todos con potencias desde 400W hasta 2000W por unidad.
              </p>

              <p className="text-gray-700 leading-relaxed mb-6">
                Ya sea para una <strong>boda en Valencia</strong>, un <strong>concierto</strong>, <strong>evento corporativo</strong>, <strong>fiesta privada</strong> o <strong>presentación</strong>, tenemos el <strong>sistema de altavoces perfecto</strong> para tu evento. Nuestro servicio incluye <strong>entrega e instalación gratuita</strong> en Valencia capital y área metropolitana.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                ¿Por Qué Alquilar Altavoces con ReSona Events?
              </h3>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Volume2 className="w-6 h-6 text-resona flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Equipo Profesional Certificado</h4>
                      <p className="text-gray-700 text-sm">
                        Todos nuestros altavoces son de marcas líderes (JBL, QSC, Yamaha, Mackie) y pasan revisión técnica antes de cada alquiler. Garantía de funcionamiento 100%.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Truck className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Entrega Gratis en Valencia</h4>
                      <p className="text-gray-700 text-sm">
                        Llevamos y recogemos los altavoces en tu ubicación sin coste adicional en Valencia ciudad y área metropolitana (Mislata, Paterna, Torrent, Burjassot...).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Todo Incluido</h4>
                      <p className="text-gray-700 text-sm">
                        Cables XLR profesionales, soportes regulables, protección de cables, y manual de uso. También ofrecemos servicio de instalación profesional.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-6 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Star className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Asesoramiento Experto</h4>
                      <p className="text-gray-700 text-sm">
                        Te ayudamos a elegir el sistema perfecto según tu evento, número de asistentes, y tipo de música. Más de 500 eventos exitosos en Valencia.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-6">
                Catálogo de Altavoces Profesionales en Alquiler
              </h3>

              <div className="space-y-6">
                <div className="border-l-4 border-resona pl-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    Altavoces Activos 400W-600W
                  </h4>
                  <p className="text-gray-700 mb-2">
                    <strong>Ideal para:</strong> Presentaciones, fiestas pequeñas (hasta 50 personas), background music.
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Modelos:</strong> JBL EON 615, Mackie Thump 15A, Yamaha DBR12.
                  </p>
                  <p className="text-resona font-semibold">
                    Desde 35€/día • Pareja desde 60€/día
                  </p>
                </div>

                <div className="border-l-4 border-blue-600 pl-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    Altavoces Activos 800W-1200W
                  </h4>
                  <p className="text-gray-700 mb-2">
                    <strong>Ideal para:</strong> Bodas (50-150 personas), eventos corporativos, fiestas medianas.
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Modelos:</strong> JBL PRX 815, QSC K12.2, Yamaha DXR15.
                  </p>
                  <p className="text-blue-600 font-semibold">
                    Desde 60€/día • Pareja desde 110€/día
                  </p>
                </div>

                <div className="border-l-4 border-purple-600 pl-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    Altavoces Activos 1500W-2000W + Subwoofer
                  </h4>
                  <p className="text-gray-700 mb-2">
                    <strong>Ideal para:</strong> Eventos grandes (150-300 personas), conciertos, discotecas móviles.
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Modelos:</strong> JBL SRX 815P, QSC KW153, + Subwoofer 18" 2000W.
                  </p>
                  <p className="text-purple-600 font-semibold">
                    Desde 140€/día • Sistema completo desde 250€/día
                  </p>
                </div>

                <div className="border-l-4 border-green-600 pl-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    Sistemas Line Array (300+ personas)
                  </h4>
                  <p className="text-gray-700 mb-2">
                    <strong>Ideal para:</strong> Conciertos, festivales, eventos corporativos grandes, bodas premium.
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Incluye:</strong> Torres line array, subwoofers dobles, procesador digital, técnico especializado.
                  </p>
                  <p className="text-green-600 font-semibold">
                    Presupuesto personalizado • Desde 450€/evento
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-resona/10 to-blue-100 p-8 rounded-xl mt-12 mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-resona" />
                  Zonas de Entrega en Valencia
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Valencia Ciudad</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Ciutat Vella</li>
                      <li>• Eixample</li>
                      <li>• Extramurs</li>
                      <li>• Campanar</li>
                      <li>• La Saïdia</li>
                      <li>• El Pla del Real</li>
                      <li>• Quatre Carreres</li>
                      <li>• Poblats Marítims</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Área Metropolitana</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Mislata</li>
                      <li>• Paterna</li>
                      <li>• Torrent</li>
                      <li>• Burjassot</li>
                      <li>• Manises</li>
                      <li>• Xirivella</li>
                      <li>• Alboraya</li>
                      <li>• Alfafar</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Zona Ampliada</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Sedaví</li>
                      <li>• Quart de Poblet</li>
                      <li>• Aldaia</li>
                      <li>• Picanya</li>
                      <li>• Paiporta</li>
                      <li>• Alaquàs</li>
                      <li>• Massanassa</li>
                      <li>• + Consultar otras zonas</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Preguntas Frecuentes sobre Alquiler de Altavoces en Valencia
            </h2>
            <div className="space-y-6">
              {faqData.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Final */}
          <div className="bg-gradient-to-r from-resona to-blue-600 text-white rounded-xl shadow-2xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              ¿Listo para Alquilar Altavoces Profesionales en Valencia?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Presupuesto gratis en 24h • Entrega e instalación incluida
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="tel:+34613881414"
                className="bg-white text-resona px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Llamar: 613 88 14 14
              </a>
              <Link
                to="/contacto"
                className="bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition-colors inline-flex items-center gap-2"
              >
                Pedir Presupuesto
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AlquilerAltavocesValenciaPage;
