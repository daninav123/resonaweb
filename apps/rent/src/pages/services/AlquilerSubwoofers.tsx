import React from 'react';
import ServicePageTemplate from '../../components/services/ServicePageTemplate';

const AlquilerSubwoofers = () => {
  const pageData = {
    title: "Subwoofers Valencia | DAS Audio 215A/218A | ReSona",
    metaDescription: "Subwoofers profesionales en Valencia. DAS Audio 215A/218A. 2000-3200W. Graves potentes. Técnico opcional. ☎️ 613 88 14 14",
    keywords: "alquiler subwoofers valencia, subwoofer profesional, graves eventos",
    canonicalUrl: "https://resonarent.com/servicios/alquiler-subwoofers",
    heroTitle: "Alquiler de Subwoofers Profesionales en Valencia",
    heroSubtitle: "DAS Audio 215A y 218A - Graves profundos y potentes para tu evento",
    introduction: `El <strong>alquiler de subwoofers profesionales en Valencia</strong> es esencial para conseguir graves potentes y profundos en tu evento. En ReSona Rent disponemos de <strong>DAS Audio 215A</strong> (subwoofer activo doble 15", 2000W) y <strong>DAS Audio 218A</strong> (subwoofer premium doble 18", 3200W pico).

Nuestro servicio de <strong>alquiler de subwoofers profesionales en Valencia</strong> está diseñado para eventos de 50 a 300 personas. Los subwoofers son fundamentales para fiestas, bodas, conciertos: aportan los graves que hacen vibrar el suelo y crean esa sensación de potencia sin saturar.

Disponemos de equipos de última generación, perfectamente mantenidos y calibrados profesionalmente antes de cada evento. Todos los equipos salen revisados y probados, con el cableado y los soportes necesarios para que puedas montarlo tú mismo sin complicaciones. Si prefieres que nos encarguemos nosotros, la entrega, el montaje y el técnico son servicios opcionales que se presupuestan aparte.

El alquiler incluye el material revisado, el cableado y los soportes necesarios, asesoramiento previo para elegir el equipo según tu aforo y tu espacio, y soporte telefónico durante el evento. La recogida y la devolución se hacen en nuestro almacén de Valencia; la entrega, el montaje y el técnico son opcionales y se presupuestan aparte.

Hemos trabajado en eventos de todo tipo en Valencia: conciertos, <a href="/servicios/sonido-bodas-valencia" class="text-resona-light hover:underline font-semibold">bodas</a>, fiestas, y todo tipo de celebraciones en espacios emblemáticos de la ciudad. Combinamos con <a href="/servicios/alquiler-sonido-valencia" class="text-resona-light hover:underline font-semibold">sistemas de sonido completos</a>.`,
   
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
        description: "Recogida en almacén · entrega y montaje opcionales"
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
          "Recogida en almacén"
        ]
      },
      {
        name: "Pack 2 Subwoofers",
        subtitle: "Potencia media (120-200 personas)",
        price: "desde 230€",
        features: [
          "2x DAS Audio 215A (4000W total)",
          "Configuración stereo o mono",
          "Técnico opcional",
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
            answer: "El alquiler incluye el equipo revisado y probado antes de salir, el cableado y los soportes necesarios, y asesoramiento previo para elegir la configuración según tu aforo y tu espacio. La recogida y la devolución se hacen en nuestro almacén de Valencia. Si necesitas entrega, montaje o un técnico durante el evento, son servicios opcionales que presupuestamos según la distancia y el volumen del material."
      },
      {
            question: "¿Con cuánta antelación debo reservar el alquiler de subwoofers profesionales en Valencia?",
            answer: "El plazo de reserva depende de la temporada y disponibilidad. Para fechas entre semana, generalmente con 1-2 semanas de antelación es suficiente, aunque recomendamos consultar disponibilidad lo antes posible. Para fines de semana, especialmente en temporada alta (mayo a octubre), recomendamos reservar con 1-2 meses de antelación mínimo. Para eventos grandes como conciertos o bodas que requieren producción compleja, lo ideal es contactar con 2-3 meses de antelación. Para fechas muy demandadas (Navidad, San Juan, Fallas, puentes festivos) recomendamos 3-4 meses. Puedes consultar disponibilidad en tiempo real llamando al 613 88 14 14 o vía WhatsApp, te respondemos en menos de 2 horas."
      },
      {
            question: "¿Puedo contratar un técnico para el evento?",
            answer: "El técnico no va incluido en el alquiler: el material se entrega listo para que lo montes tú, con su cableado y sus soportes. Si prefieres que se encargue alguien, podemos asignarte un técnico como servicio opcional. Cuéntanos el tipo de evento y el espacio y te lo presupuestamos aparte."
      },
      {
            question: "¿Tengo que recoger el material o me lo lleváis?",
            answer: "Lo habitual es que recojas el material en nuestro almacén de Valencia y lo devuelvas al terminar: así te ahorras el coste del transporte. Si prefieres que te lo llevemos, la entrega es un servicio opcional que se calcula según la distancia y el volumen del pedido. Dinos la dirección y la fecha y te cerramos el precio antes de reservar."
      },
      {
            question: "¿Qué pasa si hay algún fallo técnico durante el evento?",
            answer: "La fiabilidad es nuestra máxima prioridad. Todos nuestros equipos pasan revisión técnica completa antes de cada evento y utilizamos exclusivamente marcas profesionales de máxima confianza. En los packs Profesional y Premium puedes añadir equipo de respaldo al alquiler. Si surge cualquier problema durante el evento, tienes soporte telefónico directo con nosotros para resolverlo, y si hace falta sustituir material te lo cambiamos en el almacén. En 15 años de trayectoria y multitud de eventos realizados, nunca hemos tenido que cancelar o suspender un evento por fallo técnico gracias a nuestros sistemas redundantes y protocolos de contingencia."
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
      { title: "Altavoces Profesionales", url: "/servicios/alquiler-altavoces-profesionales" },
      { title: "Mesa de Mezclas DJ", url: "/servicios/alquiler-mesa-mezcla-dj" },
      { title: "Alquiler de DJ", url: "/servicios/alquiler-dj-valencia" }
    ]
  };

  return <ServicePageTemplate {...pageData} />;
};

export default AlquilerSubwoofers;
