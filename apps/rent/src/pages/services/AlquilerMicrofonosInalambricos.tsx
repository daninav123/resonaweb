import React from 'react';
import ServicePageTemplate from '../../components/services/ServicePageTemplate';

const AlquilerMicrofonosInalambricos = () => {
  const pageData = {
    title: "Micrófonos Inalámbricos Valencia | Shure | ReSona",
    metaDescription: "Micrófonos inalámbricos profesionales. Shure SM58, Sennheiser. Mano, solapa, diadema. Técnico opcional. ☎️ 613 88 14 14",
    keywords: "alquiler micrófonos inalámbricos valencia, micrófonos shure valencia, alquiler micros valencia, sennheiser valencia",
    canonicalUrl: "https://resonarent.com/servicios/alquiler-microfonos-inalambricos",
    heroTitle: "Alquiler de Micrófonos Inalámbricos en Valencia",
    heroSubtitle: "Shure SM58 Inalámbrico - Calidad profesional sin cables",
    introduction: `El <strong>alquiler de micrófonos inalámbricos en Valencia</strong> es fundamental para garantizar el éxito de cualquier evento en la Comunidad Valenciana. En ReSona Rent contamos con experiencia desde 2011 proporcionando servicios audiovisuales profesionales de máxima calidad en Valencia, Castellón y Alicante.

Nuestro servicio de <strong>alquiler de micrófonos inalámbricos en Valencia</strong> está diseñado para cubrir desde eventos íntimos de 20 personas hasta grandes producciones de más de 5.000 asistentes. Trabajamos con equipamiento profesional: Shure SM58 Inalámbrico (dinámico cardioide, estándar mundial), ideal para ceremonias, discursos, presentaciones, bodas. Disponibles bajo pedido (consultar disponibilidad).

Disponemos de equipos de última generación, perfectamente mantenidos y calibrados profesionalmente antes de cada evento. Todos los equipos salen revisados y probados, con el cableado y los soportes necesarios para que puedas montarlo tú mismo sin complicaciones. Si prefieres que nos encarguemos nosotros, la entrega, el montaje y el técnico son servicios opcionales que se presupuestan aparte.

El alquiler incluye el material revisado, el cableado y los soportes necesarios, asesoramiento previo para elegir el equipo según tu aforo y tu espacio, y soporte telefónico durante el evento. La recogida y la devolución se hacen en nuestro almacén de Valencia; la entrega, el montaje y el técnico son opcionales y se presupuestan aparte.

Hemos trabajado en eventos de todo tipo en Valencia: <a href="/servicios/sonido-bodas-valencia" class="text-primary-600 hover:underline font-semibold">bodas</a>, <a href="/servicios/sonido-eventos-corporativos" class="text-primary-600 hover:underline font-semibold">conferencias</a>, karaoke, y todo tipo de celebraciones en espacios emblemáticos de la ciudad. Combinamos con <a href="/servicios/alquiler-sonido-valencia" class="text-primary-600 hover:underline font-semibold">sistemas de sonido completos</a>.`,
   
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
            title: "Altavoces y Sistemas de PA",
            items: [
                  "Shure SM58: Sistemas activos 1000-2000W RMS, 2-3 vías, cobertura 90x50°",
                  "Sennheiser EW: Altavoces profesionales 12\" y 15\", DSP integrado, conectividad Dante",
                  "Shure Beta: Line Array modular escalable 8-24 cajas, rango 50-20kHz",
                  "Subwoofers activos 18\" 1000-2000W, respuesta 35-150Hz, cardioide/omnidireccional",
                  "Sistemas portátiles batería recargable para ceremonias sin electricidad"
            ]
      },
      {
            title: "Mesas de Mezclas y Procesadores",
            items: [
                  "sistemas UHF: Mesas digitales 16-32 canales, efectos integrados, control remoto iPad",
                  "Allen & Heath Qu/SQ Series: DSP avanzado, 32 entradas, matrices auxiliares",
                  "Yamaha TF/CL Series: TouchFlow interface, recallable scene, feedback suppressor",
                  "Procesadores Klark Teknik/DBX: Ecualizadores gráficos 31 bandas, compresores dinámicos",
                  "Controladores Dante/AVB para redes audio digital multicasting"
            ]
      },
      {
            title: "Micrófonos Profesionales",
            items: [
                  "Shure SM58/SM57: Dinámicos cardioide, estándar mundial voces/instrumentos",
                  "Sennheiser EW 135/145 G4: Inalámbricos UHF, 20 canales, alcance 100m",
                  "Shure Beta 87A/58A: Condensador supercardioide, alta ganancia, rechazo feedback",
                  "AKG C414/C451: Condensador estudio gran diafragma, múltiples patrones polares",
                  "DI boxes Radial J48/JDI activas y pasivas para instrumentos",
                  "Stands K&M/Manfrotto boom ajustables 1-2m, bases sólidas antivuelco"
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
            question: "¿Qué incluye exactamente el servicio de alquiler de micrófonos inalámbricos en Valencia?",
            answer: "El alquiler incluye el equipo revisado y probado antes de salir, el cableado y los soportes necesarios, y asesoramiento previo para elegir la configuración según tu aforo y tu espacio. La recogida y la devolución se hacen en nuestro almacén de Valencia. Si necesitas entrega, montaje o un técnico durante el evento, son servicios opcionales que presupuestamos según la distancia y el volumen del material."
      },
      {
            question: "¿Con cuánta antelación debo reservar el alquiler de micrófonos inalámbricos en Valencia?",
            answer: "El plazo de reserva depende de la temporada y disponibilidad. Para fechas entre semana, generalmente con 1-2 semanas de antelación es suficiente, aunque recomendamos consultar disponibilidad lo antes posible. Para fines de semana, especialmente en temporada alta (mayo a octubre), recomendamos reservar con 1-2 meses de antelación mínimo. Para eventos grandes como bodas o conferencias que requieren producción compleja, lo ideal es contactar con 2-3 meses de antelación. Para fechas muy demandadas (Navidad, San Juan, Fallas, puentes festivos) recomendamos 3-4 meses. Puedes consultar disponibilidad en tiempo real llamando al 613 88 14 14 o vía WhatsApp, te respondemos en menos de 2 horas."
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
            answer: "Sí, tenemos amplia experiencia en todo tipo de eventos: bodas, conferencias, karaoke, presentaciones, teatro, y cualquier celebración que requiera alquiler de micrófonos inalámbricos en Valencia. Hemos trabajado en espacios emblemáticos de Valencia como el Palau de la Música, Ciudad de las Artes y las Ciencias, La Hacienda, Masía de San Antonio, Hotel Las Arenas, Viveros Municipales, así como en centenares de fincas, hoteles, locales, carpas, y espacios únicos en toda la provincia de Valencia, Castellón y Alicante. Cada tipo de evento tiene requisitos técnicos específicos que conocemos perfectamente: acústica, potencia necesaria, distribución de equipos, timing, y protocolos. Nuestro equipo realiza visita técnica previa gratuita para eventos grandes, evaluando acústica del espacio, puntos eléctricos, accesos, y diseñando la mejor configuración técnica."
      },
      {
            question: "¿Ofrecéis descuentos para eventos de varios días o múltiples servicios?",
            answer: "Sí, aplicamos descuentos progresivos atractivos. Para alquileres de varios días: 2-3 días consecutivos 15% descuento total, 4-7 días 25% descuento, más de 7 días precio especial personalizado. Para contratación de múltiples servicios combinados (por ejemplo sonido + iluminación, o sonido + vídeo + iluminación) aplicamos packs con hasta 20% descuento sobre contratación separada. También ofrecemos condiciones ventajosas para: clientes recurrentes con contrato marco, empresas organizadoras de eventos, ayuntamientos y entidades públicas, asociaciones y ONGs, y productoras audiovisuales. Consulta tu caso específico llamando al 613 88 14 14 para presupuesto personalizado ajustado con las máximas ventajas."
      },
      {
            question: "¿Puedo ver los equipos antes de contratar el servicio?",
            answer: "Por supuesto. Puedes visitar nuestro showroom-almacén en Valencia con cita previa, donde podrás ver y probar los equipos en funcionamiento. También organizamos demostraciones técnicas para eventos grandes o producciones complejas que lo requieran. Además, tenemos portfolio fotográfico completo de equipos, fichas técnicas detalladas con especificaciones, vídeos de eventos reales realizados, y referencias de clientes satisfechos. Para bodas o conferencias grandes, ofrecemos visita técnica gratuita al espacio del evento, donde mostramos referencias fotográficas de montajes similares y explicamos detalladamente la configuración técnica propuesta. Trabajamos con total transparencia: lo que ves en la demostración es exactamente lo que recibirás en tu evento."
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

export default AlquilerMicrofonosInalambricos;
