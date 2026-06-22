import React from 'react';
import ServicePageTemplate from '../../components/services/ServicePageTemplate';

const AlquilerSubwoofers = () => {
  const pageData = {
    title: "Subwoofers Valencia | DAS Audio 215A/218A | ReSona",
    metaDescription: "Subwoofers profesionales en Valencia. DAS Audio 215A/218A. 2000-3200W. Graves potentes. Técnico incluido. ☎️ 613 88 14 14",
    keywords: "alquiler subwoofers valencia, subwoofer profesional, graves eventos",
    canonicalUrl: "https://resonaevents.com/servicios/alquiler-subwoofers",
    heroTitle: "Alquiler de Subwoofers Profesionales en Valencia",
    heroSubtitle: "DAS Audio 215A y 218A - Graves profundos y potentes para tu evento",
    introduction: `El <strong>alquiler de subwoofers profesionales en Valencia</strong> es esencial para conseguir graves potentes y profundos en tu evento. En ReSona Events disponemos de <strong>DAS Audio 215A</strong> (subwoofer activo doble 15", 2000W) y <strong>DAS Audio 218A</strong> (subwoofer premium doble 18", 3200W pico).

Nuestro servicio de <strong>alquiler de subwoofers profesionales en Valencia</strong> está diseñado para eventos de 50 a 300 personas. Los subwoofers son fundamentales para fiestas, bodas, conciertos: aportan los graves que hacen vibrar el suelo y crean esa sensación de potencia sin saturar.

Disponemos de equipos de última generación, perfectamente mantenidos y calibrados profesionalmente antes de cada evento. Todos nuestros sistemas se entregan con técnico especializado incluido, quien se encarga de la instalación, configuración, operación durante el evento y desmontaje completo.

El servicio completo incluye transporte sin coste adicional en Valencia capital y hasta 30 kilómetros, montaje y desmontaje profesional, calibración técnica según las características acústicas del espacio, asistencia técnica durante todo el evento, equipos de respaldo en los packs premium, y soporte telefónico 24/7.

Hemos trabajado en más de 2.000 eventos en Valencia: conciertos, <a href="/servicios/sonido-bodas-valencia" class="text-primary-600 hover:underline font-semibold">bodas</a>, fiestas, y todo tipo de celebraciones en espacios emblemáticos de la ciudad. Combinamos con <a href="/servicios/alquiler-sonido-valencia" class="text-primary-600 hover:underline font-semibold">sistemas de sonido completos</a>.`,
   
    whyChooseUs: [
      {
        icon: "🎵",
        title: "Equipos Profesionales",
        description: "Solo marcas líderes de máxima calidad"
      },
      {
        icon: "👨‍🔧",
        title: "Técnicos Especializados",
        description: "Expertos con años de experiencia"
      },
      {
        icon: "🚚",
        title: "Servicio Completo",
        description: "Transporte, montaje y desmontaje incluidos"
      },
      {
        icon: "🔒",
        title: "Equipos de Backup",
        description: "Respaldo siempre disponible"
      },
      {
        icon: "💰",
        title: "Precios Claros",
        description: "Sin costes ocultos"
      },
      {
        icon: "⚡",
        title: "Respuesta Rápida",
        description: "Presupuesto en 24h"
      }
    ],

    technicalSpecs: [
      {
            title: "DAS Audio 215A - Subwoofer Doble 15\"",
            items: [
                  "Doble 15\" (2x15\") - Dos altavoces de graves de 15 pulgadas",
                  "2000W de potencia - Amplificador Clase D integrado",
                  "Respuesta de frecuencia 35Hz-150Hz - Graves profundos sin saturar",
                  "Activo (autoamplificado) - No requiere amplificador externo",
                  "Ideal para fiestas, bodas, eventos de 80-150 personas"
            ]
      },
      {
            title: "DAS Audio 218A - Subwoofer Premium Doble 18\"",
            items: [
                  "Doble 18\" (2x18\") - Máxima potencia de graves",
                  "3200W pico (2400W RMS) - Potencia brutal para grandes eventos",
                  "Respuesta de frecuencia 30Hz-120Hz - Graves ultra profundos",
                  "SPL 138dB - Nivel de presión sonora extremo",
                  "Perfecto para conciertos, eventos +150 personas, fiestas grandes"
            ]
      },
      {
            title: "Configuración y Uso",
            items: [
                  "Configuración cardioide disponible - Dirección controlada de graves",
                  "Modo omnidireccional - Dispersión 360° para espacios grandes",
                  "Crossover integrado - Se conecta fácilmente con altavoces principales",
                  "Entrada XLR balanceada + salida thru para cadena",
                  "Controles en panel trasero - Volumen, fase, filtro pasa-altos"
            ]
      },
      {
            title: "Combinaciones Recomendadas",
            items: [
                  "1x Sub 215A + 2x DAS Audio 515A = Sistema completo hasta 150 personas",
                  "2x Sub 218A + 4x DAS Audio 515A = Sistema potente +200 personas",
                  "1x Sub 215A + 2x ICOA 15A = Perfecto para fiestas medianas",
                  "Incluye cables XLR profesionales balanceados",
                  "Técnico especializado ajusta crossover y ecualización"
            ]
      }
],

    packages: [
      {
        name: "Pack 1 Subwoofer",
        subtitle: "Graves para fiestas (80-120 personas)",
        price: "desde 120€",
        features: [
          "1x DAS Audio 215A (doble 15\", 2000W)",
          "Cables XLR profesionales incluidos",
          "Configuración y ajuste de crossover",
          "Transporte Valencia capital",
          "Montaje y desmontaje incluido"
        ]
      },
      {
        name: "Pack 2 Subwoofers",
        subtitle: "Potencia media (120-200 personas)",
        price: "desde 230€",
        features: [
          "2x DAS Audio 215A (4000W total)",
          "Configuración stereo o mono",
          "Técnico especializado incluido",
          "Cables y conexiones completas",
          "Ajuste de fase y ecualización",
          "Transporte y montaje completo"
        ],
        highlighted: true
      },
      {
        name: "Pack Premium",
        subtitle: "Máxima potencia (+200 personas)",
        price: "desde 300€",
        features: [
          "2x DAS Audio 218A (doble 18\", 6400W pico)",
          "2 técnicos especializados",
          "Equipos redundantes",
          "Prueba previa",
          "Soporte 24/7"
        ]
      }
    ],

    faqs: [
      {
            question: "¿Qué incluye exactamente el servicio de alquiler de subwoofers profesionales en Valencia?",
            answer: "Nuestro servicio completo de alquiler de subwoofers profesionales en Valencia incluye: equipamiento profesional de última generación perfectamente calibrado, técnico especializado con más de 10 años de experiencia (en packs Profesional y Premium), transporte sin coste adicional en Valencia capital y hasta 30km, montaje completo siguiendo plano del espacio y especificaciones del evento, configuración y calibración técnica personalizada, pruebas de sonido previas al evento, asistencia técnica durante todo el desarrollo del evento, equipos de respaldo incluidos en packs premium, desmontaje completo al finalizar, soporte telefónico 24/7 para emergencias, y seguro de responsabilidad civil de todos los equipos. Todo está incluido en el precio final sin sorpresas ni costes ocultos adicionales."
      },
      {
            question: "¿Con cuánta antelación debo reservar el alquiler de subwoofers profesionales en Valencia?",
            answer: "El plazo de reserva depende de la temporada y disponibilidad. Para fechas entre semana, generalmente con 1-2 semanas de antelación es suficiente, aunque recomendamos consultar disponibilidad lo antes posible. Para fines de semana, especialmente en temporada alta (mayo a octubre), recomendamos reservar con 1-2 meses de antelación mínimo. Para eventos grandes como conciertos o bodas que requieren producción compleja, lo ideal es contactar con 2-3 meses de antelación. Para fechas muy demandadas (Navidad, San Juan, Fallas, puentes festivos) recomendamos 3-4 meses. Puedes consultar disponibilidad en tiempo real llamando al 613 88 14 14 o vía WhatsApp, te respondemos en menos de 2 horas."
      },
      {
            question: "¿El técnico especializado está incluido en el precio?",
            answer: "Sí, en los packs Profesional y Premium el técnico especializado está totalmente incluido durante todo el evento. El técnico llega 2-3 horas antes para montaje y configuración, permanece durante todo el desarrollo del evento gestionando niveles, ecualizaciones y solucionando cualquier incidencia técnica, y se encarga del desmontaje completo al finalizar. En el pack Básico, los equipos son autoamplificados fáciles de operar con controles intuitivos, pero puedes añadir técnico especializado por 150€ adicionales si lo prefieres. Nuestros técnicos tienen formación específica en sonido profesional y más de 10 años de experiencia en eventos en Valencia, garantizando resultados profesionales impecables."
      },
      {
            question: "¿El transporte y montaje tiene coste adicional?",
            answer: "No, el transporte está completamente incluido en Valencia capital y hasta 30 kilómetros de radio sin ningún coste adicional. Para distancias superiores aplicamos suplemento: 30-50km +30€, 50-80km +60€, 80-120km +100€, más de 120km consultar presupuesto personalizado. El precio incluye: transporte de ida con furgoneta equipada, descarga y traslado de equipos al espacio del evento, montaje completo siguiendo especificaciones técnicas y plano del espacio, calibración y pruebas, desmontaje al finalizar el evento, recogida y transporte de vuelta. Todo en un precio cerrado final sin sorpresas. También ofrecemos opción de recogida en nuestro almacén en Valencia con 20% descuento si prefieres transportar tú mismo."
      },
      {
            question: "¿Qué pasa si hay algún fallo técnico durante el evento?",
            answer: "La fiabilidad es nuestra máxima prioridad. Todos nuestros equipos pasan revisión técnica completa antes de cada evento y utilizamos exclusivamente marcas profesionales de máxima confianza. En los packs Profesional y Premium incluimos siempre equipos de respaldo (backup completo de elementos críticos) sin coste adicional. En el improbable caso de fallo técnico, el técnico presente soluciona el 95% de incidencias en menos de 5 minutos. Para el 5% restante, disponemos de técnicos de guardia 24/7 con furgoneta equipada para reemplazo urgente, llegando en menos de 60 minutos en Valencia capital. En 15 años de trayectoria y más de 2.000 eventos realizados, nunca hemos tenido que cancelar o suspender un evento por fallo técnico gracias a nuestros sistemas redundantes y protocolos de contingencia."
      },
      {
            question: "¿Trabajáis con todos los tipos de eventos en Valencia?",
            answer: "Sí, tenemos amplia experiencia en todo tipo de eventos: conciertos, bodas, fiestas, eventos dance, festivales, y cualquier celebración que requiera alquiler de subwoofers profesionales en Valencia. Hemos trabajado en espacios emblemáticos de Valencia como el Palau de la Música, Ciudad de las Artes y las Ciencias, La Hacienda, Masía de San Antonio, Hotel Las Arenas, Viveros Municipales, así como en centenares de fincas, hoteles, locales, carpas, y espacios únicos en toda la provincia de Valencia, Castellón y Alicante. Cada tipo de evento tiene requisitos técnicos específicos que conocemos perfectamente: acústica, potencia necesaria, distribución de equipos, timing, y protocolos. Nuestro equipo realiza visita técnica previa gratuita para eventos grandes, evaluando acústica del espacio, puntos eléctricos, accesos, y diseñando la mejor configuración técnica."
      },
      {
            question: "¿Ofrecéis descuentos para eventos de varios días o múltiples servicios?",
            answer: "Sí, aplicamos descuentos progresivos atractivos. Para alquileres de varios días: 2-3 días consecutivos 15% descuento total, 4-7 días 25% descuento, más de 7 días precio especial personalizado. Para contratación de múltiples servicios combinados (por ejemplo sonido + iluminación, o sonido + vídeo + iluminación) aplicamos packs con hasta 20% descuento sobre contratación separada. También ofrecemos condiciones ventajosas para: clientes recurrentes con contrato marco, empresas organizadoras de eventos, ayuntamientos y entidades públicas, asociaciones y ONGs, y productoras audiovisuales. Consulta tu caso específico llamando al 613 88 14 14 para presupuesto personalizado ajustado con las máximas ventajas."
      },
      {
            question: "¿Puedo ver los equipos antes de contratar el servicio?",
            answer: "Por supuesto. Puedes visitar nuestro showroom-almacén en Valencia con cita previa, donde podrás ver y probar los equipos en funcionamiento. También organizamos demostraciones técnicas para eventos grandes o producciones complejas que lo requieran. Además, tenemos portfolio fotográfico completo de equipos, fichas técnicas detalladas con especificaciones, vídeos de eventos reales realizados, y referencias de clientes satisfechos. Para conciertos o bodas grandes, ofrecemos visita técnica gratuita al espacio del evento, donde mostramos referencias fotográficas de montajes similares y explicamos detalladamente la configuración técnica propuesta. Trabajamos con total transparencia: lo que ves en la demostración es exactamente lo que recibirás en tu evento."
      },
      {
            question: "¿Qué formas de pago aceptáis?",
            answer: "Aceptamos múltiples formas de pago para tu comodidad: transferencia bancaria (IBAN español), Bizum (hasta 1.000€), tarjeta de crédito/débito (Visa, Mastercard), PayPal, y efectivo. El proceso de reserva es: 1) Confirmas fecha y servicio, 2) Pagas señal del 30% para bloquear fecha (no reembolsable), 3) Pagas 70% restante hasta 7 días antes del evento, 4) Realizamos el evento, 5) Firmas albarán de conformidad. Emitimos factura completa con IVA desglosado. Para empresas ofrecemos pago a 30 días con contrato marco. Para eventos grandes (+ 2.000€) aceptamos pago fraccionado: 30% reserva, 40% un mes antes, 30% 7 días antes. Todas las transacciones son seguras y ofrecemos recibo/factura oficial."
      },
      {
            question: "¿Tenéis seguro de responsabilidad civil?",
            answer: "Sí, disponemos de seguro de responsabilidad civil profesional con cobertura de 600.000€ que cubre cualquier daño a terceros, equipos, instalaciones del venue, y accidentes durante montaje/desmontaje. Además, todos nuestros equipos están asegurados contra robo, daño, y mal funcionamiento. Nuestras estructuras truss están certificadas TÜV (inspección anual), cumplimos normativa UNE-EN 61439, y seguimos todos los protocolos de seguridad eléctrica y prevención de riesgos laborales. Nuestros técnicos tienen formación en prevención de riesgos, primeros auxilios, y trabajos en altura. Podemos proporcionar copia del seguro y certificados si el venue lo requiere. Tu evento está en manos profesionales y totalmente aseguradas, garantizando tranquilidad absoluta."
      }
],

    relatedServices: [
      { title: "Sonido Profesional", url: "/servicios/alquiler-sonido-valencia" },
      { title: "Iluminación LED", url: "/servicios/iluminacion-led-profesional" },
      { title: "Pantallas LED", url: "/servicios/alquiler-pantallas-led-eventos" }
    ]
  };

  return <ServicePageTemplate {...pageData} />;
};

export default AlquilerSubwoofers;
