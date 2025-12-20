import React from 'react';
import ServicePageTemplate from '../../components/services/ServicePageTemplate';

const AlquilerAltavocesProfesionales = () => {
  const pageData = {
    title: "Altavoces Profesionales Valencia | DAS Audio | ReSona",
    metaDescription: "Altavoces profesionales en Valencia. DAS Audio, ICOA. 1000-1500W. Técnico incluido. Desde 159€. ☎️ 613 88 14 14",
    keywords: "alquiler altavoces valencia, altavoces profesionales valencia, alquiler altavoces JBL valencia, alquiler sonido valencia",
    heroTitle: "Alquiler de Altavoces Profesionales en Valencia",
    heroSubtitle: "DAS Audio 515A, ICOA 12A/15A - Altavoces profesionales de 1000-1500W",
    introduction: `El <strong>alquiler de altavoces profesionales en Valencia</strong> es fundamental para el éxito de tu evento. En ReSona Events disponemos de <strong>DAS Audio 515A</strong> (1500W, 2 vías), <strong>ICOA 12A</strong> (1000W, acabado blanco), <strong>ICOA 15A</strong> (1200W, acabado negro), y <strong>Altavoz Pasivo 10"</strong> (400W).

Nuestros <strong>altavoces profesionales</strong> cubren desde eventos de 50 personas hasta 300 asistentes. Todos son sistemas activos (autoamplificados) que no requieren amplificador externo. Todos nuestros <strong>altavoces</strong> están calibrados profesionalmente y se entregan con técnico especializado.

El servicio de <strong>alquiler de altavoces en Valencia</strong> incluye transporte, montaje, calibración acústica y asistencia técnica durante todo el evento.

Trabajamos con estudios de sonido certificados para garantizar la mejor calidad en <a href="/servicios/sonido-bodas-valencia" class="text-primary-600 hover:underline font-semibold">bodas</a>, conciertos, <a href="/servicios/sonido-eventos-corporativos" class="text-primary-600 hover:underline font-semibold">eventos corporativos</a> y festivales en Valencia y provincia. Combinamos con <a href="/servicios/alquiler-sonido-valencia" class="text-primary-600 hover:underline font-semibold">sistemas de sonido completos</a>.`,
   
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

    packages: [
      {
        name: "Pack Básico",
        subtitle: "50-80 personas",
        price: "desde 157€ (IVA incl.)",
        features: [
          "Equipos básicos profesionales",
          "Transporte incluido",
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
          "Técnico especializado incluido",
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

    technicalSpecs: [
      {
        title: "Altavoces Activos JBL",
        items: [
          "JBL PRX 712: 1500W, 2 vías 12\", cobertura 90x50°",
          "JBL PRX 715: 1500W, 2 vías 15\", ideal para música en vivo",
          "JBL PRX 725: 1500W, 2 vías 15\", doble woofer para más graves",
          "JBL SRX 812P: 2000W, sistema profesional para conciertos",
          "JBL VTX Line Array: Sistema modular para grandes eventos"
        ]
      },
      {
        title: "Altavoces Activos QSC",
        items: [
          "QSC K12.2: 2000W, 12\", perfectos para eventos medianos",
          "QSC K10.2: 2000W, 10\", compactos y potentes",
          "QSC KW153: 3000W, sistema de 3 vías profesional",
          "QSC KLA12: Sistema Line Array modular",
          "QSC CP Series: Económicos para eventos pequeños"
        ]
      },
      {
        title: "Altavoces Electro-Voice",
        items: [
          "EV ZLX-12P: 1000W, 12\", excelente relación calidad-precio",
          "EV ZLX-15P: 1000W, 15\", más graves para música dance",
          "EV EKX-12P: 1500W, profesional para instalaciones",
          "EV EKX-15P: 1500W, 15\", potencia extrema",
          "EV ETX Series: Top de gama para conciertos"
        ]
      },
      {
        title: "Sistemas Line Array",
        items: [
          "L-Acoustics KARA: Sistema modular 8-16 cajas",
          "JBL VTX V25: Line Array compacto 6-12 módulos",
          "d&b audiotechnik Y-Series: Para grandes eventos",
          "Subwoofers 18\" activos 1000-2000W por unidad",
          "Amplificación en clase D con DSP integrado"
        ]
      }
    ],

    faqs: [
      {
        question: "¿Qué potencia de altavoces necesito para mi evento en Valencia?",
        answer: "Depende del número de asistentes y tipo de evento. Para 50-100 personas recomendamos 2 altavoces de 1000W. Para 100-300 personas, altavoces de 1500W + subwoofer. Para 300-500 personas, sistemas de 2000W o Line Array. Para más de 500, Line Array profesional. Nuestros técnicos realizan estudio acústico gratuito del espacio."
      },
      {
        question: "¿Los altavoces incluyen cables y soportes?",
        answer: "Sí, todos nuestros packs de alquiler de altavoces incluyen: cables XLR profesionales, soportes elevadores hasta 2.5m de altura, protección para cables, y todos los conectores necesarios. También incluimos mesa de mezclas y micrófonos según el paquete contratado."
      },
      {
        question: "¿Puedo alquilar altavoces para bodas en Valencia?",
        answer: "Por supuesto. Somos especialistas en sonido para bodas en Valencia. Ofrecemos altavoces discretos y elegantes para ceremonia (batería recargable), altavoces potentes para banquete y cocktail, y sistemas completos para fiesta. Incluimos micrófonos inalámbricos para oficiante y novios. Consulta nuestro pack especial bodas."
      },
      {
        question: "¿El técnico de sonido está incluido?",
        answer: "En los packs Profesional y Premium sí está incluido un técnico especializado durante todo el evento. En el pack Básico, los altavoces son autoamplificados fáciles de usar, pero puedes añadir técnico por 150€ adicionales. El técnico gestiona volúmenes, ecualización y soluciona cualquier incidencia."
      },
      {
        question: "¿Con cuánta antelación debo reservar altavoces?",
        answer: "Para fechas entre semana, con 1-2 semanas es suficiente. Para fines de semana y temporada alta (mayo-octubre), recomendamos 1-2 meses de antelación. Para bodas y grandes eventos, idealmente 2-3 meses. Consulta disponibilidad en tiempo real llamando al 613 88 14 14."
      },
      {
        question: "¿El transporte de altavoces tiene coste extra?",
        answer: "No, el transporte está incluido en Valencia capital y hasta 30km. Para distancias superiores: 30-50km +30€, 50-80km +60€. Incluye transporte de ida, montaje completo, calibración, desmontaje y recogida. Todo en el precio final sin sorpresas."
      },
      {
        question: "¿Qué marca de altavoces es mejor: JBL, QSC o Electro-Voice?",
        answer: "Las tres son marcas profesionales de máxima calidad. JBL PRX tiene sonido potente ideal para música en vivo. QSC K Series ofrece gran potencia y claridad para voces. Electro-Voice ZLX tiene excelente relación calidad-precio. Nuestros técnicos recomiendan según tu tipo de evento y preferencias musicales."
      },
      {
        question: "¿Puedo recoger yo los altavoces o es necesario montaje?",
        answer: "Ofrecemos ambas opciones. Recogida en nuestro almacén en Valencia (descuento 20%) o servicio completo con transporte y montaje. Si recoges tú, incluimos tutorial de 15 minutos y soporte telefónico. Para eventos importantes recomendamos servicio completo con técnico para garantizar calidad acústica."
      },
      {
        question: "¿Qué incluye el alquiler de altavoces además de los altavoces?",
        answer: "Incluye: altavoces profesionales, soportes elevadores, cables XLR balanceados, protecciones de cables, mesa de mezclas (según pack), micrófonos (según pack), reproductor audio, transporte, montaje, calibración acústica, asistencia técnica y desmontaje. Todo lo necesario para funcionamiento perfecto."
      },
      {
        question: "¿Tienen altavoces de respaldo por si falla alguno?",
        answer: "En packs Profesional y Premium incluimos equipos de backup (altavoz y amplificador de respaldo). En pack Básico se puede añadir por 80€. Tenemos técnicos disponibles 24/7 para reemplazo urgente en caso de fallo. En 15 años nunca hemos cancelado un evento por fallo técnico."
      },
      {
        question: "¿Trabajáis con todos los tipos de eventos en Valencia?",
        answer: "Sí, tenemos experiencia en todo tipo de eventos: bodas (ceremonia, cocktail, banquete, fiesta), eventos corporativos (conferencias, presentaciones, convenciones, lanzamientos), conciertos (bandas, DJ, electrónica), festivales, ferias comerciales, actos institucionales, eventos deportivos, teatros, musicales, desfiles, fiestas patronales, verbenas, y eventos privados. Hemos trabajado en espacios emblemáticos de Valencia como el Palau de la Música, Ciudad de las Artes y las Ciencias, La Hacienda, Masía de San Antonio, Hotel Las Arenas, así como en centenares de fincas, hoteles, carpas y espacios únicos en toda la provincia. Cada tipo de evento tiene requisitos acústicos específicos que conocemos perfectamente."
      },
      {
        question: "¿Los altavoces funcionan en espacios exteriores?",
        answer: "Sí, nuestros altavoces profesionales JBL, QSC y Electro-Voice funcionan perfectamente en exteriores. Para eventos al aire libre recomendamos sistemas de mayor potencia debido a la dispersión acústica natural. Disponemos de altavoces con certificación IP65 waterproof específicos para exterior que aguantan lluvia ligera. Los sistemas portátiles con batería recargable son ideales para ceremonias en jardines, playas o espacios sin electricidad cercana. En caso de lluvia intensa seguimos protocolos de seguridad y protegemos equipos con lonas impermeables. La acústica exterior requiere mayor potencia: para 100 personas exterior necesitas el doble de potencia que en interior cerrado."
      },
      {
        question: "¿Ofrecéis servicio de DJ además del alquiler de altavoces?",
        answer: "Sí, además del sistema de altavoces profesionales podemos proporcionar servicio completo de DJ especializado en bodas, eventos corporativos y fiestas privadas. Nuestros DJs cuentan con biblioteca musical de más de 50.000 canciones en todos los géneros (pop, rock, electrónica, reggaeton, salsa, bachata, clásicos, años 80/90), experiencia de 10+ años, equipo propio Pioneer CDJ-3000 y mesas DJM profesionales, iluminación básica LED incluida, micrófono inalámbrico para anuncios, y consulta previa para personalizar playlist según gustos. También ofrecemos servicio de saxofonista, violinista o músicos en vivo para cocktails y ceremonias. Consulta packs combinados altavoces + DJ con descuento especial."
      },
      {
        question: "¿Puedo conectar mi móvil o portátil a los altavoces?",
        answer: "Sí, todos nuestros sistemas de altavoces incluyen múltiples opciones de conexión: Bluetooth (alcance 10-15m, calidad AAC/aptX), cable auxiliar minijack 3.5mm, USB directo (pen drive con MP3/WAV), entrada RCA estéreo, y conexión XLR balanceada profesional. La mesa de mezclas incluida (según pack) tiene entrada para conectar portátil, móvil, tablet, reproductor MP3, o cualquier dispositivo de audio. Para presentaciones corporativas con portátil, incluimos cable adaptador HDMI/VGA a audio. La calidad de sonido será mejor usando archivos de alta calidad (320kbps MP3 o FLAC) que streaming de baja calidad. El técnico te ayuda con todas las conexiones necesarias."
      },
      {
        question: "¿Qué documentación necesito para contratar el servicio?",
        answer: "Para realizar la reserva necesitas: DNI/NIE o CIF empresa, teléfono de contacto, email, fecha y hora del evento, dirección exacta del espacio, número aproximado de asistentes, y tipo de evento. Para la señal del 30% aceptamos: transferencia bancaria, Bizum, tarjeta, PayPal o efectivo. Nosotros proporcionamos: presupuesto detallado por escrito, contrato de alquiler con condiciones, factura con IVA desglosado, certificado de seguro RC si el venue lo requiere, y ficha técnica de equipos. Para eventos en venues profesionales (hoteles, palacios, fincas) podemos coordinarnos directamente con el responsable técnico del espacio para resolver requisitos específicos de carga eléctrica, accesos, horarios de montaje, etc."
      },
      {
        question: "¿Cuánto tiempo antes debo tener montados los altavoces?",
        answer: "Recomendamos tener los altavoces montados y probados 2-3 horas antes del inicio del evento. Esto permite tiempo suficiente para montaje físico (30-60 minutos), calibración acústica del espacio (20-30 minutos), pruebas de sonido completas (30 minutos), y margen de seguridad ante imprevistos. Para bodas, montamos durante cocktail o antes de ceremonia. Para eventos corporativos, montamos la noche anterior o temprano por la mañana del evento. Para conciertos y grandes producciones, el montaje puede requerir 4-6 horas con equipo completo. Nuestros técnicos coordinan horarios de montaje directamente con el venue y el organizador del evento para garantizar cero interferencias con decoración, catering u otros proveedores."
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

export default AlquilerAltavocesProfesionales;
