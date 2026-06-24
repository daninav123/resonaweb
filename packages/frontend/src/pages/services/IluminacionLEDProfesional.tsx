import React from 'react';
import ServicePageTemplate from '../../components/services/ServicePageTemplate';

const IluminacionLEDProfesional = () => {
  const pageData = {
    title: "Iluminación LED Valencia | Moving Heads RGB | ReSona",
    metaDescription: "Iluminación LED para eventos en Valencia. Moving Heads, focos RGB/RGBW. Control DMX. Técnico incluido. ☎️ 613 88 14 14",
    keywords: "iluminación led eventos valencia, luces led profesionales valencia, focos par led valencia, iluminación profesional valencia",
    canonicalUrl: "https://resonaevents.com/servicios/iluminacion-led-profesional",
    heroTitle: "Iluminación LED Profesional para Eventos en Valencia",
    heroSubtitle: "Moving Heads, Flash RGB, Focos LED - Efectos profesionales para tu evento",
    introduction: `La <strong>iluminación LED profesional en Valencia</strong> transforma completamente cualquier evento. En ReSona Events contamos con más de 15 años de experiencia en iluminación para bodas, eventos corporativos, conciertos y fiestas en Valencia, Castellón y Alicante.

Nuestro servicio de <strong>iluminación LED profesional</strong> está diseñado para eventos de 20 a 300 personas. Trabajamos con equipamiento profesional: <strong>Moving Head 3en1 17R</strong> (350W, Beam/Spot/Wash), <strong>Moving Head Beam 7R</strong> (230W, 14 colores), <strong>Mini Beam LED</strong> y <strong>Mini Wash RGBW</strong>, <strong>Flash Estroboscópico RGB 1000W</strong>, <strong>Focos LED RGB</strong> decorativos, <strong>Ventilador LED RGB</strong> para efectos rotativos, y <strong>Focos Spot</strong> profesionales.

Todos nuestros equipos LED son de última generación, bajo consumo, y perfectamente mantenidos. Incluimos <strong>técnico especializado</strong> que programa y controla toda la iluminación durante el evento, creando ambientes únicos: entrada de novios, cambios de ambiente en el banquete, efectos sincronizados en la fiesta.

El servicio completo incluye: transporte en Valencia capital (30km), montaje completo con estructuras truss si es necesario, controlador DMX 512 profesional, programación de escenas personalizadas, operación durante todo el evento, desmontaje, y soporte 24/7.

Hemos iluminado más de 1.000 eventos en espacios emblemáticos: Palau de la Música, La Hacienda, Masía de San Antonio, Hotel Las Arenas, y centenares de fincas y espacios únicos en Valencia. Ofrecemos también <a href="/servicios/alquiler-sonido-valencia" class="text-primary-600 hover:underline font-semibold">alquiler de sonido profesional</a> y <a href="/servicios/sonido-bodas-valencia" class="text-primary-600 hover:underline font-semibold">sonido para bodas</a>.`,
   
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
            title: "Moving Heads Profesionales",
            items: [
                  "Moving Head 3en1 17R: Lámpara 350W, Beam/Spot/Wash en uno, prisma 8+16 facetas, zoom 5-45°",
                  "Moving Head Beam 7R: Beam concentrado 230W, 14 colores + blanco, prisma 3 facetas, efectos espectaculares",
                  "Mini Beam LED: Compacto 60W LED, 8 colores, DMX 512, perfecto eventos pequeños/medianos",
                  "Mini Wash LED RGBW: 80W LED, mezcla colores suave, zoom motorizado, silencioso",
                  "Control DMX 512 profesional con escenas preprogramadas y modo music-reactive"
            ]
      },
      {
            title: "Efectos y Focos LED",
            items: [
                  "Flash Estroboscópico RGB 1000W: Alta potencia LED RGB, velocidad variable, control DMX para momentos clave",
                  "Ventilador LED RGB: Efectos giratorios impactantes, LED RGB full color, modo DMX/Auto/Sound",
                  "Foco Spot Pequeño: LED 50W, haz concentrado regulable, montaje versátil para iluminación puntual",
                  "Foco LED RGB Decoración: 18W RGB compacto, control remoto, múltiples modos, batería opcional",
                  "Todos los equipos con control DMX sincronizado - efectos coordinados perfectamente"
            ]
      },
      {
            title: "Controladores y Programación",
            items: [
                  "Controlador DMX 512 profesional: 192-384 canales, escenas preprogramables, fade manual",
                  "Programación personalizada de escenas para cada momento del evento",
                  "Modo automático sincronizado con música (music-reactive) para fiestas",
                  "Control manual en tiempo real por técnico especializado",
                  "Equipos sincronizados: cambios de ambiente instantáneos y fluidos"
            ]
      },
      {
            title: "Estructuras y Montaje",
            items: [
                  "Estructuras truss profesionales 1.5m-3m para colgar moving heads",
                  "Soportes de suelo ajustables en altura para focos y efectos",
                  "Cableado DMX profesional certificado con conectores Neutrik",
                  "Extensiones eléctricas schuko CEE con protección térmica",
                  "Montaje discreto y seguro - instalación invisible durante el evento"
            ]
      }
],

    packages: [
      {
        name: "Pack Básico Iluminación",
        subtitle: "Eventos pequeños (hasta 100 personas)",
        price: "desde 180€",
        features: [
          "Focos LED RGB decorativos",
          "Iluminación ambiente personalizada",
          "Control DMX profesional",
          "Transporte incluido Valencia capital",
          "Montaje y desmontaje",
          "Programación de colores",
          "Técnico durante el evento"
        ]
      },
      {
        name: "Pack Profesional",
        subtitle: "Eventos medianos (100-200 personas)",
        price: "desde 350€",
        features: [
          "Sistema completo LED profesional",
          "Iluminación arquitectónica uplighting",
          "Efectos dinámicos sincronizados",
          "Programación personalizada",
          "Técnico especializado incluido",
          "Control inalámbrico DMX",
          "Equipos de backup",
          "Soporte técnico 24/7"
        ],
        highlighted: true
      },
      {
        name: "Pack Premium",
        subtitle: "Eventos grandes (+200 personas)",
        price: "desde 600€",
        features: [
          "Iluminación espectacular completa",
          "Moving heads profesionales",
          "Efectos láser y especiales",
          "Iluminación arquitectónica avanzada",
          "Programación show completo",
          "2 técnicos especializados",
          "Equipos redundantes completos",
          "Ensayo previo incluido"
        ]
      }
    ],

    faqs: [
      {
            question: "¿Qué incluye exactamente el servicio de iluminación LED profesional en Valencia?",
            answer: "Nuestro servicio completo de iluminación LED profesional en Valencia incluye: equipamiento profesional de última generación perfectamente calibrado, técnico especializado con más de 10 años de experiencia (en packs Profesional y Premium), transporte sin coste adicional en Valencia capital y hasta 30km, montaje completo siguiendo plano del espacio y especificaciones del evento, configuración y calibración técnica personalizada, pruebas de sonido previas al evento, asistencia técnica durante todo el desarrollo del evento, equipos de respaldo incluidos en packs premium, desmontaje completo al finalizar, soporte telefónico 24/7 para emergencias, y seguro de responsabilidad civil de todos los equipos. Todo está incluido en el precio final sin sorpresas ni costes ocultos adicionales."
      },
      {
            question: "¿Con cuánta antelación debo reservar el iluminación LED profesional en Valencia?",
            answer: "El plazo de reserva depende de la temporada y disponibilidad. Para fechas entre semana, generalmente con 1-2 semanas de antelación es suficiente, aunque recomendamos consultar disponibilidad lo antes posible. Para fines de semana, especialmente en temporada alta (mayo a octubre), recomendamos reservar con 1-2 meses de antelación mínimo. Para eventos grandes como eventos o conciertos que requieren producción compleja, lo ideal es contactar con 2-3 meses de antelación. Para fechas muy demandadas (Navidad, San Juan, Fallas, puentes festivos) recomendamos 3-4 meses. Puedes consultar disponibilidad en tiempo real llamando al 613 88 14 14 o vía WhatsApp, te respondemos en menos de 2 horas."
      },
      {
            question: "¿El técnico especializado está incluido en el precio?",
            answer: "Sí, en los packs Profesional y Premium el técnico especializado está totalmente incluido durante todo el evento. El técnico llega 2-3 horas antes para montaje y configuración, permanece durante todo el desarrollo del evento gestionando niveles, ecualizaciones y solucionando cualquier incidencia técnica, y se encarga del desmontaje completo al finalizar. En el pack Básico, los equipos son autoamplificados fáciles de operar con controles intuitivos, pero puedes añadir técnico especializado por 150€ adicionales si lo prefieres. Nuestros técnicos tienen formación específica en iluminacion profesional y más de 10 años de experiencia en eventos en Valencia, garantizando resultados profesionales impecables."
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
            answer: "Sí, tenemos amplia experiencia en todo tipo de eventos: eventos, conciertos, teatro, corporativos, bodas, y cualquier celebración que requiera iluminación LED profesional en Valencia. Hemos trabajado en espacios emblemáticos de Valencia como el Palau de la Música, Ciudad de las Artes y las Ciencias, La Hacienda, Masía de San Antonio, Hotel Las Arenas, Viveros Municipales, así como en centenares de fincas, hoteles, locales, carpas, y espacios únicos en toda la provincia de Valencia, Castellón y Alicante. Cada tipo de evento tiene requisitos técnicos específicos que conocemos perfectamente: acústica, potencia necesaria, distribución de equipos, timing, y protocolos. Nuestro equipo realiza visita técnica previa gratuita para eventos grandes, evaluando acústica del espacio, puntos eléctricos, accesos, y diseñando la mejor configuración técnica."
      },
      {
            question: "¿Ofrecéis descuentos para eventos de varios días o múltiples servicios?",
            answer: "Sí, aplicamos descuentos progresivos atractivos. Para alquileres de varios días: 2-3 días consecutivos 15% descuento total, 4-7 días 25% descuento, más de 7 días precio especial personalizado. Para contratación de múltiples servicios combinados (por ejemplo sonido + iluminación, o sonido + vídeo + iluminación) aplicamos packs con hasta 20% descuento sobre contratación separada. También ofrecemos condiciones ventajosas para: clientes recurrentes con contrato marco, empresas organizadoras de eventos, ayuntamientos y entidades públicas, asociaciones y ONGs, y productoras audiovisuales. Consulta tu caso específico llamando al 613 88 14 14 para presupuesto personalizado ajustado con las máximas ventajas."
      },
      {
            question: "¿Puedo ver los equipos antes de contratar el servicio?",
            answer: "Por supuesto. Puedes visitar nuestro showroom-almacén en Valencia con cita previa, donde podrás ver y probar los equipos en funcionamiento. También organizamos demostraciones técnicas para eventos grandes o producciones complejas que lo requieran. Además, tenemos portfolio fotográfico completo de equipos, fichas técnicas detalladas con especificaciones, vídeos de eventos reales realizados, y referencias de clientes satisfechos. Para eventos o conciertos grandes, ofrecemos visita técnica gratuita al espacio del evento, donde mostramos referencias fotográficas de montajes similares y explicamos detalladamente la configuración técnica propuesta. Trabajamos con total transparencia: lo que ves en la demostración es exactamente lo que recibirás en tu evento."
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

export default IluminacionLEDProfesional;
