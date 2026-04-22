import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Phone, Mail, Calculator, CheckCircle, MapPin, Star, Heart, Music, Lightbulb } from 'lucide-react';
import SEOHead from '../../components/SEO/SEOHead';

const BodasValencia = () => {
  const currentUrl = 'https://resonaevents.com/bodas-valencia';
  
  // Canonical URL para SEO
  const canonicalUrl = 'https://resonaevents.com/servicios/bodas-valencia';

  return (
    <>
      <SEOHead
        title="Bodas en Valencia | Sonido + Iluminación + DJ | ReSona Events"
        description="Organiza tu boda en Valencia con los mejores profesionales. Sonido, iluminación, DJ. +500 bodas realizadas en La Hacienda, Mas de San Antonio, El Bohío. ☎️ 613 88 14 14"
        keywords="bodas valencia, boda valencia, sonido bodas valencia, iluminación bodas valencia, dj bodas valencia, fincas bodas valencia, organizar boda valencia"
        canonicalUrl={canonicalUrl}
      />
      
      <Helmet>
        
        {/* Schema.org - Event */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            "name": "Bodas en Valencia",
            "description": "Servicios profesionales de sonido, iluminación y DJ para bodas en Valencia",
            "location": {
              "@type": "Place",
              "name": "Valencia, España",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Valencia",
                "addressRegion": "Comunidad Valenciana",
                "addressCountry": "ES"
              }
            },
            "organizer": {
              "@type": "Organization",
              "name": "ReSona Events Valencia",
              "url": "https://resonaevents.com",
              "telephone": "+34613881414"
            }
          })}
        </script>

        {/* Schema.org - LocalBusiness */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "ReSona Events - Bodas Valencia",
            "image": "https://resonaevents.com/logo.png",
            "telephone": "+34613881414",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Valencia",
              "addressRegion": "Comunidad Valenciana",
              "addressCountry": "ES"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 39.4699,
              "longitude": -0.3763
            },
            "url": "https://resonaevents.com",
            "priceRange": "€€"
          })}
        </script>

        {/* Schema.org - FAQPage */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "¿Cuánto cuesta el sonido e iluminación para una boda en Valencia?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "El precio varía según el número de invitados y servicios. Para una boda de 100 invitados, desde 850€ con sonido completo (ceremonia + banquete + fiesta) e iluminación LED ambiental. Para 200 invitados, desde 1.200€. Incluye técnico especializado, montaje, desmontaje y transporte en Valencia capital."
                }
              },
              {
                "@type": "Question",
                "name": "¿Trabajáis en las principales fincas para bodas de Valencia?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sí, hemos trabajado en más de 500 bodas en Valencia. Conocemos La Hacienda, Mas de San Antonio, El Bohío, Viveros Municipales, Torre del Pi, Alquería del Pi, Casa Granero, Masía Egara, Hotel Las Arenas, Palau de la Música y centenares de fincas en Valencia, Godella, Bétera, L'Eliana, Alboraya y toda la provincia."
                }
              },
              {
                "@type": "Question",
                "name": "¿Qué incluye vuestro servicio completo para bodas en Valencia?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Servicio completo incluye: sonido profesional DAS Audio/ICOA para ceremonia, cóctel, banquete y fiesta; microfonía inalámbrica para novios, testigos y sacerdote; iluminación LED RGB ambiental (uplighting); técnico especializado durante toda la boda; montaje y desmontaje; transporte Valencia capital; equipos de backup; coordinación con DJ/wedding planner; y soporte 24/7."
                }
              },
              {
                "@type": "Question",
                "name": "¿Con cuánta antelación debo reservar para mi boda en Valencia?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Para bodas en Valencia recomendamos reservar con 6-12 meses de antelación, especialmente para bodas en temporada alta (mayo-octubre) o fechas populares (sábados). Para fechas entre semana o temporada baja, con 3-4 meses puede ser suficiente. Consulta disponibilidad llamando al 613 88 14 14."
                }
              },
              {
                "@type": "Question",
                "name": "¿Ofrecéis servicio de DJ para bodas en Valencia?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sí, disponemos de equipamiento DJ profesional Pioneer RX2, CDJ-2000 NXS2 y mezcladoras DJM. Podemos proporcionar el equipo para que trabaje tu DJ o recomendar DJs especializados en bodas con los que colaboramos habitualmente en Valencia."
                }
              },
              {
                "@type": "Question",
                "name": "¿Qué tipo de iluminación ofrecéis para bodas en Valencia?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Ofrecemos iluminación LED profesional: uplighting (focos LED RGB para iluminar paredes/columnas en cualquier color), proyección de nombres/gobo, iluminación de pista de baile, moving heads para efectos dinámicos, baile en las nubes (humo bajo), y efectos especiales. Todo coordinado con la decoración de tu boda."
                }
              },
              {
                "@type": "Question",
                "name": "¿Trabajáis bodas en toda la provincia de Valencia?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sí, trabajamos en toda la provincia de Valencia y alrededores: Valencia capital, Alboraya, Torrent, Paterna, Mislata, Godella, Bétera, L'Eliana, Moncada, Burjassot, Manises, Quart de Poblet, Xirivella, Catarroja, Massanassa, Alfafar, Sedaví, y toda la comarca de L'Horta. Transporte incluido en Valencia capital (30km), resto según distancia."
                }
              },
              {
                "@type": "Question",
                "name": "¿Qué equipamiento de sonido usáis para bodas en Valencia?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Usamos equipamiento profesional de marcas líderes: altavoces DAS Audio 515A (1500W), ICOA 12A/15A (blancos elegantes para ceremonias), subwoofers DAS Audio 215A/218A para la fiesta, mezcladoras Behringer X Air XR18, equipos DJ Pioneer RX2/CDJ-2000, y micrófonos inalámbricos Shure SM58/Beta 58A. Todo perfectamente mantenido y calibrado."
                }
              },
              {
                "@type": "Question",
                "name": "¿Hacéis pruebas previas en el lugar de la boda?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sí, en packs Premium incluimos visita técnica previa para evaluar acústica, distribución de equipos y planificar montaje. En todos los packs, el técnico llega con antelación el día de la boda para montar, calibrar y probar todo antes de la ceremonia. Nos aseguramos que todo funcione perfecto."
                }
              },
              {
                "@type": "Question",
                "name": "¿Tenéis equipos de backup por si falla algo?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sí, en packs Profesional y Premium siempre llevamos equipos de backup: altavoces de respaldo, micrófonos adicionales, cables extra, mezcladoras redundantes. En 500+ bodas nunca hemos tenido un fallo que afecte el evento. Tu tranquilidad es nuestra prioridad."
                }
              },
              {
                "@type": "Question",
                "name": "¿El técnico se queda durante toda la boda?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sí, en todos nuestros packs el técnico especializado está presente durante toda la celebración: monta antes de la ceremonia, ajusta niveles durante discursos, gestiona música en banquete, opera la fiesta, y desmonta al finalizar. Tú solo disfrutas, nosotros nos ocupamos de todo lo técnico."
                }
              },
              {
                "@type": "Question",
                "name": "¿Coordinais con otros proveedores de la boda?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sí, trabajamos en coordinación con tu wedding planner, DJ, catering, fotógrafo y videógrafo. Conocemos el timing típico de bodas y nos adaptamos perfectamente. Hemos colaborado con los principales proveedores de bodas en Valencia y conocemos cómo trabajar en equipo para que todo fluya perfectamente."
                }
              },
              {
                "@type": "Question",
                "name": "¿Qué pasa si mi boda es en una finca sin electricidad?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No hay problema. Muchas fincas en Valencia tienen electricidad limitada o generadores. Nuestro equipo técnico evalúa las necesidades eléctricas, coordinamos con la finca, y llevamos distribuidores/alargadores profesionales. Si es necesario, podemos recomendar proveedores de generadores o adaptar el equipo a la potencia disponible."
                }
              },
              {
                "@type": "Question",
                "name": "¿Ofrecéis paquetes personalizados para bodas en Valencia?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sí, cada boda es única. Aunque tenemos packs estándar (Ceremonia, Completo, Premium), personalizamos según tus necesidades: número de invitados, duración, espacios (ceremonia religiosa/civil, cóctel exterior, banquete, fiesta), efectos especiales (baile nubes, proyección nombres), etc. Llámanos al 613 88 14 14 para un presupuesto personalizado."
                }
              },
              {
                "@type": "Question",
                "name": "¿Puedo ver fotos de bodas que habéis hecho en Valencia?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sí, tenemos portfolio con fotos de más de 500 bodas realizadas en Valencia. Puedes ver ejemplos de montajes en diferentes fincas, tipos de iluminación, y configuraciones según número de invitados. Contacta con nosotros y te mostramos ejemplos específicos de bodas similares a la tuya en espacios que conozcas."
                }
              }
            ]
          })}
        </script>

        {/* Schema.org - Breadcrumbs */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Inicio",
                "item": "https://resonaevents.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Bodas en Valencia",
                "item": currentUrl
              }
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-600 text-white py-24 overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Heart className="w-5 h-5" />
                <span className="text-sm font-semibold">+500 Bodas Realizadas en Valencia</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Bodas en Valencia con el Mejor Sonido e Iluminación
              </h1>
              
              <p className="text-xl md:text-2xl mb-8 text-white/90">
                Sonido Profesional + Iluminación LED + DJ | Técnico Especializado | Desde 850€
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <a
                  href="https://wa.me/34613881414"
                  className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  WhatsApp: 613 88 14 14
                </a>
                <a
                  href="/calculadora-eventos"
                  className="inline-flex items-center justify-center bg-white hover:bg-gray-100 text-purple-600 font-bold py-4 px-8 rounded-lg transition-all shadow-lg"
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  Calcula tu Presupuesto
                </a>
              </div>

              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span>Equipos Profesionales DAS Audio</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span>Técnico Durante Toda la Boda</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span>Iluminación LED Espectacular</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">La Mejor Sonorización e Iluminación para tu Boda en Valencia</h2>
              
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4">
                <p>
                  Organizar una <strong>boda en Valencia</strong> es un momento único en la vida, y el <strong>sonido e iluminación para bodas</strong> juega un papel fundamental en crear la atmósfera perfecta para tu día especial. En <strong>ReSona Events</strong> somos especialistas en <strong>equipamiento audiovisual profesional para bodas en Valencia</strong>, con más de 15 años de experiencia y <strong>más de 500 bodas realizadas</strong> en los mejores espacios de la provincia.
                </p>

                <p>
                  Sabemos que cada <strong>boda en Valencia</strong> es única y especial. Por eso ofrecemos un <strong>servicio completamente personalizado</strong> que se adapta perfectamente a tu estilo, número de invitados, tipo de ceremonia y espacio del evento. Desde bodas íntimas de 50 personas en masías históricas hasta grandes celebraciones de 400 invitados en fincas espectaculares, disponemos del equipo profesional y la experiencia necesaria para que todo funcione perfectamente.
                </p>

                <p>
                  Hemos trabajado en los <strong>mejores espacios para bodas en Valencia</strong>: <strong>La Hacienda</strong>, <strong>Mas de San Antonio</strong>, <strong>El Bohío</strong>, <strong>Viveros Municipales</strong>, <strong>Torre del Pi</strong>, <strong>Alquería del Pi</strong>, <strong>Casa Granero</strong>, <strong>Masía Egara</strong>, <strong>Hotel Las Arenas</strong>, <strong>Palau de la Música</strong>, <strong>Hotel SH Valencia Palace</strong>, <strong>Jardines de Monforte</strong>, y centenares de fincas privadas, hoteles y espacios únicos en Valencia, Godella, Bétera, L'Eliana, Alboraya, Torrent, Paterna y toda la provincia.
                </p>

                <p>
                  Nuestro <strong>servicio completo para bodas en Valencia</strong> incluye equipamiento de alta calidad de marcas profesionales reconocidas: <strong>altavoces DAS Audio 515A</strong> (1500W de potencia), <strong>ICOA 12A/15A</strong> (acabados elegantes en blanco perfecto para ceremonias), <strong>subwoofers DAS Audio 215A/218A</strong> para graves profundos en la fiesta, <strong>mezcladoras Behringer X Air XR18</strong>, <strong>equipos DJ Pioneer RX2/CDJ-2000</strong>, y <strong>micrófonos inalámbricos Shure SM58</strong> profesionales.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Nuestros Servicios para Bodas en Valencia</h2>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <a href="/servicios/sonido-bodas-valencia" className="group bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                <Music className="w-12 h-12 text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold mb-3 group-hover:text-purple-600 transition-colors">Sonido para Bodas</h3>
                <p className="text-gray-600 mb-4">
                  Sonido profesional completo para ceremonia, cóctel, banquete y fiesta. Equipos DAS Audio, ICOA, microfonía inalámbrica Shure.
                </p>
                <div className="text-purple-600 font-semibold group-hover:underline">
                  Ver Sonido Bodas →
                </div>
              </a>

              <a href="/servicios/alquiler-iluminacion-bodas" className="group bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                <Lightbulb className="w-12 h-12 text-pink-600 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold mb-3 group-hover:text-pink-600 transition-colors">Iluminación para Bodas</h3>
                <p className="text-gray-600 mb-4">
                  Iluminación LED profesional: uplighting RGB, proyección nombres, baile en nubes, moving heads, efectos especiales.
                </p>
                <div className="text-pink-600 font-semibold group-hover:underline">
                  Ver Iluminación Bodas →
                </div>
              </a>

              <a href="/servicios/sonido-iluminacion-bodas-valencia" className="group bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 ring-2 ring-purple-500">
                <div className="flex gap-2 mb-4">
                  <Music className="w-10 h-10 text-purple-600 group-hover:scale-110 transition-transform" />
                  <Lightbulb className="w-10 h-10 text-pink-600 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-purple-600 transition-colors">
                  Pack Completo Boda
                  <span className="ml-2 text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">POPULAR</span>
                </h3>
                <p className="text-gray-600 mb-4">
                  Sonido + Iluminación completo desde 850€. Todo incluido: técnico, montaje, transporte. El paquete más elegido.
                </p>
                <div className="text-purple-600 font-semibold group-hover:underline">
                  Ver Pack Completo →
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* Wedding Venues */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-gray-800">Fincas y Espacios para Bodas en Valencia Donde Trabajamos</h2>
              
              <div className="prose prose-lg max-w-none text-gray-700 mb-8">
                <p>
                  Conocemos a la perfección las <strong>mejores fincas para bodas en Valencia</strong> y sus características acústicas y técnicas. Hemos trabajado en más de 100 espacios diferentes, desde masías históricas en L'Horta hasta modernos hoteles en la playa de Valencia.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    Valencia Capital
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• La Hacienda</li>
                    <li>• Viveros Municipales</li>
                    <li>• Palau de la Música</li>
                    <li>• Hotel Las Arenas</li>
                    <li>• Hotel SH Valencia Palace</li>
                    <li>• Jardines de Monforte</li>
                    <li>• Casa Granero</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-pink-600" />
                    L'Horta Nord
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Mas de San Antonio</li>
                    <li>• El Bohío</li>
                    <li>• Torre del Pi</li>
                    <li>• Alquería del Pi</li>
                    <li>• Masía Egara</li>
                    <li>• Fincas en Godella</li>
                    <li>• Fincas en Bétera</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                  Provincia de Valencia
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Fincas en Alboraya</li>
                    <li>• Fincas en L'Eliana</li>
                    <li>• Fincas en Moncada</li>
                    <li>• Hoteles Torrent</li>
                    <li>• Masías en Paterna</li>
                    <li>• Espacios en Burjassot</li>
                    <li>• Y muchos más...</li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 bg-purple-50 border-l-4 border-purple-500 p-6 rounded">
                <p className="text-gray-700">
                  <strong>¿Tu boda es en otro espacio?</strong> No hay problema. Trabajamos en cualquier finca, hotel, masía o espacio de la provincia de Valencia. Hacemos visita técnica previa para evaluar acústica, distribución de equipos y planificar el montaje perfecto.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Por Qué Elegirnos para tu Boda en Valencia</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-4xl mb-4">💍</div>
                <h3 className="text-xl font-bold mb-3">Especialistas en Bodas</h3>
                <p className="text-gray-600">Más de 500 bodas realizadas en Valencia. Conocemos todos los espacios, timings y detalles que hacen perfecta tu boda.</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-4xl mb-4">🎵</div>
                <h3 className="text-xl font-bold mb-3">Sonido Perfecto Garantizado</h3>
                <p className="text-gray-600">Ceremonia cristalina, discursos perfectos, banquete con ambiente, fiesta espectacular. Audio impecable en cada momento.</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-4xl mb-4">✨</div>
                <h3 className="text-xl font-bold mb-3">Iluminación de Ensueño</h3>
                <p className="text-gray-600">Uplighting en cualquier color, proyección de nombres, baile en nubes, moving heads. Crea la atmósfera mágica que imaginas.</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-4xl mb-4">👨‍🔧</div>
                <h3 className="text-xl font-bold mb-3">Técnico Especializado</h3>
                <p className="text-gray-600">Presente durante toda la boda. Monta antes de la ceremonia, ajusta durante discursos, gestiona la fiesta. Tú solo disfrutas.</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-xl font-bold mb-3">Coordinación Total</h3>
                <p className="text-gray-600">Trabajamos con tu wedding planner, DJ, catering, fotógrafo. Conocemos el timing de bodas y nos adaptamos perfectamente.</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-bold mb-3">Sin Sorpresas</h3>
                <p className="text-gray-600">Presupuesto claro desde el inicio. Todo incluido: equipos, técnico, montaje, desmontaje, transporte. Sin extras ocultos.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Packages Preview */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Paquetes para Bodas en Valencia</h2>
              <p className="text-gray-600 text-lg">Desde 850€ con todo incluido. Presupuestos personalizados según tu boda.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-8 text-center">
                <h3 className="text-2xl font-bold mb-2">Pack Ceremonia</h3>
                <p className="text-gray-600 mb-4">Hasta 100 invitados</p>
                <div className="text-4xl font-bold text-purple-600 mb-6">desde 300€</div>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Sonido ceremonia + cóctel</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Microfonía inalámbrica</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Iluminación LED ambiental</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Técnico durante ceremonia</span>
                  </li>
                </ul>
                <a href="/servicios/sonido-iluminacion-bodas-valencia" className="block bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg transition-all">
                  Ver Detalles
                </a>
              </div>

              <div className="bg-white border-4 border-purple-500 rounded-lg p-8 text-center relative transform scale-105 shadow-xl">
                <div className="absolute top-0 right-0 bg-purple-500 text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
                  MÁS POPULAR
                </div>
                <h3 className="text-2xl font-bold mb-2">Pack Completo</h3>
                <p className="text-gray-600 mb-4">100-200 invitados</p>
                <div className="text-4xl font-bold text-purple-600 mb-6">desde 850€</div>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Ceremonia + Banquete + Fiesta</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Equipamiento DJ profesional</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Iluminación LED completa</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Técnico toda la boda</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Equipos de backup</span>
                  </li>
                </ul>
                <a href="/servicios/sonido-iluminacion-bodas-valencia" className="block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all">
                  Ver Detalles
                </a>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-lg p-8 text-center">
                <h3 className="text-2xl font-bold mb-2">Pack Premium</h3>
                <p className="text-gray-600 mb-4">+200 invitados</p>
                <div className="text-4xl font-bold text-purple-600 mb-6">desde 1.500€</div>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Experiencia completa</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Moving heads + efectos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Baile en las nubes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">2 técnicos especializados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Visita técnica previa</span>
                  </li>
                </ul>
                <a href="/servicios/sonido-iluminacion-bodas-valencia" className="block bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg transition-all">
                  Ver Detalles
                </a>
              </div>
            </div>

            <div className="text-center">
              <a
                href="/calculadora-eventos"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                <Calculator className="w-5 h-5" />
                Calcula tu Presupuesto Personalizado
              </a>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Lo Que Dicen Nuestros Novios</h2>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Increíbles! El sonido en nuestra boda en La Hacienda fue perfecto. La ceremonia se escuchó cristalina y la fiesta fue espectacular. El técnico fue súper profesional y discreto. 100% recomendables."
                </p>
                <div className="font-semibold text-gray-800">María y Carlos</div>
                <div className="text-sm text-gray-500">Boda en La Hacienda, Valencia - 180 invitados</div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "La iluminación LED que nos montaron fue mágica. Transformaron completamente el Mas de San Antonio. El baile en las nubes fue el momento más emotivo. Gracias por hacer nuestra boda tan especial!"
                </p>
                <div className="font-semibold text-gray-800">Laura y Javi</div>
                <div className="text-sm text-gray-500">Boda en Mas de San Antonio - 220 invitados</div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Profesionales de verdad. Montaron todo antes de que llegaran los invitados, el sonido funcionó perfecto durante toda la boda y se coordinaron genial con nuestro DJ. Relación calidad-precio excelente."
                </p>
                <div className="font-semibold text-gray-800">Ana y David</div>
                <div className="text-sm text-gray-500">Boda en El Bohío, Godella - 150 invitados</div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">Preguntas Frecuentes sobre Bodas en Valencia</h2>
              
              <div className="space-y-6">
                <details className="bg-gray-50 p-6 rounded-lg">
                  <summary className="font-bold text-lg cursor-pointer hover:text-purple-600">
                    ¿Cuánto cuesta el sonido e iluminación para una boda en Valencia?
                  </summary>
                  <p className="mt-4 text-gray-700">
                    El precio varía según el número de invitados y servicios. Para una boda de 100 invitados, desde 850€ con sonido completo (ceremonia + banquete + fiesta) e iluminación LED ambiental. Para 200 invitados, desde 1.200€. Incluye técnico especializado, montaje, desmontaje y transporte en Valencia capital.
                  </p>
                </details>

                <details className="bg-gray-50 p-6 rounded-lg">
                  <summary className="font-bold text-lg cursor-pointer hover:text-purple-600">
                    ¿Trabajáis en las principales fincas para bodas de Valencia?
                  </summary>
                  <p className="mt-4 text-gray-700">
                    Sí, hemos trabajado en más de 500 bodas en Valencia. Conocemos La Hacienda, Mas de San Antonio, El Bohío, Viveros Municipales, Torre del Pi, Alquería del Pi, Casa Granero, Masía Egara, Hotel Las Arenas, Palau de la Música y centenares de fincas en Valencia, Godella, Bétera, L'Eliana, Alboraya y toda la provincia.
                  </p>
                </details>

                <details className="bg-gray-50 p-6 rounded-lg">
                  <summary className="font-bold text-lg cursor-pointer hover:text-purple-600">
                    ¿Qué incluye vuestro servicio completo para bodas en Valencia?
                  </summary>
                  <p className="mt-4 text-gray-700">
                    Servicio completo incluye: sonido profesional DAS Audio/ICOA para ceremonia, cóctel, banquete y fiesta; microfonía inalámbrica para novios, testigos y sacerdote; iluminación LED RGB ambiental (uplighting); técnico especializado durante toda la boda; montaje y desmontaje; transporte Valencia capital; equipos de backup; coordinación con DJ/wedding planner; y soporte 24/7.
                  </p>
                </details>

                <details className="bg-gray-50 p-6 rounded-lg">
                  <summary className="font-bold text-lg cursor-pointer hover:text-purple-600">
                    ¿Con cuánta antelación debo reservar para mi boda en Valencia?
                  </summary>
                  <p className="mt-4 text-gray-700">
                    Para bodas en Valencia recomendamos reservar con 6-12 meses de antelación, especialmente para bodas en temporada alta (mayo-octubre) o fechas populares (sábados). Para fechas entre semana o temporada baja, con 3-4 meses puede ser suficiente. Consulta disponibilidad llamando al 613 88 14 14.
                  </p>
                </details>

                <details className="bg-gray-50 p-6 rounded-lg">
                  <summary className="font-bold text-lg cursor-pointer hover:text-purple-600">
                    ¿Ofrecéis servicio de DJ para bodas en Valencia?
                  </summary>
                  <p className="mt-4 text-gray-700">
                    Sí, disponemos de equipamiento DJ profesional Pioneer RX2, CDJ-2000 NXS2 y mezcladoras DJM. Podemos proporcionar el equipo para que trabaje tu DJ o recomendar DJs especializados en bodas con los que colaboramos habitualmente en Valencia.
                  </p>
                </details>

                <details className="bg-gray-50 p-6 rounded-lg">
                  <summary className="font-bold text-lg cursor-pointer hover:text-purple-600">
                    ¿Qué tipo de iluminación ofrecéis para bodas en Valencia?
                  </summary>
                  <p className="mt-4 text-gray-700">
                    Ofrecemos iluminación LED profesional: uplighting (focos LED RGB para iluminar paredes/columnas en cualquier color), proyección de nombres/gobo, iluminación de pista de baile, moving heads para efectos dinámicos, baile en las nubes (humo bajo), y efectos especiales. Todo coordinado con la decoración de tu boda.
                  </p>
                </details>
              </div>

              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4">¿Más preguntas sobre tu boda en Valencia?</p>
                <a
                  href="https://wa.me/34613881414"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
                >
                  <Phone className="w-5 h-5" />
                  Contacta por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-16 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">¿Listo para Hacer tu Boda en Valencia Inolvidable?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Más de 500 parejas han confiado en nosotros. Haz que tu día especial sea perfecto con el mejor sonido e iluminación profesional.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/34613881414"
                className="inline-flex items-center justify-center bg-white text-purple-600 font-bold py-4 px-8 rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
              >
                <Phone className="w-5 h-5 mr-2" />
                Llama Ahora: 613 88 14 14
              </a>
              <a
                href="/calculadora-eventos"
                className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                <Calculator className="w-5 h-5 mr-2" />
                Calcula tu Presupuesto
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default BodasValencia;
