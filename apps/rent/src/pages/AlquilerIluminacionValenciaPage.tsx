import React from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, Phone, MapPin, Star, CheckCircle, ArrowRight } from 'lucide-react';
import SEOHead from '../components/SEO/SEOHead';
import { getLocalBusinessSchema, getFAQSchema } from '../components/SEO/schemas';

const AlquilerIluminacionValenciaPage = () => {
  const faqData = [
    {
      question: '¿Cuánto cuesta alquilar iluminación para eventos en Valencia?',
      answer: 'El precio del alquiler de iluminación en Valencia varía según el tipo de luces y la cantidad necesaria. Nuestros focos LED básicos empiezan desde 25€/día, cabezas móviles desde 45€/día, y paquetes completos desde 200€/día. Ofrecemos presupuestos personalizados según tus necesidades específicas.',
    },
    {
      question: '¿Qué tipos de iluminación profesional alquiláis?',
      answer: 'Disponemos de focos LED RGB y RGBW, cabezas móviles (moving heads), focos PAR LED, cañones de luz, barras LED, efectos especiales (estroboscopios, láser), iluminación arquitectural, y sistemas DMX completos. Todo controlable mediante mesa DMX o control inalámbrico.',
    },
    {
      question: '¿Necesito técnico de iluminación para mi evento?',
      answer: 'Depende de la complejidad. Para eventos simples con iluminación estática, nuestros equipos son fáciles de usar. Para bodas, conciertos o eventos que requieran programación de escenas y efectos, recomendamos nuestro servicio de técnico profesional. Incluye programación previa, operación durante el evento y desmontaje.',
    },
    {
      question: '¿La iluminación incluye estructura de truss?',
      answer: 'Sí, ofrecemos estructuras de aluminio (truss) y portales de iluminación para colgar focos y cabezas móviles de forma segura. Incluyen sistemas de elevación y todos los elementos de seguridad necesarios. Cumplimos con normativas de montajes en espacios públicos de Valencia.',
    },
    {
      question: '¿Hacéis entregas en salones de eventos y fincas de Valencia?',
      answer: 'Sí, realizamos entregas en toda Valencia capital, área metropolitana y provincia. Hemos trabajado en las principales fincas (Mas de San Pablo, La Hacienda, Alquería de Morayma), salones (La Finca del Duque, La Hacienda), y espacios únicos como La Marina de Valencia y Jardines de Viveros.',
    },
    {
      question: '¿Qué marcas de iluminación profesional tenéis?',
      answer: 'Trabajamos con las mejores marcas del mercado: Chauvet Professional, American DJ, Showtec, Beamz, y equipos LED de última generación. Todos nuestros focos son LED de bajo consumo, iluminación RGB de amplio espectro cromático y cabezas móviles con efectos prism y gobo. Equipos profesionales homologados para eventos en Valencia.',
    },
    {
      question: '¿Podéis iluminar edificios y fachadas en Valencia?',
      answer: 'Sí, ofrecemos servicio de iluminación arquitectónica para edificios, fachadas, monumentos y espacios exteriores en Valencia. Utilizamos proyectores LED de alta potencia, iluminación RGB programable y sistemas wireless DMX. Ideal para eventos corporativos, inauguraciones y celebraciones especiales en Valencia.',
    },
    {
      question: '¿Incluye el alquiler de iluminación el montaje y desmontaje?',
      answer: 'El transporte está siempre incluido en Valencia capital. El montaje e instalación técnica es opcional con coste adicional según la complejidad. Para eventos grandes (bodas, conciertos, eventos corporativos) recomendamos nuestro servicio completo que incluye diseño lumínico, montaje, programación, operación y desmontaje. Presupuesto sin compromiso en 24 horas.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="Alquiler Iluminación Valencia desde 25€ · Focos LED"
        description="Alquiler de iluminación profesional en Valencia desde 25€/día. Focos LED RGB, cabezas móviles, láseres, control DMX. Técnico incluido. Presupuesto 24h ☎ 613 88 14 14"
        keywords="alquiler iluminacion valencia, alquiler luces led valencia, alquiler focos valencia, alquiler iluminacion de obra exterior, iluminacion profesional valencia"
        canonicalUrl="https://resonarent.com/alquiler-iluminacion-valencia"
        schema={[getLocalBusinessSchema(), getFAQSchema(faqData)]}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 text-white py-16">
        <div className="container mx-auto px-4">
          <nav className="text-sm mb-6 opacity-90">
            <Link to="/" className="hover:underline">Inicio</Link>
            <span className="mx-2">›</span>
            <span>Alquiler Iluminación Valencia</span>
          </nav>
          
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Alquiler de Iluminación Profesional en Valencia
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-pink-100">
              Iluminación LED de última generación para bodas, conciertos y eventos corporativos. 
              Crea ambientes únicos con nuestros equipos de iluminación profesional.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span>Tecnología LED</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span>Control DMX</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span>Desde 25€/día</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/productos?category=iluminacion"
                className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
              >
                Ver Catálogo Iluminación
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
              Iluminación LED Profesional para tu Evento en Valencia
            </h2>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-4">
                En <strong>ReSona Rent</strong> somos especialistas en <strong>alquiler de iluminación profesional en Valencia</strong>. 
                Transformamos cualquier espacio con nuestros equipos de iluminación LED de última generación. Ya sea para una boda elegante 
                en una finca valenciana, un concierto en vivo, o un evento corporativo en el centro de Valencia, tenemos la solución perfecta 
                de iluminación para crear el ambiente que buscas.
              </p>

              <p className="text-gray-700 mb-4">
                Nuestro catálogo incluye <strong>cabezas móviles LED</strong> con efectos de gobos y prismas, <strong>focos PAR LED RGBW</strong> 
                de 200W con millones de colores, <strong>barras LED</strong> para iluminación arquitectural, <strong>efectos especiales</strong> 
                como estroboscopios y máquinas de niebla con LED, y <strong>mesas controladoras DMX</strong> profesionales. Todos nuestros equipos 
                utilizan tecnología LED, lo que garantiza bajo consumo eléctrico, cero emisión de calor y colores vibrantes.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                Servicios de Iluminación en Valencia y Provincia
              </h3>

              <p className="text-gray-700 mb-4">
                Realizamos instalaciones de iluminación en toda la ciudad de <strong>Valencia</strong> (Ciutat Vella, Ruzafa, Campanar, 
                Benimaclet, Poblats Marítims) y en toda el <strong>área metropolitana</strong>: Mislata, Paterna, Torrent, Burjassot, 
                Manises, Quart de Poblet, Xirivella, Aldaia y Picanya.
              </p>

              <p className="text-gray-700 mb-4">
                También cubrimos eventos en la <strong>provincia de Valencia</strong>: Cullera, Gandía, Sagunto, Requena, Cheste, Buñol, 
                Sueca, Alzira, Xàtiva, Ontinyent y L'Horta Nord. Para eventos en ubicaciones especiales, ofrecemos servicio de análisis 
                técnico previo sin coste.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                Soluciones de Iluminación por Tipo de Evento
              </h3>

              <div className="grid md:grid-cols-2 gap-4 my-6">
                <div className="bg-pink-50 p-4 rounded-lg border-2 border-pink-200">
                  <h4 className="font-bold text-pink-600 mb-2">💒 Bodas y Celebraciones</h4>
                  <p className="text-sm text-gray-700">
                    Iluminación cálida para ceremonias, uplighting en colores personalizados, efectos de cielo estrellado, 
                    monogramas proyectados, y pista de baile con efectos LED. Perfecto para fincas como Mas de San Pablo, 
                    La Hacienda El Puente, o salones como Palacio de Congresos Valencia.
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                  <h4 className="font-bold text-purple-600 mb-2">🎸 Conciertos y Festivales</h4>
                  <p className="text-sm text-gray-700">
                    Cabezas móviles sincronizadas, efectos beam, wash y spot, strobo profesional, barras LED pixel mapping, 
                    y control DMX/ArtNet. Experiencia en salas como 16 Toneladas, Loco Club, Moon Club, y eventos al aire 
                    libre en Jardines de Viveros.
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                  <h4 className="font-bold text-blue-600 mb-2">💼 Eventos Corporativos</h4>
                  <p className="text-sm text-gray-700">
                    Iluminación arquitectural con colores corporativos, retroproyección, focos elipsoidales para logos, 
                    iluminación de stands en ferias, y sistemas modulares para salas de conferencias. Ideal para eventos 
                    en Feria Valencia, La Marina de Valencia, o hoteles como Las Arenas y Westin.
                  </p>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
                  <h4 className="font-bold text-orange-600 mb-2">🎭 Teatro y Espectáculos</h4>
                  <p className="text-sm text-gray-700">
                    Focos fresnel, recortes, cicloramas, cañones seguidor, dimmer analógicos y digitales. Control 
                    profesional mediante mesas ETC, Avolites o GrandMA. Colaboramos con teatros municipales y 
                    producciones privadas en Valencia.
                  </p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                Ventajas de Nuestro Servicio de Iluminación
              </h3>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>Tecnología LED de Bajo Consumo:</strong> Todos nuestros focos son LED, reduciendo el consumo 
                    eléctrico hasta un 80% vs. iluminación halógena tradicional. Sin calor, ideales para espacios cerrados.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>Control Profesional DMX-512:</strong> Todas nuestras luces son controlables vía DMX. 
                    Incluimos mesa controladora y programación de escenas personalizadas para tu evento.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>Estructuras y Truss Certificados:</strong> Ofrecemos estructuras de aluminio ligero con 
                    certificación TÜV. Portales autoportantes, truss triangular y cuadrado, y sistemas de elevación manual y motorizada.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>Diseño de Iluminación Personalizado:</strong> Nuestros técnicos diseñan el lighting plot específico 
                    para tu espacio. Planos 2D/3D previos y simulación de efectos antes del evento.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>Instalación y Operación Técnica:</strong> Montaje profesional con personal certificado en trabajos 
                    en altura. Operador de iluminación durante todo el evento si lo necesitas.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>Seguro de Responsabilidad Civil:</strong> Todo nuestro material está asegurado. 
                    Cumplimos normativas de seguridad eléctrica y prevención de riesgos laborales.
                  </span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                Equipos de Iluminación Destacados
              </h3>

              <p className="text-gray-700 mb-4">
                Nuestras <strong>cabezas móviles LED</strong> (Chauvet Intimidator, ADJ Focus, Betopper LM70) ofrecen efectos 
                beam, spot y wash en un solo equipo. Potencia de 230W LED, 8 gobos rotatorios, prisma de 3 facetas, y colores 
                ilimitados mediante mezcla RGBW. Perfectas para crear efectos dinámicos en bodas y conciertos.
              </p>

              <p className="text-gray-700 mb-4">
                Los <strong>focos PAR LED RGBW de 200W</strong> son ideales para iluminación de fachadas, uplighting en eventos, 
                y wash general. Ángulo de apertura 25°, control DMX de 4 a 8 canales, y función stand-alone con programas automáticos. 
                Utilizados en más de 300 bodas en Valencia.
              </p>

              <p className="text-gray-700 mb-4">
                Las <strong>barras LED de 1 metro con pixel control</strong> permiten crear efectos de persiana, fade, y animaciones. 
                144 LEDs RGB individuales, compatibles con software Madrix y control ArtNet. Muy solicitadas para eventos corporativos 
                con identidad visual corporativa.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                Casos de Éxito: Iluminación en Eventos en Valencia
              </h3>

              <p className="text-gray-700 mb-4">
                Hemos iluminado más de <strong>500 bodas en fincas de Valencia</strong>. En Mas de San Pablo, creamos ambientes 
                románticos con uplighting en tonos durazno y ámbar. En La Hacienda El Puente, instalamos 40 focos PAR LED para 
                iluminar los jardines y árboles centenarios. En Alquería de Morayma, diseñamos iluminación arquitectural que 
                resaltó la belleza del edificio histórico.
              </p>

              <p className="text-gray-700 mb-4">
                Para <strong>conciertos en vivo</strong>, hemos trabajado en salas emblemáticas de Valencia: 16 Toneladas (rock/indie), 
                Loco Club (electrónica), Radio City (pop/rock), y eventos al aire libre en Jardines de Viveros y Plaza del Ayuntamiento. 
                Nuestros sistemas de cabezas móviles sincronizadas crean atmósferas únicas que complementan la música.
              </p>

              <p className="text-gray-700 mb-4">
                En <strong>eventos corporativos</strong>, destacamos la iluminación del stand de Telefónica en Feria Valencia 
                (200m² iluminados con barras LED pixel), la presentación de producto de Ford en La Marina de Valencia (mapping de logo 
                en fachada), y el congreso anual de Mercadona en Palacio de Congresos (500 focos LED sincronizados).
              </p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Preguntas Frecuentes sobre Iluminación Profesional
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
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-8 mt-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ilumina tu Evento en Valencia con Equipos Profesionales
            </h2>
            <p className="text-xl mb-6 text-purple-100">
              Diseño de iluminación personalizado + Presupuesto gratis en 24h
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/contacto"
                className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
              >
                <Lightbulb className="w-5 h-5" />
                Calcular Presupuesto
              </Link>
              <a
                href="tel:+34613881414"
                className="bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition-colors inline-flex items-center gap-2 border-2 border-white"
              >
                <Phone className="w-5 h-5" />
                Llamar: 613 88 14 14
              </a>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-purple-100">
              <MapPin className="w-5 h-5" />
              <span>Servicio en Valencia, área metropolitana y provincia</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AlquilerIluminacionValenciaPage;
