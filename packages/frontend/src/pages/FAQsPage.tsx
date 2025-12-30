import { Link } from 'react-router-dom';
import SEOHead from '../components/SEO/SEOHead';
import { getFAQSchema } from '../components/SEO/schemas';

const FAQsPage = () => {
  const faqs = [
    {
      question: '¿Cómo funciona el alquiler de equipos con ReSona Events?',
      answer:
        'Puedes navegar por el catálogo, seleccionar productos y fechas, y completar la reserva. Si prefieres una recomendación personalizada, utiliza la calculadora de eventos y te prepararemos un presupuesto según tipo de evento, asistentes, duración y ubicación.',
    },
    {
      question: '¿Puedo calcular un presupuesto online para mi evento?',
      answer:
        'Sí. Puedes usar nuestra calculadora para estimar el presupuesto de tu evento y solicitar una propuesta. Te recomendamos empezar por la calculadora si no tienes claro qué equipo necesitas.',
    },
    {
      question: '¿Incluís transporte, montaje y desmontaje?',
      answer:
        'Depende del servicio seleccionado. En muchos casos podemos incluir transporte y montaje (especialmente en Valencia y área metropolitana). Indícanos la ubicación y horarios para darte una propuesta clara.',
    },
    {
      question: '¿Con cuánta antelación debo reservar?',
      answer:
        'Recomendamos reservar cuanto antes, especialmente en temporada alta y fines de semana. Para bodas y eventos grandes, idealmente 3-6 semanas antes. Para eventos pequeños, 1-2 semanas suele ser suficiente si hay disponibilidad.',
    },
    {
      question: '¿Pedís fianza o depósito?',
      answer:
        'En algunos alquileres se solicita un depósito reembolsable según el material y el valor del pedido. Te informaremos del importe antes de confirmar la reserva.',
    },
    {
      question: '¿Qué métodos de pago aceptáis?',
      answer:
        'Aceptamos pago con tarjeta y otras formas de pago disponibles durante el checkout. Si necesitas factura o condiciones específicas, contáctanos.',
    },
    {
      question: '¿En qué zonas trabajáis?',
      answer:
        'Trabajamos principalmente en Valencia y Comunidad Valenciana. Para otras zonas, consúltanos y valoraremos logística y costes de desplazamiento.',
    },
    {
      question: '¿Qué hago si no sé qué equipo necesito?',
      answer:
        'Empieza por la calculadora de eventos: con 3-4 datos podemos orientarte mejor. También puedes contactar y te asesoraremos en función del espacio, número de asistentes y tipo de evento.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <SEOHead
        title="Preguntas Frecuentes (FAQs) | ReSona Events"
        description="Resolvemos dudas frecuentes sobre alquiler de equipos para eventos: reservas, transporte, montaje, depósito y presupuesto."
        keywords="faqs alquiler equipos eventos, preguntas frecuentes alquiler sonido valencia, alquiler audiovisuales valencia"
        canonicalUrl="https://resonaevents.com/faqs"
        schema={[getFAQSchema(faqs)]}
      />

      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Preguntas Frecuentes sobre Alquiler de Equipos</h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <p className="text-gray-700 leading-relaxed mb-4">
            En <strong>ReSona Events</strong> llevamos más de 15 años proporcionando equipos de sonido, iluminación y audiovisuales 
            profesionales para eventos en Valencia y toda la Comunidad Valenciana. Durante este tiempo, hemos trabajado en más de 
            2.000 eventos, desde bodas íntimas hasta conciertos con 1.000+ asistentes, eventos corporativos, festivales municipales 
            y celebraciones privadas.
          </p>
          
          <p className="text-gray-700 leading-relaxed mb-4">
            Sabemos que planificar un evento puede generar muchas dudas, especialmente si es la primera vez que alquilas equipos 
            audiovisuales. Por eso, hemos recopilado las preguntas más frecuentes que nos hacen nuestros clientes sobre <strong>reservas, 
            transporte, instalación, precios, garantías y logística</strong>. Nuestro objetivo es que tengas toda la información clara 
            desde el primer momento.
          </p>
          
          <p className="text-gray-700 leading-relaxed">
            Si no encuentras tu respuesta aquí, puedes <strong>contactarnos directamente por teléfono (613 88 14 14)</strong>, 
            usar nuestro <strong>formulario de contacto</strong>, o probar la <strong>calculadora de eventos</strong> para obtener 
            un presupuesto personalizado en menos de 2 minutos. Respondemos todas las consultas en menos de 24 horas.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-10">
          <Link
            to="/calculadora-evento"
            className="bg-resona text-white px-5 py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Ir a la Calculadora
          </Link>
          <Link
            to="/productos"
            className="bg-white border border-gray-200 px-5 py-3 rounded-lg font-semibold text-gray-900 hover:bg-gray-50 transition"
          >
            Ver Catálogo
          </Link>
          <Link
            to="/contacto"
            className="bg-white border border-gray-200 px-5 py-3 rounded-lg font-semibold text-gray-900 hover:bg-gray-50 transition"
          >
            Contacto
          </Link>
        </div>

        <div className="space-y-4 mb-12">
          {faqs.map((faq) => (
            <details key={faq.question} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <summary className="cursor-pointer select-none font-semibold text-gray-900">
                {faq.question}
              </summary>
              <div className="mt-3 text-gray-700 leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>

        {/* Información adicional */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sobre ReSona Events Valencia</h2>
          
          <div className="space-y-4 text-gray-700">
            <p className="leading-relaxed">
              <strong>ReSona Events</strong> es una empresa especializada en el <strong>alquiler profesional de equipos de sonido, 
              iluminación, audiovisuales y escenarios</strong> para todo tipo de eventos en la provincia de Valencia. Con sede en 
              Valencia capital, ofrecemos servicio completo en toda la Comunidad Valenciana, incluyendo <strong>Valencia ciudad, 
              Torrent, Paterna, Mislata, Burjassot, Manises, Aldaia, Quart de Poblet, Xirivella</strong> y el resto del área metropolitana.
            </p>
            
            <p className="leading-relaxed">
              Disponemos de un amplio catálogo con más de <strong>500 productos profesionales</strong> de las mejores marcas del mercado: 
              <strong>JBL, QSC, Yamaha, Behringer, Mackie, Martin Audio, Showtec, Chauvet</strong> y muchas más. Todo nuestro equipamiento 
              pasa revisión técnica mensual y cumple con las normativas CE vigentes.
            </p>
            
            <p className="leading-relaxed">
              Nuestros servicios incluyen <strong>asesoramiento técnico personalizado, transporte, instalación, configuración, operación 
              durante el evento y recogida posterior</strong>. Trabajamos con particulares, empresas, ayuntamientos, productoras y 
              organizadores de eventos. Ofrecemos <strong>presupuestos sin compromiso</strong> y tarifas especiales para clientes 
              recurrentes y eventos de larga duración.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQsPage;
