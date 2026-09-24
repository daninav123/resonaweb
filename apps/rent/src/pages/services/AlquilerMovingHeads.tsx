import React from 'react';
import ServicePageTemplate from '../../components/services/ServicePageTemplate';

const AlquilerMovingHeads = () => {
  const pageData = {
    title: "Moving Heads Valencia | Luces Robotizadas | ReSona",
    metaDescription: "Moving heads profesionales. Luces robotizadas 17R, 7R. Beam, Spot, Wash. Control DMX. Técnico opcional. ☎️ 613 88 14 14",
    keywords: "alquiler moving heads valencia, luces robotizadas, luces inteligentes eventos",
    canonicalUrl: "https://resonarent.com/servicios/alquiler-moving-heads",
    heroTitle: "Alquiler de Moving Heads en Valencia",
    heroSubtitle: "Moving Head 17R, 7R, Mini Beam LED - Efectos profesionales Dinámicos",
    introduction: `El <strong>alquiler de moving heads en Valencia</strong> transforma cualquier evento en un espectáculo visual impresionante. En ReSona Rent disponemos de <strong>Moving Head 3en1 17R</strong> (350W Beam/Spot/Wash), <strong>Moving Head Beam 7R</strong> (230W, 14 colores), <strong>Mini Beam LED</strong> y <strong>Mini Wash LED RGBW</strong>.

Nuestro servicio de <strong>alquiler de moving heads en Valencia</strong> está diseñado para eventos de 50 a 300 personas. Los moving heads son cabezas móviles robotizadas que crean efectos dinámicos espectaculares: haces de luz que se mueven, cambian de color, proyectan gobos, y se sincronizan con la música.

Perfectos para bodas (entrada de novios, primera baile), eventos corporativos (presentaciones, galas), conciertos, y fiestas. Incluimos <strong>técnico especializado</strong> que programa y controla los moving heads durante el evento, creando efectos sincronizados perfectamente.

El servicio completo incluye: transporte en Valencia capital (30km), montaje con estructuras truss profesionales, controlador DMX 512, programación de escenas personalizadas, operación durante todo el evento, desmontaje, y soporte 24/7.

Hemos iluminado multitud de eventos con moving heads en Valencia: <a href="/servicios/sonido-bodas-valencia" class="text-primary-600 hover:underline font-semibold">bodas</a>, conciertos, eventos corporativos en Palau de la Música y espacios únicos. Combinamos con <a href="/servicios/iluminacion-led-profesional" class="text-primary-600 hover:underline font-semibold">iluminación LED</a>.`,
   
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
            title: "Moving Head 3en1 17R - Profesional",
            items: [
                  "Lámpara 17R de 350W - Potencia máxima para grandes eventos",
                  "3 en 1: Beam (haz concentrado), Spot (gobos), Wash (ángulo amplio) - Máxima versatilidad",
                  "Prisma 8+16 facetas - Efectos multiplicados espectaculares",
                  "Zoom motorizado 5-45° - Ajuste preciso del ángulo de proyección",
                  "14 colores + blanco + rueda CMY para millones de combinaciones",
                  "Gobos estáticos y rotativos - Proyección de formas y patrones"
            ]
      },
      {
            title: "Moving Head Beam 7R - Compacto y Potente",
            items: [
                  "Lámpara 7R de 230W - Beam concentrado ultra potente",
                  "14 colores + blanco - Rueda dicróica de alta calidad",
                  "Prisma 3 facetas - Multiplicación de efectos beam",
                  "Haz de luz súper concentrado - Ideal para atravesar humo/niebla",
                  "Velocidad pan/tilt ajustable - Movimientos rápidos o suaves"
            ]
      },
      {
            title: "Mini Beam y Mini Wash LED",
            items: [
                  "Mini Beam LED 60W: Compacto, 8 colores, DMX 512, perfecto para eventos pequeños",
                  "Mini Wash LED RGBW 80W: Mezcla de colores suave, zoom motorizado, silencioso",
                  "Bajo consumo eléctrico - Ideales para espacios con potencia limitada",
                  "Control DMX sincronizado - Efectos coordinados con otros equipos",
                  "Montaje versátil - Suelo, truss, o colgados del techo"
            ]
      },
      {
            title: "Control y Programación",
            items: [
                  "Controlador DMX 512 profesional - Control total de todos los moving heads",
                  "Programación personalizada de escenas y secuencias",
                  "Modo automático music-reactive - Se sincronizan con la música",
                  "Estructuras truss profesionales para montaje seguro",
                  "Técnico especializado - Operación manual durante todo el evento"
            ]
      }
],

    packages: [
      {
        name: "Pack Mini",
        subtitle: "Eventos pequeños (50-100 personas)",
        price: "desde 200€",
        features: [
          "2x Mini Beam LED + 2x Mini Wash RGBW",
          "Controlador DMX profesional",
          "Programación de escenas básicas",
          "Montaje con soportes de suelo",
          "Transporte Valencia capital",
          "Asistencia telefónica"
        ]
      },
      {
        name: "Pack Profesional",
        subtitle: "Eventos medianos (100-200 personas)",
        price: "desde 400€",
        features: [
          "2x Moving Head Beam 7R (230W)",
          "2x Mini Beam + 2x Mini Wash LED",
          "Estructura truss profesional",
          "Controlador DMX + programación avanzada",
          "Técnico opcional",
          "Efectos sincronizados con música",
          "Transporte y montaje completo"
        ],
        highlighted: true
      },
      {
        name: "Pack Premium",
        subtitle: "Eventos grandes (+200 personas)",
        price: "desde 700€",
        features: [
          "4x Moving Head 3en1 17R (350W)",
          "2x Moving Head Beam 7R adicionales",
          "Estructura truss completa",
          "2 técnicos especializados",
          "Programación show completo",
          "Equipos backup incluidos",
          "Visita técnica previa",
          "Soporte 24/7"
        ]
      }
    ],

    faqs: [
      {
            question: "¿Qué incluye exactamente el servicio de alquiler de moving heads en Valencia?",
            answer: "El alquiler incluye el equipo revisado y probado antes de salir, el cableado y los soportes necesarios, y asesoramiento previo para elegir la configuración según tu aforo y tu espacio. La recogida y la devolución se hacen en nuestro almacén de Valencia. Si necesitas entrega, montaje o un técnico durante el evento, son servicios opcionales que presupuestamos según la distancia y el volumen del material."
      },
      {
            question: "¿Con cuánta antelación debo reservar el alquiler de moving heads en Valencia?",
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
            answer: "Sí, tenemos amplia experiencia en todo tipo de eventos: conciertos, bodas, eventos, discotecas, teatro, y cualquier celebración que requiera alquiler de moving heads en Valencia. Hemos trabajado en espacios emblemáticos de Valencia como el Palau de la Música, Ciudad de las Artes y las Ciencias, La Hacienda, Masía de San Antonio, Hotel Las Arenas, Viveros Municipales, así como en centenares de fincas, hoteles, locales, carpas, y espacios únicos en toda la provincia de Valencia, Castellón y Alicante. Cada tipo de evento tiene requisitos técnicos específicos que conocemos perfectamente: acústica, potencia necesaria, distribución de equipos, timing, y protocolos. Nuestro equipo realiza visita técnica previa gratuita para eventos grandes, evaluando acústica del espacio, puntos eléctricos, accesos, y diseñando la mejor configuración técnica."
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
      { title: "Iluminación LED", url: "/servicios/iluminacion-led-profesional" },
      { title: "Láser", url: "/servicios/alquiler-laser" },
      { title: "Máquinas de Efectos", url: "/servicios/alquiler-maquinas-fx" },
      { title: "Iluminación para Bodas", url: "/servicios/alquiler-iluminacion-bodas" }
    ]
  };

  return <ServicePageTemplate {...pageData} />;
};

export default AlquilerMovingHeads;
