import React from 'react';
import ServicePageTemplate from '../../components/services/ServicePageTemplate';

const AlquilerMesaMezclaDJ = () => {
  const pageData = {
    title: "Mesa Mezclas DJ Valencia | Pioneer DJM | ReSona",
    metaDescription: "Mesas de mezclas DJ profesionales. Pioneer DJM-900, Allen & Heath. Con CDJs. Técnico incluido. ☎️ 613 88 14 14",
    keywords: "alquiler mesa mezclas dj valencia, mesa pioneer valencia, alquiler djm-900 valencia, controladora dj valencia",
    canonicalUrl: "https://resonaevents.com/servicios/alquiler-mesa-mezcla-dj",
    heroTitle: "Alquiler de Mesa de Mezclas DJ en Valencia",
    heroSubtitle: "Behringer X Air XR18 y Pioneer RX2 - Mezcla profesional digital",
    introduction: `El <strong>alquiler de mesa de mezclas DJ en Valencia</strong> es fundamental para garantizar el éxito de cualquier evento en la Comunidad Valenciana. En ReSona Events contamos con más de 15 años de experiencia proporcionando servicios audiovisuales profesionales de máxima calidad en Valencia, Castellón y Alicante.

Nuestro servicio de <strong>alquiler de mesa de mezclas DJ en Valencia</strong> está diseñado para cubrir desde eventos íntimos de 20 personas hasta grandes producciones de más de 5.000 asistentes. Trabajamos con equipamiento profesional: Behringer X Air XR18 (mezcladora digital 18 canales, control WiFi/tablet) y Pioneer RX2 (controlador DJ 2 canales, efectos FX, grabación USB), garantizando mezcla profesional y fiabilidad.

Disponemos de equipos de última generación, perfectamente mantenidos y calibrados profesionalmente antes de cada evento. Todos nuestros sistemas se entregan con técnico especializado incluido, quien se encarga de la instalación, configuración, operación durante el evento y desmontaje completo.

El servicio completo incluye transporte sin coste adicional en Valencia capital y hasta 30 kilómetros, montaje y desmontaje profesional, calibración técnica según las características acústicas del espacio, asistencia técnica durante todo el evento, equipos de respaldo en los packs premium, y soporte telefónico 24/7.

Hemos trabajado en más de 2.000 eventos en Valencia: <a href="/servicios/sonido-bodas-valencia" class="text-primary-600 hover:underline font-semibold">bodas</a>, fiestas, eventos privados en espacios emblemáticos de la ciudad. Combinamos con <a href="/servicios/alquiler-dj-valencia" class="text-primary-600 hover:underline font-semibold">servicio de DJ completo</a>.`,
   
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
                  "Pioneer DJM-900: Sistemas activos 1000-2000W RMS, 2-3 vías, cobertura 90x50°",
                  "Allen & Heath Xone: Altavoces profesionales 12\" y 15\", DSP integrado, conectividad Dante",
                  "Native Instruments: Line Array modular escalable 8-24 cajas, rango 50-20kHz",
                  "Subwoofers activos 18\" 1000-2000W, respuesta 35-150Hz, cardioide/omnidireccional",
                  "Sistemas portátiles batería recargable para ceremonias sin electricidad"
            ]
      },
      {
            title: "Mesas de Mezclas y Procesadores",
            items: [
                  "Denon DJ: Mesas digitales 16-32 canales, efectos integrados, control remoto iPad",
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

    faqs: [
      {
            question: "¿Qué incluye exactamente el servicio de alquiler de mesa de mezclas DJ en Valencia?",
            answer: "Nuestro servicio completo de alquiler de mesa de mezclas DJ en Valencia incluye: equipamiento profesional de última generación perfectamente calibrado, técnico especializado con más de 10 años de experiencia (en packs Profesional y Premium), transporte sin coste adicional en Valencia capital y hasta 30km, montaje completo siguiendo plano del espacio y especificaciones del evento, configuración y calibración técnica personalizada, pruebas de sonido previas al evento, asistencia técnica durante todo el desarrollo del evento, equipos de respaldo incluidos en packs premium, desmontaje completo al finalizar, soporte telefónico 24/7 para emergencias, y seguro de responsabilidad civil de todos los equipos. Todo está incluido en el precio final sin sorpresas ni costes ocultos adicionales."
      },
      {
            question: "¿Con cuánta antelación debo reservar el alquiler de mesa de mezclas DJ en Valencia?",
            answer: "El plazo de reserva depende de la temporada y disponibilidad. Para fechas entre semana, generalmente con 1-2 semanas de antelación es suficiente, aunque recomendamos consultar disponibilidad lo antes posible. Para fines de semana, especialmente en temporada alta (mayo a octubre), recomendamos reservar con 1-2 meses de antelación mínimo. Para eventos grandes como bodas o fiestas que requieren producción compleja, lo ideal es contactar con 2-3 meses de antelación. Para fechas muy demandadas (Navidad, San Juan, Fallas, puentes festivos) recomendamos 3-4 meses. Puedes consultar disponibilidad en tiempo real llamando al 613 88 14 14 o vía WhatsApp, te respondemos en menos de 2 horas."
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
            answer: "Sí, tenemos amplia experiencia en todo tipo de eventos: bodas, fiestas, eventos privados, clubes, festivales, y cualquier celebración que requiera alquiler de mesa de mezclas DJ en Valencia. Hemos trabajado en espacios emblemáticos de Valencia como el Palau de la Música, Ciudad de las Artes y las Ciencias, La Hacienda, Masía de San Antonio, Hotel Las Arenas, Viveros Municipales, así como en centenares de fincas, hoteles, locales, carpas, y espacios únicos en toda la provincia de Valencia, Castellón y Alicante. Cada tipo de evento tiene requisitos técnicos específicos que conocemos perfectamente: acústica, potencia necesaria, distribución de equipos, timing, y protocolos. Nuestro equipo realiza visita técnica previa gratuita para eventos grandes, evaluando acústica del espacio, puntos eléctricos, accesos, y diseñando la mejor configuración técnica."
      },
      {
            question: "¿Ofrecéis descuentos para eventos de varios días o múltiples servicios?",
            answer: "Sí, aplicamos descuentos progresivos atractivos. Para alquileres de varios días: 2-3 días consecutivos 15% descuento total, 4-7 días 25% descuento, más de 7 días precio especial personalizado. Para contratación de múltiples servicios combinados (por ejemplo sonido + iluminación, o sonido + vídeo + iluminación) aplicamos packs con hasta 20% descuento sobre contratación separada. También ofrecemos condiciones ventajosas para: clientes recurrentes con contrato marco, empresas organizadoras de eventos, ayuntamientos y entidades públicas, asociaciones y ONGs, y productoras audiovisuales. Consulta tu caso específico llamando al 613 88 14 14 para presupuesto personalizado ajustado con las máximas ventajas."
      },
      {
            question: "¿Puedo ver los equipos antes de contratar el servicio?",
            answer: "Por supuesto. Puedes visitar nuestro showroom-almacén en Valencia con cita previa, donde podrás ver y probar los equipos en funcionamiento. También organizamos demostraciones técnicas para eventos grandes o producciones complejas que lo requieran. Además, tenemos portfolio fotográfico completo de equipos, fichas técnicas detalladas con especificaciones, vídeos de eventos reales realizados, y referencias de clientes satisfechos. Para bodas o fiestas grandes, ofrecemos visita técnica gratuita al espacio del evento, donde mostramos referencias fotográficas de montajes similares y explicamos detalladamente la configuración técnica propuesta. Trabajamos con total transparencia: lo que ves en la demostración es exactamente lo que recibirás en tu evento."
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

export default AlquilerMesaMezclaDJ;
