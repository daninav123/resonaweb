import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Phone, MapPin, Star, CheckCircle, ArrowRight, Music } from 'lucide-react';
import SEOHead from '../components/SEO/SEOHead';
import { getLocalBusinessSchema, getFAQSchema } from '../components/SEO/schemas';

const SonidoBodasValenciaPage = () => {
  const faqData = [
    {
      question: '¿Cuánto cuesta el alquiler de sonido para una boda en Valencia?',
      answer: 'El precio del sonido para bodas en Valencia varía según el número de invitados y servicios. Para bodas de 100 personas, paquetes desde 350€. Para 150-200 personas, desde 550€. Incluye altavoces, microfonía inalámbrica, mesa de mezclas, y técnico durante ceremonia y banquete. Presupuesto personalizado sin compromiso.',
    },
    {
      question: '¿Qué incluye el servicio de sonido para bodas?',
      answer: 'Nuestro servicio completo incluye: altavoces profesionales para ceremonia y banquete, microfonía inalámbrica (corbata/petaca para oficiante y novios), mesa de mezclas, reproducción de música (Spotify, USB, auxiliar), técnico profesional durante todo el evento, montaje previo y desmontaje posterior, y transporte en Valencia y provincia.',
    },
    {
      question: '¿El técnico de sonido está presente durante toda la boda?',
      answer: 'Sí, nuestro técnico de sonido está presente desde el montaje (2-3 horas antes de la ceremonia) hasta el final del banquete. Se encarga de las pruebas de sonido, ajusta niveles durante la ceremonia, gestiona micrófonos para discursos, y coordina la música ambiental durante todo el evento.',
    },
    {
      question: '¿Trabajáis en las principales fincas de Valencia?',
      answer: 'Sí, trabajamos habitualmente en Mas de San Pablo, La Hacienda El Puente, Alquería de Morayma, Masía Les Corts, La Finca del Duque, Jardines de Abril, Masía Egara, Hacienda Los Molinos, y muchas más. Conocemos las características técnicas de cada espacio y las mejores ubicaciones para equipos.',
    },
    {
      question: '¿Puedo llevar mi propia música o necesito DJ?',
      answer: 'Puedes llevar tu música en pen drive USB, usar Spotify, o conectar tu móvil. No necesitas DJ si solo quieres música de fondo. Si prefieres DJ profesional para amenizar y mezclar música, podemos recomendarte colaboradores de confianza. Nuestro equipo de sonido es compatible con cualquier fuente.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="Sonido para Bodas en Valencia | Alquiler Equipos Profesionales"
        description="Alquiler de sonido profesional para bodas en Valencia. Ceremonia, banquete y fiesta con equipos de alta calidad. Microfonía inalámbrica y técnico incluido. Más de 500 bodas realizadas. ☎️ 613881414"
        keywords="sonido bodas valencia, alquiler sonido boda valencia, equipos audio bodas valencia, microfono boda valencia, sonido ceremonia valencia, sonido banquete valencia, musica boda valencia"
        canonicalUrl="https://resonaevents.com/sonido-bodas-valencia"
        schema={[getLocalBusinessSchema(), getFAQSchema(faqData)]}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <nav className="text-sm mb-6 opacity-90">
            <Link to="/" className="hover:underline">Inicio</Link>
            <span className="mx-2">›</span>
            <span>Sonido para Bodas Valencia</span>
          </nav>
          
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Sonido Profesional para Bodas en Valencia
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-pink-100">
              Haz que tu día especial suene perfecto. Equipos de sonido de alta gama para ceremonia, 
              cóctel y banquete. Más de 500 bodas realizadas en las mejores fincas de Valencia.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span>Técnico incluido</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span>Microfonía inalámbrica</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span>Desde 350€</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/calculadora-evento"
                className="bg-white text-rose-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
              >
                <Heart className="w-5 h-5" />
                Presupuesto para mi Boda
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
              El Sonido Perfecto para el Día Más Importante de tu Vida
            </h2>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-4">
                Tu <strong>boda en Valencia</strong> merece un <strong>sonido impecable</strong>. En <strong>ReSona Events</strong>, 
                somos especialistas en <strong>alquiler de equipos de sonido para bodas</strong>, con más de 10 años de experiencia 
                y más de <strong>500 bodas realizadas</strong> en las principales fincas y salones de Valencia y provincia.
              </p>

              <p className="text-gray-700 mb-4">
                Entendemos que cada momento de tu boda es único: desde la emotiva ceremonia, pasando por el alegre cóctel, 
                hasta la fiesta del banquete. Por eso, ofrecemos <strong>paquetes de sonido completos</strong> que cubren todas 
                las necesidades de audio de tu celebración, con <strong>equipos profesionales discretos</strong> que no interfieren 
                con la decoración, y un <strong>técnico especializado</strong> que se encarga de que todo suene perfecto sin que 
                tengas que preocuparte de nada.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                Nuestros Paquetes de Sonido para Bodas
              </h3>

              <div className="grid md:grid-cols-2 gap-6 my-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-300">
                  <h4 className="text-xl font-bold text-blue-900 mb-3">💍 Paquete Ceremonia</h4>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p>✅ 2 altavoces compactos (100-150 personas)</p>
                    <p>✅ 2 micrófonos inalámbricos (oficiante + lecturas)</p>
                    <p>✅ Mesa de mezclas profesional</p>
                    <p>✅ Reproducción música entrada/salida</p>
                    <p>✅ Técnico durante la ceremonia</p>
                    <p className="font-bold text-blue-900 mt-4">Desde 250€</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-300">
                  <h4 className="text-xl font-bold text-purple-900 mb-3">🥂 Paquete Ceremonia + Cóctel</h4>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p>✅ Todo lo del Paquete Ceremonia</p>
                    <p>✅ Música ambiental para cóctel</p>
                    <p>✅ Altavoz adicional para exterior</p>
                    <p>✅ Micrófono para brindis</p>
                    <p>✅ Técnico durante ceremonia y cóctel</p>
                    <p className="font-bold text-purple-900 mt-4">Desde 350€</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-xl border-2 border-pink-300">
                  <h4 className="text-xl font-bold text-pink-900 mb-3">🎉 Paquete Completo</h4>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p>✅ Sonido ceremonia + cóctel + banquete</p>
                    <p>✅ Sistema profesional 150-200 personas</p>
                    <p>✅ Subwoofer para fiesta</p>
                    <p>✅ 3-4 micrófonos inalámbricos</p>
                    <p>✅ Técnico durante todo el evento (8-10h)</p>
                    <p className="font-bold text-pink-900 mt-4">Desde 550€</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-6 rounded-xl border-2 border-rose-300">
                  <h4 className="text-xl font-bold text-rose-900 mb-3">👑 Paquete Premium</h4>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p>✅ Todo lo del Paquete Completo</p>
                    <p>✅ Sistema line array 200-300 personas</p>
                    <p>✅ Iluminación ambiental LED</p>
                    <p>✅ Equipo backup de emergencia</p>
                    <p>✅ 2 técnicos (sonido + iluminación)</p>
                    <p className="font-bold text-rose-900 mt-4">Desde 850€</p>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                Experiencia en las Mejores Fincas de Valencia
              </h3>

              <p className="text-gray-700 mb-4">
                Conocemos a la perfección las <strong>fincas para bodas más exclusivas de Valencia</strong> y sabemos exactamente 
                qué equipo funciona mejor en cada espacio:
              </p>

              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>Mas de San Pablo (Olocau):</strong> Ceremonia en jardín con acústica natural. Usamos 2 altavoces 
                    discretos en pedestales blancos. Banquete en salón con sonido envolvente.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>La Hacienda El Puente (Picassent):</strong> Ceremonia bajo cenador, cóctel en jardines. 
                    Sistema multi-zona con 4 altavoces sincronizados.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>Alquería de Morayma (Quart de Poblet):</strong> Edificio histórico con techos altos. 
                    Recomendamos sistema con subwoofer para graves controlados.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>Masía Les Corts (Alboraya):</strong> Ceremonia junto a la piscina. Protección IP65 anti-humedad 
                    para equipos en exterior.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>La Finca del Duque (Buñol):</strong> Amplios jardines con zonas diferenciadas. 
                    Sistema wireless DMX para control remoto desde sala técnica.
                  </span>
                </li>
              </ul>

              <p className="text-gray-700 mb-4">
                También trabajamos en: Jardines de Abril, Hacienda Los Molinos, Masía Egara, Finca La Concepción, 
                Alquería del Pi, La Carrasca, y cualquier ubicación en Valencia y provincia.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                ¿Por Qué Elegir ReSona Events para el Sonido de tu Boda?
              </h3>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>Más de 500 Bodas Realizadas:</strong> Sabemos exactamente qué funciona. Cada detalle está cuidado: 
                    desde la colocación de altavoces hasta el momento exacto de reproducir la música de entrada.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>Equipos Discretos y Elegantes:</strong> Nuestros altavoces blancos o negros se integran perfectamente 
                    con la decoración. Sin cables visibles, montaje limpio y profesional.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>Técnico Especializado en Bodas:</strong> Coordinado con wedding planner, oficiante, fotógrafo y DJ. 
                    Experiencia en ceremonias civiles y religiosas. Sensibilidad para momentos emotivos.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>Microfonía Inalámbrica de Calidad:</strong> Usamos Shure y Sennheiser. Micrófono de corbata 
                    (petaca) para oficiante, de mano para lecturas. Sin interferencias, batería garantizada 8+ horas.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>Plan B Siempre Preparado:</strong> Llevamos micrófonos de repuesto, cables adicionales, 
                    y equipo backup para emergencias. En 500 bodas, jamás hemos tenido un fallo crítico.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>Reunión Previa sin Coste:</strong> Visitamos la finca contigo 1-2 semanas antes. 
                    Planificamos ubicaciones, hacemos pruebas de sonido, y coordinamos horarios con otros proveedores.
                  </span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                Cómo Funciona Nuestro Servicio
              </h3>

              <div className="bg-blue-50 p-6 rounded-lg mb-6">
                <ol className="space-y-3 list-decimal list-inside">
                  <li className="text-gray-700">
                    <strong>Consulta Inicial:</strong> Llámanos o solicita presupuesto online. Hablamos sobre tu boda: 
                    número de invitados, ubicación, ceremonias (civil/religiosa), necesidades especiales.
                  </li>
                  <li className="text-gray-700">
                    <strong>Presupuesto Personalizado:</strong> En 24h recibes presupuesto detallado sin compromiso. 
                    Incluye todo: equipos, técnico, transporte, montaje.
                  </li>
                  <li className="text-gray-700">
                    <strong>Visita a la Finca (Opcional):</strong> Si lo deseas, visitamos la ubicación contigo para 
                    valorar acústica, ubicación de equipos, y puntos de corriente eléctrica.
                  </li>
                  <li className="text-gray-700">
                    <strong>Reserva Confirmada:</strong> Con 30% de señal, tu fecha queda bloqueada. 
                    El resto se abona después de la boda.
                  </li>
                  <li className="text-gray-700">
                    <strong>Coordinación Pre-Evento:</strong> 1 semana antes, confirmamos horarios con ceremonia, 
                    wedding planner, DJ, y otros proveedores. Recibimos tu playlist de canciones especiales.
                  </li>
                  <li className="text-gray-700">
                    <strong>Montaje y Pruebas:</strong> Llegamos 2-3 horas antes. Montaje completo, cableado oculto, 
                    y pruebas de sonido. Todo listo antes de que lleguen los invitados.
                  </li>
                  <li className="text-gray-700">
                    <strong>Durante la Boda:</strong> Técnico discreto controlando audio en tiempo real. 
                    Ajustamos volumen según ambiente. Coordinados con maestro de ceremonias.
                  </li>
                  <li className="text-gray-700">
                    <strong>Desmontaje:</strong> Al finalizar, recogemos equipos sin molestar. 
                    Dejamos todo limpio. Tú solo disfrutas.
                  </li>
                </ol>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                Testimonios de Novios en Valencia
              </h3>

              <div className="space-y-4 mb-6">
                <div className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-500">
                  <p className="text-gray-700 italic mb-2">
                    "El sonido en nuestra boda en Mas de San Pablo fue perfecto. Ni muy alto ni muy bajo, 
                    justo como lo queríamos. El técnico fue súper profesional y discreto. 
                    Nuestros invitados escucharon perfectamente los votos y las lecturas. 100% recomendable."
                  </p>
                  <p className="text-sm text-gray-600">— María y Carlos, Boda 15/06/2024</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                  <p className="text-gray-700 italic mb-2">
                    "Contratamos sonido + iluminación para nuestra boda en La Hacienda El Puente. 
                    Todo fue mágico. El técnico coordinó perfectamente con nuestro DJ y fotógrafo. 
                    Los micrófonos inalámbricos funcionaron perfecto durante toda la ceremonia. 
                    ¡Gracias por hacer nuestro día tan especial!"
                  </p>
                  <p className="text-sm text-gray-600">— Laura y Javier, Boda 22/09/2024</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Preguntas Frecuentes sobre Sonido para Bodas
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
          <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl p-8 mt-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Haz Realidad el Sonido de tu Boda de Ensueño
            </h2>
            <p className="text-xl mb-6 text-pink-100">
              Presupuesto personalizado gratis en 24h. Más de 500 bodas nos avalan.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/calculadora-evento"
                className="bg-white text-rose-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
              >
                <Music className="w-5 h-5" />
                Calcular Presupuesto Boda
              </Link>
              <a
                href="tel:+34613881414"
                className="bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition-colors inline-flex items-center gap-2 border-2 border-white"
              >
                <Phone className="w-5 h-5" />
                Llamar: 613 88 14 14
              </a>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-pink-100">
              <MapPin className="w-5 h-5" />
              <span>Servicio en todas las fincas de Valencia y provincia</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SonidoBodasValenciaPage;
