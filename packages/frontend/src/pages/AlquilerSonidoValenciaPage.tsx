import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Phone, MapPin, Star, CheckCircle, ArrowRight } from 'lucide-react';
import SEOHead from '../components/SEO/SEOHead';
import { getLocalBusinessSchema, getFAQSchema } from '../components/SEO/schemas';

const AlquilerSonidoValenciaPage = () => {
  const faqData = [
    {
      question: '¿Cuánto cuesta alquilar sonido profesional en Valencia?',
      answer: 'El precio del alquiler de sonido en Valencia varía según el tipo de equipo y la duración. Nuestros altavoces profesionales empiezan desde 35€/día, con sistemas completos desde 150€/día. Ofrecemos presupuestos personalizados sin compromiso. Incluimos entrega en Valencia capital y área metropolitana.',
    },
    {
      question: '¿Entregan el equipo de sonido a domicilio en Valencia?',
      answer: 'Sí, realizamos entregas en toda Valencia capital y municipios cercanos como Mislata, Paterna, Torrent, Burjassot, Manises y Xirivella. El transporte está incluido en nuestras tarifas. También ofrecemos servicio técnico de instalación y montaje profesional.',
    },
    {
      question: '¿Qué equipos de sonido tienen disponibles?',
      answer: 'Disponemos de altavoces activos y pasivos (JBL, Mackie, QSC), subwoofers de 15" y 18", mesas de mezclas analógicas y digitales, microfonía inalámbrica profesional (Shure, Sennheiser), cables XLR, y sistemas completos para eventos de 50 a 500 personas. Todo el material está certificado y en perfecto estado.',
    },
    {
      question: '¿Necesito técnico de sonido para mi evento?',
      answer: 'Depende de la complejidad del evento. Para eventos simples (presentaciones, pequeñas fiestas), el equipo es plug-and-play. Para bodas, conciertos o eventos corporativos, recomendamos nuestro servicio técnico profesional. Nuestros técnicos tienen más de 10 años de experiencia en eventos en Valencia.',
    },
    {
      question: '¿Cuál es el plazo mínimo de reserva?',
      answer: 'Aceptamos reservas desde 24 horas antes (sujeto a disponibilidad), pero recomendamos reservar con 1-2 semanas de antelación, especialmente para fines de semana y temporada alta (mayo-octubre). El alquiler mínimo es de 1 día.',
    },
    {
      question: '¿Qué incluye el servicio de alquiler de sonido en Valencia?',
      answer: 'Nuestro servicio incluye el transporte y entrega de equipos en Valencia, asesoramiento técnico gratuito, equipos probados y certificados, cables y conectores necesarios. Opcionalmente ofrecemos montaje, instalación técnica, operador de sonido durante el evento y recogida post-evento.',
    },
    {
      question: '¿Alquilan sonido para bodas en Valencia?',
      answer: 'Sí, somos especialistas en sonido para bodas en Valencia. Ofrecemos paquetes completos que incluyen sistema de sonido para ceremonia (micrófonos inalámbricos), equipo para banquete y sistema de altavoces profesionales para la fiesta. Más de 200 bodas realizadas con éxito en Valencia y provincia.',
    },
    {
      question: '¿Tienen seguro para los equipos de sonido?',
      answer: 'Todos nuestros equipos están asegurados y en perfecto estado de funcionamiento. Solicitamos un depósito de seguridad reembolsable. En caso de daño accidental durante el evento, el depósito cubre reparaciones menores. Para eventos grandes, recomendamos contratar seguro de responsabilidad civil adicional.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="Alquiler Sonido Valencia 🔊 Desde 35€/día | Eventos, Bodas, Fiestas"
        description="✅ Alquiler de sonido profesional en Valencia y área metropolitana. Equipos JBL, QSC, Yamaha. Instalación GRATIS. 15 años de experiencia. Presupuesto en 24h. ⭐ 4.9/5 estrellas. ☎️ 613881414"
        keywords="alquiler sonido valencia, alquiler altavoces valencia, alquiler equipos sonido valencia, sonido profesional valencia, alquiler PA valencia, sistema sonido eventos valencia, alquiler subwoofer valencia"
        canonicalUrl="https://resonaevents.com/alquiler-sonido-valencia"
        schema={[getLocalBusinessSchema(), getFAQSchema(faqData)]}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-resona via-blue-500 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <nav className="text-sm mb-6 opacity-90">
            <Link to="/" className="hover:underline">Inicio</Link>
            <span className="mx-2">›</span>
            <span>Alquiler Sonido Valencia</span>
          </nav>
          
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Alquiler de Sonido Profesional en Valencia
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Equipos de audio de primera calidad para tu evento. Desde bodas hasta conciertos. 
              Entrega en Valencia capital y área metropolitana.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span>Entrega incluida</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span>Técnicos certificados</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span>Desde 35€/día</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/productos"
                className="bg-white text-resona px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
              >
                Ver Equipos Disponibles
                <ArrowRight className="w-5 h-5" />
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
              Tu Partner en Sonido Profesional para Eventos en Valencia
            </h2>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-4">
                <strong>ReSona Events</strong> es tu empresa de confianza para el <strong>alquiler de equipos de sonido profesional en Valencia</strong>. 
                Con más de 10 años de experiencia en el sector audiovisual, ofrecemos soluciones completas de audio para todo tipo de eventos: 
                bodas, conciertos, eventos corporativos, fiestas privadas, conferencias y presentaciones.
              </p>

              <p className="text-gray-700 mb-4">
                Nuestro catálogo incluye <strong>altavoces activos y pasivos de alta gama</strong> (JBL EON, Mackie Thump, QSC K Series), 
                <strong>subwoofers de 15" y 18"</strong> para graves profundos, <strong>mesas de mezclas digitales y analógicas</strong> 
                (Behringer X32, Yamaha MG Series), y <strong>microfonía inalámbrica profesional</strong> de marcas como Shure y Sennheiser. 
                Todo nuestro material está certificado, se revisa antes de cada alquiler y cumple con las normativas de seguridad vigentes.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                Cobertura en Valencia y Área Metropolitana
              </h3>

              <p className="text-gray-700 mb-4">
                Realizamos entregas en <strong>Valencia capital</strong> y todos los barrios: Ciutat Vella, L'Eixample, Extramurs, 
                Campanar, La Saïdia, El Pla del Real, Olivereta, Patraix, Jesús, Quatre Carreres, Poblats Marítims, Camins al Grau, 
                Algirós, Benimaclet, Rascanya y Benicalap.
              </p>

              <p className="text-gray-700 mb-4">
                También damos servicio en el <strong>área metropolitana de Valencia</strong>: Mislata, Paterna, Burjassot, Torrent, 
                Xirivella, Aldaia, Quart de Poblet, Manises, Alaquàs, Picanya, Paiporta, Alfafar, Massanassa, Sedaví, Benetússer, 
                y otros municipios cercanos. Consulta disponibilidad para tu zona.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                Tipos de Eventos que Cubrimos en Valencia
              </h3>

              <div className="grid md:grid-cols-2 gap-4 my-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-resona mb-2">🎵 Bodas y Celebraciones</h4>
                  <p className="text-sm text-gray-700">
                    Sonido cristalino para ceremonia, cóctel y banquete. Microfonía inalámbrica para discursos. 
                    Equipos probados en más de 200 bodas en Valencia.
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-bold text-purple-600 mb-2">🎸 Conciertos y Festivales</h4>
                  <p className="text-sm text-gray-700">
                    Sistemas line array, backline completo, monitores de escenario. 
                    Experiencia en salas como 16 Toneladas, Loco Club y eventos al aire libre.
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-bold text-green-600 mb-2">💼 Eventos Corporativos</h4>
                  <p className="text-sm text-gray-700">
                    Presentaciones empresariales, conferencias, ferias. Sonido discreto y profesional. 
                    Micrófonos de solapa, atril y de mano. Compatibilidad con presentaciones multimedia.
                  </p>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-bold text-orange-600 mb-2">🎉 Fiestas Privadas</h4>
                  <p className="text-sm text-gray-700">
                    Cumpleaños, aniversarios, fiestas de empresa. Equipos compactos y potentes. 
                    Conexión Bluetooth, USB y auxiliar para tu música favorita.
                  </p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                ¿Por Qué Elegir ReSona Events para tu Alquiler de Sonido?
              </h3>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>Equipos de Última Generación:</strong> Renovamos nuestro catálogo constantemente. 
                    Todo el material tiene menos de 3 años de antigüedad.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>Entrega y Recogida Incluidas:</strong> Nos encargamos del transporte en Valencia y alrededores. 
                    Sin costes ocultos.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>Técnicos Especializados:</strong> Ofrecemos servicio de instalación, montaje y operación. 
                    Formados en más de 500 eventos.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>Presupuestos Personalizados:</strong> Cada evento es único. Te asesoramos sin compromiso 
                    y ajustamos el equipo a tu presupuesto.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>Disponibilidad 24/7:</strong> Emergencias y eventos de última hora. 
                    Teléfono de contacto directo: 613 88 14 14.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>Mejor Precio Garantizado:</strong> Tarifas competitivas. Descuentos para alquileres de fin de semana 
                    y semana completa. Presupuesto online en nuestra calculadora.
                  </span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                Equipos de Sonido Más Solicitados en Valencia
              </h3>

              <p className="text-gray-700 mb-4">
                Nuestros <strong>altavoces JBL EON 615</strong> son perfectos para eventos medianos (100-150 personas). 
                Potencia de 1000W, peso ligero y sonido cristalino. Ideales para bodas en fincas de Valencia como 
                La Hacienda El Puente, Mas de San Pablo o Alquería de Morayma.
              </p>

              <p className="text-gray-700 mb-4">
                Para eventos grandes, nuestros <strong>sistemas line array</strong> ofrecen cobertura uniforme para 300-500 personas. 
                Perfectos para conciertos en Plaza del Ayuntamiento, Jardines de Viveros o eventos corporativos en La Marina de Valencia.
              </p>

              <p className="text-gray-700 mb-4">
                La <strong>mesa de mezclas Behringer X32</strong> es la favorita de DJ profesionales en Valencia. 
                32 canales, efectos integrados, grabación USB y control desde iPad. Compatible con todos nuestros sistemas de altavoces.
              </p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Preguntas Frecuentes sobre Alquiler de Sonido en Valencia
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
          <div className="bg-gradient-to-r from-resona to-blue-600 text-white rounded-xl p-8 mt-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              ¿Necesitas Sonido para tu Evento en Valencia?
            </h2>
            <p className="text-xl mb-6 text-blue-100">
              Presupuesto gratis en menos de 24 horas. Sin compromiso.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/calculadora-evento"
                className="bg-white text-resona px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
              >
                <Music className="w-5 h-5" />
                Calcular Presupuesto Online
              </Link>
              <a
                href="tel:+34613881414"
                className="bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition-colors inline-flex items-center gap-2 border-2 border-white"
              >
                <Phone className="w-5 h-5" />
                Llamar Ahora
              </a>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-blue-100">
              <MapPin className="w-5 h-5" />
              <span>Servicio en Valencia y área metropolitana (50km)</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AlquilerSonidoValenciaPage;
