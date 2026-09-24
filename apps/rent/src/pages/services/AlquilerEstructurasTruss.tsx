import React from 'react';
import ServicePageTemplate from '../../components/services/ServicePageTemplate';

const AlquilerEstructurasTruss = () => {
  const pageData = {
    title: "Estructuras Truss Valencia | Montajes Rigging | ReSona",
    metaDescription: "Estructuras truss para eventos. Montajes profesionales certificados. Rigging seguro. Técnico opcional. ☎️ 613 88 14 14",
    keywords: "alquiler truss valencia, estructuras eventos, montajes truss",
    canonicalUrl: "https://resonarent.com/servicios/alquiler-estructuras-truss",
    heroTitle: "Alquiler de Estructuras Truss en Valencia",
    heroSubtitle: "Estructuras truss profesionales para Moving Heads, iluminación, sonido. Montajes seguros y profesionales - Servicio en Valencia y provincia",
    introduction: `El <strong>alquiler de estructuras truss en Valencia</strong> es fundamental para garantizar el éxito de cualquier evento en la Comunidad Valenciana. En ReSona Rent contamos con experiencia desde 2011 proporcionando servicios audiovisuales profesionales de máxima calidad en Valencia, Castellón y Alicante.

Nuestro servicio de <strong>alquiler de estructuras truss en Valencia</strong> está diseñado para cubrir desde eventos íntimos de 20 personas hasta grandes producciones de más de 5.000 asistentes. Trabajamos con estructuras truss profesionales certificadas (triangular/cuadrado 290mm) para colgar Moving Heads 17R/7R, iluminación LED, altavoces. Torres elevadoras, ground support, rigging certificado TÜV. Instalación segura por técnicos especializados.

Disponemos de equipos de última generación, perfectamente mantenidos y calibrados profesionalmente antes de cada evento. Todos los equipos salen revisados y probados, con el cableado y los soportes necesarios para que puedas montarlo tú mismo sin complicaciones. Si prefieres que nos encarguemos nosotros, la entrega, el montaje y el técnico son servicios opcionales que se presupuestan aparte.

El alquiler incluye el material revisado, el cableado y los soportes necesarios, asesoramiento previo para elegir el equipo según tu aforo y tu espacio, y soporte telefónico durante el evento. La recogida y la devolución se hacen en nuestro almacén de Valencia; la entrega, el montaje y el técnico son opcionales y se presupuestan aparte.

Hemos trabajado en eventos de todo tipo en Valencia: conciertos, eventos, ferias en espacios emblemáticos de la ciudad. Utilizamos para <a href="/servicios/iluminacion-led-profesional" class="text-primary-600 hover:underline font-semibold">iluminación profesional</a> y <a href="/servicios/alquiler-sonido-valencia" class="text-primary-600 hover:underline font-semibold">sistemas de sonido</a>.`,
   
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
            title: "Estructuras Truss Certificadas",
            items: [
                  "Truss triangular 290mm: Aluminio 6061-T6, carga 250kg/m, TÜV certificado",
                  "Truss cuadrado 290×290mm: Heavy duty, carga 400kg/m, esquinas reforzadas",
                  "Torres elevadoras: Cremallera manual/motor, 3-6m altura, base 1.5×1.5m",
                  "Ground support: Vigas 6-12m, patas telescópicas, outriggers estabilizadores",
                  "Rigging: Motores chain hoist 250-500kg, controladores DMX"
            ]
      },
      {
            title: "Máquinas de Efectos Especiales",
            items: [
                  "Humo bajo/alto: Antari ICE-101, M-10E, fluido base agua no tóxico",
                  "Fazer/neblina fina: Look Solutions Unique 2.1, Antari Z-350",
                  "CO2 jets: 6m columna blanca fría, control DMX, cilindros 20kg",
                  "Confeti cañones: Disparador eléctrico, papelitos biodegradables colores",
                  "Burbujas profesionales: Antari B-200, líquido especial ultra-resistente",
                  "Chispas frías: Máquina sparkular, 3-5m altura, sin llama, seguras interior"
            ]
      },
      {
            title: "Backline y Equipamiento Musical",
            items: [
                  "Baterías completas: Pearl/Yamaha, 5 piezas, platillos Zildjian/Sabian",
                  "Amplificadores guitarra: Marshall/Fender 50-100W, combos/cabezales",
                  "Amplificadores bajo: Ampeg SVT, Markbass, 300-500W, cajas 4×10/1×15",
                  "Teclados MIDI: Nord Stage/Yamaha Montage, 88 teclas weighted",
                  "Atriles partituras: Manhasset, iluminación LED, plegables transporte"
            ]
      }
],

    packages: [
      {
        name: "Pack Básico",
        subtitle: "Para eventos pequeños",
        price: "desde 300€",
        features: [
          "Equipos básicos profesionales",
          "Recogida en almacén",
          "Montaje y desmontaje",
          "Asistencia telefónica"
        ]
      },
      {
        name: "Pack Profesional",
        subtitle: "Más popular",
        price: "desde 600€",
        features: [
          "Equipos profesionales completos",
          "Técnico opcional",
          "Transporte y montaje",
          "Equipos de backup",
          "Soporte completo"
        ],
        highlighted: true
      },
      {
        name: "Pack Premium",
        subtitle: "Máxima calidad",
        price: "desde 1.200€",
        features: [
          "Equipos top de gama",
          "2 técnicos especializados",
          "Equipos redundantes",
          "Prueba previa",
          "Soporte 24/7"
        ]
      }
    ],

    faqs: [
      {
            question: "¿Qué incluye exactamente el servicio de alquiler de estructuras truss en Valencia?",
            answer: "El alquiler incluye el equipo revisado y probado antes de salir, el cableado y los soportes necesarios, y asesoramiento previo para elegir la configuración según tu aforo y tu espacio. La recogida y la devolución se hacen en nuestro almacén de Valencia. Si necesitas entrega, montaje o un técnico durante el evento, son servicios opcionales que presupuestamos según la distancia y el volumen del material."
      },
      {
            question: "¿Con cuánta antelación debo reservar el alquiler de estructuras truss en Valencia?",
            answer: "El plazo de reserva depende de la temporada y disponibilidad. Para fechas entre semana, generalmente con 1-2 semanas de antelación es suficiente, aunque recomendamos consultar disponibilidad lo antes posible. Para fines de semana, especialmente en temporada alta (mayo a octubre), recomendamos reservar con 1-2 meses de antelación mínimo. Para eventos grandes como conciertos o eventos que requieren producción compleja, lo ideal es contactar con 2-3 meses de antelación. Para fechas muy demandadas (Navidad, San Juan, Fallas, puentes festivos) recomendamos 3-4 meses. Puedes consultar disponibilidad en tiempo real llamando al 613 88 14 14 o vía WhatsApp, te respondemos en menos de 2 horas."
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
            answer: "Sí, tenemos amplia experiencia en todo tipo de eventos: conciertos, eventos, ferias, stands, iluminación aérea, y cualquier celebración que requiera alquiler de estructuras truss en Valencia. Hemos trabajado en espacios emblemáticos de Valencia como el Palau de la Música, Ciudad de las Artes y las Ciencias, La Hacienda, Masía de San Antonio, Hotel Las Arenas, Viveros Municipales, así como en centenares de fincas, hoteles, locales, carpas, y espacios únicos en toda la provincia de Valencia, Castellón y Alicante. Cada tipo de evento tiene requisitos técnicos específicos que conocemos perfectamente: acústica, potencia necesaria, distribución de equipos, timing, y protocolos. Nuestro equipo realiza visita técnica previa gratuita para eventos grandes, evaluando acústica del espacio, puntos eléctricos, accesos, y diseñando la mejor configuración técnica."
      },
      {
            question: "¿Ofrecéis descuentos para eventos de varios días o múltiples servicios?",
            answer: "Sí, aplicamos descuentos progresivos atractivos. Para alquileres de varios días: 2-3 días consecutivos 15% descuento total, 4-7 días 25% descuento, más de 7 días precio especial personalizado. Para contratación de múltiples servicios combinados (por ejemplo sonido + iluminación, o sonido + vídeo + iluminación) aplicamos packs con hasta 20% descuento sobre contratación separada. También ofrecemos condiciones ventajosas para: clientes recurrentes con contrato marco, empresas organizadoras de eventos, ayuntamientos y entidades públicas, asociaciones y ONGs, y productoras audiovisuales. Consulta tu caso específico llamando al 613 88 14 14 para presupuesto personalizado ajustado con las máximas ventajas."
      },
      {
            question: "¿Puedo ver los equipos antes de contratar el servicio?",
            answer: "Por supuesto. Puedes visitar nuestro showroom-almacén en Valencia con cita previa, donde podrás ver y probar los equipos en funcionamiento. También organizamos demostraciones técnicas para eventos grandes o producciones complejas que lo requieran. Además, tenemos portfolio fotográfico completo de equipos, fichas técnicas detalladas con especificaciones, vídeos de eventos reales realizados, y referencias de clientes satisfechos. Para conciertos o eventos grandes, ofrecemos visita técnica gratuita al espacio del evento, donde mostramos referencias fotográficas de montajes similares y explicamos detalladamente la configuración técnica propuesta. Trabajamos con total transparencia: lo que ves en la demostración es exactamente lo que recibirás en tu evento."
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
      { title: "Pantallas LED", url: "/servicios/alquiler-pantallas-led" },
      { title: "Moving Heads", url: "/servicios/alquiler-moving-heads" },
      { title: "Sonido Profesional", url: "/servicios/alquiler-sonido-valencia" }
    ]
  };

  return <ServicePageTemplate {...pageData} />;
};

export default AlquilerEstructurasTruss;
