import React from 'react';
import ServicePageTemplate from '../../components/services/ServicePageTemplate';

const AlquilerLaser = () => {
  const pageData = {
    title: "Láser Eventos Valencia | RGB Profesional | ReSona",
    metaDescription: "Láser profesional RGB para eventos. Efectos espectaculares. Control DMX, sincronización música. Técnico opcional. ☎️ 613 88 14 14",
    keywords: "alquiler laser eventos valencia, laser profesional, efectos laser",
    canonicalUrl: "https://resonarent.com/servicios/alquiler-laser",
    heroTitle: "Alquiler de Láser Profesional en Valencia",
    heroSubtitle: "Efectos láser profesionales - Disponibles bajo pedido especial",
    introduction: `El <strong>alquiler de láser profesional en Valencia</strong> es fundamental para garantizar el éxito de cualquier evento en la Comunidad Valenciana. En ReSona Rent contamos con experiencia desde 2011 proporcionando servicios audiovisuales profesionales de máxima calidad en Valencia, Castellón y Alicante.

Nuestro servicio de <strong>alquiler de láser profesional en Valencia</strong> está diseñado para cubrir desde eventos íntimos de 20 personas hasta grandes producciones de más de 5.000 asistentes. Equipos láser profesionales disponibles bajo pedido. Consultanos para eventos especiales que requieran efectos láser RGB, beam, animaciones. Todos los equipos cumplen normativa CE y requieren operador certificado.

Disponemos de equipos de última generación, perfectamente mantenidos y calibrados profesionalmente antes de cada evento. Todos los equipos salen revisados y probados, con el cableado y los soportes necesarios para que puedas montarlo tú mismo sin complicaciones. Si prefieres que nos encarguemos nosotros, la entrega, el montaje y el técnico son servicios opcionales que se presupuestan aparte.

El alquiler incluye el material revisado, el cableado y los soportes necesarios, asesoramiento previo para elegir el equipo según tu aforo y tu espacio, y soporte telefónico durante el evento. La recogida y la devolución se hacen en nuestro almacén de Valencia; la entrega, el montaje y el técnico son opcionales y se presupuestan aparte.

Hemos trabajado en eventos de todo tipo en Valencia: conciertos, festivales, eventos en espacios emblemáticos de la ciudad. Combinamos con <a href="/servicios/iluminacion-led-profesional" class="text-resona-light hover:underline font-semibold">iluminación LED</a> y <a href="/servicios/alquiler-moving-heads" class="text-resona-light hover:underline font-semibold">moving heads</a>.`,
   
    whyChooseUs: [
      {
        icon: "",
        title: "Equipos Profesionales",
        description: "Solo marcas líderes de máxima calidad"
      },
      {
        icon: "‍",
        title: "Técnicos Especializados",
        description: "Expertos con años de experiencia"
      },
      {
        icon: "",
        title: "Servicio Completo",
        description: "Recogida en almacén · entrega y montaje opcionales"
      },
      {
        icon: "",
        title: "Equipos de Backup",
        description: "Respaldo siempre disponible"
      },
      {
        icon: "",
        title: "Precios Claros",
        description: "Sin costes ocultos"
      },
      {
        icon: "",
        title: "Respuesta Rápida",
        description: "Presupuesto en 24h"
      }
    ],

    technicalSpecs: [
      {
            title: "Focos PAR LED Profesionales",
            items: [
                  "Chauvet SlimPAR Pro: 12×4W RGBW, ángulo 25°, modo DMX/autónomo/master-slave",
                  "ADJ Mega Par Profile Plus: 228W RGBWA+UV, wash uniforme, flicker-free para vídeo",
                  "Showtec Spectral M800: 8×10W RGBA, compacto, batería litio recargable 8-12h",
                  "Martin RUSH PAR 2 RGBW: 12×12W Zoom 15-40°, profesional touring IP20",
                  "Eurolite LED IP PAR: 14×10W RGBWA+UV, certificación IP65 waterproof exterior"
            ]
      },
      {
            title: "Moving Heads y Cabezas Móviles",
            items: [
                  "Martin RUSH MH3 Beam: 140W LED Beam, prisma 3 facetas, 8 gobos rotación",
                  "Chauvet Intimidator Spot 355: 90W LED Spot, 8 gobos + 8 colores dicróicos",
                  "ADJ Focus Spot 4Z: 200W LED Spot motorized Zoom 12-30°, iris variable",
                  "Showtec Phantom 75 LED Beam: Beam compacto 75W, prisma, velocidad pan/tilt",
                  "American DJ Inno Pocket Wash: Mini moving wash 7×10W, compacto DJ booth"
            ]
      },
      {
            title: "Controladores DMX y Efectos",
            items: [
                  "Controlador Martin M-Touch: Pantalla táctil 15\", 16 universos Art-Net, librería fixtures",
                  "ADJ Operator 384: Mesa DMX 384 canales, 24 fixtures, 30 bancos, MIDI",
                  "Chauvet Obey 70: Controlador compacto 192 canales, 12 escenas, fade manual",
                  "Antari Z-350 Fazer: Máquina neblina DMX, tanque 3.5L, 700W",
                  "Chauvet Hurricane 1800 Flex: Humo 1800W, control DMX/wireless, timer"
            ]
      },
      {
            title: "Iluminación Arquitectónica Exterior",
            items: [
                  "Bañadores LED RGBW IP65: 36×3W, alcance 20m, ángulo 25°/45°",
                  "Uplights wireless batería: 12×18W RGBWA+UV, 12h autonomía, control WiFi",
                  "Proyectores LED 150-300W: Iluminación fachadas, jardines, COB chip",
                  "Tiras LED RGBW IP68: 5050/2835 SMD, 60-120 LED/m, sumergibles",
                  "Controladores DMX wireless: 2.4GHz, alcance 300m, 512 canales"
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
            question: "¿Qué incluye exactamente el servicio de alquiler de láser profesional en Valencia?",
            answer: "El alquiler incluye el equipo revisado y probado antes de salir, el cableado y los soportes necesarios, y asesoramiento previo para elegir la configuración según tu aforo y tu espacio. La recogida y la devolución se hacen en nuestro almacén de Valencia. Si necesitas entrega, montaje o un técnico durante el evento, son servicios opcionales que presupuestamos según la distancia y el volumen del material."
      },
      {
            question: "¿Con cuánta antelación debo reservar el alquiler de láser profesional en Valencia?",
            answer: "El plazo de reserva depende de la temporada y disponibilidad. Para fechas entre semana, generalmente con 1-2 semanas de antelación es suficiente, aunque recomendamos consultar disponibilidad lo antes posible. Para fines de semana, especialmente en temporada alta (mayo a octubre), recomendamos reservar con 1-2 meses de antelación mínimo. Para eventos grandes como conciertos o festivales que requieren producción compleja, lo ideal es contactar con 2-3 meses de antelación. Para fechas muy demandadas (Navidad, San Juan, Fallas, puentes festivos) recomendamos 3-4 meses. Puedes consultar disponibilidad en tiempo real llamando al 613 88 14 14 o vía WhatsApp, te respondemos en menos de 2 horas."
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
            answer: "Sí, tenemos amplia experiencia en todo tipo de eventos: conciertos, festivales, eventos, discotecas, shows, y cualquier celebración que requiera alquiler de láser profesional en Valencia. Hemos trabajado en espacios emblemáticos de Valencia como el Palau de la Música, Ciudad de las Artes y las Ciencias, La Hacienda, Masía de San Antonio, Hotel Las Arenas, Viveros Municipales, así como en centenares de fincas, hoteles, locales, carpas, y espacios únicos en toda la provincia de Valencia, Castellón y Alicante. Cada tipo de evento tiene requisitos técnicos específicos que conocemos perfectamente: acústica, potencia necesaria, distribución de equipos, timing, y protocolos. Nuestro equipo realiza visita técnica previa gratuita para eventos grandes, evaluando acústica del espacio, puntos eléctricos, accesos, y diseñando la mejor configuración técnica."
      },
      {
            question: "¿Ofrecéis descuentos para eventos de varios días o múltiples servicios?",
            answer: "Sí, aplicamos descuentos progresivos atractivos. Para alquileres de varios días: 2-3 días consecutivos 15% descuento total, 4-7 días 25% descuento, más de 7 días precio especial personalizado. Para contratación de múltiples servicios combinados (por ejemplo sonido + iluminación, o sonido + vídeo + iluminación) aplicamos packs con hasta 20% descuento sobre contratación separada. También ofrecemos condiciones ventajosas para: clientes recurrentes con contrato marco, empresas organizadoras de eventos, ayuntamientos y entidades públicas, asociaciones y ONGs, y productoras audiovisuales. Consulta tu caso específico llamando al 613 88 14 14 para presupuesto personalizado ajustado con las máximas ventajas."
      },
      {
            question: "¿Puedo ver los equipos antes de contratar el servicio?",
            answer: "Por supuesto. Puedes visitar nuestro showroom-almacén en Valencia con cita previa, donde podrás ver y probar los equipos en funcionamiento. También organizamos demostraciones técnicas para eventos grandes o producciones complejas que lo requieran. Además, tenemos portfolio fotográfico completo de equipos, fichas técnicas detalladas con especificaciones, vídeos de eventos reales realizados, y referencias de clientes satisfechos. Para conciertos o festivales grandes, ofrecemos visita técnica gratuita al espacio del evento, donde mostramos referencias fotográficas de montajes similares y explicamos detalladamente la configuración técnica propuesta. Trabajamos con total transparencia: lo que ves en la demostración es exactamente lo que recibirás en tu evento."
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
      { title: "Moving Heads", url: "/servicios/alquiler-moving-heads" },
      { title: "Máquinas de Efectos", url: "/servicios/alquiler-maquinas-fx" },
      { title: "Pantallas LED", url: "/servicios/alquiler-pantallas-led" }
    ]
  };

  return <ServicePageTemplate {...pageData} />;
};

export default AlquilerLaser;
