import React from 'react';
import ServicePageTemplate from '../../components/services/ServicePageTemplate';

const AlquilerPantallasLED = () => {
  const pageData = {
    title: "Alquiler de Pantalla LED Gigante en Valencia | Mundial 2026 | Resona Rent",
    metaDescription:
      "Alquila una pantalla LED gigante en Valencia para ver el Mundial 2026 en grande. P3.9 interior y exterior. 3×2 m (800 € + IVA) y 3×4 m (1.500 € + IVA). Entrega y montaje. ☎️ 613 88 14 14",
    keywords:
      "alquiler pantalla led valencia, pantalla led gigante mundial, pantalla gigante futbol valencia, alquiler pantalla mundial 2026, videowall eventos valencia, pantalla led exterior valencia",
    canonicalUrl: "https://resonarent.com/servicios/alquiler-pantallas-led",
    heroTitle: "Alquiler de Pantalla LED Gigante en Valencia",
    heroSubtitle:
      "Vive el Mundial 2026 en pantalla gigante — y cualquier evento — con calidad LED profesional",

    introduction: `<img src="https://resonarent.com/images/pantalla-led-3x4.jpg" alt="Pantalla LED gigante de 3×4 m para ver el Mundial 2026 en Valencia" style="width:100%;border-radius:12px;margin-bottom:24px;" loading="lazy" />

<p><strong>El Mundial de fútbol 2026 ya está en marcha.</strong> Y no hay mejor forma de vivirlo que reuniendo a tu público delante de una <strong>pantalla LED gigante</strong>.</p>

<p>En ReSona Rent alquilamos pantallas LED profesionales en Valencia para <strong>bares, peñas, cervecerías, fan zones, comunidades, empresas y eventos privados</strong>. Imagen <strong>brillante y nítida</strong> para disfrutar cada partido en grande.</p>

<p><strong>¿Por qué LED y no un proyector?</strong></p>

<ul>
<li><strong>Mucho más brillo:</strong> una pantalla LED P3.9 se ve perfecta incluso con luz ambiente, de día y de noche.</li>
<li><strong>Interior y exterior:</strong> vale igual para una terraza, una plaza o un salón.</li>
<li><strong>Dos formatos:</strong> 3×2 m (6 m²) y 3×4 m (12 m²), para adaptarnos a tu espacio y aforo.</li>
<li><strong>Doble pantalla:</strong> tenemos dos de 3×2 m, así que puedes cubrir varias zonas a la vez.</li>
</ul>

<p>Nos encargamos de la <strong>entrega, el montaje y el desmontaje en toda la provincia de Valencia</strong>: tú solo eliges la fecha y nosotros lo dejamos listo para el saque inicial. Además del fútbol, la pantalla es perfecta para <strong>conciertos, ferias, presentaciones, bodas</strong> y todo tipo de eventos.</p>

<p><strong>Las fechas de partido vuelan.</strong> Reserva con antelación llamando al <strong>613 88 14 14</strong> o por WhatsApp y te confirmamos disponibilidad al momento.</p>`,

    whyChooseUs: [
      {
        icon: "⚽",
        title: "Perfecta para el Mundial 2026",
        description: "Reúne a tu público para ver los partidos en pantalla gigante",
      },
      {
        icon: "📺",
        title: "LED P3.9 de verdad",
        description: "Imagen brillante y nítida, muy superior a un proyector",
      },
      {
        icon: "☀️",
        title: "Interior y exterior",
        description: "Apta para terrazas, plazas y salones, de día o de noche",
      },
      {
        icon: "📐",
        title: "Dos tamaños",
        description: "3×2 m (6 m²) y 3×4 m (12 m²) según tu espacio y aforo",
      },
      {
        icon: "🚚",
        title: "Entrega y montaje",
        description: "La llevamos, montamos y desmontamos en toda la provincia",
      },
      {
        icon: "🗓️",
        title: "Reserva por fecha",
        description: "Disponibilidad real: eliges tu día y la bloqueamos",
      },
    ],

    technicalSpecs: [
      {
        title: "Especificaciones",
        items: [
          "Pixel pitch P3.9 — alta resolución, nítida de cerca y de lejos",
          "Apta para interior y exterior",
          "Imagen LED de alto brillo, visible con luz de día",
          "Formato modular: montaje adaptado a tu espacio",
        ],
      },
      {
        title: "Tamaños disponibles",
        items: [
          "Pantalla LED 3×2 m — 6 m² de superficie",
          "Pantalla LED 3×4 m — 12 m² de superficie",
          "Dos unidades de 3×2 m disponibles a la vez",
          "Entrega y montaje incluidos en la provincia de Valencia",
        ],
      },
      {
        title: "Ideal para",
        items: [
          "Ver los partidos del Mundial 2026 en pantalla gigante",
          "Bares, peñas, cervecerías y locales de ocio",
          "Fan zones, plazas y eventos al aire libre",
          "Comunidades, empresas y eventos privados",
          "Conciertos, ferias, bodas y presentaciones",
        ],
      },
    ],

    packages: [
      {
        name: "Pantalla LED 3×2 m",
        subtitle: "6 m² · ideal para bares, peñas y locales",
        price: "800 € + IVA",
        features: [
          "Superficie de 6 m² (3×2 m) · P3.9",
          "Interior y exterior",
          "Entrega, montaje y desmontaje en la provincia de Valencia",
          "Perfecta para ver el Mundial en grande",
          "968 € IVA incluido · 2 unidades disponibles",
        ],
      },
      {
        name: "Pantalla LED 3×4 m",
        subtitle: "12 m² · máximo impacto",
        price: "1.500 € + IVA",
        features: [
          "Superficie de 12 m² (3×4 m) · P3.9",
          "Interior y exterior · visible para grandes aforos",
          "Entrega, montaje y desmontaje en la provincia de Valencia",
          "Ideal para fan zones y eventos grandes",
          "1.815 € IVA incluido",
        ],
        highlighted: true,
      },
      {
        name: "Dos pantallas 3×2 m",
        subtitle: "Cubre dos zonas o más aforo",
        price: "1.600 € + IVA",
        features: [
          "Dos pantallas de 6 m² a la vez",
          "Cubre dos salas, terrazas o ambientes",
          "Más puntos de visión para tu público",
          "Entrega, montaje y desmontaje en la provincia de Valencia",
        ],
      },
    ],

    faqs: [
      {
        question: "¿Puedo alquilar una pantalla LED gigante para ver el Mundial 2026?",
        answer:
          "Sí. Una pantalla LED gigante es la mejor forma de reunir a tu público para vivir los partidos del Mundial 2026 en grande, ya sea en un bar, una peña, una empresa, una comunidad de vecinos o un evento al aire libre. Como solo disponemos de un número limitado de pantallas, te recomendamos reservar tu fecha con antelación, sobre todo para los días de partido.",
      },
      {
        question: "¿Qué tamaños de pantalla LED tenéis y cuánto cuestan?",
        answer:
          "Tenemos dos formatos, ambos con pixel pitch P3.9: la pantalla de 3×2 metros (6 m²) por 800 € + IVA (968 € IVA incluido), y la pantalla de 3×4 metros (12 m²) por 1.500 € + IVA (1.815 € IVA incluido). Disponemos de dos pantallas de 3×2 m, por lo que también puedes alquilar las dos a la vez (1.600 € + IVA) para cubrir varias zonas. Todas incluyen entrega y montaje en la provincia de Valencia.",
      },
      {
        question: "¿La pantalla sirve para interior y exterior?",
        answer:
          "Sí, nuestras pantallas LED P3.9 son aptas tanto para interior como para exterior, así que funcionan igual de bien en una terraza, una plaza, una carpa o un salón. Gracias a su alto brillo se ven con claridad incluso con luz de día.",
      },
      {
        question: "¿Entregáis y montáis la pantalla?",
        answer:
          "Sí. La entrega, el montaje y el desmontaje están incluidos en toda la provincia de Valencia. Tú solo eliges la fecha y el espacio, y nosotros dejamos la pantalla lista y funcionando. Para ubicaciones fuera de la provincia, consúltanos y te confirmamos las condiciones.",
      },
      {
        question: "¿La pantalla LED se ve bien de día y con luz ambiente?",
        answer:
          "Sí. A diferencia de un proyector, una pantalla LED tiene mucho más brillo, por lo que ofrece una imagen nítida incluso con luz, tanto de día como de noche. Es la mejor opción para que todo el público vea el partido con claridad.",
      },
      {
        question: "¿Con cuánta antelación debo reservar?",
        answer:
          "Cuanto antes, mejor, especialmente para los días de partido del Mundial y los fines de semana: la disponibilidad es limitada porque solo contamos con estas unidades. Puedes consultar disponibilidad y reservar tu fecha llamando al 613 88 14 14 o por WhatsApp; te respondemos rápido.",
      },
      {
        question: "¿Sirve para otros eventos además del fútbol?",
        answer:
          "Por supuesto. Además de retransmisiones deportivas, la pantalla LED es ideal para conciertos, ferias, presentaciones de empresa, bodas, comuniones, eventos corporativos y cualquier ocasión en la que quieras una imagen grande y de calidad.",
      },
    ],

    relatedServices: [
      { title: "Alquiler de sonido", url: "/servicios/alquiler-sonido-valencia" },
      { title: "Ver todo el catálogo", url: "/productos" },
    ],
  };

  return <ServicePageTemplate {...pageData} />;
};

export default AlquilerPantallasLED;
