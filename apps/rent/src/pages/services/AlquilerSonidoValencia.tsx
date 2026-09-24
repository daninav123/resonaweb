import React from 'react';
import ServicePageTemplate from '../../components/services/ServicePageTemplate';

const AlquilerSonidoValencia = () => {
  const pageData = {
    title: "Alquiler Sonido Valencia desde 120€ · Técnico Incluido",
    metaDescription: "Alquiler de equipos de sonido profesional en Valencia desde 120€/día. DAS Audio, ICOA, Pioneer. Técnico especializado opcional. eventos por toda la provincia ☎ 613 88 14 14",
    keywords: "alquiler sonido valencia, alquiler equipos sonido valencia, alquiler de sonido para eventos, alquiler equipo sonido",
    canonicalUrl: "https://resonarent.com/servicios/alquiler-sonido-valencia",
    heroTitle: "Alquiler de Sonido Profesional en Valencia",
    heroSubtitle: "Equipos DAS Audio, ICOA, Behringer, Pioneer - Técnico especializado opcional",
    introduction: `El <strong>alquiler de sonido profesional en Valencia</strong> es fundamental para garantizar el éxito de cualquier evento en la Comunidad Valenciana. En ReSona Rent contamos con experiencia desde 2011 proporcionando servicios audiovisuales profesionales de máxima calidad en Valencia, Castellón y Alicante.

Nuestro servicio de <strong>alquiler de sonido profesional en Valencia</strong> está diseñado para cubrir desde eventos íntimos de 20 personas hasta grandes producciones de más de 300 asistentes. Trabajamos exclusivamente con equipamiento profesional de marcas reconocidas: <strong>DAS Audio</strong> (altavoces 515A y subwoofers 215A/218A), <strong>ICOA</strong> (series 12A y 15A), <strong>Behringer X Air</strong>, <strong>Pioneer</strong> para DJ, y micrófonos <strong>Shure</strong>, garantizando rendimiento y fiabilidad máximos.

Disponemos de equipos de última generación, perfectamente mantenidos y calibrados profesionalmente antes de cada evento. Todos los equipos salen revisados y probados, con el cableado y los soportes necesarios para que puedas montarlo tú mismo sin complicaciones. Si prefieres que nos encarguemos nosotros, la entrega, el montaje y el técnico son servicios opcionales que se presupuestan aparte.

El alquiler incluye el material revisado, el cableado y los soportes necesarios, asesoramiento previo para elegir el equipo según tu aforo y tu espacio, y soporte telefónico durante el evento. La recogida y la devolución se hacen en nuestro almacén de Valencia; la entrega, el montaje y el técnico son opcionales y se presupuestan aparte.

Hemos trabajado en eventos de todo tipo en Valencia: <a href="/servicios/sonido-bodas-valencia" class="text-resona-light hover:underline font-semibold">bodas</a>, <a href="/servicios/sonido-eventos-corporativos" class="text-resona-light hover:underline font-semibold">eventos corporativos</a>, conciertos, y todo tipo de celebraciones en espacios emblemáticos de la ciudad como el Palau de la Música, Ciudad de las Artes y las Ciencias, La Hacienda, Masía de San Antonio, Hotel Las Arenas, y centenares de fincas, hoteles y espacios únicos en toda la provincia de Valencia y alrededores.`,
   
    whyChooseUs: [
      {
        icon: "",
        title: "Equipos de Última Generación",
        description: "DAS Audio, ICOA, Behringer, Pioneer, Shure - Marcas profesionales de confianza"
      },
      {
        icon: "‍",
        title: "Técnico Especializado Incluido",
        description: "Ajuste perfecto, mezcla profesional y soporte durante todo el evento"
      },
      {
        icon: "",
        title: "Recogida en Almacén",
        description: "Transporte, montaje, desmontaje y cables - Sin cargos ocultos"
      },
      {
        icon: "",
        title: "Equipos de Backup",
        description: "Siempre llevamos respaldo - Cero riesgo de fallo"
      },
      {
        icon: "",
        title: "Precios Transparentes",
        description: "Presupuesto claro desde el principio - Sin sorpresas"
      },
      {
        icon: "",
        title: "Respuesta Rápida",
        description: "Presupuesto en menos de 24h - Servicio ágil y profesional"
      }
    ],

    packages: [
      {
        name: "Pack Básico",
        subtitle: "Eventos pequeños (hasta 100 personas)",
        price: "desde 200€",
        features: [
          "Altavoces activos profesionales",
          "Microfonía inalámbrica",
          "Mezcladora digital",
          "Recogida en nuestro almacén de Valencia",
          "Montaje y desmontaje",
          "Asistencia técnica durante el evento",
          "Cables y soportes incluidos"
        ]
      },
      {
        name: "Pack Profesional",
        subtitle: "Eventos medianos (100-200 personas)",
        price: "desde 400€",
        features: [
          "Sistema de sonido DAS Audio",
          "Subwoofer de graves profundos",
          "Mezcladora digital profesional",
          "Múltiples micrófonos inalámbricos",
          "Técnico opcional",
          "Montaje completo y calibración",
          "Equipos de backup disponibles",
          "Soporte técnico 24/7"
        ],
        highlighted: true
      },
      {
        name: "Pack Premium",
        subtitle: "Eventos grandes (+200 personas)",
        price: "desde 700€",
        features: [
          "Sistema de alta potencia completo",
          "Múltiples subwoofers profesionales",
          "Equipamiento DJ profesional",
          "Microfonía premium múltiple",
          "Procesador de audio DSP",
          "2 técnicos especializados",
          "Equipos redundantes completos",
          "Prueba de sonido previa incluida"
        ]
      }
    ],

    technicalSpecs: [
      {
            title: "Altavoces y Sistemas de PA",
            items: [
                  "DAS Audio 515A: Altavoz activo 2 vías, 1500W potencia, procesador DSP integrado, SPL máx 135dB",
                  "ICOA 12A: Altavoz activo 12\", 1000W, acabado blanco/negro, ideal eventos elegantes",
                  "ICOA 15A: Altavoz activo 15\", 1200W, graves profundos, control remoto integrado",
                  "DAS Audio 215A: Subwoofer activo doble 15\", 2000W, respuesta 35-150Hz, Clase D",
                  "DAS Audio 218A: Subwoofer premium doble 18\", 3200W pico, respuesta 30-120Hz, SPL 138dB",
                  "Altavoz Pasivo 10\": Versátil 400W, ideal monitores de escenario o sistemas secundarios"
            ]
      },
      {
            title: "Mesas de Mezclas y Procesadores",
            items: [
                  "Behringer X Air XR18: Mezcladora digital 18 canales, control WiFi/tablet, efectos integrados",
                  "Pioneer RX2: Controlador DJ profesional, 2 canales, efectos FX, USB recording",
                  "Procesador DSP integrado en altavoces DAS Audio para ecualización automática",
                  "Control remoto inalámbrico para ajustes en tiempo real",
                  "Aplicaciones móviles iOS/Android para control de mezcla desde cualquier punto"
            ]
      },
      {
            title: "Micrófonos y Accesorios",
            items: [
                  "Shure SM58: Micrófono dinámico cardioide, estándar mundial para voces, ultra resistente",
                  "Shure SM57: Dinámico versátil para instrumentos y voces, respuesta plana 40-15kHz",
                  "Micrófonos inalámbricos UHF disponibles bajo pedido (consultar disponibilidad)",
                  "Soportes profesionales ajustables 1-2m con bases antivuelco",
                  "Cables XLR balanceados Cordial/Neutrik de 3-25m incluidos",
                  "Pop filters y antipops para grabaciones y eventos con presentadores"
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

        faqs: [
      {
            question: "¿Qué incluye exactamente el servicio de alquiler de sonido profesional en Valencia?",
            answer: "El alquiler incluye el equipo revisado y probado antes de salir, el cableado y los soportes necesarios, y asesoramiento previo para elegir la configuración según tu aforo y tu espacio. La recogida y la devolución se hacen en nuestro almacén de Valencia. Si necesitas entrega, montaje o un técnico durante el evento, son servicios opcionales que presupuestamos según la distancia y el volumen del material."
      },
      {
            question: "¿Con cuánta antelación debo reservar el alquiler de sonido profesional en Valencia?",
            answer: "El plazo de reserva depende de la temporada y disponibilidad. Para fechas entre semana, generalmente con 1-2 semanas de antelación es suficiente, aunque recomendamos consultar disponibilidad lo antes posible. Para fines de semana, especialmente en temporada alta (mayo a octubre), recomendamos reservar con 1-2 meses de antelación mínimo. Para eventos grandes como bodas o eventos corporativos que requieren producción compleja, lo ideal es contactar con 2-3 meses de antelación. Para fechas muy demandadas (Navidad, San Juan, Fallas, puentes festivos) recomendamos 3-4 meses. Puedes consultar disponibilidad en tiempo real llamando al 613 88 14 14 o vía WhatsApp, te respondemos en menos de 2 horas."
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
            answer: "Sí, tenemos amplia experiencia en todo tipo de eventos: bodas, eventos corporativos, conciertos, festivales, presentaciones, y cualquier celebración que requiera alquiler de sonido profesional en Valencia. Hemos trabajado en espacios emblemáticos de Valencia como el Palau de la Música, Ciudad de las Artes y las Ciencias, La Hacienda, Masía de San Antonio, Hotel Las Arenas, Viveros Municipales, así como en centenares de fincas, hoteles, locales, carpas, y espacios únicos en toda la provincia de Valencia, Castellón y Alicante. Cada tipo de evento tiene requisitos técnicos específicos que conocemos perfectamente: acústica, potencia necesaria, distribución de equipos, timing, y protocolos. Nuestro equipo realiza visita técnica previa gratuita para eventos grandes, evaluando acústica del espacio, puntos eléctricos, accesos, y diseñando la mejor configuración técnica."
      },
      {
            question: "¿Ofrecéis descuentos para eventos de varios días o múltiples servicios?",
            answer: "Sí, aplicamos descuentos progresivos atractivos. Para alquileres de varios días: 2-3 días consecutivos 15% descuento total, 4-7 días 25% descuento, más de 7 días precio especial personalizado. Para contratación de múltiples servicios combinados (por ejemplo sonido + iluminación, o sonido + vídeo + iluminación) aplicamos packs con hasta 20% descuento sobre contratación separada. También ofrecemos condiciones ventajosas para: clientes recurrentes con contrato marco, empresas organizadoras de eventos, ayuntamientos y entidades públicas, asociaciones y ONGs, y productoras audiovisuales. Consulta tu caso específico llamando al 613 88 14 14 para presupuesto personalizado ajustado con las máximas ventajas."
      },
      {
            question: "¿Puedo ver los equipos antes de contratar el servicio?",
            answer: "Por supuesto. Puedes visitar nuestro showroom-almacén en Valencia con cita previa, donde podrás ver y probar los equipos en funcionamiento. También organizamos demostraciones técnicas para eventos grandes o producciones complejas que lo requieran. Además, tenemos portfolio fotográfico completo de equipos, fichas técnicas detalladas con especificaciones, vídeos de eventos reales realizados, y referencias de clientes satisfechos. Para bodas o eventos corporativos grandes, ofrecemos visita técnica gratuita al espacio del evento, donde mostramos referencias fotográficas de montajes similares y explicamos detalladamente la configuración técnica propuesta. Trabajamos con total transparencia: lo que ves en la demostración es exactamente lo que recibirás en tu evento."
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
      { title: "Iluminación para Eventos", url: "/servicios/iluminacion-led-profesional" },
      { title: "Alquiler de DJ", url: "/servicios/alquiler-dj-valencia" },
      { title: "Pantallas LED", url: "/servicios/alquiler-pantallas-led" },
      { title: "Micrófonos Inalámbricos", url: "/servicios/alquiler-microfonos-inalambricos" }
    ]
  };

  return <ServicePageTemplate {...pageData} />;
};

export default AlquilerSonidoValencia;
