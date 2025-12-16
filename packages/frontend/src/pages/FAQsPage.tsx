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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Preguntas Frecuentes</h1>
        <p className="text-gray-700 mb-8">
          Si no encuentras tu respuesta, puedes contactar con nosotros o usar la calculadora para preparar un
          presupuesto.
        </p>

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

        <div className="space-y-4">
          {faqs.map((faq) => (
            <details key={faq.question} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <summary className="cursor-pointer select-none font-semibold text-gray-900">
                {faq.question}
              </summary>
              <div className="mt-3 text-gray-700 leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQsPage;
