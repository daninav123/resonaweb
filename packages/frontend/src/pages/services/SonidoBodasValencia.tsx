import React from 'react';
import ServicePageTemplate from '../../components/services/ServicePageTemplate';

const SonidoBodasValencia = () => {
  const pageData = {
    title: "Sonido Profesional para Bodas en Valencia | Ceremonia + Banquete + Fiesta",
    metaDescription: "Sonido completo para bodas en Valencia. Ceremonia, discursos y fiesta. Equipos profesionales + técnico. Desde 600€. ☎️ 613 88 14 14",
    keywords: "sonido bodas valencia, alquiler sonido boda, sonido ceremonia valencia",
    heroTitle: "Sonido Profesional para Bodas en Valencia",
    heroSubtitle: "DAS Audio, ICOA, Behringer, Shure - Sonido perfecto para tu boda",
    introduction: `El <strong>sonido para bodas en Valencia</strong> es fundamental para garantizar el éxito de tu día especial. En ReSona Events contamos con más de 15 años de experiencia en bodas en la Comunidad Valenciana. Nuestro servicio de <strong>sonido para bodas en Valencia</strong> cubre ceremonia, cóctel, banquete y fiesta: todo el día con sonido perfecto. Trabajamos con equipamiento profesional: <strong>DAS Audio 515A</strong> (altavoces 1500W), <strong>ICOA 12A/15A</strong> (acabados elegantes blanco/negro), <strong>subwoofers DAS Audio 215A/218A</strong>, <strong>Behringer X Air XR18</strong>, <strong>Pioneer RX2</strong> para DJ, y micrófonos <strong>Shure SM58</strong> inalámbricos. Todos nuestros equipos están perfectamente mantenidos y calibrados antes de cada boda. Incluimos <strong>técnico especializado</strong> que se encarga de: instalación discreta antes de la ceremonia, ajuste de niveles durante discursos, mezcla profesional en el banquete, y gestión de música DJ en la fiesta. El servicio completo incluye: transporte gratis en Valencia capital (30km), montaje invisible antes de los invitados, desmontaje al finalizar, micrófonos inalámbricos para novios/testigos/sacerdote, conexión para música ceremony/banquete, equipos de respaldo, y soporte 24/7. Hemos sonorizado más de 500 bodas en: Masias de Valencia, La Hacienda, Hotel Las Arenas, fincas en l'Horta, hoteles en la playa, y espacios únicos en toda la provincia.`,
   
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
            title: "Altavoces y Sistemas de PA",
            items: [
                  "DAS Audio 515A: Altavoz activo 1500W, 2 vías, DSP integrado, SPL 135dB - Sonido cristalino para ceremonias",
                  "ICOA 12A Blanco: Altavoz elegante 1000W, acabado blanco perfecto para bodas, discreto y potente",
                  "ICOA 15A Negro: Altavoz 1200W, graves profundos, ideal para banquete y fiesta",
                  "DAS Audio 215A: Subwoofer doble 15\", 2000W, graves potentes para la fiesta sin saturar",
                  "DAS Audio 218A: Subwoofer premium doble 18\", 3200W pico, máxima potencia para fiestas grandes",
                  "Altavoces portátiles con batería para ceremonias al aire libre sin electricidad"
            ]
      },
      {
            title: "Mesas de Mezclas y Control",
            items: [
                  "Behringer X Air XR18: Mezcladora digital 18 canales, control WiFi/tablet, efectos profesionales",
                  "Pioneer RX2: Controlador DJ profesional 2 canales, efectos FX, grabación USB de la ceremonia",
                  "Control remoto inalámbrico para ajustes discretos durante ceremonia y discursos",
                  "Procesador DSP integrado para ecualización automática según el espacio",
                  "Apps iOS/Android para control total desde tablet - técnico invisible durante el evento"
            ]
      },
      {
            title: "Micrófonos para Bodas",
            items: [
                  "Shure SM58 Inalámbrico: Micrófono profesional para novios, testigos, sacerdote - sin cables molestos",
                  "Shure SM57: Micrófono para instrumentos en vivo (guitarra, piano) durante ceremonia",
                  "Micrófonos inalámbricos UHF adicionales para discursos múltiples en el banquete",
                  "Micrófonos de solapa discretos para ceremonias civiles o presentadores",
                  "Soportes ajustables profesionales con bases antivuelco - instalación invisible",
                  "Cables XLR balanceados premium - sin ruidos ni interferencias"
            ]
      },
      {
            title: "Monitorización y Accesorios",
            items: [
                  "Monitores de escenario activos 12\"/15\" coaxiales, 45° ángulo proyección",
                  "In-Ear monitoring Sennheiser/Shure, receptores belt-pack, auriculares profesionales",
                  "Cables XLR Neutrik/Cordial balanceados 3-25m, conectores chapados oro",
                  "Multipar 16-32 canales stage box a mixer, snake cables certificados",
                  "Extensiones eléctricas schuko CEE profesionales 10-50m, protección térmica"
            ]
      }
],

    packages: [
      {
        name: "Pack Ceremonia",
        subtitle: "Solo ceremonia (50-80 invitados)",
        price: "desde 159€ (IVA incl.)",
        features: [
          "2x ICOA 12A Blanco (discretos y elegantes)",
          "2x Micrófonos inalámbricos Shure (novios/sacerdote)",
          "Conexión música (Spotify/móvil/USB)",
          "Técnico durante ceremonia",
          "Montaje invisible antes de invitados",
          "Transporte gratis Valencia capital"
        ]
      },
      {
        name: "Pack Boda Completa",
        subtitle: "Ceremonia + Banquete + Fiesta (80-150 invitados)",
        price: "desde 448€ (IVA incl.)",
        features: [
          "2x DAS Audio 515A (ceremonia y banquete)",
          "1x DAS Audio 215A Sub (fiesta con DJ)",
          "Behringer X Air XR18 + Pioneer RX2",
          "4x Micrófonos inalámbricos Shure",
          "Técnico todo el día (8-12 horas)",
          "Música ceremonia, discursos, fiesta",
          "Equipos backup incluidos",
          "Grabación audio ceremonia en USB"
        ],
        highlighted: true
      },
      {
        name: "Pack Premium",
        subtitle: "Bodas grandes (+150 invitados)",
        price: "desde 665€ (IVA incl.)",
        features: [
          "4x DAS Audio 515A + 2x ICOA 15A",
          "2x DAS Audio 218A Subwoofer (fiesta potente)",
          "Behringer X Air + Pioneer RX2 + Backup",
          "6+ Micrófonos profesionales",
          "2 técnicos especializados todo el día",
          "Iluminación ambiental LED opcional",
          "Visita técnica previa al lugar",
          "Equipos redundantes completos",
          "Grabación profesional ceremonia + discursos"
        ]
      }
    ],

    faqs: [
      {
            question: "¿Qué incluye exactamente el servicio de sonido para bodas en Valencia?",
            answer: "Nuestro servicio completo de sonido para bodas en Valencia incluye: equipamiento profesional de última generación perfectamente calibrado, técnico especializado con más de 10 años de experiencia (en packs Profesional y Premium), transporte sin coste adicional en Valencia capital y hasta 30km, montaje completo siguiendo plano del espacio y especificaciones del evento, configuración y calibración técnica personalizada, pruebas de sonido previas al evento, asistencia técnica durante todo el desarrollo del evento, equipos de respaldo incluidos en packs premium, desmontaje completo al finalizar, soporte telefónico 24/7 para emergencias, y seguro de responsabilidad civil de todos los equipos. Todo está incluido en el precio final sin sorpresas ni costes ocultos adicionales."
      },
      {
            question: "¿Con cuánta antelación debo reservar el sonido para bodas en Valencia?",
            answer: "El plazo de reserva depende de la temporada y disponibilidad. Para fechas entre semana, generalmente con 1-2 semanas de antelación es suficiente, aunque recomendamos consultar disponibilidad lo antes posible. Para fines de semana, especialmente en temporada alta (mayo a octubre), recomendamos reservar con 1-2 meses de antelación mínimo. Para eventos grandes como ceremonia o cocktail que requieren producción compleja, lo ideal es contactar con 2-3 meses de antelación. Para fechas muy demandadas (Navidad, San Juan, Fallas, puentes festivos) recomendamos 3-4 meses. Puedes consultar disponibilidad en tiempo real llamando al 613 88 14 14 o vía WhatsApp, te respondemos en menos de 2 horas."
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
            answer: "Sí, tenemos amplia experiencia en todo tipo de eventos: ceremonia, cocktail, banquete, fiesta, primer baile, y cualquier celebración que requiera sonido para bodas en Valencia. Hemos trabajado en espacios emblemáticos de Valencia como el Palau de la Música, Ciudad de las Artes y las Ciencias, La Hacienda, Masía de San Antonio, Hotel Las Arenas, Viveros Municipales, así como en centenares de fincas, hoteles, locales, carpas, y espacios únicos en toda la provincia de Valencia, Castellón y Alicante. Cada tipo de evento tiene requisitos técnicos específicos que conocemos perfectamente: acústica, potencia necesaria, distribución de equipos, timing, y protocolos. Nuestro equipo realiza visita técnica previa gratuita para eventos grandes, evaluando acústica del espacio, puntos eléctricos, accesos, y diseñando la mejor configuración técnica."
      },
      {
            question: "¿Ofrecéis descuentos para eventos de varios días o múltiples servicios?",
            answer: "Sí, aplicamos descuentos progresivos atractivos. Para alquileres de varios días: 2-3 días consecutivos 15% descuento total, 4-7 días 25% descuento, más de 7 días precio especial personalizado. Para contratación de múltiples servicios combinados (por ejemplo sonido + iluminación, o sonido + vídeo + iluminación) aplicamos packs con hasta 20% descuento sobre contratación separada. También ofrecemos condiciones ventajosas para: clientes recurrentes con contrato marco, empresas organizadoras de eventos, ayuntamientos y entidades públicas, asociaciones y ONGs, y productoras audiovisuales. Consulta tu caso específico llamando al 613 88 14 14 para presupuesto personalizado ajustado con las máximas ventajas."
      },
      {
            question: "¿Puedo ver los equipos antes de contratar el servicio?",
            answer: "Por supuesto. Puedes visitar nuestro showroom-almacén en Valencia con cita previa, donde podrás ver y probar los equipos en funcionamiento. También organizamos demostraciones técnicas para eventos grandes o producciones complejas que lo requieran. Además, tenemos portfolio fotográfico completo de equipos, fichas técnicas detalladas con especificaciones, vídeos de eventos reales realizados, y referencias de clientes satisfechos. Para ceremonia o cocktail grandes, ofrecemos visita técnica gratuita al espacio del evento, donde mostramos referencias fotográficas de montajes similares y explicamos detalladamente la configuración técnica propuesta. Trabajamos con total transparencia: lo que ves en la demostración es exactamente lo que recibirás en tu evento."
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

export default SonidoBodasValencia;
